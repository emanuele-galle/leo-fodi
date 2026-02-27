/**
 * Application Types - Domain Models
 * Types for business logic and API responses
 */

// ============================================
// CLIENT FORM DATA
// ============================================

export interface ClientFormData {
  nome: string
  cognome: string
  localita?: string
  ruolo?: string
  settore?: string
  link_social?: string[]
  sito_web?: string
}

// ============================================
// OSINT PROFILE STRUCTURE
// ============================================

export interface IdentitaPresenzaOnline {
  nome_completo: string
  ruoli_principali: string[]
  aziende_attuali: string[]
  settore_principale: string
  citta_area: string
}

export interface ProfiloDigitale {
  piattaforma: string
  url: string
  frequenza_aggiornamento: string
  temi_ricorrenti: string[]
}

export interface PresenzaDigitale {
  profili_principali: ProfiloDigitale[]
}

export interface SegnaliAutorita {
  premi_certificazioni: string[]
  pubblicazioni: string[]
  community_attive: string[]
  livello_influenza: string
}

export interface ModelloLavorativo {
  orari_tipici: string
  cicli_produttivi: string[]
  fonti_ricavo: string[]
  rischi_operativi: string[]
  rischi_legali: string[]
}

export interface VisioneObiettivi {
  obiettivi_dichiarati: string[]
  aspirazioni_future: string[]
  rischi_percepiti: string[]
}

export interface StileVita {
  interessi_ricorrenti: string[]
  abitudini: string[]
  valori_espressi: string[]
  eventi_vita_potenziali: string[]
}

export interface OrizzonteTemporale {
  breve_termine: string[]
  medio_termine: string[]
  lungo_termine: string[]
}

export interface MappaturaBisogni {
  bisogni_personali: string[]
  bisogni_patrimoniali: string[]
  bisogni_professionali: string[]
  orizzonte_temporale: OrizzonteTemporale
}

export interface LeveIngaggio {
  script_apertura: string
  domande_intelligenza_emotiva: string[]
  cta_soft: string
}

export interface RaccomandazioneProdotto {
  prodotto: string
  categoria: string
  motivazione: string
  priorita: 'alta' | 'media' | 'bassa'
}

export interface PianoContatto {
  strategia: string
  follow_up: string[]
  checklist_privacy: string[]
}

export interface OSINTProfile {
  identita_presenza_online: IdentitaPresenzaOnline
  presenza_digitale: PresenzaDigitale
  segnali_autorita: SegnaliAutorita
  modello_lavorativo: ModelloLavorativo
  visione_obiettivi: VisioneObiettivi
  stile_vita: StileVita
  mappatura_bisogni: MappaturaBisogni
  leve_ingaggio: LeveIngaggio
  raccomandazioni_prodotti: RaccomandazioneProdotto[]
  piano_contatto: PianoContatto
}

// ============================================
// FINANCIAL PLAN STRUCTURE
// ============================================

export interface ObiettivoFinanziario {
  obiettivo: string
  importo_stimato: string
  tempistica: string
}

export interface ObiettiviFinanziari {
  breve_termine: ObiettivoFinanziario[]
  medio_termine: ObiettivoFinanziario[]
  lungo_termine: ObiettivoFinanziario[]
}

export interface GapItem {
  attuale: string
  obiettivo: string
  gap: string
}

export interface RischiProfessionali {
  coperti: string[]
  scoperti: string[]
}

export interface AnalisiGap {
  liquidita_sicurezza: GapItem
  previdenza_integrativa: GapItem
  protezione_reddito: GapItem
  rischi_professionali: RischiProfessionali
}

export interface SequenzaItem {
  ordine: number
  area: string
  azione: string
  tempistica: string
}

export interface SpuntiFiscali {
  deducibilita: string[]
  ltc: string[]
  rc_professionale: string[]
  strumenti_autonomi_impresa: string[]
}

export interface RaccomandazioneProdottoFinanziario {
  prodotto: string
  tipologia: string
  razionale: string
  priorita: 'alta' | 'media' | 'bassa'
  vantaggio_fiscale: string | null
}

export interface SintesiValore {
  trigger_idoneita: string[]
  checklist_finale: string[]
  script_appuntamento: string
}

export interface TriggerVita {
  evento: string
  rilevanza: 'alta' | 'media' | 'bassa'
  opportunita: string
}

export interface PrioritaContatto {
  score: number
  motivo_principale: string
  gancio_specifico: string
}

export interface FinancialPlan {
  obiettivi_finanziari: ObiettiviFinanziari
  analisi_gap: AnalisiGap
  sequenza_raccomandata: SequenzaItem[]
  spunti_fiscali: SpuntiFiscali
  raccomandazioni_prodotti: RaccomandazioneProdottoFinanziario[]
  sintesi_valore: SintesiValore
  trigger_vita?: TriggerVita[]
  priorita_contatto?: PrioritaContatto
}

// ============================================
// AI API TYPES
// ============================================

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Keep backward compatibility aliases
export type XAIMessage = AIMessage
export type XAIRequest = {
  model: string
  messages: AIMessage[]
  temperature?: number
  max_tokens?: number
  response_format?: { type: 'json_object' }
  search_parameters?: Record<string, unknown>
}
export type XAIResponse = AIResponse

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ProfilingSuccessResponse {
  success: true
  clientId: string
  profileId: string
  profile: OSINTProfile
}

export interface ProfilingGetResponse {
  success: true
  client: {
    id: string
    nome: string
    cognome: string
    localita: string | null
    ruolo: string | null
    settore: string | null
    link_social: string[] | null
    sito_web: string | null
    created_at: string
    updated_at: string
  }
  profile: OSINTProfile
}

export interface PlanningSuccessResponse {
  success: true
  planId: string
  plan: FinancialPlan
}

export interface PlanningGetResponse {
  success: true
  plan: FinancialPlan
}

export interface ErrorResponse {
  error: string
}

// ============================================
// LEAD EXTRACTION - Re-export from lead-extraction.ts
// ============================================

export * from './lead-extraction'
