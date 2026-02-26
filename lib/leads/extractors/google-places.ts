/**
 * Google Places API Extractor
 * REAL DATA extraction using Google Places API
 * Provides verified business information for Italian companies
 */

import { Client } from '@googlemaps/google-maps-services-js'
import type { BaseExtractor } from './base-extractor'
import type { LeadSearchParams, Lead } from '@/lib/types/lead-extraction'
import { generateLeadId } from './base-extractor'
import { calculateAffidabilitaScore } from '../extraction-worker'
import { apiCache, CacheTTL } from '@/lib/cache/api-cache'
import { costTracker } from '@/lib/monitoring/cost-tracker'

// Google Maps API Client
const googleMapsClient = new Client({})

/**
 * Map Italian sectors to Google Places types
 */
const SECTOR_TO_PLACES_TYPE: Record<string, string> = {
  ristorazione: 'restaurant',
  commercio: 'store',
  servizi_professionali: 'lawyer|accountant|doctor',
  manifatturiero: 'hardware_store|home_goods_store',
  edilizia: 'general_contractor|electrician|plumber',
  tecnologia: 'electronics_store|computer_store',
  sanita: 'hospital|doctor|pharmacy',
  turismo: 'hotel|travel_agency|tourist_attraction',
  trasporti: 'moving_company|taxi_stand',
  agricoltura: 'farm|food',
  energia: 'gas_station|car_repair',
  immobiliare: 'real_estate_agency',
  altro: 'establishment',
}

export const googlePlacesExtractor: BaseExtractor = {
  name: 'Google Places API',
  tipo: 'aggregatore',

  async extract(params: LeadSearchParams): Promise<Lead[]> {
    console.log('[GooglePlaces] Starting REAL extraction with params:', params)

    // Check cache first
    const cacheKey = {
      settore: params.settore,
      sottocategoria: params.sottocategoria,
      comune: params.comune,
      regione: params.regione,
    }

    const cachedLeads = apiCache.get<Lead[]>('google_places', cacheKey)
    if (cachedLeads) {
      console.log(`[GooglePlaces] 💰 Using cached results (${cachedLeads.length} leads) - COST SAVED!`)

      // Track cached request (no cost)
      await costTracker.trackGooglePlacesSearch(cachedLeads.length, true, undefined, cacheKey)

      return cachedLeads
    }

    // Check API key
    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    if (!apiKey) {
      // Se Google Places non è configurato, usa Apify Google Maps
      if (process.env.APIFY_API_TOKEN) {
        console.log('[GooglePlaces] GOOGLE_PLACES_API_KEY not set, falling back to Apify Google Maps')
        const { apifyGoogleMapsExtractor } = await import('./apify-google-maps')
        return apifyGoogleMapsExtractor.extract(params)
      }
      console.error('[GooglePlaces] ❌ GOOGLE_PLACES_API_KEY not configured')
      console.warn('[GooglePlaces] Add GOOGLE_PLACES_API_KEY to .env.local')
      return []
    }

    try {
      const leads: Lead[] = []

      // Build search query
      const searchQuery = buildSearchQuery(params)
      const location = params.comune || params.regione || 'Italia'
      const fullQuery = `${searchQuery} ${location}`

      console.log(`[GooglePlaces] 🔍 Searching: "${fullQuery}"`)

      // Get place type from sector
      const placeType = SECTOR_TO_PLACES_TYPE[params.settore] || 'establishment'

      // Call Google Places Text Search API
      const response = await googleMapsClient.textSearch({
        params: {
          query: fullQuery,
          type: placeType as any,
          region: 'it', // Italy
          language: 'it' as any,
          key: apiKey,
        },
        timeout: 30000,
      })

      console.log(`[GooglePlaces] ✅ API Response Status: ${response.data.status}`)
      console.log(`[GooglePlaces] 📊 Results found: ${response.data.results?.length || 0}`)

      // Track API request cost
      await costTracker.trackGooglePlacesSearch(
        response.data.results?.length || 0,
        false,
        undefined,
        cacheKey
      )

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        console.error(`[GooglePlaces] API Error: ${response.data.status}`)
        if (response.data.error_message) {
          console.error(`[GooglePlaces] Error message: ${response.data.error_message}`)
        }
        return []
      }

      if (!response.data.results || response.data.results.length === 0) {
        console.warn('[GooglePlaces] ⚠️  No results found for this query')
        return []
      }

      // Process results
      for (const place of response.data.results.slice(0, 20)) {
        try {
          // Get detailed information
          let detailedPlace = place

          // If we have place_id, get more details
          if (place.place_id) {
            try {
              const detailsResponse = await googleMapsClient.placeDetails({
                params: {
                  place_id: place.place_id,
                  fields: [
                    'name',
                    'formatted_address',
                    'formatted_phone_number',
                    'international_phone_number',
                    'website',
                    'rating',
                    'user_ratings_total',
                    'types',
                    'business_status',
                  ],
                  language: 'it' as any,
                  key: apiKey,
                },
                timeout: 5000,
              })

              if (detailsResponse.data.status === 'OK' && detailsResponse.data.result) {
                detailedPlace = { ...place, ...detailsResponse.data.result }
              }
            } catch (detailError) {
              console.warn(`[GooglePlaces] Could not fetch details for ${place.name}:`, detailError)
            }
          }

          // Parse address components
          const addressComponents = parseAddress(detailedPlace.formatted_address || '')

          // Create lead from Google Places data
          const leadData: Partial<Lead> = {
            id: generateLeadId(),
            ragione_sociale: detailedPlace.name || 'N/A',
            nome_commerciale: detailedPlace.name,

            // Classification
            settore: params.settore,
            categoria: params.sottocategoria,

            // Address from Google
            indirizzo: addressComponents.street,
            cap: addressComponents.postalCode,
            citta: addressComponents.city || params.comune,
            provincia: addressComponents.province || params.provincia,
            regione: addressComponents.region || params.regione,
            nazione: 'IT',

            // Contacts from Google
            telefono_principale: (detailedPlace as any).formatted_phone_number || (detailedPlace as any).international_phone_number,
            sito_web: (detailedPlace as any).website,

            // Google-specific metadata
            rating_creditizio: (detailedPlace as any).rating ? `${(detailedPlace as any).rating}/5` : undefined,

            // Metadata
            fonte_primaria: 'google_places',
            fonti_consultate: ['google_places'],
            validazione_status: 'validated', // Google data is pre-validated
            data_estrazione: new Date().toISOString(),
            attivo: (detailedPlace as any).business_status === 'OPERATIONAL',
            da_contattare: true,
            priorita: (detailedPlace as any).rating && (detailedPlace as any).rating >= 4 ? 'alta' : 'media',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),

            // Extra data from Google
            extra_data: {
              google_place_id: place.place_id,
              google_rating: (detailedPlace as any).rating,
              google_reviews_count: (detailedPlace as any).user_ratings_total,
              google_types: detailedPlace.types,
            },
          }

          // Calculate affidabilita score (Google data is highly reliable)
          leadData.affidabilita_score = Math.max(calculateAffidabilitaScore(leadData), 80)

          leads.push(leadData as Lead)

          console.log(`[GooglePlaces] ✓ Extracted: ${leadData.ragione_sociale}`)
        } catch (placeError) {
          console.error(`[GooglePlaces] Error processing place:`, placeError)
        }
      }

      console.log(`[GooglePlaces] 🎉 Successfully extracted ${leads.length} REAL leads from Google Places API`)

      // Cache results for 2 hours (business data is relatively stable)
      apiCache.set('google_places', cacheKey, leads, CacheTTL.LONG)
      console.log('[GooglePlaces] 💾 Results cached for 2 hours')

      return leads
    } catch (error) {
      console.error('[GooglePlaces] Fatal extraction error:', error)
      if ((error as any).response) {
        console.error('[GooglePlaces] API Response:', (error as any).response.data)
      }
      return []
    }
  },
}

/**
 * Build search query from parameters
 */
function buildSearchQuery(params: LeadSearchParams): string {
  let query = ''

  if (params.sottocategoria) {
    query = params.sottocategoria
  } else {
    // Map Italian sector names to common search terms
    const sectorNames: Record<string, string> = {
      ristorazione: 'ristorante',
      commercio: 'negozio',
      servizi_professionali: 'studio professionale',
      manifatturiero: 'azienda produzione',
      edilizia: 'impresa edile',
      tecnologia: 'azienda informatica',
      sanita: 'studio medico',
      turismo: 'agenzia viaggi',
      trasporti: 'azienda trasporti',
      agricoltura: 'azienda agricola',
    }

    query = sectorNames[params.settore] || params.settore
  }

  return query
}

/**
 * Parse Italian address into components
 */
function parseAddress(fullAddress: string): {
  street?: string
  postalCode?: string
  city?: string
  province?: string
  region?: string
} {
  if (!fullAddress) return {}

  const parts = fullAddress.split(',').map((p) => p.trim())

  // Italian address format: "Via Roma 123, 20121 Milano MI, Italy"
  const result: any = {}

  // Try to extract postal code (5 digits)
  const postalMatch = fullAddress.match(/\b(\d{5})\b/)
  if (postalMatch) {
    result.postalCode = postalMatch[1]
  }

  // Try to extract province code (2 uppercase letters)
  const provinceMatch = fullAddress.match(/\b([A-Z]{2})\b/)
  if (provinceMatch && provinceMatch[1] !== 'IT') {
    result.province = provinceMatch[1]
  }

  // First part is usually the street
  if (parts.length > 0 && !parts[0].includes('Italia') && !parts[0].includes('Italy')) {
    result.street = parts[0]
  }

  // Extract city (word before province code or postal code)
  const cityMatch = fullAddress.match(/(\d{5})\s+([A-Za-zàèéìòù\s]+?)(?:\s+[A-Z]{2}|,|$)/)
  if (cityMatch) {
    result.city = cityMatch[2].trim()
  }

  return result
}
