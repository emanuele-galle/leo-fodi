/**
 * Yelp Italia Extractor
 * Extracts local business data with focus on services and restaurants
 * Specializes in: Restaurants, services, retail, local businesses
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
import { apiCache, CacheTTL } from '@/lib/cache/api-cache'

/**
 * Yelp Italia Extractor - Local Business Directory
 * Specializes in restaurants, services, and retail businesses
 */
export const yelpExtractor: BaseExtractor = {
  name: 'Yelp Italia',
  tipo: 'directory',

  async extract(params: LeadSearchParams): Promise<Lead[]> {
    console.log('[Yelp] Starting extraction with params:', params)

    // Check cache first
    const cacheKey = {
      settore: params.settore,
      sottocategoria: params.sottocategoria,
      comune: params.comune,
      regione: params.regione,
    }

    const cachedLeads = apiCache.get<Lead[]>('yelp', cacheKey)
    if (cachedLeads) {
      console.log(`[Yelp] 💰 Using cached results (${cachedLeads.length} leads) - COST SAVED!`)
      return cachedLeads
    }

    try {
      const scrapedLeads = await scrapeYelp(params)
      console.log(`[Yelp] Found ${scrapedLeads.length} leads`)

      // Cache results for 2 hours
      apiCache.set('yelp', cacheKey, scrapedLeads, CacheTTL.LONG)

      return scrapedLeads
    } catch (error) {
      console.error('[Yelp] Extraction error:', error)
      return []
    }
  },
}

/**
 * Scrape real data from Yelp Italia
 */
async function scrapeYelp(params: LeadSearchParams): Promise<Lead[]> {
  const leads: Lead[] = []

  try {
    // Build search URL
    const searchQuery = buildSearchQuery(params)
    const location = params.comune || params.regione || 'Italia'
    const url = `https://www.yelp.it/search?find_desc=${encodeURIComponent(searchQuery)}&find_loc=${encodeURIComponent(location)}`

    console.log(`[Yelp] 🔍 Scraping URL: ${url}`)

    // Make HTTP request with proper headers
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        Referer: 'https://www.yelp.it/',
        Connection: 'keep-alive',
      },
      timeout: 15000,
      maxRedirects: 5,
    })

    const $ = cheerio.load(response.data)

    // Extract business listings
    $(
      '.businessName, [data-testid="serp-ia-card"], .container__09f24__FeTO6, article[data-testid], [itemtype*="LocalBusiness"]'
    ).each((index, element) => {
      try {
        const $el = $(element)

        // Extract business name
        const ragioneSociale = normalizeText(
          $el
            .find(
              'a[href*="/biz/"], h3 a, h2 a, .businessName, [itemprop="name"], [data-testid="business-name"]'
            )
            .first()
            .text()
        )

        if (!ragioneSociale || leads.length >= 50) return false // Limit to 50 results

        // Extract rating and review count
        const ratingText = $el
          .find('[aria-label*="stelle"], [role="img"], .rating, [itemprop="ratingValue"]')
          .first()
          .attr('aria-label')
        const rating = ratingText ? parseFloat(ratingText.match(/[\d.]+/)?.[0] || '0') : undefined
        const reviewsText = $el
          .find('.reviewCount, [data-testid="review-count"], [itemprop="reviewCount"]')
          .first()
          .text()
        const reviewsCount = reviewsText ? parseInt(reviewsText.match(/\d+/)?.[0] || '0') : undefined

        // Extract address
        const addressBlock = $el
          .find('.address, [itemprop="address"], [data-testid="address"]')
          .first()
          .text()
        const addressParts = addressBlock.split(',').map((p) => p.trim())
        const indirizzo = normalizeText(addressParts[0])
        const citta = normalizeText(addressParts[1] || params.comune || '')
        const cap = addressBlock.match(/\b\d{5}\b/)?.[0]

        // Extract phone numbers
        const phoneText =
          $el.find('.phone, [itemprop="telephone"], [data-testid="phone"]').text() +
          ' ' +
          $el
            .find('[href^="tel:"]')
            .map((i, el) => $(el).attr('href')?.replace('tel:', ''))
            .get()
            .join(' ')
        const phones = extractPhoneNumbers(phoneText)

        // Separate mobile from landline
        const mobileMatch = phoneText.match(/(?:\+39\s?)?3\d{2}[\s\-]?\d{6,7}/)
        const telefonoMobile = mobileMatch ? mobileMatch[0].replace(/[\s\-]/g, '') : undefined

        // Extract website
        const websiteHref = $el
          .find('a[href*="biz_redir"], a.website, [itemprop="url"], [data-testid="website"]')
          .attr('href')
        const websites = websiteHref ? extractWebsites(websiteHref) : []

        // Extract category
        const categoria = normalizeText(
          $el
            .find(
              '.category, [data-testid="category"], [itemprop="servesCuisine"], [itemprop="category"]'
            )
            .first()
            .text()
        )

        // Extract price range
        const priceRange = $el
          .find('.priceRange, [data-testid="price-range"]')
          .first()
          .text()
          .trim()

        // Extract opening hours status
        const isOpen = $el.find('.businessHours, [data-testid="hours"]').text().toLowerCase()
        const isOpenNow = isOpen.includes('aperto') || isOpen.includes('open')

        // Extract photos count
        const photosText = $el.find('[data-testid="photo-count"]').first().text()
        const photosCount = photosText ? parseInt(photosText.match(/\d+/)?.[0] || '0') : undefined

        // Create lead data
        const leadData: Partial<Lead> = {
          id: generateLeadId(),
          ragione_sociale: ragioneSociale,
          settore: params.settore,
          categoria: categoria || params.sottocategoria,

          // Address
          indirizzo: indirizzo || undefined,
          cap: cap || undefined,
          citta: citta || undefined,
          provincia: params.provincia || undefined,
          regione: params.regione || undefined,
          nazione: 'IT',

          // Contacts
          telefono_principale: phones[0] || undefined,
          telefono_mobile: telefonoMobile || undefined,
          sito_web: websites[0] || undefined,

          // Rating as credit score
          rating_creditizio: rating ? `${rating}/5` : undefined,

          // Notes - Include Yelp-specific info
          note: [
            categoria ? `Categoria: ${categoria}` : null,
            reviewsCount ? `${reviewsCount} recensioni` : null,
            priceRange ? `Fascia prezzo: ${priceRange}` : null,
            photosCount ? `${photosCount} foto` : null,
            isOpenNow ? '✅ Aperto ora' : null,
          ]
            .filter(Boolean)
            .join(' | '),

          // Metadata
          fonte_primaria: 'yelp',
          fonti_consultate: ['yelp'],
          validazione_status: 'pending',
          data_estrazione: new Date().toISOString(),
          attivo: true,
          da_contattare: true,
          priorita: rating && rating >= 4 ? 'alta' : 'media', // High priority for highly rated businesses
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),

          // Extra data
          extra_data: {
            source_detail: 'yelp_local',
            yelp_rating: rating || undefined,
            yelp_reviews_count: reviewsCount || undefined,
            yelp_photos_count: photosCount || undefined,
            price_range: priceRange || undefined,
            is_open_now: isOpenNow,
            categoria_dettaglio: categoria || undefined,
          },
        }

        // Calculate affidabilita score with Yelp bonuses
        let baseScore = calculateAffidabilitaScore(leadData)
        if (rating && rating >= 4) baseScore += 15 // High rating bonus
        if (reviewsCount && reviewsCount >= 50) baseScore += 10 // Many reviews bonus
        if (photosCount && photosCount >= 10) baseScore += 5
        if (websites[0]) baseScore += 5
        if (isOpenNow) baseScore += 5
        leadData.affidabilita_score = Math.min(baseScore, 100)

        leads.push(leadData as Lead)

        console.log(
          `[Yelp] ✓ Extracted: ${leadData.ragione_sociale} (score: ${leadData.affidabilita_score}, rating: ${rating || 'N/A'})`
        )
      } catch (itemError) {
        console.error('[Yelp] Error parsing business item:', itemError)
      }
    })

    console.log(`[Yelp] Successfully scraped ${leads.length} leads`)
    return leads
  } catch (error) {
    console.error('[Yelp] Scraping error:', error)
    throw error
  }
}

/**
 * Build search query from parameters
 */
function buildSearchQuery(params: LeadSearchParams): string {
  let query = params.name || params.settore

  if (params.sottocategoria) {
    query += ` ${params.sottocategoria}`
  }

  return query
}
