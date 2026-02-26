/**
 * Google Search OSINT
 * Usa Google Custom Search API o ScrapeCreators Google Search API per trovare menzioni pubbliche del target
 * Scopre: articoli, interviste, profili social alternativi, apparizioni pubbliche
 *
 * PRIORITY:
 * 1. ScrapeCreators Google Search (più affidabile, nessun setup complesso)
 * 2. Google Custom Search API (richiede setup SearchEngineID)
 */

import { CacheService, CacheTTL } from '@/lib/cache/cache-service'
import { searchGoogle as scrapeCreatorsSearch } from '@/lib/scrapecreators/client'
import type { ProfilingTarget } from '../osint/types'

export interface GoogleSearchResult {
  title: string
  link: string
  snippet: string
  displayLink: string
  source: string
}

export interface GoogleSearchOSINTData {
  target_name: string
  queries_executed: string[]
  total_results: number
  results: GoogleSearchResult[]
  social_profiles_found: {
    twitter?: string
    tiktok?: string
    youtube?: string
    github?: string
    medium?: string
    other?: string[]
  }
  mentions: {
    articles: string[]
    interviews: string[]
    press_releases: string[]
    other: string[]
  }
  searched_at: string
}

export class GoogleSearchOSINT {
  private cache: CacheService
  private apiKey: string | null
  private searchEngineId: string | null
  private enabled: boolean
  private scrapeCreatorsEnabled: boolean
  private useScrapecreators: boolean

  constructor() {
    this.cache = CacheService.getInstance()

    // Google Custom Search API
    this.apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || null
    this.searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID || null
    this.enabled = !!(this.apiKey && this.searchEngineId)

    // ScrapeCreators API
    this.scrapeCreatorsEnabled = !!process.env.SCRAPECREATORS_API_KEY

    // Priority: ScrapeCreators > Google Custom Search
    this.useScrapecreators = this.scrapeCreatorsEnabled

    if (!this.useScrapecreators && !this.enabled) {
      console.warn('[GoogleSearchOSINT] ⚠️ No Google Search API configured (optional feature)')
      console.warn('   Configure either SCRAPECREATORS_API_KEY or GOOGLE_CUSTOM_SEARCH_API_KEY')
    } else {
      const provider = this.useScrapecreators ? 'ScrapeCreators' : 'Google Custom Search'
      console.log(`[GoogleSearchOSINT] ✅ Using ${provider} API`)
    }
  }

  /**
   * Cerca informazioni pubbliche su un target
   */
  async searchPerson(target: ProfilingTarget): Promise<GoogleSearchOSINTData | null> {
    if (!this.useScrapecreators && !this.enabled) {
      console.log('[GoogleSearchOSINT] Skipping - API not configured')
      return null
    }

    const cacheKey = `google_search:${target.nome}_${target.cognome}`
    const cached = this.cache.get<GoogleSearchOSINTData>(cacheKey)
    if (cached) {
      console.log(`[GoogleSearchOSINT] ✅ Cache hit for: ${target.nome} ${target.cognome}`)
      return cached
    }

    console.log(`[GoogleSearchOSINT] 🔍 Searching for: ${target.nome} ${target.cognome}`)

    // Use ScrapeCreators if enabled (priority)
    if (this.useScrapecreators) {
      return await this.searchPersonWithScrapeCreators(target, cacheKey)
    }

    // Fallback to Google Custom Search
    const fullName = `"${target.nome} ${target.cognome}"`

    // Genera query di ricerca automatiche
    const queries = this.generateSearchQueries(target)

    const allResults: GoogleSearchResult[] = []
    const queriesExecuted: string[] = []

    // Esegui max 3 query (30 risultati totali) per evitare costi eccessivi
    for (const query of queries.slice(0, 3)) {
      try {
        const results = await this.executeSearch(query)
        allResults.push(...results)
        queriesExecuted.push(query)

        // Rate limiting: 1 query/secondo per evitare quota errors
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`[GoogleSearchOSINT] Query failed: ${query}`, error instanceof Error ? error.message : String(error))
      }
    }

    // Analizza risultati
    const data = this.analyzeResults(target, allResults, queriesExecuted)

    // Cache per 7 giorni (dati pubblici cambiano lentamente)
    this.cache.set(cacheKey, data, CacheTTL.WEEK)

    console.log(`[GoogleSearchOSINT] ✅ Found ${data.total_results} results across ${queriesExecuted.length} queries`)

    return data
  }

  /**
   * Cerca informazioni usando ScrapeCreators Google Search API
   */
  private async searchPersonWithScrapeCreators(
    target: ProfilingTarget,
    cacheKey: string
  ): Promise<GoogleSearchOSINTData | null> {
    console.log(`[GoogleSearchOSINT] 🔍 Using ScrapeCreators for: ${target.nome} ${target.cognome}`)

    // Genera query di ricerca automatiche
    const queries = this.generateSearchQueries(target)

    const allResults: GoogleSearchResult[] = []
    const queriesExecuted: string[] = []

    // Esegui max 3 query per evitare costi eccessivi
    for (const query of queries.slice(0, 3)) {
      try {
        const response = await scrapeCreatorsSearch({
          query,
          region: 'IT', // Italian results
          num_results: 10
        })

        if (response.success && response.results) {
          // Convert ScrapeCreators format to our format
          const converted = response.results.map(r => ({
            title: r.title,
            link: r.url,
            snippet: r.description,
            displayLink: new URL(r.url).hostname,
            source: this.categorizeSource(r.url),
          }))

          allResults.push(...converted)
          queriesExecuted.push(query)
        }

        // Rate limiting: 500ms between queries
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`[GoogleSearchOSINT] ScrapeCreators query failed: ${query}`, error instanceof Error ? error.message : String(error))
      }
    }

    // Analizza risultati
    const data = this.analyzeResults(target, allResults, queriesExecuted)

    // Cache per 7 giorni (dati pubblici cambiano lentamente)
    this.cache.set(cacheKey, data, CacheTTL.WEEK)

    console.log(`[GoogleSearchOSINT] ✅ Found ${data.total_results} results across ${queriesExecuted.length} queries`)

    return data
  }

  /**
   * Genera query di ricerca strategiche
   */
  private generateSearchQueries(target: ProfilingTarget): string[] {
    // FIXED: Removed quotes - ScrapeCreators API doesn't accept them
    const fullName = `${target.nome} ${target.cognome}`
    const queries: string[] = []

    // Query 1: Nome completo + città
    if (target.citta) {
      queries.push(`${fullName} ${target.citta}`)
    } else {
      queries.push(fullName)
    }

    // Query 2: Nome + LinkedIn (per trovare profilo anche se URL non fornito)
    queries.push(`${fullName} LinkedIn`)

    // Query 3: Nome + social media alternativi
    queries.push(`${fullName} (Twitter OR TikTok OR YouTube OR GitHub)`)

    // Query 4: Nome + professione (se disponibile da altri dati)
    // queries.push(`${fullName} CEO OR founder OR manager`)

    // Query 5: Nome + articoli/interviste
    queries.push(`${fullName} (interview OR article OR press OR news)`)

    return queries
  }

  /**
   * Esegui singola query Google Custom Search
   */
  private async executeSearch(query: string): Promise<GoogleSearchResult[]> {
    const url = `https://www.googleapis.com/customsearch/v1?key=${this.apiKey}&cx=${this.searchEngineId}&q=${encodeURIComponent(query)}&num=10`

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'LEO-FODI-OSINT/1.0',
        },
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        throw new Error(`Google API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.items || data.items.length === 0) {
        console.log(`[GoogleSearchOSINT] No results for query: ${query}`)
        return []
      }

      return data.items.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        displayLink: item.displayLink,
        source: this.categorizeSource(item.link),
      }))

    } catch (error) {
      console.error(`[GoogleSearchOSINT] Search failed: ${error instanceof Error ? error.message : String(error)}`)
      return []
    }
  }

  /**
   * Categorizza fonte del risultato
   */
  private categorizeSource(url: string): string {
    const lowerUrl = url.toLowerCase()

    if (lowerUrl.includes('linkedin.com')) return 'linkedin'
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'twitter'
    if (lowerUrl.includes('facebook.com')) return 'facebook'
    if (lowerUrl.includes('instagram.com')) return 'instagram'
    if (lowerUrl.includes('tiktok.com')) return 'tiktok'
    if (lowerUrl.includes('youtube.com')) return 'youtube'
    if (lowerUrl.includes('github.com')) return 'github'
    if (lowerUrl.includes('medium.com')) return 'medium'
    if (lowerUrl.includes('behance.net')) return 'behance'
    if (lowerUrl.includes('dribbble.com')) return 'dribbble'

    // Identifica articoli/news
    if (lowerUrl.includes('/articol') || lowerUrl.includes('/news') ||
        lowerUrl.includes('/blog') || lowerUrl.includes('/post')) {
      return 'article'
    }

    return 'other'
  }

  /**
   * Analizza risultati e estrai insight
   */
  private analyzeResults(
    target: ProfilingTarget,
    results: GoogleSearchResult[],
    queries: string[]
  ): GoogleSearchOSINTData {
    // FIX 2: Filter results to avoid mixing with other people (omonimi)
    const targetLinkedInUrl = target.linkedin_url?.replace('https://', '').replace('www.', '').replace(/\/$/, '') || ''

    const filteredResults = results.filter(result => {
      const url = result.link?.replace('https://', '').replace('www.', '') || ''
      const isLinkedInProfile = url.includes('linkedin.com/in/')

      if (isLinkedInProfile && targetLinkedInUrl) {
        // Only include LinkedIn profiles that match target URL
        return url.includes(targetLinkedInUrl)
      }

      // Include all non-LinkedIn results (articles, news, other social, etc.)
      return true
    })

    console.log(`[GoogleSearchOSINT] 📊 Filtered ${filteredResults.length}/${results.length} results (removed ${results.length - filteredResults.length} mismatched profiles)`)

    const socialProfiles: any = {}
    const mentions: any = {
      articles: [],
      interviews: [],
      press_releases: [],
      other: [],
    }

    for (const result of filteredResults) {
      // Estrai profili social
      switch (result.source) {
        case 'twitter':
          if (!socialProfiles.twitter) socialProfiles.twitter = result.link
          break
        case 'tiktok':
          if (!socialProfiles.tiktok) socialProfiles.tiktok = result.link
          break
        case 'youtube':
          if (!socialProfiles.youtube) socialProfiles.youtube = result.link
          break
        case 'github':
          if (!socialProfiles.github) socialProfiles.github = result.link
          break
        case 'medium':
          if (!socialProfiles.medium) socialProfiles.medium = result.link
          break
        case 'article':
          if (result.snippet.toLowerCase().includes('interview')) {
            mentions.interviews.push(result.link)
          } else if (result.snippet.toLowerCase().includes('press release')) {
            mentions.press_releases.push(result.link)
          } else {
            mentions.articles.push(result.link)
          }
          break
        default:
          if (result.source !== 'linkedin' && result.source !== 'facebook' && result.source !== 'instagram') {
            mentions.other.push(result.link)
          }
      }
    }

    return {
      target_name: `${target.nome} ${target.cognome}`,
      queries_executed: queries,
      total_results: filteredResults.length, // FIX: Use filtered count
      results: filteredResults, // FIX: Return only filtered results
      social_profiles_found: socialProfiles,
      mentions: mentions,
      searched_at: new Date().toISOString(),
    }
  }

  /**
   * Verifica se API è configurata
   */
  isEnabled(): boolean {
    return this.useScrapecreators || this.enabled
  }
}
