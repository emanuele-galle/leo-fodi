/**
 * Pagine Gialle Extractor
 * Extracts business data from Pagine Gialle directory
 * REAL IMPLEMENTATION with web scraping
 */

import axios from 'axios'
import * as cheerio from 'cheerio'
import type { BaseExtractor } from './base-extractor'
import type { LeadSearchParams, Lead } from '@/lib/types/lead-extraction'
import {
  generateLeadId,
  normalizeText,
  extractPhoneNumbers,
  extractEmails,
  extractWebsites,
} from './base-extractor'
import { calculateAffidabilitaScore } from '../extraction-worker'

/**
 * Pagine Gialle Extractor - REAL IMPLEMENTATION
 * Performs actual web scraping of Pagine Gialle
 */
export const pagineGialleExtractor: BaseExtractor = {
  name: 'Pagine Gialle',
  tipo: 'directory',

  async extract(params: LeadSearchParams): Promise<Lead[]> {
    console.log('[PagineGialle] Starting REAL extraction with params:', params)

    try {
      // Perform real web scraping
      const scrapedLeads = await scrapePagineGialle(params)

      console.log(`[PagineGialle] Found ${scrapedLeads.length} REAL leads`)
      return scrapedLeads
    } catch (error) {
      console.error('[PagineGialle] Extraction error:', error)
      // Return empty array on error - no mock data
      return []
    }
  },
}

/**
 * Scrape real data from Pagine Gialle
 * NEW APPROACH: Extract data from JavaScript variables embedded in HTML
 */
async function scrapePagineGialle(params: LeadSearchParams): Promise<Lead[]> {
  const leads: Lead[] = []

  try {
    // Build search URL
    const searchQuery = buildSearchQuery(params)
    const url = `https://www.paginegialle.it/ricerca/${encodeURIComponent(searchQuery)}/${encodeURIComponent(params.comune || params.regione || 'italia')}`

    console.log(`[PagineGialle] 🔍 Scraping URL: ${url}`)

    // Make HTTP request with proper headers
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.paginegialle.it/',
        'Connection': 'keep-alive',
      },
      timeout: 15000, // 15 second timeout
      maxRedirects: 5,
    })

    const htmlContent = response.data

    // NEW: Extract business IDs from JavaScript cookie data
    const shinyPosCookieMatch = htmlContent.match(/shinyPosCookie:\s*"([^"]+)"/)

    if (shinyPosCookieMatch && shinyPosCookieMatch[1]) {
      const businessIds = shinyPosCookieMatch[1].split('|').map((entry: string) => {
        // Format: "01_aldopola-mi" -> extract business slug
        const parts = entry.split('_')
        return parts.length > 1 ? parts[1] : null
      }).filter(Boolean)

      console.log(`[PagineGialle] 🎯 Found ${businessIds.length} business IDs in cookie data`)

      // For each business ID, try to extract data from page
      for (const businessId of businessIds.slice(0, 50)) { // Limit to 50
        try {
          const leadData = await extractBusinessFromPage(businessId, htmlContent, params)
          if (leadData) {
            leads.push(leadData)
          }
        } catch (err) {
          console.warn(`[PagineGialle] ⚠️  Error extracting ${businessId}:`, err)
        }
      }

      console.log(`[PagineGialle] ✅ Successfully extracted ${leads.length} leads from cookie data`)
      return leads
    }

    // FALLBACK: Try classic HTML parsing
    console.log(`[PagineGialle] ⚠️  No cookie data found, trying HTML parsing...`)
    const $ = cheerio.load(htmlContent)

    // Extract business listings - ENHANCED selectors
    $('.list-element, .vcard, .business-item, .scheda, article[itemtype*="LocalBusiness"]').each((index, element) => {
      try {
        const $el = $(element)

        // Extract business name - ENHANCED selectors
        const ragioneSociale = normalizeText(
          $el.find('.business-name, .vcard-name, h3 a, h2 a, .title, [itemprop="name"]').first().text()
        )

        if (!ragioneSociale) return // Skip if no name found

        // Extract address - ENHANCED
        const indirizzo = normalizeText($el.find('.address, .street-address, .indirizzo, [itemprop="address"], [itemprop="streetAddress"]').first().text())
        const citta = normalizeText($el.find('.locality, .citta, .city, [itemprop="addressLocality"]').first().text())
        const provincia = normalizeText($el.find('.region, .provincia, .prov, [itemprop="addressRegion"]').first().text())

        // Extract phone numbers - ENHANCED (fixed + mobile)
        const phoneText = $el.find('.phone, .tel, .telefono, [itemprop="telephone"], [href^="tel:"]').text() + ' ' +
                          $el.find('[href^="tel:"]').map((i, el) => $(el).attr('href')?.replace('tel:', '')).get().join(' ')
        const phones = extractPhoneNumbers(phoneText)

        // Separate mobile from fixed
        const mobileMatch = phoneText.match(/(?:\+39\s?)?3\d{2}\s?\d{6,7}/)
        const mobilePhone = mobileMatch ? mobileMatch[0] : phones[1]

        // Extract website - ENHANCED
        const websiteHref = $el.find('a[href*="www"], a.website, .sito-web, [itemprop="url"]').attr('href')
        const websites = websiteHref ? extractWebsites(websiteHref) : []

        // Extract emails - ENHANCED (including PEC)
        const emailText = $el.find('.email, [href^="mailto:"]').map((i, el) => {
          return $(el).attr('href')?.replace('mailto:', '') || $(el).text()
        }).get().join(' ')
        const emails = extractEmails(emailText)
        const pecEmail = emails.find(e => e.includes('pec'))

        // Extract social media - NUOVO
        const allLinks = $el.find('a[href]').map((i, el) => $(el).attr('href')).get()
        const linkedin = allLinks.find(href => href?.includes('linkedin.com'))
        const facebook = allLinks.find(href => href?.includes('facebook.com'))
        const instagram = allLinks.find(href => href?.includes('instagram.com'))
        const whatsapp = allLinks.find(href => href?.includes('wa.me') || href?.includes('whatsapp'))

        // Extract category/description - NUOVO
        const categoria = normalizeText($el.find('.category, .attivita, .categoria, [itemprop="description"]').first().text())
        const descrizione = normalizeText($el.find('.description, .desc, .about').first().text()).substring(0, 200)

        // Create lead data - ENHANCED
        const leadData: Partial<Lead> = {
          id: generateLeadId(),
          ragione_sociale: ragioneSociale,
          settore: params.settore,
          categoria: categoria || params.sottocategoria,

          // Address
          indirizzo: indirizzo || undefined,
          citta: citta || params.comune || undefined,
          provincia: provincia || params.provincia || undefined,
          regione: params.regione || undefined,
          nazione: 'IT',

          // Contacts - ENHANCED
          telefono_principale: phones[0] || undefined,
          telefono_mobile: mobilePhone || undefined,
          email_principale: emails[0] || undefined,
          email_pec: pecEmail || undefined,  // Changed from 'pec' to 'email_pec'
          sito_web: websites[0] || undefined,

          // Social media - NUOVO
          linkedin_url: linkedin || undefined,
          facebook_url: facebook || undefined,
          instagram_url: instagram || undefined,

          // Notes - ENHANCED
          note: descrizione ? `Desc: ${descrizione}` : undefined,

          // Metadata
          fonte_primaria: 'pagine_gialle',
          fonti_consultate: ['pagine_gialle'],
          validazione_status: 'pending',
          data_estrazione: new Date().toISOString(),
          attivo: true,
          da_contattare: true,
          priorita: linkedin ? 'alta' : 'media', // Alta se ha LinkedIn
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),

          // Extra data - NUOVO
          extra_data: {
            whatsapp: whatsapp || undefined,
            categoria_dettaglio: categoria || undefined,
            has_social: !!(linkedin || facebook || instagram),
            social_count: [linkedin, facebook, instagram].filter(Boolean).length,
          },
        }

        // Calculate affidabilita score - ENHANCED with social bonus
        let baseScore = calculateAffidabilitaScore(leadData)
        if (linkedin) baseScore += 10
        if (facebook || instagram) baseScore += 5
        if (pecEmail) baseScore += 5
        leadData.affidabilita_score = Math.min(baseScore, 100)

        leads.push(leadData as Lead)

        // Limit to reasonable number per page
        if (leads.length >= 50) return false // Increased limit to 50
      } catch (itemError) {
        console.error('[PagineGialle] Error parsing business item:', itemError)
      }
    })

    console.log(`[PagineGialle] Successfully scraped ${leads.length} leads`)
    return leads
  } catch (error) {
    console.error('[PagineGialle] Scraping error:', error)
    throw error
  }
}

/**
 * Fetch and extract contact details from business detail page
 * Returns: { telefono, email, sito_web, social }
 */
async function fetchBusinessDetails(businessId: string): Promise<{
  telefono?: string
  email?: string
  sito_web?: string
  facebook_url?: string
  linkedin_url?: string
  instagram_url?: string
}> {
  try {
    const detailUrl = `https://www.paginegialle.it/${businessId}`
    console.log(`[PagineGialle] 📞 Fetching contact details from: ${detailUrl}`)

    const response = await axios.get(detailUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
      },
      timeout: 30000,
    })

    const $ = cheerio.load(response.data)
    const pageText = $.text()

    // Extract phone from mailto body (contains full business info including phone)
    const mailtoLink = $('[href^="mailto:"]').first().attr('href')
    let telefono: string | undefined
    if (mailtoLink) {
      // Phone is in the body parameter: "0984 846363"
      const phoneMatch = mailtoLink.match(/body=.*?(\d{4}\s\d{6})/)
      if (phoneMatch && phoneMatch[1]) {
        telefono = phoneMatch[1].replace(/\s/g, ' ') // Keep single space
      }
    }

    // Extract email from page text using regex
    const emailMatch = pageText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
    const email = emailMatch ? emailMatch[1] : undefined

    // Extract website (look for external links that aren't paginegialle.it)
    const websiteLink = $('a[href^="http"]')
      .filter((i, el) => {
        const href = $(el).attr('href') || ''
        return (
          !href.includes('paginegialle.it') &&
          !href.includes('facebook.com') &&
          !href.includes('linkedin.com') &&
          !href.includes('instagram.com') &&
          !href.includes('italiaonline.it')
        )
      })
      .first()
      .attr('href')

    // Extract social media links (business-specific, not Pagine Gialle's own)
    // Note: In most cases these won't be present on PG pages
    const allLinks = $('a[href]')
      .map((i, el) => $(el).attr('href'))
      .get()
    const facebook = allLinks.find((href) => href?.includes('facebook.com') && !href.includes('paginegialle'))
    const linkedin = allLinks.find((href) => href?.includes('linkedin.com') && !href.includes('italiaonline'))
    const instagram = allLinks.find((href) => href?.includes('instagram.com'))

    const result = {
      telefono,
      email,
      sito_web: websiteLink,
      facebook_url: facebook,
      linkedin_url: linkedin,
      instagram_url: instagram,
    }

    console.log(
      `[PagineGialle] ✅ Contacts: Phone=${telefono || 'N/A'}, Email=${email || 'N/A'}, Website=${websiteLink || 'N/A'}`
    )

    return result
  } catch (error) {
    console.error(`[PagineGialle] ❌ Error fetching details for ${businessId}:`, error)
    return {}
  }
}

/**
 * Rate-limited delay between requests (500ms = 2 requests/second)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Extract business data from business ID - FIXED FOR REAL PAGINE GIALLE STRUCTURE
 * Based on actual HTML analysis from test-pagine-gialle.js
 *
 * Key findings:
 * - Business links: <a href="https://www.paginegialle.it/{businessId}">
 * - Business name: <h2 class="search-itm__rag">
 * - Category: <div class="search-itm__category">
 * - Address: <div class="search-itm__adr">
 * - Description: <div class="search-itm__dsc">
 *
 * ENHANCED: Now fetches detail page to extract phone + email
 */
async function extractBusinessFromPage(
  businessId: string,
  htmlContent: string,
  params: LeadSearchParams
): Promise<Lead | null> {
  try {
    const $ = cheerio.load(htmlContent)

    // Find business link by exact href match
    const businessLink = $(`a[href="https://www.paginegialle.it/${businessId}"]`).first()

    if (businessLink.length === 0) {
      console.warn(`[PagineGialle] ⚠️  Business link not found for ID: ${businessId}`)
      return null
    }

    // === EXTRACT BUSINESS NAME ===
    const ragioneSociale = normalizeText(
      businessLink.find('h2.search-itm__rag').first().text()
    )

    if (!ragioneSociale) {
      console.warn(`[PagineGialle] ⚠️  Business name not found for ID: ${businessId}`)
      return null
    }

    // === EXTRACT CATEGORY ===
    const categoria = normalizeText(
      businessLink.find('.search-itm__category').first().text()
    )

    // === EXTRACT ADDRESS ===
    const addressBlock = businessLink.find('.search-itm__adr').first()
    const addressText = normalizeText(addressBlock.text())

    // Extract CAP (postal code - 5 digits)
    const capMatch = addressText.match(/\b(\d{5})\b/)
    const cap = capMatch ? capMatch[1] : undefined

    // Extract all spans from address block
    const spans = addressBlock.find('span').toArray().map(el => $(el).text().trim())

    // Street address is first span
    const indirizzo = normalizeText(spans[0] || '')

    // Province is span in format (XX)
    const provinciaSpan = spans.find(s => s?.match(/^\([A-Z]{2}\)$/))
    const provincia = provinciaSpan ? provinciaSpan.replace(/[()]/g, '') : params.provincia

    // City name extraction: It appears between CAP and province in full text
    // Example: "Ss107 - 87036 Santo Stefano di Rende (CS)"
    // Pattern: CAP followed by city name followed by (province)
    let citta = params.comune
    if (cap && provincia) {
      // Look for text between CAP and (province)
      const cityPattern = new RegExp(`${cap}\\s+([^(]+)\\s*\\(${provincia}\\)`)
      const cityMatch = addressText.match(cityPattern)
      if (cityMatch && cityMatch[1]) {
        citta = normalizeText(cityMatch[1])
      }
    }

    // === EXTRACT DESCRIPTION ===
    const descrizione = normalizeText(
      businessLink.find('.search-itm__dsc').first().text()
    ).substring(0, 200)

    // === EXTRACT OPENING HOURS ===
    const hoursData = businessLink.find('[data-time]').attr('data-time')
    let hoursNote = ''
    if (hoursData) {
      try {
        const hours = JSON.parse(hoursData.replace(/&quot;/g, '"'))
        const today = new Date().getDay()
        const todayHours = hours[today]
        if (todayHours && todayHours.length > 0) {
          hoursNote = `Orari: ${todayHours.join(', ')}`
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

    // === FETCH CONTACT DETAILS FROM DETAIL PAGE ===
    // This adds ~500ms per business but provides phone + email
    const contactDetails = await fetchBusinessDetails(businessId)

    // Rate limiting: Wait 500ms between requests (2 req/sec)
    await delay(500)

    // === CREATE LEAD WITH COMPLETE DATA ===
    const leadData: Partial<Lead> = {
      id: generateLeadId(),
      ragione_sociale: ragioneSociale,
      settore: params.settore,
      categoria: categoria || params.sottocategoria,

      // Address
      indirizzo: indirizzo || undefined,
      cap: cap,
      citta: citta || undefined,
      provincia: provincia || undefined,
      regione: params.regione || undefined,
      nazione: 'IT',

      // Contacts - NOW EXTRACTED FROM DETAIL PAGE
      telefono_principale: contactDetails.telefono,
      email_principale: contactDetails.email,
      sito_web: contactDetails.sito_web,

      // Social media (rarely present on PG)
      facebook_url: contactDetails.facebook_url,
      linkedin_url: contactDetails.linkedin_url,
      instagram_url: contactDetails.instagram_url,

      // Notes - Include description and hours
      note: [descrizione, hoursNote].filter(Boolean).join(' | '),

      // Metadata
      fonte_primaria: 'pagine_gialle',
      fonti_consultate: ['pagine_gialle'],
      validazione_status: 'pending',
      data_estrazione: new Date().toISOString(),
      attivo: true,
      da_contattare: true,
      priorita: contactDetails.telefono || contactDetails.email ? 'alta' : 'media',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),

      // Extra data
      extra_data: {
        business_id: businessId,
        categoria_dettaglio: categoria || undefined,
        pagine_gialle_url: `https://www.paginegialle.it/${businessId}`,
        has_contacts: !!(contactDetails.telefono || contactDetails.email),
      },
    }

    // Calculate affidabilita score with contact bonuses
    let baseScore = calculateAffidabilitaScore(leadData)
    // Bonus for having complete address
    if (indirizzo && citta && cap) baseScore += 10
    if (categoria) baseScore += 5
    if (descrizione) baseScore += 5
    // Bonus for contacts
    if (contactDetails.telefono) baseScore += 15
    if (contactDetails.email) baseScore += 10
    if (contactDetails.sito_web) baseScore += 5
    leadData.affidabilita_score = Math.min(baseScore, 100)

    console.log(`[PagineGialle] ✅ Extracted: ${ragioneSociale} (${citta || 'N/A'}) - score: ${leadData.affidabilita_score}`)

    return leadData as Lead
  } catch (error) {
    console.error(`[PagineGialle] ❌ Error extracting ${businessId}:`, error)
    return null
  }
}

/**
 * Build search query from parameters
 * FIXED: Use params.name (user search term) not params.settore (category)
 */
function buildSearchQuery(params: LeadSearchParams): string {
  // Use the actual search term provided by user
  let query = params.name || params.settore

  if (params.sottocategoria) {
    query += ` ${params.sottocategoria}`
  }

  return query
}


/**
 * TODO: Implement actual Pagine Gialle scraping
 *
 * Steps for production implementation:
 *
 * 1. Build search URL
 *    - Example: https://www.paginegialle.it/ricerca/{settore}/{comune}
 *
 * 2. Make HTTP request with proper headers
 *    - User-Agent rotation
 *    - Rate limiting (respect robots.txt)
 *    - Retry logic for failed requests
 *
 * 3. Parse HTML response
 *    - Use cheerio or similar for DOM parsing
 *    - Extract business listings
 *    - Extract contact details from each listing
 *
 * 4. Handle pagination
 *    - Detect total pages
 *    - Iterate through all result pages
 *    - Respect max results limit
 *
 * 5. Validate extracted data
 *    - Check phone number formats
 *    - Validate email addresses
 *    - Verify website URLs
 *
 * 6. Handle errors gracefully
 *    - Network errors
 *    - Parsing errors
 *    - CAPTCHA detection
 *    - Rate limit exceeded
 *
 * Example implementation structure:
 *
 * async function scrapePagineGialle(params: LeadSearchParams): Promise<Lead[]> {
 *   const url = buildSearchUrl(params)
 *   const html = await fetchWithRetry(url)
 *   const $ = cheerio.load(html)
 *
 *   const listings = $('.listing-item').map((i, el) => {
 *     return {
 *       ragione_sociale: $(el).find('.business-name').text(),
 *       indirizzo: $(el).find('.address').text(),
 *       telefono: $(el).find('.phone').text(),
 *       ...
 *     }
 *   }).get()
 *
 *   return listings.map(parseListing)
 * }
 */
