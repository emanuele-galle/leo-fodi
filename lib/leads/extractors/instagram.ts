import type { BaseExtractor } from './base-extractor'
import type { LeadSearchParams, Lead } from '@/lib/types/lead-extraction'
import { callScrapeCreators } from '@/lib/scrapecreators/client'
import { generateLeadId } from './base-extractor'
import { calculateAffidabilitaScore, validateEmail } from '../extraction-worker'

export const instagramExtractor: BaseExtractor = {
  name: 'Instagram (ScrapeCreators)',
  tipo: 'social',

  async extract(params: LeadSearchParams): Promise<Lead[]> {
    if (!process.env.SCRAPECREATORS_API_KEY) {
      console.log('[Instagram] ⏭️  Skipped: SCRAPECREATORS_API_KEY not configured')
      return []
    }

    try {
      // Step 1: Search for Instagram profile using Google Search
      const searchQuery = `${params.name} ${params.comune || params.provincia || ''} site:instagram.com`
      console.log(`[Instagram] 🔍 Searching: "${searchQuery}"`)

      const searchResult = await callScrapeCreators<{ results: { url: string }[] }>(
        'google/search',
        {
          query: searchQuery,
          num_results: 1,
        }
      )

      const instagramUrl = searchResult.results?.[0]?.url
      if (!instagramUrl || !instagramUrl.includes('instagram.com')) {
        console.log(`[Instagram] ❌ No profile found for: ${params.name}`)
        return []
      }

      console.log(`[Instagram] ✅ Found profile: ${instagramUrl}`)

      // Extract handle (username) from URL
      // URL format: https://www.instagram.com/username/
      const handleMatch = instagramUrl.match(/instagram\.com\/([^\/\?]+)/);
      const handle = handleMatch?.[1]

      if (!handle) {
        console.log(`[Instagram] ❌ Could not extract handle from URL: ${instagramUrl}`)
        return []
      }

      console.log(`[Instagram] 📝 Extracted handle: ${handle}`)

      // Step 2: Extract rich data from profile
      const profileData = await callScrapeCreators<any>('instagram/profile', {
        handle: handle,  // Pass handle instead of URL
      })

      if (!profileData) {
        console.log(`[Instagram] ❌ Failed to extract data from ${instagramUrl}`)
        return []
      }

      console.log(`[Instagram] ✅ Extracted profile data for: ${profileData.full_name}`)

      // Step 3: Map data to Lead interface (including raw data)
      const lead: Lead = {
        id: generateLeadId(),
        search_id: '', // Will be set by worker
        ragione_sociale: profileData.full_name || profileData.username || params.name,
        instagram_url: profileData.url || instagramUrl,
        sito_web: profileData.external_url,
        descrizione: profileData.biography?.substring(0, 500),
        email_principale: validateEmail(profileData.email) ? profileData.email : undefined,

        // Metadata
        fonte_primaria: 'instagram_scrapecreators',
        fonti_consultate: ['instagram_scrapecreators'],
        validazione_status: 'pending',
        data_estrazione: new Date().toISOString(),
        attivo: true,
        da_contattare: true,
        priorita: 'media',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),

        // --- RAW DATA STORAGE ---
        // Save full JSON to avoid duplicate API calls during OSINT
        raw_data_sc: profileData,
      }

      lead.affidabilita_score = calculateAffidabilitaScore(lead)

      console.log(
        `[Instagram] ✅ Lead created: ${lead.ragione_sociale} (score: ${lead.affidabilita_score})`
      )

      return [lead]
    } catch (error: any) {
      console.error(`[Instagram Extractor] ❌ Error: ${error.message}`)
      return []
    }
  },
}
