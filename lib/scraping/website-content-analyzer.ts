/**
 * Website Content Analyzer
 * Analizza in profondità i contenuti di un sito web usando XAI per estrarre informazioni rilevanti
 * su aziende, clienti, prodotti, servizi, storia, mission, valori, etc.
 */

import * as cheerio from 'cheerio'
import { callAI, createMessages } from '../ai/ai-client'

export interface WebsiteAnalysis {
  url: string
  title: string
  description: string

  // Informazioni aziendali
  company_info: {
    name?: string
    industry?: string
    founded_year?: string
    size?: string // "1-10", "11-50", "51-200", "201-500", "500+"
    headquarters?: string
    description?: string
  }

  // Prodotti e servizi
  products_services: {
    main_offerings: string[]
    target_market: string[]
    unique_selling_points: string[]
  }

  // Mission e valori
  mission_values: {
    mission?: string
    vision?: string
    values: string[]
    certifications: string[]
  }

  // Informazioni chiave estratte
  key_insights: {
    business_model?: string // "B2B", "B2C", "B2B2C", "Marketplace"
    competitive_advantages: string[]
    client_types: string[]
    geographic_reach?: string // "Local", "Regional", "National", "International"
  }

  // Contatti e presenza online
  online_presence: {
    social_media: string[]
    blog_articles: number
    languages_supported: string[]
  }

  // Metadata
  analyzed_at: string
  confidence_score: number // 0-100
  analysis_source: 'openrouter'
}

export class WebsiteContentAnalyzer {
  private readonly timeout = 15000 // 15s timeout for content-heavy pages
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

  /**
   * Analizza in profondità un sito web
   */
  async analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
    console.log(`\n🔍 [WebsiteAnalyzer] Starting deep analysis of: ${url}`)

    try {
      // 1. Fetch HTML content
      const html = await this.fetchHtml(url)

      // 2. Extract structured content
      const extractedContent = this.extractContent(html, url)

      // 3. Use XAI to analyze content semantically
      const analysis = await this.analyzeWithAI(extractedContent, url)

      console.log(`✅ [WebsiteAnalyzer] Analysis completed for: ${url}`)
      console.log(`   - Company: ${analysis.company_info.name || 'Unknown'}`)
      console.log(`   - Industry: ${analysis.company_info.industry || 'Unknown'}`)
      console.log(`   - Products/Services: ${analysis.products_services.main_offerings.length}`)
      console.log(`   - Confidence: ${analysis.confidence_score}%`)

      return analysis

    } catch (error) {
      console.error(`❌ [WebsiteAnalyzer] Failed to analyze ${url}:`, error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  /**
   * Fetch HTML from URL
   */
  private async fetchHtml(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        signal: AbortSignal.timeout(this.timeout),
        redirect: 'follow',
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.text()
    } catch (error) {
      throw new Error(`Failed to fetch website: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Extract structured content from HTML
   */
  private extractContent(html: string, url: string): {
    url: string
    title: string
    description: string
    main_content: string
    about_section: string
    services_section: string
    meta_data: any
  } {
    const $ = cheerio.load(html)

    // Remove script, style, nav, footer noise
    $('script, style, nav, footer, header, .cookie-banner, .popup').remove()

    // Extract metadata
    const title = $('title').text().trim() || $('meta[property="og:title"]').attr('content') || ''
    const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || ''

    // Extract main content (prioritize important sections)
    const mainContent = this.extractMainContent($)
    const aboutSection = this.extractAboutSection($)
    const servicesSection = this.extractServicesSection($)

    // Extract Schema.org data if available
    const schemaData = this.extractSchemaOrg($)

    return {
      url,
      title,
      description,
      main_content: mainContent,
      about_section: aboutSection,
      services_section: servicesSection,
      meta_data: schemaData,
    }
  }

  /**
   * Extract main content text
   */
  private extractMainContent($: cheerio.CheerioAPI): string {
    const candidates = [
      'main',
      'article',
      '[role="main"]',
      '.main-content',
      '#main-content',
      '.content',
      '#content',
      '.page-content',
    ]

    for (const selector of candidates) {
      const content = $(selector).first().text().trim()
      if (content.length > 200) {
        return this.cleanText(content)
      }
    }

    // Fallback: get body text
    return this.cleanText($('body').text())
  }

  /**
   * Extract "About" section
   */
  private extractAboutSection($: cheerio.CheerioAPI): string {
    const aboutSelectors = [
      '#about',
      '.about',
      '#chi-siamo',
      '.chi-siamo',
      '#about-us',
      '.about-us',
      '[id*="about"]',
      '[class*="about"]',
      '[id*="chi-siamo"]',
    ]

    for (const selector of aboutSelectors) {
      const content = $(selector).first().text().trim()
      if (content.length > 50) {
        return this.cleanText(content)
      }
    }

    return ''
  }

  /**
   * Extract "Services/Products" section
   */
  private extractServicesSection($: cheerio.CheerioAPI): string {
    const serviceSelectors = [
      '#services',
      '.services',
      '#servizi',
      '.servizi',
      '#products',
      '.products',
      '#prodotti',
      '.prodotti',
      '[id*="service"]',
      '[class*="service"]',
    ]

    for (const selector of serviceSelectors) {
      const content = $(selector).first().text().trim()
      if (content.length > 50) {
        return this.cleanText(content)
      }
    }

    return ''
  }

  /**
   * Extract Schema.org structured data
   */
  private extractSchemaOrg($: cheerio.CheerioAPI): any {
    const schema: any = {}

    // Organization schema
    const orgName = $('[itemtype*="schema.org/Organization"] [itemprop="name"]').text().trim()
    if (orgName) schema.organization_name = orgName

    const orgDesc = $('[itemtype*="schema.org/Organization"] [itemprop="description"]').text().trim()
    if (orgDesc) schema.organization_description = orgDesc

    // LocalBusiness schema
    const bizName = $('[itemtype*="schema.org/LocalBusiness"] [itemprop="name"]').text().trim()
    if (bizName) schema.business_name = bizName

    return schema
  }

  /**
   * Clean text content
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')  // Multiple spaces → single space
      .replace(/\n+/g, '\n') // Multiple newlines → single newline
      .trim()
      .substring(0, 5000)    // Limit to 5000 chars for AI processing
  }

  /**
   * Analyze extracted content with XAI
   */
  private async analyzeWithAI(content: any, url: string): Promise<WebsiteAnalysis> {
    const systemPrompt = `Sei un esperto analista di business intelligence specializzato nell'estrazione di informazioni strategiche da siti web aziendali.

Il tuo compito è analizzare il contenuto di un sito web e estrarre informazioni chiave sull'azienda, i suoi prodotti/servizi, mission, valori, e posizionamento di mercato.

Rispondi SEMPRE con un JSON valido seguendo ESATTAMENTE questa struttura:

{
  "company_info": {
    "name": "Nome azienda (se presente)",
    "industry": "Settore/industria (es. 'Assicurazioni', 'Tecnologia', 'Consulenza')",
    "founded_year": "Anno di fondazione (se presente)",
    "size": "Dimensione aziendale: '1-10' | '11-50' | '51-200' | '201-500' | '500+' (stima basata su indizi)",
    "headquarters": "Sede principale (città/paese)",
    "description": "Breve descrizione dell'azienda (2-3 frasi)"
  },
  "products_services": {
    "main_offerings": ["Lista dei principali prodotti/servizi offerti"],
    "target_market": ["Mercati target / tipologie di clienti serviti"],
    "unique_selling_points": ["Punti di forza / differenziatori competitivi"]
  },
  "mission_values": {
    "mission": "Mission aziendale (se presente)",
    "vision": "Vision aziendale (se presente)",
    "values": ["Lista dei valori aziendali"],
    "certifications": ["Certificazioni / riconoscimenti"]
  },
  "key_insights": {
    "business_model": "B2B | B2C | B2B2C | Marketplace | Altro",
    "competitive_advantages": ["Vantaggi competitivi identificati"],
    "client_types": ["Tipologie di clienti (es. 'PMI', 'Enterprise', 'Consumer')"],
    "geographic_reach": "Local | Regional | National | International"
  },
  "online_presence": {
    "social_media": ["Piattaforme social utilizzate"],
    "blog_articles": 0,
    "languages_supported": ["Lingue supportate dal sito"]
  },
  "confidence_score": 85
}

REGOLE IMPORTANTI:
- Se un'informazione non è disponibile, usa stringa vuota "" o array vuoto []
- Confidence score: 0-100 basato sulla quantità/qualità delle informazioni trovate
- Sii specifico e concreto, evita genericità
- Estrai solo informazioni realmente presenti nel contenuto
- Se il sito è un portfolio personale, trattalo come "freelance" o "consulente indipendente"`

    const userPrompt = `Analizza il seguente sito web e estrai tutte le informazioni rilevanti:

URL: ${url}

TITOLO PAGINA:
${content.title}

DESCRIZIONE META:
${content.description}

SEZIONE "CHI SIAMO":
${content.about_section || 'Non disponibile'}

SEZIONE "SERVIZI/PRODOTTI":
${content.services_section || 'Non disponibile'}

CONTENUTO PRINCIPALE:
${content.main_content.substring(0, 3000)}

DATI STRUTTURATI (Schema.org):
${JSON.stringify(content.meta_data, null, 2)}

Rispondi SOLO con il JSON richiesto, senza altri commenti.`

    try {
      const messages = createMessages(systemPrompt, userPrompt)
      const response = await callAI(messages, {
        temperature: 0.3,
        maxTokens: 2000,
        responseFormat: 'json_object',
      })

      // Parse JSON response
      const responseContent = response.choices[0].message.content
      const analysis = JSON.parse(responseContent)

      return {
        url,
        title: content.title,
        description: content.description,
        company_info: analysis.company_info || {},
        products_services: analysis.products_services || { main_offerings: [], target_market: [], unique_selling_points: [] },
        mission_values: analysis.mission_values || { values: [], certifications: [] },
        key_insights: analysis.key_insights || { competitive_advantages: [], client_types: [] },
        online_presence: analysis.online_presence || { social_media: [], blog_articles: 0, languages_supported: [] },
        analyzed_at: new Date().toISOString(),
        confidence_score: analysis.confidence_score || 0,
        analysis_source: 'openrouter',
      }

    } catch (error) {
      console.error(`[WebsiteAnalyzer] XAI analysis failed:`, error)

      // Return basic analysis from extracted content
      return {
        url,
        title: content.title,
        description: content.description,
        company_info: {
          name: content.meta_data.organization_name || content.meta_data.business_name || '',
          description: content.meta_data.organization_description || content.description || '',
        },
        products_services: {
          main_offerings: [],
          target_market: [],
          unique_selling_points: [],
        },
        mission_values: {
          values: [],
          certifications: [],
        },
        key_insights: {
          competitive_advantages: [],
          client_types: [],
        },
        online_presence: {
          social_media: [],
          blog_articles: 0,
          languages_supported: ['it'],
        },
        analyzed_at: new Date().toISOString(),
        confidence_score: 30,
        analysis_source: 'openrouter',
      }
    }
  }

  /**
   * Analyze multiple pages of a website (homepage + key pages)
   */
  async analyzeMultiplePages(baseUrl: string): Promise<WebsiteAnalysis[]> {
    const pagesToAnalyze = [
      baseUrl,
      `${baseUrl}/chi-siamo`,
      `${baseUrl}/about`,
      `${baseUrl}/servizi`,
      `${baseUrl}/services`,
      `${baseUrl}/prodotti`,
      `${baseUrl}/products`,
    ]

    const analyses: WebsiteAnalysis[] = []

    for (const pageUrl of pagesToAnalyze.slice(0, 3)) { // Limit to 3 pages to avoid excessive API costs
      try {
        const analysis = await this.analyzeWebsite(pageUrl)
        analyses.push(analysis)
      } catch (error) {
        console.log(`[WebsiteAnalyzer] Skipping page ${pageUrl}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    return analyses
  }
}
