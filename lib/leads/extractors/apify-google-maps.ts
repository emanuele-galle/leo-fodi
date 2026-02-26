/**
 * Apify Google Maps Extractor
 * Uses Apify compass/crawler-google-places actor to extract business leads from Google Maps
 */

import type { BaseExtractor } from './base-extractor'
import { generateLeadId } from './base-extractor'
import type { LeadSearchParams, Lead } from '@/lib/types/lead-extraction'

export const apifyGoogleMapsExtractor: BaseExtractor = {
  name: 'Google Maps (Apify)',
  tipo: 'aggregatore',

  async extract(params: LeadSearchParams): Promise<Lead[]> {
    const apiToken = process.env.APIFY_API_TOKEN
    if (!apiToken) {
      console.warn('[ApifyGoogleMaps] APIFY_API_TOKEN not configured')
      return []
    }

    // Costruisci query di ricerca
    const location = [params.comune, params.provincia, params.regione, params.nazione || 'Italia']
      .filter(Boolean).join(', ')
    const searchQuery = `${params.settore} ${params.sottocategoria || ''} ${location}`.trim()

    console.log(`[ApifyGoogleMaps] Search query: "${searchQuery}"`)

    try {
      // Avvia run Apify Actor
      const runResponse = await fetch(
        `https://api.apify.com/v2/acts/compass~crawler-google-places/runs`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            searchStringsArray: [searchQuery],
            language: 'it',
            maxCrawledPlacesPerSearch: 50,
            includeWebResults: false,
            scrapeDirectories: false,
          }),
        }
      )

      if (!runResponse.ok) {
        console.error('[ApifyGoogleMaps] Failed to start run:', runResponse.status, runResponse.statusText)
        return []
      }

      const run = await runResponse.json()
      const runId = run.data?.id
      if (!runId) {
        console.error('[ApifyGoogleMaps] No runId returned')
        return []
      }

      console.log(`[ApifyGoogleMaps] Run started: ${runId}`)

      // Polling fino a completamento (max 3 min, ogni 5 secondi)
      let attempts = 0
      while (attempts < 36) {
        await new Promise(r => setTimeout(r, 5000))
        const statusRes = await fetch(
          `https://api.apify.com/v2/actor-runs/${runId}`,
          { headers: { 'Authorization': `Bearer ${apiToken}` } }
        )
        const status = await statusRes.json()
        const runStatus = status.data?.status

        console.log(`[ApifyGoogleMaps] Run ${runId} status: ${runStatus} (attempt ${attempts + 1}/36)`)

        if (runStatus === 'SUCCEEDED') break
        if (runStatus === 'FAILED' || runStatus === 'ABORTED' || runStatus === 'TIMED-OUT') {
          console.error(`[ApifyGoogleMaps] Run ${runId} ended with status: ${runStatus}`)
          return []
        }
        attempts++
      }

      if (attempts >= 36) {
        console.error('[ApifyGoogleMaps] Polling timeout after 3 minutes')
        return []
      }

      // Recupera dataset
      const datasetRes = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?limit=200`,
        { headers: { 'Authorization': `Bearer ${apiToken}` } }
      )

      if (!datasetRes.ok) {
        console.error('[ApifyGoogleMaps] Failed to fetch dataset:', datasetRes.statusText)
        return []
      }

      const items = await datasetRes.json()

      if (!Array.isArray(items)) {
        console.error('[ApifyGoogleMaps] Unexpected dataset format')
        return []
      }

      console.log(`[ApifyGoogleMaps] Got ${items.length} results from Apify`)

      const now = new Date().toISOString()

      return items.map((item: Record<string, unknown>): Lead => {
        const locationObj = item.location as Record<string, unknown> | undefined
        return {
          id: generateLeadId(),
          search_id: '',
          ragione_sociale: (item.title as string) || (item.name as string) || '',
          indirizzo: (item.address as string) || '',
          citta: (item.city as string) || (locationObj?.city as string) || '',
          provincia: params.provincia || '',
          regione: params.regione || '',
          nazione: 'Italia',
          telefono_principale: (item.phone as string) || '',
          sito_web: (item.website as string) || '',
          email_principale: '',
          settore: params.settore,
          fonte_primaria: 'google_maps_apify',
          fonti_consultate: ['google_maps_apify'],
          affidabilita_score: 0.85,
          validazione_status: 'pending',
          data_estrazione: now,
          attivo: true,
          da_contattare: true,
          priorita: 'media',
          created_at: now,
          updated_at: now,
          extra_data: {
            rating: item.totalScore,
            reviewCount: item.reviewsCount,
            categories: item.categories,
            placeId: item.placeId,
          },
        }
      })
    } catch (error) {
      console.error('[ApifyGoogleMaps] Error:', error)
      return []
    }
  },
}
