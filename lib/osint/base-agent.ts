/**
 * Base Agent Class
 * Classe base per tutti gli agent OSINT con integrazione OpenRouter
 */

import axios from 'axios'
import { trackTokenUsage, calculateXAICost, XAI_COSTS } from '@/lib/ai/token-tracker'
import type {
  AgentConfig,
  AgentContext,
  AgentResult,
  ProfilingTarget,
  XAIModel,
  WebSearchResult,
} from './types'

export abstract class BaseOSINTAgent<TResult = any> {
  protected config: AgentConfig
  protected apiKey: string
  protected apiUrl: string

  constructor(config: AgentConfig) {
    this.config = config
    this.apiKey = process.env.OPENROUTER_API_KEY || ''
    this.apiUrl = 'https://openrouter.ai/api/v1'

    if (!this.apiKey) {
      console.warn(`[${this.config.id}] ⚠️  OPENROUTER_API_KEY not configured`)
    }
  }

  /**
   * Metodo principale da implementare in ogni agent
   */
  abstract execute(context: AgentContext): Promise<AgentResult<TResult>>

  /**
   * Estrae strategia di ricerca adattiva dal context
   */
  protected getAdaptiveSearchStrategy(context: AgentContext): {
    mode?: 'on' | 'off' | 'auto'
    max_search_results?: number
    sources?: Array<'web' | 'news' | 'x'>
    return_citations?: boolean
  } | undefined {
    const rawData = (context as any).raw_data
    if (rawData?._adaptiveSearchStrategy?.searchParameters) {
      const strategy = rawData._adaptiveSearchStrategy
      this.log(
        `Using adaptive search: ${strategy.priority} priority (${strategy.searchParameters.mode} mode, ${strategy.searchParameters.max_search_results} results)`,
        'info'
      )
      return strategy.searchParameters
    }
    return undefined
  }

  /**
   * Estrae prompt di enrichment per email/phone dal context
   */
  protected getEnrichmentPromptFromContext(context: AgentContext): string | null {
    const rawData = (context as any).raw_data
    if (rawData?._enrichmentPrompt) {
      return rawData._enrichmentPrompt
    }
    return null
  }

  /**
   * Chiamata al modello OpenRouter con supporto parametri standard
   */
  protected async callXAI(
    userMessage: string,
    options?: {
      temperature?: number
      max_tokens?: number
      response_format?: { type: 'json_object' }
      searchParameters?: {
        mode?: 'on' | 'off' | 'auto'
        max_search_results?: number
        sources?: Array<'web' | 'news' | 'x'>
        return_citations?: boolean
      }
    }
  ): Promise<string> {
    const startTime = Date.now()

    try {
      console.log(`[${this.config.id}] 🤖 Calling OpenRouter model: ${this.config.model}`)

      // Build request body (search_parameters not supported on OpenRouter)
      const requestBody: any = {
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: this.config.system_prompt,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: options?.temperature ?? this.config.temperature,
        max_tokens: options?.max_tokens ?? this.config.max_tokens,
        response_format: options?.response_format,
      }

      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://leo-fodi.fodivps2.cloud',
            'X-Title': 'LEO-FODI OSINT',
          },
          timeout: 90000, // 90s timeout (increased for complex agents like education profiler)
        }
      )

      const content = response.data.choices[0].message.content
      const executionTime = Date.now() - startTime
      const usage = response.data.usage

      console.log(
        `[${this.config.id}] ✅ OpenRouter response received (${executionTime}ms, ${usage?.total_tokens || 'N/A'} tokens)`
      )

      // Track token usage in database
      if (usage) {
        try {
          const totalCost = calculateXAICost(
            this.config.model,
            usage.prompt_tokens || 0,
            usage.completion_tokens || 0
          )

          await trackTokenUsage({
            section: 'osint_profiling',
            operation: this.config.id,
            provider: 'openrouter',
            model: this.config.model,
            promptTokens: usage.prompt_tokens || 0,
            completionTokens: usage.completion_tokens || 0,
            totalTokens: usage.total_tokens || 0,
            totalCost,
            executionTimeMs: executionTime,
            status: 'success',
          })
        } catch (trackError) {
          console.warn(`[${this.config.id}] ⚠️  Failed to track token usage:`, trackError)
          // Don't throw - tracking failure shouldn't break the agent
        }
      }

      return content

    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error(`[${this.config.id}] ❌ OpenRouter call failed (${executionTime}ms):`, error)

      // Track failed request
      try {
        await trackTokenUsage({
          section: 'osint_profiling',
          operation: this.config.id,
          provider: 'openrouter',
          model: this.config.model,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          totalCost: 0,
          executionTimeMs: executionTime,
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        })
      } catch (trackError) {
        console.warn(`[${this.config.id}] ⚠️  Failed to track error:`, trackError)
      }

      if (axios.isAxiosError(error)) {
        throw new Error(
          `OpenRouter API Error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`
        )
      }

      throw error
    }
  }

  /**
   * Parsing sicuro di JSON response da AI
   */
  protected parseJSONResponse<T>(jsonString: string): T {
    try {
      // Estrae JSON dal testo se necessario
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return JSON.parse(jsonString)
    } catch (error) {
      console.error(`[${this.config.id}] ❌ JSON parsing failed:`, error)
      throw new Error(`Failed to parse JSON response: ${error}`)
    }
  }

  /**
   * Ricerca web con Apify RAG Web Browser
   */
  protected async searchWeb(query: string, numResults: number = 5): Promise<WebSearchResult[]> {
    const apiToken = process.env.APIFY_API_TOKEN
    if (!apiToken) {
      this.log('⚠️ APIFY_API_TOKEN not configured, skipping web search', 'warn')
      return []
    }

    try {
      console.log(`[${this.config.id}] 🔍 Web search via Apify: "${query}"`)

      const response = await fetch(
        'https://api.apify.com/v2/acts/apify~rag-web-browser/run-sync-get-dataset-items?token=' + apiToken,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            maxResults: numResults,
            outputFormats: ['markdown'],
          }),
          signal: AbortSignal.timeout(30000),
        }
      )

      if (!response.ok) {
        this.log(`⚠️ Apify web search failed: ${response.statusText}`, 'warn')
        return []
      }

      const items = await response.json() as Array<{url?: string; title?: string; markdown?: string; text?: string}>
      console.log(`[${this.config.id}] ✅ Found ${items.length} search results via Apify`)

      return items.map(item => ({
        url: item.url || '',
        title: item.title || '',
        snippet: (item.markdown || item.text || '').slice(0, 500),
        source: 'apify_rag',
      }))
    } catch (error) {
      this.log(`⚠️ Web search error: ${error instanceof Error ? error.message : error}`, 'warn')
      return []
    }
  }

  /**
   * Scraping semplice di una pagina web
   */
  protected async scrapePage(url: string): Promise<string> {
    try {
      console.log(`[${this.config.id}] 🌐 Scraping: ${url}`)

      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        maxRedirects: 5,
      })

      // Rimuove tag HTML e script per ottenere solo testo
      const text = response.data
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      console.log(`[${this.config.id}] ✅ Scraped ${text.length} characters`)

      return text.substring(0, 10000) // Limita a 10K caratteri

    } catch (error) {
      console.error(`[${this.config.id}] ❌ Scraping failed:`, error)
      return ''
    }
  }

  /**
   * Estrae informazioni da URL LinkedIn
   */
  protected extractLinkedInUsername(url: string): string | null {
    const match = url.match(/linkedin\.com\/in\/([^/?]+)/)
    return match ? match[1] : null
  }

  /**
   * Estrae informazioni da URL Facebook
   */
  protected extractFacebookUsername(url: string): string | null {
    const match = url.match(/facebook\.com\/([^/?]+)/)
    return match ? match[1] : null
  }

  /**
   * Estrae informazioni da URL Instagram
   */
  protected extractInstagramUsername(url: string): string | null {
    const match = url.match(/instagram\.com\/([^/?]+)/)
    return match ? match[1] : null
  }

  /**
   * Estrae informazioni da URL Twitter/X
   */
  protected extractTwitterUsername(url: string): string | null {
    const match = url.match(/(?:twitter|x)\.com\/([^/?]+)/)
    return match ? match[1] : null
  }

  /**
   * Sleep utility per rate limiting
   */
  protected async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * FIX A: Sanifica dati LinkedIn oscurati con asterischi (****)
   * LinkedIn usa **** per nascondere campi privati
   * Questa funzione rimuove/nullifica tali campi per evitare che gli agent li usino come dati reali
   */
  protected sanitizeLinkedInData(data: any): any {
    if (!data) return data

    // Clone per evitare mutazioni
    const sanitized = { ...data }

    // Sanifica esperienze lavorative
    if (sanitized.esperienze) {
      sanitized.esperienze = sanitized.esperienze.map((exp: any) => ({
        ...exp,
        ruolo: this.isObscured(exp.ruolo) ? null : exp.ruolo,
        descrizione: this.isObscured(exp.descrizione) ? null : exp.descrizione,
        azienda: this.isObscured(exp.azienda) ? null : exp.azienda,
      }))
    }

    // Sanifica formazione
    if (sanitized.formazione) {
      sanitized.formazione = sanitized.formazione.map((edu: any) => ({
        ...edu,
        titolo: this.isObscured(edu.titolo) ? null : edu.titolo,
        campo_studio: this.isObscured(edu.campo_studio) ? null : edu.campo_studio,
        istituzione: this.isObscured(edu.istituzione) ? null : edu.istituzione,
      }))
    }

    // Sanifica competenze
    if (sanitized.competenze) {
      sanitized.competenze = sanitized.competenze.filter((skill: any) => {
        const skillName = typeof skill === 'string' ? skill : skill.nome
        return !this.isObscured(skillName)
      })
    }

    // Sanifica certificazioni
    if (sanitized.certificazioni) {
      sanitized.certificazioni = sanitized.certificazioni.filter((cert: any) => {
        return !this.isObscured(cert.nome)
      })
    }

    // Sanifica bio/about
    if (this.isObscured(sanitized.about)) {
      sanitized.about = null
    }

    if (this.isObscured(sanitized.headline)) {
      sanitized.headline = null
    }

    return sanitized
  }

  /**
   * Verifica se un testo è oscurato con asterischi da LinkedIn
   * Considera oscurato se >50% del testo sono asterischi
   */
  private isObscured(text: string | null | undefined): boolean {
    if (!text || typeof text !== 'string') return false

    const asteriskCount = (text.match(/\*/g) || []).length
    const totalLength = text.length

    // Se >50% asterischi → oscurato
    return asteriskCount > totalLength * 0.5
  }

  /**
   * FIX B: Filtra risultati Google Search per evitare omonimi
   * Mantiene solo risultati del profilo LinkedIn target o risultati non-LinkedIn (articoli, news)
   */
  protected filterGoogleSearchResults(
    results: any[],
    targetLinkedInUrl: string
  ): any[] {
    if (!results || results.length === 0) return []
    if (!targetLinkedInUrl) return results // Se no target URL, ritorna tutto

    const cleanTargetUrl = targetLinkedInUrl
      .replace('https://', '')
      .replace('http://', '')
      .replace('www.', '')
      .replace(/\/$/, '')

    const filtered = results.filter((result: any) => {
      const url = (result.link || result.url || '')
        .replace('https://', '')
        .replace('http://', '')
        .replace('www.', '') || ''

      const isLinkedInProfile = url.includes('linkedin.com/in/')

      if (isLinkedInProfile) {
        // Se è profilo LinkedIn, mantieni solo se match con target
        return url.includes(cleanTargetUrl)
      }

      // Mantieni tutti i risultati non-LinkedIn (articoli, news, altre piattaforme)
      return true
    })

    if (filtered.length < results.length) {
      this.log(`Filtered Google Search: ${filtered.length}/${results.length} results (removed ${results.length - filtered.length} mismatched profiles)`, 'info')
    }

    return filtered
  }

  /**
   * Crea risultato success
   */
  protected createSuccessResult(
    data: TResult,
    confidence: number,
    sources: string[],
    executionTime: number
  ): AgentResult<TResult> {
    return {
      agent_id: this.config.id,
      success: true,
      data,
      confidence,
      sources,
      execution_time_ms: executionTime,
    }
  }

  /**
   * Crea risultato error
   */
  protected createErrorResult(
    error: string,
    executionTime: number
  ): AgentResult<TResult> {
    return {
      agent_id: this.config.id,
      success: false,
      data: null,
      confidence: 0,
      sources: [],
      execution_time_ms: executionTime,
      error,
    }
  }

  /**
   * Log helper
   */
  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    const prefix = `[${this.config.id}]`
    const emoji = level === 'error' ? '❌' : level === 'warn' ? '⚠️ ' : '📝'

    switch (level) {
      case 'error':
        console.error(`${prefix} ${emoji} ${message}`)
        break
      case 'warn':
        console.warn(`${prefix} ${emoji} ${message}`)
        break
      default:
        console.log(`${prefix} ${emoji} ${message}`)
    }
  }
}
