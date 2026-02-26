/**
 * Multi-Agent OSINT System - Type Definitions
 * Sistema di profilazione avanzata con architettura multi-agent
 */

// ==================== SOGGETTO DA PROFILARE ====================

export interface ProfilingTarget {
  id: string
  nome: string
  cognome: string
  data_nascita?: string
  citta?: string
  // Contact info (per ricerca web pubblica)
  email?: string
  phone?: string
  // Social media profiles (se noti)
  linkedin_url?: string
  facebook_url?: string
  instagram_url?: string
  // Website aziendale / personale (fonte primaria per analisi approfondita)
  website_url?: string
  // Consenso privacy
  consenso_profilazione: boolean
  data_consenso: string
  note?: string
}

// ==================== RISULTATI AGENT ====================

export interface FamilyProfile {
  nucleo_familiare_attuale: {
    coniuge?: { nome: string; cognome?: string; fonte: string }
    figli?: Array<{ nome: string; eta_stimata?: number; fonte: string }>
    altri_familiari?: Array<{ relazione: string; nome: string; fonte: string }>
  }
  nucleo_familiare_precedente?: {
    ex_coniuge?: { nome: string; periodo?: string; fonte: string }
    note?: string
  }
  residenza: {
    citta: string
    quartiere?: string
    tipo_zona: 'centro' | 'periferia' | 'residenziale' | 'popolare' | 'esclusiva' | 'non_determinato'
    indicatori_ricchezza: string[]
    fonte: string
  }
  confidence_score: number
  fonti_consultate: string[]
}

export interface CareerProfile {
  professione_attuale: {
    ruolo: string
    azienda?: string
    settore?: string
    anzianita_anni?: number
    livello: 'junior' | 'mid' | 'senior' | 'executive' | 'imprenditore' | 'non_determinato'
    fonte: string
  }
  storico_professionale: Array<{
    ruolo: string
    azienda?: string
    periodo: string
    settore?: string
    fonte: string
  }>
  competenze_chiave: string[]
  certificazioni: string[]
  confidence_score: number
  fonti_consultate: string[]
}

export interface EducationProfile {
  titolo_studio_massimo: {
    livello: 'licenza_media' | 'diploma' | 'laurea_triennale' | 'laurea_magistrale' | 'master' | 'dottorato' | 'non_determinato'
    campo_studio?: string
    istituzione?: string
    anno?: number
    fonte: string
  }
  altri_studi: Array<{
    tipo: string
    istituzione?: string
    anno?: number
    fonte: string
  }>
  sintesi_percorso: string
  confidence_score: number
  fonti_consultate: string[]
}

export interface LifestyleProfile {
  hobby_passioni: Array<{
    categoria: string
    descrizione: string
    frequenza: 'alta' | 'media' | 'bassa'
    fonte: string
  }>
  interessi_principali: string[]
  stile_vita: {
    tipo: 'sportivo' | 'culturale' | 'mondano' | 'familiare' | 'professionale' | 'misto'
    descrizione: string
  }
  viaggi: {
    frequenza: 'alta' | 'media' | 'bassa' | 'non_determinato'
    destinazioni_preferite: string[]
    tipo_viaggio: 'lusso' | 'avventura' | 'relax' | 'culturale' | 'business' | 'misto'
  }
  brand_preferiti: string[]
  attivita_ricorrenti: string[]
  confidence_score: number
  fonti_consultate: string[]
}

export interface WealthProfile {
  valutazione_economica: {
    fascia: 'bassa' | 'media-bassa' | 'media' | 'media-alta' | 'alta' | 'molto_alta' | 'non_determinato'
    reddito_stimato_annuo?: { min: number; max: number }
    patrimonio_stimato?: { min: number; max: number }
    confidence: number
  }
  indicatori_ricchezza: Array<{
    tipo: 'residenza' | 'auto' | 'viaggi' | 'brand' | 'proprietà' | 'investimenti' | 'altro'
    descrizione: string
    peso: 'alto' | 'medio' | 'basso'
    fonte: string
  }>
  tenore_vita: {
    descrizione: string
    caratteristiche: string[]
  }
  proprieta_note: Array<{
    tipo: 'immobile' | 'veicolo' | 'barca' | 'altro'
    descrizione: string
    valore_stimato?: number
    fonte: string
  }>
  confidence_score: number
  fonti_consultate: string[]
}

export interface SocialGraphProfile {
  rete_sociale: {
    dimensione: 'piccola' | 'media' | 'grande' | 'molto_grande'
    followers_totali?: number
    following_totali?: number
    engagement_rate?: number
  }
  connessioni_chiave: Array<{
    nome: string
    relazione: 'familiare' | 'amico' | 'collega' | 'professionale' | 'altro'
    influenza: 'alta' | 'media' | 'bassa'
    fonte: string
  }>
  gruppi_appartenenza: Array<{
    nome: string
    tipo: string
    attivita: 'alta' | 'media' | 'bassa'
    fonte: string
  }>
  comunita_interesse: string[]
  influencer_seguiti: string[]
  confidence_score: number
  fonti_consultate: string[]
}

export interface ContentAnalysisProfile {
  analisi_contenuti: {
    post_analizzati: number
    periodo_analisi: string
    piattaforme: string[]
  }
  temi_ricorrenti: Array<{
    tema: string
    frequenza: number
    sentiment: 'positivo' | 'neutro' | 'negativo'
  }>
  linguaggio_comunicazione: {
    tono: 'formale' | 'informale' | 'professionale' | 'colloquiale' | 'misto'
    stile: string
    emoji_usage: 'alto' | 'medio' | 'basso'
  }
  valori_emergenti: string[]
  brand_mentions: string[]
  location_frecuenti: string[]
  persone_menzionate: string[]
  immagini_analizzate: {
    totale: number
    luoghi_riconosciuti: string[]
    oggetti_ricorrenti: string[]
    brand_visibili: string[]
    dettagli_immagini?: Array<{
      url: string
      thumbnail_url?: string
      brand_identificati: string[]
      luoghi: string[]
      attivita: string[]
    }>
  }
  confidence_score: number
  fonti_consultate: string[]
}

// ==================== ADVANCED PROFILES (Sezioni 8-13) ====================

export interface AuthoritySignalsProfile {
  livello_influenza: 'micro' | 'emerging' | 'established' | 'macro' | 'celebrity' | 'niche_expert' | 'non_determinato'
  premi_certificazioni: Array<{
    nome: string
    organizzazione: string
    anno: string | null
    descrizione: string
    fonte: string
  }>
  pubblicazioni: Array<{
    titolo: string
    tipo: 'articolo' | 'libro' | 'paper' | 'post' | 'altro'
    piattaforma: string | null
    anno: string | null
    fonte: string
  }>
  community_attive: Array<{
    nome: string
    ruolo: 'membro' | 'moderatore' | 'leader' | 'fondatore' | 'altro'
    piattaforma: string
    engagement_level: 'alto' | 'medio' | 'basso'
    fonte: string
  }>
  riconoscimenti_pubblici: Array<{
    tipo: string
    descrizione: string
    fonte: string
  }>
  confidence_score: number
  fonti_consultate: string[]
}

export interface WorkModelProfile {
  modalita_lavoro: {
    tipo: 'remoto' | 'ibrido' | 'ufficio' | 'autonomo' | 'non_determinato'
    flessibilita: 'alta' | 'media' | 'bassa' | 'non_determinato'
    descrizione: string
    fonte: string
  }
  orari_lavoro: {
    tipo: 'standard' | 'flessibile' | 'turni' | 'indipendente' | 'non_determinato'
    work_life_balance: 'ottimo' | 'buono' | 'medio' | 'scarso' | 'non_determinato'
    descrizione: string
  }
  ambiente_lavoro: {
    tipo: 'corporate' | 'startup' | 'pmi' | 'freelance' | 'imprenditore' | 'non_determinato'
    team_size: 'solo' | 'piccolo' | 'medio' | 'grande' | 'non_determinato'
    descrizione: string
  }
  strumenti_tecnologie: string[]
  metodo_lavoro: {
    approccio: 'agile' | 'tradizionale' | 'ibrido' | 'non_determinato'
    collaborazione: 'alta' | 'media' | 'bassa' | 'non_determinato'
    descrizione: string
  }
  confidence_score: number
  fonti_consultate: string[]
}

export interface VisionGoalsProfile {
  obiettivi_professionali: Array<{
    obiettivo: string
    termine: 'breve' | 'medio' | 'lungo'
    priorita: 'alta' | 'media' | 'bassa'
    fonte: string
  }>
  aspirazioni_personali: Array<{
    aspirazione: string
    categoria: 'carriera' | 'famiglia' | 'lifestyle' | 'crescita_personale' | 'altro'
    fonte: string
  }>
  valori_fondamentali: Array<{
    valore: string
    descrizione: string
    evidenza: string
  }>
  progetti_futuri: Array<{
    progetto: string
    stato: 'idea' | 'pianificazione' | 'in_corso' | 'completato'
    fonte: string
  }>
  mentalita: {
    tipo: 'crescita' | 'statica' | 'misto'
    descrizione: string
    attitudine_cambiamento: 'alta' | 'media' | 'bassa'
  }
  confidence_score: number
  fonti_consultate: string[]
}

export interface NeedsMappingProfile {
  bisogni_identificati: Array<{
    categoria: 'sicurezza' | 'protezione_famiglia' | 'crescita_patrimonio' | 'previdenza' | 'salute' | 'lifestyle' | 'altro'
    bisogno: string
    priorita: 'alta' | 'media' | 'bassa'
    evidenze: string[]
    gap_attuale: string
  }>
  vulnerabilita: Array<{
    area: string
    descrizione: string
    impatto: 'alto' | 'medio' | 'basso'
    fonte: string
  }>
  opportunita: Array<{
    tipo: string
    descrizione: string
    potenziale: 'alto' | 'medio' | 'basso'
    timing: 'immediato' | 'breve_termine' | 'medio_termine'
  }>
  priorita_intervento: Array<{
    area: string
    urgenza: 'alta' | 'media' | 'bassa'
    motivazione: string
  }>
  confidence_score: number
  fonti_consultate: string[]
}

export interface EngagementProfile {
  leve_principali: Array<{
    leva: string
    categoria: 'emotiva' | 'razionale' | 'sociale' | 'aspirazionale'
    efficacia: 'alta' | 'media' | 'bassa'
    descrizione: string
    come_usarla: string
  }>
  momenti_ideali: Array<{
    momento: string
    tipo: 'life_event' | 'stagionale' | 'professionale' | 'altro'
    finestra_temporale: string
    approccio_consigliato: string
  }>
  canali_comunicazione: Array<{
    canale: 'email' | 'linkedin' | 'instagram' | 'whatsapp' | 'telefono' | 'evento' | 'altro'
    efficacia: 'alta' | 'media' | 'bassa'
    frequenza_consigliata: string
    note: string
  }>
  messaggi_chiave: Array<{
    messaggio: string
    target_bisogno: string
    tono: string
  }>
  ostacoli_potenziali: Array<{
    ostacolo: string
    probabilita: 'alta' | 'media' | 'bassa'
    strategia_superamento: string
  }>
  confidence_score: number
  fonti_consultate: string[]
}

// ==================== PROFILO COMPLETO ====================

export interface CompleteOSINTProfile {
  target: ProfilingTarget
  family: FamilyProfile | null
  career: CareerProfile | null
  education: EducationProfile | null
  lifestyle: LifestyleProfile | null
  wealth: WealthProfile | null
  social_graph: SocialGraphProfile | null
  content_analysis: ContentAnalysisProfile | null
  // Nuovi agent per sezioni 8-13
  authority_signals?: AuthoritySignalsProfile | null
  work_model?: WorkModelProfile | null
  vision_goals?: VisionGoalsProfile | null
  needs_mapping?: NeedsMappingProfile | null
  engagement?: EngagementProfile | null
  sintesi_esecutiva: string
  punteggio_complessivo: number
  completezza_profilo: number // percentuale 0-100
  data_profilazione: string
  tempo_elaborazione_ms: number
  agent_utilizzati: string[]
  errori: Array<{ agent: string; errore: string }>
}

// ==================== AGENT SYSTEM ====================

export type XAIModel =
  | 'anthropic/claude-sonnet-4'          // Reasoning per analisi complesse
  | 'anthropic/claude-haiku-4-5-20251001' // Veloce per task semplici

export interface AgentConfig {
  id: string
  name: string
  role: string
  model: XAIModel
  temperature: number
  max_tokens: number
  system_prompt: string
  priority: number // ordine esecuzione (1 = massima priorità)
}

export interface AgentContext {
  target: ProfilingTarget
  previous_results?: Partial<CompleteOSINTProfile>
  shared_memory: Record<string, any>
}

export interface AgentResult<T = any> {
  agent_id: string
  success: boolean
  data: T | null
  confidence: number
  sources: string[]
  execution_time_ms: number
  error?: string
  tokens_used?: number
}

export interface OrchestrationPlan {
  phases: Array<{
    phase_number: number
    phase_name: string
    agents: string[]
    parallel: boolean
  }>
  estimated_time_ms: number
  estimated_cost_usd: number
}

// ==================== RICERCA WEB ====================

export interface WebSearchResult {
  title: string
  url: string
  snippet: string
  source: string
}

export interface ScrapedContent {
  url: string
  title?: string
  text_content: string
  images: string[]
  links: string[]
  metadata: Record<string, any>
}

// ==================== SOCIAL MEDIA ====================

export interface SocialMediaPost {
  platform: 'linkedin' | 'facebook' | 'instagram' | 'altro'
  post_id?: string
  content: string
  images?: string[]
  date?: string
  likes?: number
  comments?: number
  shares?: number
  hashtags?: string[]
  mentions?: string[]
  location?: string
}

export interface SocialMediaProfile {
  platform: string
  profile_url: string
  username?: string
  display_name?: string
  bio?: string
  followers?: number
  following?: number
  posts_count?: number
  verified?: boolean
  profile_image?: string
}
