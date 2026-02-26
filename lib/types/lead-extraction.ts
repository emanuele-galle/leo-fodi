/**
 * Lead Extraction & Automation Types
 * TypeScript types for Lead Finder module
 */

// =====================================================
// Lead Search Types
// =====================================================

export interface LeadSearchParams {
  // Basic Info
  name: string
  settore: string
  sottocategoria?: string
  codice_ateco?: string[]

  // Filtri Economici
  fatturato_min?: number
  fatturato_max?: number
  dipendenti_min?: number
  dipendenti_max?: number
  anno_fondazione_min?: number
  anno_fondazione_max?: number
  rating_min?: 'A' | 'B' | 'C' | 'D'

  // Area Geografica
  comune?: string
  provincia?: string
  regione?: string
  nazione?: string

  // Configurazione Fonti
  fonti_abilitate?: string[]
  priorita_fonti?: string[]

  // Config avanzate
  config?: Record<string, any>
}

export interface LeadSearch extends LeadSearchParams {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  leads_trovati: number
  leads_validati: number
  fonti_consultate: number
  created_at: string
  updated_at: string
  started_at?: string
  completed_at?: string
}

// =====================================================
// Lead Types
// =====================================================

export interface Lead {
  id: string
  search_id: string

  // Dati Aziendali
  ragione_sociale: string
  nome_commerciale?: string
  partita_iva?: string
  codice_fiscale?: string
  descrizione?: string

  // Classificazione
  settore?: string
  categoria?: string
  codice_ateco?: string
  forma_giuridica?: string

  // Sede
  indirizzo?: string
  cap?: string
  citta?: string
  provincia?: string
  regione?: string
  nazione?: string

  // Dati Economici
  fatturato?: number
  dipendenti?: number
  anno_fondazione?: number
  rating_creditizio?: string

  // Contatti
  telefono_principale?: string
  telefono_mobile?: string
  telefono_whatsapp?: string
  telefono_centralino?: string
  email_principale?: string
  email_pec?: string
  sito_web?: string

  // Social
  linkedin_url?: string
  facebook_url?: string
  instagram_url?: string
  altri_social?: Record<string, string>

  // Referenti
  titolare_nome?: string
  titolare_cognome?: string
  legale_rappresentante?: string
  referenti?: Referente[]

  // Metadata
  fonte_primaria?: string
  fonti_consultate?: string[]
  validazione_status: 'pending' | 'validated' | 'invalid' | 'to_verify'
  affidabilita_score?: number
  data_estrazione: string
  data_validazione?: string
  ultima_verifica?: string

  // Flags
  note?: string
  attivo: boolean
  da_contattare: boolean
  priorita: 'bassa' | 'media' | 'alta'

  created_at: string
  updated_at: string
  extra_data?: Record<string, any>

  // Raw Data Storage (ScrapeCreators)
  raw_data_sc?: any // JSONB - Full API response from ScrapeCreators (avoids duplicate API calls)
}

export interface Referente {
  nome: string
  cognome?: string
  ruolo?: string
  telefono?: string
  email?: string
  linkedin?: string
}

// =====================================================
// Contact Types
// =====================================================

export interface LeadContact {
  id: string
  lead_id: string
  tipo_contatto: 'telefono' | 'email' | 'whatsapp' | 'social' | 'web'
  valore: string
  label?: string
  fonte: string
  fonte_url?: string
  validato: boolean
  validazione_metodo?: string
  validazione_data?: string
  validazione_note?: string
  affidabilita?: number
  ufficiale: boolean
  attivo: boolean
  created_at: string
  updated_at: string
}

export type ContactStatus = 'none' | 'contacted' | 'do_not_contact'

export interface LeadContactStatus {
  contact_status: ContactStatus
  user: {
    id: string
    name: string
    email: string
  } | null
  contacted_at: string
  notes?: string
}

// =====================================================
// Source Types
// =====================================================

export interface LeadSource {
  id: string
  lead_id: string
  search_id: string
  fonte_nome: string
  fonte_tipo: 'registro_ufficiale' | 'directory' | 'motore_ricerca' | 'social' | 'aggregatore' | 'altro'
  fonte_url?: string
  risultato: 'trovato' | 'non_trovato' | 'errore' | 'timeout'
  dati_estratti?: Record<string, any>
  tempo_esecuzione_ms?: number
  created_at: string
}

// =====================================================
// Validation Types
// =====================================================

export interface LeadValidation {
  id: string
  lead_id: string
  tipo_validazione: string
  campo_validato: string
  valore_precedente?: string
  valore_nuovo?: string
  esito: 'valido' | 'invalido' | 'incerto' | 'modificato'
  note?: string
  validato_da?: string
  metodo?: string
  created_at: string
}

// =====================================================
// Form Types
// =====================================================

export interface LeadSearchFormData {
  name: string
  settore: string
  sottocategoria?: string

  // Filtri economici
  fatturato_min?: string
  fatturato_max?: string
  dipendenti_min?: string
  dipendenti_max?: string

  // Area geografica
  comune?: string
  provincia?: string
  regione?: string

  // Fonti
  fonti_selezionate: string[]
}

// =====================================================
// API Response Types
// =====================================================

export interface LeadExtractionResult {
  searchId: string
  status: 'success' | 'partial' | 'failed'
  leads_trovati: number
  leads_validati: number
  fonti_consultate: number
  tempo_totale_ms: number
  errori?: string[]
}

export interface LeadExportData {
  lead: Lead
  contacts: LeadContact[]
  sources: LeadSource[]
}

// =====================================================
// Source Configuration Types
// =====================================================

export interface SourceConfig {
  id: string
  nome: string
  tipo: 'registro_ufficiale' | 'directory' | 'motore_ricerca' | 'social' | 'aggregatore' | 'altro'
  descrizione: string
  url_base?: string
  attivo: boolean
  richiede_auth: boolean
  rate_limit?: number // requests per minute
  costo_per_query?: number
  affidabilita_media: number // 0-100
  settori_supportati?: string[]
  aree_geografiche?: string[]
}

// NOTE: LinkedIn and Facebook are NOT included here because they are ONLY used for OSINT enrichment
// They are not effective for bulk lead extraction but excellent for enriching existing leads
// See: lib/leads/enrichment/web-enricher.ts
export const DEFAULT_SOURCES: SourceConfig[] = [
  // ===== PRIORITY 1: OFFICIAL API DATA (HIGHEST RELIABILITY) =====
  {
    id: 'google_places',
    nome: 'Google Places API',
    tipo: 'aggregatore',
    descrizione: '✅ ATTIVO - Dati reali verificati da Google: aziende, contatti, indirizzi, orari, recensioni',
    url_base: 'https://maps.googleapis.com',
    attivo: true,
    richiede_auth: true,
    rate_limit: 1000,
    costo_per_query: 0.017, // $17 per 1000 queries
    affidabilita_media: 95,
  },
  {
    id: 'registro_imprese_api',
    nome: 'InfoCamere Telemaco API',
    tipo: 'registro_ufficiale',
    descrizione: '⚠️ NON DISPONIBILE - API InfoCamere richiede credenziali speciali (P.IVA, fatturato, dati ufficiali CCIAA)',
    url_base: 'https://api.infocamere.it',
    attivo: false, // DISABLED - not configured
    richiede_auth: true,
    costo_per_query: 0.15,
    affidabilita_media: 100,
  },

  // ===== PRIORITY 2: STATIC SCRAPING (MEDIUM-HIGH RELIABILITY) =====
  {
    id: 'pagine_gialle',
    nome: 'Pagine Gialle (Cheerio)',
    tipo: 'directory',
    descrizione: '✅ ATTIVO - Scraping veloce (50 lead/ricerca) + social media extraction',
    url_base: 'https://www.paginegialle.it',
    attivo: true,
    richiede_auth: false,
    affidabilita_media: 80,
  },
  {
    id: 'kompass',
    nome: 'Kompass Italia (Cheerio)',
    tipo: 'directory',
    descrizione: '❌ DISABILITATO - Anti-bot protection (403 Forbidden)',
    url_base: 'https://it.kompass.com',
    attivo: false,
    richiede_auth: false,
    affidabilita_media: 85,
  },
  {
    id: 'europages',
    nome: 'Europages (Cheerio)',
    tipo: 'directory',
    descrizione: '❌ DISABILITATO - URL structure issues (404 Not Found)',
    url_base: 'https://www.europages.it',
    attivo: false,
    richiede_auth: false,
    affidabilita_media: 85,
  },
  {
    id: 'yelp',
    nome: 'Yelp Italia (Cheerio)',
    tipo: 'directory',
    descrizione: '❌ DISABILITATO - Selettori CSS non funzionanti',
    url_base: 'https://www.yelp.it',
    attivo: false,
    richiede_auth: false,
    affidabilita_media: 80,
  },

  // ===== LEGACY/DISABLED SOURCES =====
  {
    id: 'registroimprese_it',
    nome: 'Registro Imprese (Static)',
    tipo: 'registro_ufficiale',
    descrizione: '❌ DISABILITATO - Scraping statico non implementato, usa InfoCamere API quando disponibile',
    url_base: 'https://www.registroimprese.it',
    attivo: false,
    richiede_auth: false,
    affidabilita_media: 100,
  },
  {
    id: 'pagine_bianche',
    nome: 'Pagine Bianche',
    tipo: 'directory',
    descrizione: '❌ DISABILITATO - Non implementato',
    url_base: 'https://www.paginebianche.it',
    attivo: false,
    richiede_auth: false,
    affidabilita_media: 70,
  },
  {
    id: 'google',
    nome: 'Google Search',
    tipo: 'motore_ricerca',
    descrizione: '❌ DISABILITATO - Non implementato',
    attivo: false,
    richiede_auth: false,
    rate_limit: 100,
    affidabilita_media: 60,
  },
]

// =====================================================
// Settori Predefiniti
// =====================================================

export const SETTORI_DISPONIBILI = [
  { value: 'ristorazione', label: 'Ristorazione (Bar, Ristoranti, Pizzerie)' },
  { value: 'commercio', label: 'Commercio al dettaglio' },
  { value: 'servizi_professionali', label: 'Servizi professionali (Consulenza, Studi)' },
  { value: 'manifatturiero', label: 'Manifatturiero e Produzione' },
  { value: 'edilizia', label: 'Edilizia e Costruzioni' },
  { value: 'tecnologia', label: 'Tecnologia e IT' },
  { value: 'sanita', label: 'Sanità e Assistenza' },
  { value: 'turismo', label: 'Turismo e Ospitalità' },
  { value: 'trasporti', label: 'Trasporti e Logistica' },
  { value: 'agricoltura', label: 'Agricoltura e Agriturismi' },
  { value: 'energia', label: 'Energia e Rinnovabili' },
  { value: 'immobiliare', label: 'Immobiliare' },
  { value: 'altro', label: 'Altro' },
] as const

export const REGIONI_ITALIA = [
  'Abruzzo',
  'Basilicata',
  'Calabria',
  'Campania',
  'Emilia-Romagna',
  'Friuli-Venezia Giulia',
  'Lazio',
  'Liguria',
  'Lombardia',
  'Marche',
  'Molise',
  'Piemonte',
  'Puglia',
  'Sardegna',
  'Sicilia',
  'Toscana',
  'Trentino-Alto Adige',
  'Umbria',
  "Valle d'Aosta",
  'Veneto',
] as const
