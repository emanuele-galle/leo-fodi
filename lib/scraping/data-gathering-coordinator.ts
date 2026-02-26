/**
 * Data Gathering Coordinator
 * Orchestra l'esecuzione parallela di tutti gli scraper specializzati
 * Usa ScrapCreators API + Cheerio web scraping (no Playwright - production ready)
 */

import { ScrapCreatorsClient } from './scrapcreators-client'
import { WebsiteContactScraper } from './website-contact-scraper'
import { WebContentFetcher } from './web-content-fetcher'
import { GoogleSearchOSINT } from './google-search-osint'
import { WebsiteContentAnalyzer } from './website-content-analyzer'
// ✅ REMOVED: VisionAnalyzer - XAI Live Search provides better semantic analysis
// ✅ REMOVED: Puppeteer extractors - now using ONLY ScrapCreators API + XAI Live Search
// Puppeteer era lento (15-30s), fragile (DOM changes), e costoso da mantenere (cookies)
// ScrapCreators è 5-10x più veloce, 95% reliability, e zero manutenzione
import type {
  RawOSINTData,
  LinkedInProfileData,
  InstagramProfileData,
  FacebookProfileData,
  GeneralWebData,
  ScraperResult,
} from './types'
import type { ProfilingTarget } from '../osint/types'

export class DataGatheringCoordinator {
  private scrapCreators = new ScrapCreatorsClient()
  // ✅ REMOVED: Puppeteer instances - using only ScrapCreators API
  private websiteScraper = new WebsiteContactScraper()
  private webFetcher = new WebContentFetcher()
  private googleSearch = new GoogleSearchOSINT()
  private websiteAnalyzer = new WebsiteContentAnalyzer()
  // ✅ REMOVED: VisionAnalyzer instance

  /**
   * Raccogli tutti i dati disponibili per un target
   * Esegue gli scraper in parallelo per massima efficienza
   */
  async gatherData(target: ProfilingTarget): Promise<RawOSINTData> {
    const startTime = Date.now()

    console.log(`\n🔍 [DataGathering] Starting data collection for: ${target.nome} ${target.cognome}`)
    console.log(`   Sources to scrape:`)
    if (target.linkedin_url) console.log(`   - LinkedIn: ${target.linkedin_url}`)
    if (target.instagram_url) console.log(`   - Instagram: ${target.instagram_url}`)

    const rawData: Partial<RawOSINTData> = {
      target_id: target.id,
      data_raccolta: new Date().toISOString(),
      fonti_consultate: [],
      errori: [],
      successi: 0,
      fallimenti: 0,
    }

    // ========== ESECUZIONE PARALLELA ==========
    const scrapingTasks: Promise<any>[] = []

    // LinkedIn - Solo Puppeteer con screenshot per analisi AI
    // Tempi di attesa aumentati per caricamento completo pagina
    if (target.linkedin_url && this.isValidUrl(target.linkedin_url)) {
      scrapingTasks.push(
        this.scrapeLinkedIn(target.linkedin_url).then((result) => ({
          fonte: 'linkedin',
          result,
        }))
      )
    }

    // Instagram
    if (target.instagram_url && this.isValidUrl(target.instagram_url)) {
      scrapingTasks.push(
        this.scrapeInstagram(target.instagram_url).then((result) => ({
          fonte: 'instagram',
          result,
        }))
      )
    }

    // Facebook
    if (target.facebook_url && this.isValidUrl(target.facebook_url)) {
      scrapingTasks.push(
        this.scrapeFacebook(target.facebook_url).then((result) => ({
          fonte: 'facebook',
          result,
        }))
      )
    }

    // Website aziendale/personale (campo dedicato - priorità alta)
    if (target.website_url && this.isValidUrl(target.website_url)) {
      // Task 1: Scrape contatti base
      scrapingTasks.push(
        this.scrapeWebsite(target.website_url).then((result) => ({
          fonte: 'web',
          url: target.website_url,
          result,
        }))
      )

      // Task 2: Analisi approfondita contenuti con XAI
      scrapingTasks.push(
        this.analyzeWebsite(target.website_url).then((result) => ({
          fonte: 'website_analysis',
          url: target.website_url,
          result,
        }))
      )
    }

    // General Web (sito personale/aziendale)
    // Note inserita dall'utente con altri URL
    if (target.note) {
      const urls = this.extractUrls(target.note)
      for (const url of urls.slice(0, 3)) {
        // Max 3 URL aggiuntivi
        scrapingTasks.push(
          this.scrapeWebsite(url).then((result) => ({
            fonte: 'web',
            url,
            result,
          }))
        )
      }
    }

    // Attendi completamento TUTTI gli scraper
    console.log(`\n📊 [DataGathering] Running ${scrapingTasks.length} scrapers in parallel...`)

    const results = await Promise.allSettled(scrapingTasks)

    // ========== AGGREGAZIONE RISULTATI ==========
    for (const promiseResult of results) {
      if (promiseResult.status === 'fulfilled') {
        const { fonte, result, url } = promiseResult.value

        if (result.success) {
          rawData.successi = (rawData.successi || 0) + 1
          rawData.fonti_consultate!.push(fonte)

          // Aggiungi dati al risultato finale
          if (fonte === 'linkedin' && result.data) {
            // Transform LinkedIn raw data to rich structured format
            // FIX: LinkedIn returns data directly in root (not in data.data)
            const linkedin = result.data as any
            const transformed: LinkedInProfileData = {
              nome_completo: linkedin.name || '',
              headline: linkedin.headline || '',  // Headline corto (es: "Senior Manager")
              about: linkedin.about || linkedin.summary || '',  // ⭐ Bio completa (CRITICO per analisi)
              summary: linkedin.summary || linkedin.about || '',  // Alias per compatibilità
              localita: linkedin.location || '',
              profile_url: linkedin.url || linkedin.publicProfileUrl || '',
              esperienze: linkedin.experience?.map((exp: any) => ({
                ruolo: exp.title || exp.member?.roleName || '',
                azienda: exp.name || '',
                tipo_impiego: exp.employmentType || '',
                data_inizio: exp.member?.startDate || exp.startDate || '',
                data_fine: exp.member?.endDate || exp.endDate || '',
                descrizione: exp.member?.description || exp.description || '',
                localita: exp.location || '',
              })) || [],
              formazione: linkedin.education?.map((edu: any) => ({
                istituzione: edu.schoolName || edu.name || '',
                titolo: edu.degree || edu.degreeName || edu.member?.description || '',
                campo_studio: edu.fieldOfStudy || '',
                data_inizio: edu.member?.startDate || edu.startDate || '',
                data_fine: edu.member?.endDate || edu.endDate || '',
              })) || [],
              competenze: linkedin.skills?.map((s: any) =>
                typeof s === 'string' ? s : (s.name || s.skillName || '')
              ) || [],
              certificazioni: linkedin.certifications?.map((cert: any) => ({
                nome: cert.name || cert.title || '',
                ente: cert.authority || cert.issuer || '',
                data_rilascio: cert.dateIssued || cert.timePeriod?.startDate || '',
              })) || [],
              numero_connessioni: parseInt(linkedin.connections) || undefined,
              numero_followers: parseInt(linkedin.followers) || undefined,
              data_scraping: new Date().toISOString(),
              fonte: 'linkedin',
            }
            rawData.linkedin_data = transformed
            console.log(`✅ [DataGathering] LinkedIn data collected and transformed`)
            console.log(`   - Headline: ${transformed.headline || 'N/A'}`)
            console.log(`   - 📝 Bio/About: ${transformed.about ? `${transformed.about.length} chars` : 'N/A'} ${transformed.about && transformed.about.length > 500 ? '(RICH DATA ⭐)' : ''}`)
            console.log(`   - Followers: ${transformed.numero_followers || 'N/A'}`)
            console.log(`   - Connections: ${transformed.numero_connessioni || 'N/A'}`)

            // ⭐ LOGGING: Experience descriptions
            const experiencesWithDesc = transformed.esperienze.filter(exp => exp.descrizione && exp.descrizione.length > 50)
            const totalDescChars = transformed.esperienze.reduce((sum, exp) => sum + (exp.descrizione?.length || 0), 0)
            console.log(`   - 💼 Experience: ${transformed.esperienze.length} roles`)
            console.log(`     └─ With descriptions: ${experiencesWithDesc.length}/${transformed.esperienze.length} (${totalDescChars.toLocaleString()} chars total) ${totalDescChars > 1000 ? '⭐' : ''}`)

            // ⭐ LOGGING: Education
            console.log(`   - 🎓 Education: ${transformed.formazione.length} schools`)

            // ⭐ LOGGING: Skills
            console.log(`   - 💪 Skills: ${transformed.competenze.length} skills`)
          } else if (fonte === 'instagram' && result.data) {
            // FIX: result.data is ALREADY transformed by mergeInstagramData()
            // No need for double transformation - just use it directly
            const transformed = result.data as InstagramProfileData

            // ✅ REMOVED: Vision AI Analysis
            // XAI Live Search ora fornisce analisi semantica migliore e più veloce
            // Nessun bisogno di analizzare screenshot - i dati testuali sono sufficienti

            rawData.instagram_data = transformed
            console.log(`✅ [DataGathering] Instagram data collected and transformed`)
            console.log(`   - Followers: ${transformed.numero_followers}`)
            console.log(`   - Following: ${transformed.numero_following}`)
            console.log(`   - Posts: ${transformed.numero_post}`)
            console.log(`   - Post disponibili: ${transformed.post_recenti?.length || 0}`)
            console.log(`   - Locations estratte: ${transformed.luoghi_identificati?.length || 0}`)
          } else if (fonte === 'facebook' && result.data) {
            // FIX: result.data is ALREADY transformed by mergeFacebookData()
            // No need for double transformation - just use it directly
            const transformed = result.data as FacebookProfileData

            rawData.facebook_data = transformed
            console.log(`✅ [DataGathering] Facebook data collected and transformed`)
            console.log(`   - Followers: ${transformed.numero_followers || 'N/A'}`)
            console.log(`   - Likes: ${transformed.numero_likes || 'N/A'}`)
            console.log(`   - Category: ${transformed.categoria}`)
          } else if (fonte === 'web' && result.data) {
            if (!rawData.web_data) rawData.web_data = []
            rawData.web_data.push(result.data as GeneralWebData)
            console.log(`✅ [DataGathering] Web data collected from: ${url}`)
          } else if (fonte === 'website_analysis' && result.data) {
            if (!rawData.website_analysis) rawData.website_analysis = []
            rawData.website_analysis.push(result.data as any)
            const analysis = result.data as any
            console.log(`✅ [DataGathering] Website analyzed: ${url}`)
            console.log(`   - Company: ${analysis.company_info?.name || 'Unknown'}`)
            console.log(`   - Industry: ${analysis.company_info?.industry || 'Unknown'}`)
            console.log(`   - Confidence: ${analysis.confidence_score}%`)
          }
        } else {
          rawData.fallimenti = (rawData.fallimenti || 0) + 1
          rawData.errori!.push({
            fonte,
            errore: result.error?.message || 'Unknown error',
            timestamp: new Date().toISOString(),
          })
          console.error(
            `❌ [DataGathering] Failed to scrape ${fonte}: ${result.error?.message}`
          )
        }
      } else {
        // Promise rejected
        rawData.fallimenti = (rawData.fallimenti || 0) + 1
        rawData.errori!.push({
          fonte: 'unknown',
          errore: promiseResult.reason?.message || 'Unknown error',
          timestamp: new Date().toISOString(),
        })
      }
    }

    // ========== FASE 2: WEB CONTENT FETCHING ==========
    // Raccogli link rilevanti da social media e scarica contenuto
    await this.fetchRelevantWebContent(rawData)

    // ========== FASE 3: GOOGLE SEARCH OSINT ==========
    // Cerca menzioni pubbliche e profili alternativi
    await this.performGoogleSearch(rawData, target)

    const elapsed = Date.now() - startTime
    rawData.tempo_totale_ms = elapsed

    console.log(`\n✅ [DataGathering] Data collection completed in ${(elapsed / 1000).toFixed(2)}s`)
    console.log(`   - Successes: ${rawData.successi}`)
    console.log(`   - Failures: ${rawData.fallimenti}`)
    console.log(`   - Sources: ${rawData.fonti_consultate!.join(', ') || 'none'}`)

    return rawData as RawOSINTData
  }

  /**
   * Scrape LinkedIn profile
   * STRATEGY: Use ONLY ScrapCreators API (Puppeteer removed completely)
   *
   * Note: LinkedIn has strong protections against scraping.
   * ScrapCreators may return 404 errors due to LinkedIn anti-scraping measures.
   * Falls back gracefully to XAI Live Search for profile enrichment.
   */
  private async scrapeLinkedIn(
    url: string
  ): Promise<ScraperResult<LinkedInProfileData>> {
    const startTime = Date.now()

    console.log(`[DataGathering] 🔍 Scraping LinkedIn with ScrapCreators API: ${url}`)

    try {
      // Try ScrapCreators API
      const scData = await this.scrapCreators.scrapeLinkedIn(url)

      if (scData) {
        console.log(`✅ [DataGathering] LinkedIn data collected via ScrapCreators`)
        console.log(`   - Experience: ${scData.esperienze?.length || 0} roles`)
        console.log(`   - Education: ${scData.formazione?.length || 0} schools`)
        console.log(`   - Skills: ${scData.competenze?.length || 0} skills`)
        console.log(`   - Connections: ${scData.numero_connessioni || 'N/A'}`)

        return {
          success: true,
          data: scData,
          metadata: {
            tentativo: 1,
            tempo_ms: Date.now() - startTime,
            fonte: 'ScrapCreators',
          },
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`❌ [DataGathering] ScrapCreators LinkedIn failed: ${errorMessage}`)

      return {
        success: false,
        error: {
          code: 'NOT_FOUND' as any,
          message: `LinkedIn profile unavailable: ${errorMessage}. Will use XAI Live Search for enrichment.`,
          retryable: false,
        },
        metadata: {
          tentativo: 1,
          tempo_ms: Date.now() - startTime,
          fonte: 'ScrapCreators (failed)',
        },
      }
    }

    // ScrapCreators returned null (no data extracted)
    return {
      success: false,
      error: {
        code: 'NOT_FOUND' as any,
        message: 'LinkedIn profile extraction returned no data. Profile may be private or restricted. Will use XAI Live Search for enrichment.',
        retryable: false,
      },
      metadata: {
        tentativo: 1,
        tempo_ms: Date.now() - startTime,
        fonte: 'ScrapCreators (no data)',
      },
    }
  }

  /**
   * Merge arrays by unique key (deduplication)
   * Used by Facebook merge function
   */
  private mergeArraysByKey(arr1: any[], arr2: any[], key: string): any[] {
    const map = new Map()

    for (const item of [...arr1, ...arr2]) {
      const keyValue = item[key] || item.title || item.name || JSON.stringify(item)
      if (keyValue && !map.has(keyValue)) {
        map.set(keyValue, item)
      }
    }

    return Array.from(map.values())
  }

  /**
   * Scrape Instagram profile
   * NEW STRATEGY: Execute BOTH ScrapCreators + Puppeteer in PARALLEL for maximum data completeness
   * Merge results to get the richest dataset possible
   */
  private async scrapeInstagram(
    url: string
  ): Promise<ScraperResult<InstagramProfileData>> {
    const startTime = Date.now()

    // Extract Instagram handle from URL
    const handleMatch = url.match(/instagram\.com\/([^/?]+)/)
    const handle = handleMatch?.[1]

    if (!handle) {
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR' as any,
          message: 'Cannot extract Instagram handle from URL',
          retryable: false,
        },
        metadata: {
          tentativo: 1,
          tempo_ms: Date.now() - startTime,
          fonte: 'Instagram (URL parsing)',
        },
      }
    }

    console.log(`[DataGathering] 🚀 Launching PARALLEL Instagram scraping: @${handle}`)

    // Try ScrapCreators API only
    try {
      if (!this.scrapCreators.isEnabled()) {
        throw new Error('ScrapCreators API not enabled')
      }

      const scrapCreatorsData = await this.scrapCreators.scrapeInstagram(handle)

      if (scrapCreatorsData) {
        console.log(`✅ [DataGathering] Instagram data collected from ScrapCreators`)
        console.log(`   - Followers: ${scrapCreatorsData.followers || 0}`)
        console.log(`   - Posts: ${scrapCreatorsData.posts_count || 0}`)
        console.log(`   - Bio: ${scrapCreatorsData.bio ? 'Yes' : 'No'}`)

        // Normalize from InstagramScrapedData to InstagramProfileData format
        const normalizedData = {
          username: scrapCreatorsData.username || handle,
          nome_completo: scrapCreatorsData.full_name || '',
          bio: scrapCreatorsData.bio || '',
          numero_followers: scrapCreatorsData.followers || 0,
          numero_following: scrapCreatorsData.following || 0,
          numero_post: scrapCreatorsData.posts_count || 0,
          verified: scrapCreatorsData.is_verified || false,
          business_account: scrapCreatorsData.is_business || false,
          business_email: scrapCreatorsData.business_email || undefined,
          business_phone: scrapCreatorsData.business_phone || undefined,
          category: scrapCreatorsData.category || undefined,
          website: scrapCreatorsData.external_url || undefined,
          post_recenti: scrapCreatorsData.recent_posts || [],
          profile_pic_url: scrapCreatorsData.profile_pic_hd || '',
          profile_url: `https://www.instagram.com/${handle}`,
          brand_identificati: [],
          luoghi_identificati: [],
          attivita_identificate: [],
          data_scraping: new Date().toISOString(),
          fonte: 'instagram',
        }

        return {
          success: true,
          data: normalizedData as any,
          metadata: {
            tentativo: 1,
            tempo_ms: Date.now() - startTime,
            fonte: 'ScrapCreators',
          },
        }
      }

      throw new Error('ScrapCreators returned no data')

    } catch (error: any) {
      console.error(`❌ [DataGathering] Instagram scraping failed: ${(error instanceof Error ? error.message : String(error))}`)

      return {
        success: false,
        error: {
          code: 'NOT_FOUND' as any,
          message: `Instagram profile unavailable: ${error instanceof Error ? error.message : String(error)}. Profile may be private or restricted. Will use XAI Live Search for enrichment.`,
          retryable: false,
        },
        metadata: {
          tentativo: 1,
          tempo_ms: Date.now() - startTime,
          fonte: 'ScrapCreators (failed)',
        },
      }
    }
  }


  /**
   * Scrape Facebook profile
   * Uses ScrapCreators API only
   */
  private async scrapeFacebook(
    url: string
  ): Promise<ScraperResult<any>> {
    const startTime = Date.now()

    console.log(`[DataGathering] 🚀 Launching Facebook scraping: ${url}`)

    // Try ScrapCreators API only
    try {
      if (!this.scrapCreators.isEnabled()) {
        throw new Error('ScrapCreators API not enabled')
      }

      const scrapCreatorsData = await this.scrapCreators.scrapeFacebook(url)

      // Check if data is actually present (not empty object or null)
      // FIXED: Use correct field names from API response
      const hasValidData = scrapCreatorsData &&
        scrapCreatorsData.name &&
        (scrapCreatorsData.id || scrapCreatorsData.followerCount || scrapCreatorsData.likeCount)

      if (hasValidData) {
        console.log(`✅ [DataGathering] Facebook data collected from ScrapCreators`)
        console.log(`   - Name: ${scrapCreatorsData.name || 'N/A'}`)
        console.log(`   - Followers: ${scrapCreatorsData.followerCount || 'N/A'}`)
        console.log(`   - Category: ${scrapCreatorsData.category || 'N/A'}`)
        console.log(`   - Location: ${scrapCreatorsData.location || 'N/A'}`)
        console.log(`   - About: ${scrapCreatorsData.about ? 'Yes' : 'No'}`)
        console.log(`   - Raw data keys: ${Object.keys(scrapCreatorsData).join(', ')}`)

        // FIXED: Normalize data format with correct field names from API
        // ScrapeCreators returns data directly in response (not in data.data)
        const normalizedData = {
          nome: scrapCreatorsData.name || '',
          bio: scrapCreatorsData.about || scrapCreatorsData.message || '', // "Profile is private" message if no bio
          numero_followers: scrapCreatorsData.followerCount || 0,
          numero_likes: scrapCreatorsData.likeCount || 0,
          verificato: scrapCreatorsData.isVerified || false,
          account_status: scrapCreatorsData.account_status || 'public', // "private" or "public"
          gender: scrapCreatorsData.gender || '',
          facebook_id: scrapCreatorsData.id || '',
          categoria: scrapCreatorsData.category || '',
          citta: scrapCreatorsData.location || '',
          profile_pic_url: scrapCreatorsData.profilePicLarge || scrapCreatorsData.profilePicMedium || '',
          cover_photo: scrapCreatorsData.coverPhoto || null,
          email: scrapCreatorsData.email || '',
          telefono: scrapCreatorsData.phoneNumber || '',
          indirizzo: scrapCreatorsData.address || '',
          website: scrapCreatorsData.website || '',
          links: scrapCreatorsData.links || [],
          is_business: scrapCreatorsData.isBusinessPageActive || false,
          rating_count: scrapCreatorsData.ratingCount || 0,
        }

        return {
          success: true,
          data: normalizedData,
          metadata: {
            tentativo: 1,
            tempo_ms: Date.now() - startTime,
            fonte: 'ScrapCreators',
          },
        }
      }

      // Log raw response for debugging
      console.log('[DataGathering] 🔍 Facebook raw response:', JSON.stringify(scrapCreatorsData, null, 2))
      throw new Error(`ScrapCreators returned no data or empty data. Keys found: ${scrapCreatorsData ? Object.keys(scrapCreatorsData).join(', ') : 'null'}`)

    } catch (error: any) {
      console.error(`❌ [DataGathering] Facebook scraping failed: ${error instanceof Error ? error.message : String(error)}`)

      return {
        success: false,
        error: {
          code: 'NOT_FOUND' as any,
          message: `Facebook profile unavailable: ${error instanceof Error ? error.message : String(error)}. Profile may be private or restricted. Will use XAI Live Search for enrichment.`,
          retryable: false,
        },
        metadata: {
          tentativo: 1,
          tempo_ms: Date.now() - startTime,
          fonte: 'ScrapCreators (failed)',
        },
      }
    }
  }


  /**
   * Analyze website content with XAI for deep insights
   * Extracts company info, products/services, mission, values, etc.
   */
  private async analyzeWebsite(url: string): Promise<ScraperResult<any>> {
    const startTime = Date.now()

    try {
      console.log(`[DataGathering] Analyzing website with XAI: ${url}`)

      // Analyze website content
      const analysis = await this.websiteAnalyzer.analyzeWebsite(url)

      return {
        success: true,
        data: analysis,
        metadata: {
          tentativo: 1,
          tempo_ms: Date.now() - startTime,
          fonte: 'WebsiteContentAnalyzer (XAI)',
        },
      }
    } catch (error) {
      console.error(`[DataGathering] Website analysis failed: ${(error instanceof Error ? error.message : String(error))}`)
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR' as any,
          message: error instanceof Error ? error.message : String(error),
          retryable: false,
        },
        metadata: {
          tentativo: 1,
          tempo_ms: Date.now() - startTime,
          fonte: 'WebsiteContentAnalyzer',
        },
      }
    }
  }

  /**
   * Scrape general website for contact information
   * Uses Cheerio (no browser - production ready)
   */
  private async scrapeWebsite(url: string): Promise<ScraperResult<GeneralWebData>> {
    const startTime = Date.now()

    try {
      console.log(`[DataGathering] Scraping website contacts: ${url}`)

      // Scrape contacts from website
      const contactData = await this.websiteScraper.scrapeContacts(url)

      // Transform to GeneralWebData format
      const webData: GeneralWebData = {
        url,
        data_scraping: new Date().toISOString(),
        fonte: 'website',
        emails: contactData.emails.map(e => e.value),
        phones: contactData.phones.map(p => p.value),
        addresses: contactData.addresses.map(a => a.value),
        social_links: contactData.social_links,
      }

      return {
        success: true,
        data: webData,
        metadata: {
          tentativo: 1,
          tempo_ms: Date.now() - startTime,
          fonte: 'WebsiteContactScraper (Cheerio)',
        },
      }
    } catch (error) {
      console.error(`[DataGathering] Website scraping failed: ${(error instanceof Error ? error.message : String(error))}`)
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR' as any,
          message: error instanceof Error ? error.message : String(error),
          retryable: false,
        },
        metadata: {
          tentativo: 1,
          tempo_ms: Date.now() - startTime,
          fonte: 'WebsiteContactScraper',
        },
      }
    }
  }

  /**
   * Valida URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Estrai URL da testo
   */
  private extractUrls(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const matches = text.match(urlRegex)
    return matches ? Array.from(new Set(matches)) : []
  }

  /**
   * Statistiche aggregate
   */
  getStats(rawData: RawOSINTData): {
    fonti_totali: number
    fonti_successo: number
    tasso_successo: number
    tempo_medio_ms: number
  } {
    const fontiTotali = rawData.successi + rawData.fallimenti
    const tassoSuccesso = fontiTotali > 0 ? (rawData.successi / fontiTotali) * 100 : 0

    return {
      fonti_totali: fontiTotali,
      fonti_successo: rawData.successi,
      tasso_successo: Math.round(tassoSuccesso),
      tempo_medio_ms: fontiTotali > 0 ? Math.round(rawData.tempo_totale_ms / fontiTotali) : 0,
    }
  }

  /**
   * FASE 2: Fetch contenuti web rilevanti
   * Scarica e pulisce contenuti HTML da bio links e siti personali
   */
  private async fetchRelevantWebContent(rawData: Partial<RawOSINTData>): Promise<void> {
    console.log('\n🌐 [WebFetcher] FASE 2: Starting web content fetching...')

    const urlsToFetch: string[] = []

    // Raccogli bio links da Instagram
    if (rawData.instagram_data) {
      const igData = rawData.instagram_data as any
      console.log('[WebFetcher] Checking Instagram data for URLs...')
      console.log(`   - bio_links: ${igData.bio_links ? JSON.stringify(igData.bio_links) : 'null'}`)
      console.log(`   - external_url: ${igData.external_url || 'null'}`)

      // Bio links
      if (igData.bio_links && Array.isArray(igData.bio_links)) {
        urlsToFetch.push(...igData.bio_links)
      }

      // External URL
      if (igData.external_url) {
        urlsToFetch.push(igData.external_url)
      }
    }

    // Raccogli link da Facebook
    if (rawData.facebook_data) {
      const fbData = rawData.facebook_data as any
      console.log('[WebFetcher] Checking Facebook data for URLs...')
      console.log(`   - website: ${fbData.website || 'null'}`)

      if (fbData.website) {
        urlsToFetch.push(fbData.website)
      }
    }

    console.log(`[WebFetcher] Total URLs collected: ${urlsToFetch.length}`)
    if (urlsToFetch.length > 0) {
      console.log(`   URLs: ${JSON.stringify(urlsToFetch)}`)
    }

    // Filtra URL validi e unici
    const uniqueUrls = [...new Set(urlsToFetch)].filter(url => this.isValidUrl(url))

    if (uniqueUrls.length === 0) {
      console.log('📭 [WebFetcher] No external URLs found in social profiles')
      return
    }

    console.log(`[WebFetcher] Valid unique URLs: ${uniqueUrls.length}`)
    console.log(`   Fetching ${uniqueUrls.length} external URLs...`)

    // Fetch in parallelo (max 3 alla volta)
    const fetchedContents = await this.webFetcher.fetchMultiple(uniqueUrls)

    if (fetchedContents.length > 0) {
      rawData.web_content = fetchedContents
      rawData.fonti_consultate!.push('web_content')
      rawData.successi = (rawData.successi || 0) + fetchedContents.length

      console.log(`✅ [WebFetcher] Fetched ${fetchedContents.length}/${uniqueUrls.length} URLs successfully`)
      fetchedContents.forEach(content => {
        console.log(`   - ${content.title || 'Untitled'} (${content.word_count} words)`)
      })
    } else {
      console.log(`❌ [WebFetcher] Failed to fetch any URLs`)
    }
  }

  /**
   * FASE 3: Google Search OSINT
   * Cerca menzioni pubbliche e profili social alternativi
   */
  private async performGoogleSearch(rawData: Partial<RawOSINTData>, target: ProfilingTarget): Promise<void> {
    if (!this.googleSearch.isEnabled()) {
      console.log('\n📭 [GoogleSearch] Skipping - Google Custom Search API not configured (optional)')
      return
    }

    console.log('\n🔍 [GoogleSearch] FASE 3: Starting Google Search OSINT...')

    try {
      const searchData = await this.googleSearch.searchPerson(target)

      if (!searchData) {
        console.log('📭 [GoogleSearch] No results found')
        return
      }

      // Aggiungi dati Google Search a rawData
      rawData.google_search_data = searchData
      rawData.fonti_consultate!.push('google_search')
      rawData.successi = (rawData.successi || 0) + 1

      console.log(`✅ [GoogleSearch] Found ${searchData.total_results} results`)

      // Log profili social scoperti
      const profiles = searchData.social_profiles_found
      if (Object.keys(profiles).length > 0) {
        console.log('   📱 Social profiles discovered:')
        if (profiles.twitter) console.log(`      - Twitter: ${profiles.twitter}`)
        if (profiles.tiktok) console.log(`      - TikTok: ${profiles.tiktok}`)
        if (profiles.youtube) console.log(`      - YouTube: ${profiles.youtube}`)
        if (profiles.github) console.log(`      - GitHub: ${profiles.github}`)
        if (profiles.medium) console.log(`      - Medium: ${profiles.medium}`)
      }

      // Log menzioni
      const mentions = searchData.mentions
      const totalMentions = mentions.articles.length + mentions.interviews.length + mentions.press_releases.length
      if (totalMentions > 0) {
        console.log(`   📰 Public mentions found: ${totalMentions}`)
        if (mentions.articles.length > 0) console.log(`      - Articles: ${mentions.articles.length}`)
        if (mentions.interviews.length > 0) console.log(`      - Interviews: ${mentions.interviews.length}`)
        if (mentions.press_releases.length > 0) console.log(`      - Press releases: ${mentions.press_releases.length}`)
      }

    } catch (error) {
      console.error(`❌ [GoogleSearch] Error: ${(error instanceof Error ? error.message : String(error))}`)
      rawData.fallimenti = (rawData.fallimenti || 0) + 1
      rawData.errori!.push({
        fonte: 'google_search',
        errore: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      })
    }
  }
}
