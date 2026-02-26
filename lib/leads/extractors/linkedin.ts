import type { BaseExtractor } from './base-extractor'
import type { LeadSearchParams, Lead } from '@/lib/types/lead-extraction'
import { generateLeadId } from './base-extractor'
import { calculateAffidabilitaScore } from '../extraction-worker'

export const linkedinExtractor: BaseExtractor = {
  name: 'LinkedIn (Apify)',
  tipo: 'social',

  async extract(params: LeadSearchParams): Promise<Lead[]> {
    const apiToken = process.env.APIFY_API_TOKEN
    if (!apiToken) {
      console.warn('[LinkedIn] APIFY_API_TOKEN not configured')
      return []
    }

    const leads: Lead[] = []

    try {
      // Cerca aziende LinkedIn per settore e location
      const query = `${params.settore} ${params.comune || params.provincia || params.regione || 'Italia'}`
      console.log(`[LinkedIn] 🔍 Searching: "${query}"`)

      const runRes = await fetch(
        `https://api.apify.com/v2/acts/dev_fusion~Linkedin-Company-Scraper/runs?token=${apiToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            searchKeywords: [query],
            maxItems: Math.min(params.limite || 30, 50),
          }),
        }
      )

      if (!runRes.ok) {
        console.error(`[LinkedIn] Failed to start run: ${runRes.status} ${runRes.statusText}`)
        return []
      }

      const run = await runRes.json()
      const runId = run.data?.id
      if (!runId) {
        console.error('[LinkedIn] No runId returned')
        return []
      }

      console.log(`[LinkedIn] Run started: ${runId}`)

      // Polling (max 2 min)
      for (let i = 0; i < 24; i++) {
        await new Promise(r => setTimeout(r, 5000))
        const statusRes = await fetch(
          `https://api.apify.com/v2/actor-runs/${runId}?token=${apiToken}`
        )
        const s = await statusRes.json()
        const status = s.data?.status

        console.log(`[LinkedIn] Run ${runId} status: ${status} (attempt ${i + 1}/24)`)

        if (status === 'SUCCEEDED') break
        if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
          console.error(`[LinkedIn] Run ended with status: ${status}`)
          return []
        }
      }

      const dataRes = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apiToken}&limit=50`
      )
      const items = await dataRes.json()

      if (!Array.isArray(items)) {
        console.error('[LinkedIn] Unexpected dataset format')
        return []
      }

      console.log(`[LinkedIn] Got ${items.length} results from Apify`)

      const now = new Date().toISOString()

      for (const item of items as Record<string, unknown>[]) {
        const lead: Lead = {
          id: generateLeadId(),
          search_id: '',
          ragione_sociale: String(item.name || item.companyName || ''),
          sito_web: String(item.website || item.websiteUrl || ''),
          indirizzo: String(item.headquarters || item.location || ''),
          settore: params.settore,
          fonte_primaria: 'linkedin_apify',
          fonti_consultate: ['linkedin_apify'],
          validazione_status: 'pending',
          data_estrazione: now,
          attivo: true,
          da_contattare: true,
          priorita: 'alta',
          created_at: now,
          updated_at: now,
          extra_data: {
            linkedinUrl: item.linkedinUrl,
            employees: item.employees,
            industry: item.industry,
          },
        } as Lead

        lead.affidabilita_score = calculateAffidabilitaScore(lead)

        console.log(`[LinkedIn] ✅ Lead created: ${lead.ragione_sociale} (score: ${lead.affidabilita_score})`)
        leads.push(lead)
      }

      console.log(`[LinkedIn] 🎯 Total leads extracted: ${leads.length}`)
      return leads

    } catch (error: any) {
      console.error(`[LinkedIn Extractor] ❌ Fatal error: ${error.message}`)
      return leads
    }
  },
}
