/**
 * Web Lead Enrichment
 * Automated web search and data extraction for lead enrichment
 *
 * Features:
 * - Web search for missing company information
 * - Social media profile discovery (LinkedIn, Facebook, Instagram)
 * - Website discovery if missing
 * - Contact information extraction from web results
 * - AI-powered analysis of gathered data
 */

import type { Lead } from '@/lib/types/lead-extraction'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { callScrapeCreators } from '@/lib/scrapecreators/client'

interface WebEnrichmentResult {
  sito_web?: string
  linkedin_url?: string
  facebook_url?: string
  instagram_url?: string // For social media analysis
  email_principale?: string
  email_secondaria?: string
  telefono_principale?: string
  telefono_mobile?: string
  note_enrichment?: string
  sources_found: string[]
}

/**
 * Perform comprehensive OSINT enrichment on a lead
 */
export async function performWebEnrichment(lead: Lead): Promise<Lead> {
  console.log(`[WebEnrichment] Starting enrichment for: ${lead.ragione_sociale}`)

  try {
    // Step 1: Web Search for missing information
    const webResults = await searchWebForCompany(lead)

    if (webResults.length === 0) {
      console.log('[WebEnrichment] ⚠️  No search results found')
      return lead
    }

    // Step 2: AI extraction from search results
    const emptyData: WebEnrichmentResult = { sources_found: [] }
    let enrichedData = await enrichWithAI(lead, emptyData, webResults)

    // Step 3: Deep website analysis if site found
    if (enrichedData.sito_web) {
      console.log(`[WebEnrichment] 🌐 Deep analyzing website: ${enrichedData.sito_web}`)
      const websiteData = await analyzeWebsiteWithAI(lead, enrichedData.sito_web)

      // Merge website data (website data has priority for contacts)
      enrichedData = {
        ...enrichedData,
        email_principale: websiteData.email_principale || enrichedData.email_principale,
        email_secondaria: websiteData.email_secondaria || enrichedData.email_secondaria,
        telefono_principale: websiteData.telefono_principale || enrichedData.telefono_principale,
        telefono_mobile: websiteData.telefono_mobile || enrichedData.telefono_mobile,
        linkedin_url: websiteData.linkedin_url || enrichedData.linkedin_url,
        facebook_url: websiteData.facebook_url || enrichedData.facebook_url,
        instagram_url: websiteData.instagram_url || enrichedData.instagram_url,
        sources_found: [...enrichedData.sources_found, ...websiteData.sources_found],
      }
    }

    // Step 4: Search for PERSONAL social profiles (for professionals)
    if (!enrichedData.linkedin_url || !enrichedData.facebook_url) {
      console.log(`[WebEnrichment] 👤 Searching personal social profiles...`)
      const socialData = await findPersonalSocialProfiles(lead, enrichedData)

      // Merge social data
      enrichedData = {
        ...enrichedData,
        linkedin_url: enrichedData.linkedin_url || socialData.linkedin_url,
        facebook_url: enrichedData.facebook_url || socialData.facebook_url,
        instagram_url: enrichedData.instagram_url || socialData.instagram_url,
        sources_found: [...enrichedData.sources_found, ...socialData.sources_found],
      }
    }

    // Step 5: Merge enriched data with original lead
    const enrichedLead: Lead = {
      ...lead,
      sito_web: enrichedData.sito_web || lead.sito_web,
      linkedin_url: enrichedData.linkedin_url || lead.linkedin_url,
      facebook_url: enrichedData.facebook_url || lead.facebook_url,
      instagram_url: enrichedData.instagram_url || lead.instagram_url, // Keep for social media analysis
      email_principale: enrichedData.email_principale || lead.email_principale,
      telefono_principale: enrichedData.telefono_principale || lead.telefono_principale,
      telefono_mobile: enrichedData.telefono_mobile || lead.telefono_mobile,
      note: enrichedData.note_enrichment
        ? `${lead.note || ''}\n\n🔍 Web: ${enrichedData.note_enrichment}`.trim()
        : lead.note,
      fonti_consultate: [
        ...(lead.fonti_consultate || []),
        'web_enrichment',
        ...enrichedData.sources_found,
      ],
      updated_at: new Date().toISOString(),
    }

    // Update reliability score if new data found
    const newDataCount = Object.keys(enrichedData).filter(
      key => key !== 'sources_found' && key !== 'note_enrichment' && enrichedData[key as keyof WebEnrichmentResult]
    ).length

    if (newDataCount > 0) {
      enrichedLead.affidabilita_score = Math.min(
        (enrichedLead.affidabilita_score || 0) + (newDataCount * 5),
        100
      )
    }

    console.log(`[WebEnrichment] ✅ Enrichment completed. Found ${newDataCount} new data points`)
    return enrichedLead

  } catch (error) {
    console.error(`[WebEnrichment] Error enriching ${lead.ragione_sociale}:`, error)
    return lead // Return original lead on error
  }
}

/**
 * Search web for company information (Optimized - 3 targeted queries)
 */
async function searchWebForCompany(lead: Lead): Promise<string[]> {
  const searchQueries = [
    `${lead.ragione_sociale} ${lead.citta || ''} contatti sito`.trim(), // Combined: website + contacts
    `${lead.ragione_sociale} LinkedIn Facebook Instagram`, // Combined: all social
    `${lead.ragione_sociale} ${lead.settore} email telefono`, // Combined: contacts + sector
  ]

  const results: { title: string; link: string; snippet: string }[] = []

  for (const query of searchQueries) {
    try {
      // Try ScrapeCreators first (preferred method)
      if (process.env.SCRAPECREATORS_API_KEY) {
        console.log(`[WebEnrichment] 🔍 Searching: "${query}"`)

        const response = await callScrapeCreators<{ results: any[] }>('google/search', {
          query: query,
          num_results: 3, // Top 3 results per query (optimized)
        })

        if (response.results) {
          results.push(
            ...response.results.map((item: any) => ({
              title: item.title,
              link: item.url, // ScrapeCreators uses 'url' instead of 'link'
              snippet: item.snippet,
            }))
          )
        }
      }
      // Fallback to Google Custom Search API if ScrapeCreators not available
      else if (process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
        console.log(`[WebEnrichment] 🔍 Searching via Google Custom Search: "${query}"`)

        const response = await axios.get(
          'https://www.googleapis.com/customsearch/v1',
          {
            params: {
              key: process.env.GOOGLE_SEARCH_API_KEY,
              cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
              q: query,
              num: 5,
            },
            timeout: 30000,
          }
        )

        if (response.data.items) {
          results.push(
            ...response.data.items.map((item: any) => ({
              title: item.title,
              link: item.link,
              snippet: item.snippet,
            }))
          )
        }
      } else {
        console.warn('[WebEnrichment] ⚠️  No search API configured (ScrapeCreators or Google Custom Search), skipping web search')
        break // No point trying other queries
      }

      // Rate limiting (optimized)
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error: any) {
      console.error(`[WebEnrichment] ❌ Error searching for "${query}": ${error.message}`)
    }
  }

  console.log(`[WebEnrichment] ✅ Found ${results.length} search results`)
  return results.map((r: any) => `${r.title}\n${r.link}\n${r.snippet}`)
}

/**
 * Extract enrichment data from web search results
 */
async function extractWebEnrichmentData(lead: Lead, webResults: string[]): Promise<WebEnrichmentResult> {
  const result: WebEnrichmentResult = {
    sources_found: [],
  }

  const allText = webResults.join('\n')

  // Blacklist of aggregator sites to exclude from website extraction
  const siteBlacklist = [
    'facebook.com',
    'linkedin.com',
    'instagram.com',
    'twitter.com',
    'youtube.com',
    'paginegialle.it',
    'paginebianche.it',
    'google.com',
    'google.it',
    'bing.com',
    'virgilio.it',
    'tuttocitta.it',
    'europages.it',
    'infobel.com',
    'cybo.com',
    '11880.com',
    'trustpilot.com',
    'tripadvisor.it',
  ]

  // Extract website
  const websiteMatch = allText.match(/https?:\/\/(www\.)?[\w\-]+\.(it|com|eu|net|org)/gi)
  if (websiteMatch) {
    console.log(`[WebEnrichment] 🔎 Found ${websiteMatch.length} potential websites:`, websiteMatch.slice(0, 5))

    // Filter out social media, aggregators and find company website
    const website = websiteMatch.find(url =>
      !siteBlacklist.some(domain => url.toLowerCase().includes(domain))
    )
    if (website) {
      console.log(`[WebEnrichment] ✅ Selected website: ${website}`)
      result.sito_web = website
      result.sources_found.push('web_search_website')
    } else {
      console.log('[WebEnrichment] ⚠️  No valid website found (all matches were blacklisted)')
    }
  }

  // Blacklist for social media links of aggregator sites
  const socialBlacklist = [
    '/italiaonline',
    '/paginegialle',
    '/paginebianche',
    '/google',
    '/bing',
    '/virgilio',
    '/europages',
    '/infobel',
    '/cybo',
    '/trustpilot',
    '/tripadvisor',
  ]

  // Extract LinkedIn
  const linkedinMatch = allText.match(/https?:\/\/(www\.)?linkedin\.com\/company\/[\w\-]+/gi)
  if (linkedinMatch) {
    console.log(`[WebEnrichment] 🔎 Found ${linkedinMatch.length} LinkedIn links:`, linkedinMatch.slice(0, 3))
    // Filter out aggregator social links
    const validLinkedin = linkedinMatch.find(url =>
      !socialBlacklist.some(blocked => url.toLowerCase().includes(blocked))
    )
    if (validLinkedin) {
      console.log(`[WebEnrichment] ✅ Selected LinkedIn: ${validLinkedin}`)
      result.linkedin_url = validLinkedin
      result.sources_found.push('web_search_linkedin')
    } else {
      console.log('[WebEnrichment] ⚠️  No valid LinkedIn found (all were aggregator links)')
    }
  }

  // Extract Facebook
  const facebookMatch = allText.match(/https?:\/\/(www\.)?facebook\.com\/[\w\-\.]+/gi)
  if (facebookMatch) {
    console.log(`[WebEnrichment] 🔎 Found ${facebookMatch.length} Facebook links:`, facebookMatch.slice(0, 3))
    // Filter out aggregator social links
    const validFacebook = facebookMatch.find(url =>
      !socialBlacklist.some(blocked => url.toLowerCase().includes(blocked))
    )
    if (validFacebook) {
      console.log(`[WebEnrichment] ✅ Selected Facebook: ${validFacebook}`)
      result.facebook_url = validFacebook
      result.sources_found.push('web_search_facebook')
    } else {
      console.log('[WebEnrichment] ⚠️  No valid Facebook found (all were aggregator links)')
    }
  }

  // Extract Instagram (for social media analysis)
  const instagramMatch = allText.match(/https?:\/\/(www\.)?instagram\.com\/[\w\-\.]+/gi)
  if (instagramMatch) {
    console.log(`[WebEnrichment] 🔎 Found ${instagramMatch.length} Instagram links:`, instagramMatch.slice(0, 3))
    // Filter out aggregator social links
    const validInstagram = instagramMatch.find(url =>
      !socialBlacklist.some(blocked => url.toLowerCase().includes(blocked))
    )
    if (validInstagram) {
      console.log(`[WebEnrichment] ✅ Selected Instagram: ${validInstagram}`)
      result.instagram_url = validInstagram
      result.sources_found.push('web_search_instagram')
    } else {
      console.log('[WebEnrichment] ⚠️  No valid Instagram found (all were aggregator links)')
    }
  }

  // Extract emails
  const emailMatch = allText.match(/[\w\.\-]+@[\w\.\-]+\.(it|com|eu|net|org)/gi)
  if (emailMatch) {
    const validEmails = emailMatch.filter(email =>
      !email.includes('noreply') &&
      !email.includes('example') &&
      !email.includes('@google') &&
      !email.includes('@facebook')
    )
    if (validEmails[0]) result.email_principale = validEmails[0]
    if (validEmails[1]) result.email_secondaria = validEmails[1]
    if (validEmails.length > 0) result.sources_found.push('web_search_email')
  }

  // Extract phone numbers (Italian format)
  const phoneMatch = allText.match(/(?:\+39\s?)?0?\d{2,3}[\s\-]?\d{6,7}/g)
  if (phoneMatch) {
    const phones = phoneMatch.filter(p => p.length >= 9)
    if (phones[0]) result.telefono_principale = phones[0]
    if (phones[1]) result.telefono_mobile = phones[1]
    if (phones.length > 0) result.sources_found.push('web_search_phone')
  }

  return result
}

/**
 * Deep Website Analysis with AI
 * Scrapes website content and uses AI to extract ALL contact info
 */
async function analyzeWebsiteWithAI(lead: Lead, websiteUrl: string): Promise<WebEnrichmentResult> {
  const apiKey = process.env.XAI_API_KEY

  try {
    console.log(`[WebEnrichment] 📥 Fetching website content...`)

    // Fetch website content
    const response = await axios.get(websiteUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    const $ = cheerio.load(response.data)

    // Remove scripts, styles, comments
    $('script, style, noscript, iframe').remove()
    $('*').contents().each(function() {
      if (this.type === 'comment') $(this).remove()
    })

    // Extract text content
    const pageText = $('body').text()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .slice(0, 8000) // Limit to 8000 chars for AI

    // Extract all links
    const allLinks: string[] = []
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href')
      if (href) allLinks.push(href)
    })

    console.log(`[WebEnrichment] 🤖 AI analyzing website content (${pageText.length} chars)...`)

    if (!apiKey) {
      // Fallback to basic regex extraction
      return extractFromWebsiteBasic($, pageText, allLinks)
    }

    // AI analysis of website content
    const prompt = `Estrai TUTTI i contatti da questo sito web di: ${lead.ragione_sociale}

CONTENUTO SITO:
${pageText}

LINK TROVATI:
${allLinks.slice(0, 30).join('\n')}

CERCA ATTENTAMENTE:
- Tutte le email (info@, contatti@, segreteria@, etc.)
- Tutti i telefoni (fisso, mobile, whatsapp)
- Link social nei tag <a> (LinkedIn, Facebook, Instagram)

JSON OUTPUT:
{
  "email_principale": "email primaria trovata",
  "email_secondaria": "email secondaria se presente",
  "telefono_principale": "telefono fisso",
  "telefono_mobile": "cellulare/whatsapp",
  "linkedin_url": "link linkedin aziendale",
  "facebook_url": "link facebook",
  "instagram_url": "link instagram"
}

Estrai TUTTO ciò che trovi! Anche numeri/email nel footer, contatti, etc.`

    const aiResponse = await axios.post(
      `${process.env.XAI_API_URL || 'https://api.x.ai/v1'}/chat/completions`,
      {
        model: process.env.XAI_MODEL || 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'Esperto estrazione contatti da siti web. Trova OGNI email, telefono, social. Output: JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0,
        max_tokens: 600,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 20000,
      }
    )

    const jsonMatch = aiResponse.data.choices[0].message.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.warn('[WebEnrichment] Invalid AI response from website analysis')
      return { sources_found: [] }
    }

    const ai = JSON.parse(jsonMatch[0])

    // Debug logging
    const found = []
    if (ai.email_principale) found.push('email1')
    if (ai.email_secondaria) found.push('email2')
    if (ai.telefono_principale) found.push('tel')
    if (ai.telefono_mobile) found.push('mobile')
    if (ai.linkedin_url) found.push('linkedin')
    if (ai.facebook_url) found.push('facebook')
    if (ai.instagram_url) found.push('instagram')

    console.log(`[WebEnrichment] ✅ Website analysis: ${found.join(', ') || 'nothing'}`)

    return {
      email_principale: ai.email_principale,
      email_secondaria: ai.email_secondaria,
      telefono_principale: ai.telefono_principale,
      telefono_mobile: ai.telefono_mobile,
      linkedin_url: ai.linkedin_url,
      facebook_url: ai.facebook_url,
      instagram_url: ai.instagram_url,
      sources_found: ['website_deep_analysis'],
    }

  } catch (error: any) {
    console.error('[WebEnrichment] Website analysis error:', error.message)
    return { sources_found: [] }
  }
}

/**
 * Basic regex extraction fallback (when AI not available)
 */
function extractFromWebsiteBasic($: any, pageText: string, allLinks: string[]): WebEnrichmentResult {
  const result: WebEnrichmentResult = { sources_found: ['website_regex'] }

  // Extract emails
  const emailMatches = pageText.match(/[\w\.\-]+@[\w\.\-]+\.(it|com|eu|net|org)/gi)
  if (emailMatches) {
    const validEmails = emailMatches.filter(e =>
      !e.includes('example') && !e.includes('noreply') && !e.includes('@sentry')
    )
    if (validEmails[0]) result.email_principale = validEmails[0]
    if (validEmails[1]) result.email_secondaria = validEmails[1]
  }

  // Extract phones
  const phoneMatches = pageText.match(/(?:\+39\s?)?0?\d{2,3}[\s\-\.]?\d{6,7}/g)
  if (phoneMatches) {
    const phones = phoneMatches.filter(p => p.replace(/\D/g, '').length >= 9)
    if (phones[0]) result.telefono_principale = phones[0]
    if (phones[1]) result.telefono_mobile = phones[1]
  }

  // Extract social links
  const linkedinLink = allLinks.find(l => l.includes('linkedin.com/company/'))
  const facebookLink = allLinks.find(l => l.includes('facebook.com/') && !l.includes('/sharer'))
  const instagramLink = allLinks.find(l => l.includes('instagram.com/'))

  if (linkedinLink) result.linkedin_url = linkedinLink
  if (facebookLink) result.facebook_url = facebookLink
  if (instagramLink) result.instagram_url = instagramLink

  return result
}

/**
 * Find Personal Social Profiles (for professionals: doctors, lawyers, dentists)
 * Searches for PERSONAL profiles on LinkedIn/Facebook and analyzes bio
 */
async function findPersonalSocialProfiles(lead: Lead, currentData: WebEnrichmentResult): Promise<WebEnrichmentResult> {
  const apiKey = process.env.XAI_API_KEY

  if (!process.env.SCRAPECREATORS_API_KEY) {
    console.log('[WebEnrichment] ⚠️  ScrapeCreators not configured, skipping personal profile search')
    return { sources_found: [] }
  }

  try {
    // Extract person name from ragione_sociale (es. "Fava Dr. Pierluigi" → "Pierluigi Fava")
    const nameMatch = lead.ragione_sociale.match(/(\w+)\s+(?:Dr\.|Dott\.|Avv\.)\s+(\w+)/i)
    const personName = nameMatch ? `${nameMatch[2]} ${nameMatch[1]}` : lead.ragione_sociale

    console.log(`[WebEnrichment] 🔍 Searching for: ${personName}`)

    // Search for personal profiles
    const searchQuery = `${personName} ${lead.settore} ${lead.citta || ''} facebook OR linkedin`

    const response = await callScrapeCreators<{ results: any[] }>('google/search', {
      query: searchQuery.trim(),
      num_results: 5,
    })

    if (!response.results || response.results.length === 0) {
      console.log('[WebEnrichment] ⚠️  No personal profiles found')
      return { sources_found: [] }
    }

    const searchResults = response.results.map((item: any) =>
      `${item.title}\n${item.url}\n${item.snippet}`
    ).join('\n---\n')

    if (!apiKey) {
      // Fallback: basic regex
      const linkedinPersonal = response.results.find((r: any) => r.url.includes('linkedin.com/in/'))
      const facebookPersonal = response.results.find((r: any) => r.url.includes('facebook.com/') && !r.url.includes('/company'))

      return {
        linkedin_url: linkedinPersonal?.url,
        facebook_url: facebookPersonal?.url,
        sources_found: linkedinPersonal || facebookPersonal ? ['personal_profiles_regex'] : [],
      }
    }

    // AI analysis to find correct personal profile
    const prompt = `Trova il profilo social PERSONALE corretto per: ${lead.ragione_sociale}

PERSONA: ${personName}
PROFESSIONE: ${lead.settore}
CITTÀ: ${lead.citta || 'N/A'}

RISULTATI RICERCA:
${searchResults}

TASK:
1. Identifica il profilo LinkedIn o Facebook PERSONALE (non aziendale) che corrisponde
2. Verifica che sia la persona giusta guardando la bio/descrizione
3. Estrai informazioni dalla bio (università, affiliazioni, città, specializzazione)

JSON OUTPUT:
{
  "linkedin_url": "profilo linkedin.com/in/ o null",
  "facebook_url": "profilo facebook personale o null",
  "instagram_url": "profilo instagram personale o null",
  "match_confidence": 0-100,
  "bio_info": "info estratte dalla bio (università, città, etc.) max 150 char"
}

IMPORTANTE: Solo se SEI SICURO che è la persona giusta!`

    const aiResponse = await axios.post(
      `${process.env.XAI_API_URL || 'https://api.x.ai/v1'}/chat/completions`,
      {
        model: process.env.XAI_MODEL || 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'Esperto identificazione profili social personali. Verifica identità da bio. Output: JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0,
        max_tokens: 400,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 20000,
      }
    )

    const jsonMatch = aiResponse.data.choices[0].message.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.warn('[WebEnrichment] Invalid AI response for personal profiles')
      return { sources_found: [] }
    }

    const ai = JSON.parse(jsonMatch[0])

    if (ai.match_confidence && ai.match_confidence >= 70) {
      const found = []
      if (ai.linkedin_url) found.push('linkedin-personal')
      if (ai.facebook_url) found.push('facebook-personal')
      if (ai.instagram_url) found.push('instagram-personal')

      console.log(`[WebEnrichment] ✅ Personal profiles: ${found.join(', ')} (${ai.match_confidence}% match)`)
      if (ai.bio_info) console.log(`[WebEnrichment] 📋 Bio info: ${ai.bio_info}`)

      return {
        linkedin_url: ai.linkedin_url,
        facebook_url: ai.facebook_url,
        instagram_url: ai.instagram_url,
        sources_found: found.length > 0 ? ['personal_profiles_ai'] : [],
      }
    } else {
      console.log(`[WebEnrichment] ⚠️  Low confidence (${ai.match_confidence}%), skipping personal profiles`)
      return { sources_found: [] }
    }

  } catch (error: any) {
    console.error('[WebEnrichment] Personal profiles search error:', error.message)
    return { sources_found: [] }
  }
}

/**
 * Lead Intelligence Extractor (Optimized)
 * Fast, cost-effective AI extraction with validation
 */
async function enrichWithAI(
  lead: Lead,
  enrichmentData: WebEnrichmentResult,
  webResults: string[]
): Promise<WebEnrichmentResult> {
  const apiKey = process.env.XAI_API_KEY
  const apiUrl = process.env.XAI_API_URL || 'https://api.x.ai/v1'

  if (!apiKey) {
    console.warn('[WebEnrichment] XAI_API_KEY not configured, skipping AI analysis')
    return enrichmentData
  }

  try {
    console.log(`[WebEnrichment] 🤖 AI analyzing ${webResults.length} results...`)

    // Take all results (already limited to 9 by search)
    const prompt = `Analizza TUTTI i risultati e trova OGNI informazione per: ${lead.ragione_sociale}

CERCA ATTENTAMENTE:
- Sito web ufficiale (NO paginegialle/google/bing)
- LinkedIn, Facebook, Instagram DELL'AZIENDA (NO /italiaonline o /paginegialle)
- Email e telefoni nei testi e link
- SCAVA NEI DETTAGLI: snippet, descrizioni, url

RISULTATI WEB:
${webResults.join('\n---\n')}

JSON (estrai TUTTO ciò che trovi):
{
  "sito_web": "url ufficiale",
  "linkedin_url": "linkedin aziendale (MAI aggregatori)",
  "facebook_url": "facebook aziendale (MAI aggregatori)",
  "instagram_url": "instagram aziendale",
  "email_principale": "email trovata",
  "telefono_principale": "tel trovato",
  "confidence": 0-100,
  "note": "cosa hai trovato (80 char)"
}

IMPORTANTE: Controlla OGNI risultato, anche snippet e descrizioni per email/telefoni/social!`

    const response = await axios.post(
      `${apiUrl}/chat/completions`,
      {
        model: process.env.XAI_MODEL || 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'Sei un estrattore esperto. ANALIZZA OGNI dettaglio: snippet, url, descrizioni. Trova TUTTE le info (email, tel, social). Output: JSON. Mai inventare.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0, // Maximum precision
        max_tokens: 800, // Slightly increased for thorough extraction
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 30000, // Reduced from 60s
      }
    )

    const aiResponse = response.data.choices[0].message.content
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      console.warn('[WebEnrichment] Invalid AI response')
      return enrichmentData
    }

    const ai = JSON.parse(jsonMatch[0])

    // Debug logging
    const found = []
    if (ai.sito_web) found.push('sito')
    if (ai.linkedin_url) found.push('linkedin')
    if (ai.facebook_url) found.push('facebook')
    if (ai.instagram_url) found.push('instagram')
    if (ai.email_principale) found.push('email')
    if (ai.telefono_principale) found.push('tel')

    console.log(`[WebEnrichment] ✅ Confidence: ${ai.confidence}% | Found: ${found.join(', ') || 'nothing'}`)
    console.log(`[WebEnrichment] 📝 ${ai.note || 'N/A'}`)

    return {
      sito_web: ai.sito_web || enrichmentData.sito_web,
      linkedin_url: ai.linkedin_url || enrichmentData.linkedin_url,
      facebook_url: ai.facebook_url || enrichmentData.facebook_url,
      instagram_url: ai.instagram_url || enrichmentData.instagram_url,
      email_principale: ai.email_principale || enrichmentData.email_principale,
      telefono_principale: ai.telefono_principale || enrichmentData.telefono_principale,
      note_enrichment: ai.note,
      sources_found: [...enrichmentData.sources_found, 'ai_extract'],
    }

  } catch (error: any) {
    console.error('[WebEnrichment] AI error:', error.code || error.message)
    return enrichmentData // Silent fallback
  }
}
