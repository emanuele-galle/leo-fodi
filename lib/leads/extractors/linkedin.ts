import type { BaseExtractor } from './base-extractor'
import type { LeadSearchParams, Lead } from '@/lib/types/lead-extraction'
import { callScrapeCreators } from '@/lib/scrapecreators/client'
import { generateLeadId } from './base-extractor'
import { calculateAffidabilitaScore, validateEmail } from '../extraction-worker'

export const linkedinExtractor: BaseExtractor = {
  name: 'LinkedIn (ScrapeCreators)',
  tipo: 'social',

  async extract(params: LeadSearchParams): Promise<Lead[]> {
    if (!process.env.SCRAPECREATORS_API_KEY) {
      console.log('[LinkedIn] ⏭️  Skipped: SCRAPECREATORS_API_KEY not configured')
      return []
    }

    const leads: Lead[] = []

    try {
      // Step 1: Search for multiple LinkedIn company URLs using Google Search
      const searchQuery = `${params.name} ${params.comune || params.provincia || ''} site:linkedin.com/company`
      console.log(`[LinkedIn] 🔍 Searching: "${searchQuery}"`)

      const searchResult = await callScrapeCreators<{ results: { url: string }[] }>(
        'google/search',
        {
          query: searchQuery,
          num_results: 10, // CHANGED: Get up to 10 LinkedIn profiles
        }
      )

      if (!searchResult.results || searchResult.results.length === 0) {
        console.log(`[LinkedIn] ❌ No company pages found for: ${params.name}`)
        return []
      }

      // Filter only valid LinkedIn company URLs
      const linkedinUrls = searchResult.results
        .map(r => r.url)
        .filter(url => url && url.includes('linkedin.com/company'))
        .slice(0, 5) // Limit to 5 companies to avoid excessive API costs

      console.log(`[LinkedIn] ✅ Found ${linkedinUrls.length} company pages`)

      // Step 2: Extract data from each company page
      for (const linkedinUrl of linkedinUrls) {
        try {
          console.log(`[LinkedIn] 📝 Extracting: ${linkedinUrl}`)

          const companyData = await callScrapeCreators<any>('linkedin/company', {
            url: linkedinUrl,
          })

          if (!companyData || !companyData.name) {
            console.warn(`[LinkedIn] ⚠️  No data from ${linkedinUrl}`)
            continue
          }

          console.log(`[LinkedIn] ✅ Extracted: ${companyData.name}`)

          // Step 3: Map data to Lead interface
          const lead: Lead = {
            id: generateLeadId(),
            search_id: '', // Will be set by worker
            ragione_sociale: companyData.name,
            linkedin_url: linkedinUrl,
            sito_web: companyData.website,
            indirizzo: companyData.headquarters,
            citta: companyData.location?.city || params.comune,
            provincia: companyData.location?.state || params.provincia,
            dipendenti: companyData.employeeCount,
            settore: companyData.industry || params.settore,
            descrizione: companyData.description?.substring(0, 500),
            anno_fondazione: companyData.founded,

            // Metadata
            fonte_primaria: 'linkedin_scrapecreators',
            fonti_consultate: ['linkedin_scrapecreators'],
            validazione_status: 'pending',
            data_estrazione: new Date().toISOString(),
            attivo: true,
            da_contattare: true,
            priorita: 'alta', // LinkedIn B2B = high priority
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),

            // --- RAW DATA STORAGE ---
            raw_data_sc: companyData,
          }

          lead.affidabilita_score = calculateAffidabilitaScore(lead)

          console.log(
            `[LinkedIn] ✅ Lead created: ${lead.ragione_sociale} (score: ${lead.affidabilita_score})`
          )

          leads.push(lead)

          // Rate limiting: wait 500ms between API calls
          await new Promise(resolve => setTimeout(resolve, 500))

        } catch (error: any) {
          console.error(`[LinkedIn] ❌ Error extracting ${linkedinUrl}: ${error.message}`)
          continue
        }
      }

      console.log(`[LinkedIn] 🎯 Total leads extracted: ${leads.length}`)
      return leads

    } catch (error: any) {
      console.error(`[LinkedIn Extractor] ❌ Fatal error: ${error.message}`)
      return leads // Return any leads we managed to extract
    }
  },
}
