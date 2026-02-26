import type { BaseExtractor } from './base-extractor'
import type { LeadSearchParams, Lead } from '@/lib/types/lead-extraction'
import { generateLeadId } from './base-extractor'
import { calculateAffidabilitaScore } from '../extraction-worker'

export const registroImpreseExtractor: BaseExtractor = {
  name: 'Registro Imprese',
  tipo: 'registro_ufficiale',
  async extract(params: LeadSearchParams): Promise<Lead[]> {
    // Mock implementation - would connect to Registro Imprese API
    console.log('[RegistroImprese] Starting extraction')
    const leads: Lead[] = []

    // Generate mock official data (higher quality)
    for (let i = 0; i < 3; i++) {
      const leadData: Partial<Lead> = {
        id: generateLeadId(),
        ragione_sociale: `${params.settore} SRL ${i + 1}`,
        partita_iva: `IT${Math.floor(10000000000 + Math.random() * 90000000000)}`,
        codice_fiscale: `${Math.floor(10000000000 + Math.random() * 90000000000)}`,
        forma_giuridica: 'SRL',
        settore: params.settore,
        citta: params.comune || 'Milano',
        provincia: params.provincia || 'MI',
        regione: params.regione || 'Lombardia',
        telefono_principale: `02${Math.floor(1000000 + Math.random() * 9000000)}`,
        email_pec: `${params.settore.toLowerCase()}srl${i + 1}@pec.it`,
        fonte_primaria: 'registro_imprese',
        fonti_consultate: ['registro_imprese'],
        validazione_status: 'validated',
        attivo: true,
        da_contattare: true,
        priorita: 'alta',
        data_estrazione: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      leadData.affidabilita_score = calculateAffidabilitaScore(leadData)
      leads.push(leadData as Lead)
    }

    return leads
  },
}
