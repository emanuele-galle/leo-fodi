import type { BaseExtractor } from './base-extractor'
import type { LeadSearchParams, Lead } from '@/lib/types/lead-extraction'
import { callScrapeCreators } from '@/lib/scrapecreators/client'
import { generateLeadId } from './base-extractor'
import { calculateAffidabilitaScore, validateEmail } from '../extraction-worker'

export const facebookExtractor: BaseExtractor = {
  name: 'Facebook (ScrapeCreators)',
  tipo: 'social',

  async extract(params: LeadSearchParams): Promise<Lead[]> {
    if (!process.env.SCRAPECREATORS_API_KEY) {
      console.log('[Facebook] ⏭️  Skipped: SCRAPECREATORS_API_KEY not configured')
      return []
    }

    const leads: Lead[] = []

    try {
      // Step 1: Search for multiple Facebook pages using Google Search
      const searchQuery = `${params.name} ${params.comune || params.provincia || ''} site:facebook.com`
      console.log(`[Facebook] 🔍 Searching: "${searchQuery}"`)

      const searchResult = await callScrapeCreators<{ results: { url: string }[] }>(
        'google/search',
        {
          query: searchQuery,
          num_results: 10, // CHANGED: Get up to 10 Facebook pages
        }
      )

      if (!searchResult.results || searchResult.results.length === 0) {
        console.log(`[Facebook] ❌ No pages found for: ${params.name}`)
        return []
      }

      // Filter only valid Facebook business page URLs
      const facebookUrls = searchResult.results
        .map(r => r.url)
        .filter(url => url && url.includes('facebook.com') && !url.includes('/posts/') && !url.includes('/photos/'))
        .slice(0, 5) // Limit to 5 pages to avoid excessive API costs

      console.log(`[Facebook] ✅ Found ${facebookUrls.length} business pages`)

      // Step 2: Extract data from each page
      for (const facebookUrl of facebookUrls) {
        try {
          console.log(`[Facebook] 📝 Extracting: ${facebookUrl}`)

          const profileData = await callScrapeCreators<any>('facebook/profile', {
            url: facebookUrl,
          })

          if (!profileData || !profileData.name) {
            console.warn(`[Facebook] ⚠️  No data from ${facebookUrl}`)
            continue
          }

          console.log(`[Facebook] ✅ Extracted: ${profileData.name}`)

          // Step 3: Map data to Lead interface
          const lead: Lead = {
            id: generateLeadId(),
            search_id: '', // Will be set by worker
            ragione_sociale: profileData.name,
            facebook_url: profileData.url || facebookUrl,
            sito_web: profileData.website,
            telefono_principale: profileData.phone_number,
            email_principale: validateEmail(profileData.email) ? profileData.email : undefined,
            indirizzo: profileData.address,
            citta: profileData.city || params.comune,
            provincia: params.provincia,
            settore: params.settore,
            descrizione: profileData.bio?.substring(0, 500),

            // Metadata
            fonte_primaria: 'facebook_scrapecreators',
            fonti_consultate: ['facebook_scrapecreators'],
            validazione_status: 'pending',
            data_estrazione: new Date().toISOString(),
            attivo: true,
            da_contattare: true,
            priorita: 'media',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),

            // --- RAW DATA STORAGE ---
            raw_data_sc: profileData,
          }

          lead.affidabilita_score = calculateAffidabilitaScore(lead)

          console.log(
            `[Facebook] ✅ Lead created: ${lead.ragione_sociale} (score: ${lead.affidabilita_score})`
          )

          leads.push(lead)

          // Rate limiting: wait 500ms between API calls
          await new Promise(resolve => setTimeout(resolve, 500))

        } catch (error: any) {
          console.error(`[Facebook] ❌ Error extracting ${facebookUrl}: ${error.message}`)
          continue
        }
      }

      console.log(`[Facebook] 🎯 Total leads extracted: ${leads.length}`)
      return leads

    } catch (error: any) {
      console.error(`[Facebook Extractor] ❌ Fatal error: ${error.message}`)
      return leads // Return any leads we managed to extract
    }
  },
}
