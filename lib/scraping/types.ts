/**
 * Scraping System - Type Definitions
 * Sistema di web scraping AI-guidato per raccolta dati OSINT
 */

// ==================== BROWSER & PAGE ====================

export interface BrowserConfig {
  headless?: boolean
  proxy?: string
  userAgent?: string
  viewport?: {
    width: number
    height: number
  }
  timeout?: number
}

export interface ScraperOptions {
  maxRetries?: number
  retryDelay?: number
  timeout?: number
  useStagehand?: boolean
}

// ==================== SCRAPING RESULTS ====================

export interface LinkedInProfileData {
  // Identità
  nome_completo: string
  headline?: string  // Headline corto (es: "Senior Manager at Company")
  about?: string     // Bio completa del profilo (2000+ chars) - Campo CRITICO per analisi
  summary?: string   // Alias per "about" (LinkedIn usa entrambi i nomi)
  localita?: string
  profile_url: string

  // Esperienza professionale
  esperienze: Array<{
    ruolo: string
    azienda: string
    tipo_impiego?: string
    data_inizio: string
    data_fine?: string
    descrizione?: string
    localita?: string
  }>

  // Formazione
  formazione: Array<{
    istituzione: string
    titolo: string
    campo_studio?: string
    data_inizio?: string
    data_fine?: string
  }>

  // Competenze
  competenze: string[]

  // Certificazioni
  certificazioni: Array<{
    nome: string
    ente: string
    data_rilascio?: string
  }>

  // Social proof
  numero_connessioni?: number
  numero_followers?: number

  // Metadata
  data_scraping: string
  fonte: 'linkedin'
  screenshot_path?: string  // Path locale dello screenshot Puppeteer
}

export interface FacebookProfileData {
  // Identità
  nome_completo: string
  username?: string
  profile_url: string

  // Informazioni personali
  citta_attuale?: string
  citta_origine?: string
  relazione?: string
  data_nascita?: string
  genere?: string

  // ScrapCreators API fields
  categoria?: string  // Category (Public figure, Business, etc.)
  bio?: string  // pageIntro or about
  data_creazione?: string  // creationDate
  sito_web?: string  // website
  business_page?: boolean  // isBusinessPageActive

  // Metriche social
  numero_followers?: number  // followerCount
  numero_likes?: number  // likeCount

  // Famiglia
  familiari?: Array<{
    nome: string
    relazione: string
    profile_url?: string
  }>

  // Amici (se visibili)
  numero_amici?: number
  amici_comuni?: Array<{
    nome: string
    profile_url?: string
  }>

  // Interessi
  pagine_seguite?: Array<{
    nome: string
    categoria: string
  }>

  gruppi?: Array<{
    nome: string
    membri?: number
  }>

  // Check-in e luoghi
  luoghi_frequenti?: Array<{
    nome: string
    citta: string
    check_ins: number
  }>

  // Metadata
  data_scraping: string
  fonte: 'facebook'
  screenshot_path?: string  // Path locale dello screenshot Puppeteer
}

export interface InstagramProfileData {
  // Identità
  nome_completo?: string
  username: string
  bio?: string
  profile_url: string

  // Metriche
  numero_post: number
  numero_followers: number
  numero_following: number
  verified?: boolean

  // Informazioni business
  business_account?: boolean
  business_email?: string | null
  business_phone?: string | null
  category?: string | null

  // Analisi contenuti
  post_recenti: Array<{
    id: string
    shortcode: string
    caption?: string
    data?: string
    likes?: number
    commenti?: number
    video_views?: number  // NUOVO: visualizzazioni video
    hashtags?: string[]  // NUOVO: hashtags estratti dalla caption
    mentions?: string[]  // NUOVO: mentions estratti dalla caption
    localita?: string
    location?: {  // NUOVO: dati completi location
      id: string
      name: string
      slug?: string
    }
    tagged_users?: Array<{  // NUOVO: utenti taggati
      username?: string
      full_name?: string
    }>
    tipo: 'foto' | 'video' | 'carousel'
    url?: string  // URL dell'immagine/video
    video_url?: string  // URL video se disponibile
    thumbnail?: string  // Thumbnail del post
  }>

  // Analisi visiva (da implementare con AI Vision)
  brand_identificati?: string[]
  luoghi_identificati?: string[]
  attivita_identificate?: string[]

  // Metadata
  data_scraping?: string
  fonte?: 'instagram'
  screenshot_path?: string  // Path locale dello screenshot Puppeteer
}

export interface GeneralWebData {
  url: string

  // Contatti estratti
  emails?: string[]
  phones?: string[]
  addresses?: string[]

  // Social links estratti
  social_links?: {
    facebook?: string
    instagram?: string
    linkedin?: string
    twitter?: string
    youtube?: string
  }

  // Metadata scraping
  data_scraping: string
  fonte: 'website'
}

// ==================== AGGREGATED DATA ====================

export interface RawOSINTData {
  target_id: string

  linkedin_data?: LinkedInProfileData
  facebook_data?: FacebookProfileData
  instagram_data?: InstagramProfileData
  web_data?: GeneralWebData[]
  web_content?: Array<{
    url: string
    title: string
    text_content: string
    metadata: {
      description?: string
      keywords?: string[]
      author?: string
      og_title?: string
      og_description?: string
    }
    word_count: number
    fetched_at: string
  }>
  website_analysis?: Array<{
    url: string
    title: string
    description: string
    company_info: {
      name?: string
      industry?: string
      founded_year?: string
      size?: string
      headquarters?: string
      description?: string
    }
    products_services: {
      main_offerings: string[]
      target_market: string[]
      unique_selling_points: string[]
    }
    mission_values: {
      mission?: string
      vision?: string
      values: string[]
      certifications: string[]
    }
    key_insights: {
      business_model?: string
      competitive_advantages: string[]
      client_types: string[]
      geographic_reach?: string
    }
    online_presence: {
      social_media: string[]
      blog_articles: number
      languages_supported: string[]
    }
    analyzed_at: string
    confidence_score: number
    analysis_source: 'xai'
  }>
  google_search_data?: {
    target_name: string
    queries_executed: string[]
    total_results: number
    results: Array<{
      title: string
      link: string
      snippet: string
      displayLink: string
      source: string
    }>
    social_profiles_found: {
      twitter?: string
      tiktok?: string
      youtube?: string
      github?: string
      medium?: string
      other?: string[]
    }
    mentions: {
      articles: string[]
      interviews: string[]
      press_releases: string[]
      other: string[]
    }
    searched_at: string
  }

  // Metadata aggregazione
  data_raccolta: string
  fonti_consultate: string[]
  errori: Array<{
    fonte: string
    errore: string
    timestamp: string
  }>

  // Statistiche
  tempo_totale_ms: number
  successi: number
  fallimenti: number
}

// ==================== SCRAPING ERRORS ====================

export class ScraperError extends Error {
  constructor(
    message: string,
    public code: ScraperErrorCode,
    public retryable: boolean = true
  ) {
    super(message)
    this.name = 'ScraperError'
  }
}

export enum ScraperErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  BLOCKED = 'BLOCKED',
  CAPTCHA = 'CAPTCHA',
  NOT_FOUND = 'NOT_FOUND',
  PARSE_ERROR = 'PARSE_ERROR',
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  RATE_LIMITED = 'RATE_LIMITED'
}

export interface ScraperResult<T> {
  success: boolean
  data?: T
  error?: {
    code: ScraperErrorCode
    message: string
    retryable: boolean
  }
  metadata: {
    tentativo: number
    tempo_ms: number
    fonte: string
  }
}
