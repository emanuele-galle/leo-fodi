/**
 * Web Content Fetcher
 * Scarica e pulisce contenuti HTML da URL esterni
 * Ottimizzato per ridurre token usage
 */

import { CacheService, CacheTTL } from '@/lib/cache/cache-service'

interface FetchedContent {
  url: string
  title: string
  text_content: string // Testo pulito senza HTML
  metadata: {
    description?: string
    keywords?: string[]
    author?: string
    og_title?: string
    og_description?: string
  }
  word_count: number
  fetched_at: string
}

export class WebContentFetcher {
  private cache: CacheService
  private maxContentLength = 5000 // Max caratteri per ottimizzare token

  constructor() {
    this.cache = CacheService.getInstance()
  }

  /**
   * Fetch e pulisci contenuto da URL
   */
  async fetchAndClean(url: string): Promise<FetchedContent | null> {
    try {
      // Check cache first
      const cacheKey = `web_content:${url}`
      const cached = await this.cache.get<FetchedContent>(cacheKey)
      if (cached) {
        console.log(`[WebFetcher] ✅ Cache hit for: ${url}`)
        return cached
      }

      console.log(`[WebFetcher] 📥 Fetching: ${url}`)

      // Fetch HTML
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LEO-FODI-Bot/1.0; +https://leo-fodi.com)',
        },
        signal: AbortSignal.timeout(10000), // 10s timeout
      })

      if (!response.ok) {
        console.warn(`[WebFetcher] ❌ HTTP ${response.status} for: ${url}`)
        return null
      }

      const html = await response.text()

      // Parse HTML
      const content = this.parseHTML(html, url)

      // Cache per 24h
      this.cache.set(cacheKey, content, CacheTTL.DAY)

      console.log(`[WebFetcher] ✅ Fetched ${content.word_count} words from: ${url}`)

      return content

    } catch (error) {
      console.error(`[WebFetcher] ❌ Error fetching ${url}:`, error)
      return null
    }
  }

  /**
   * Parse HTML e estrai testo pulito + metadata
   */
  private parseHTML(html: string, url: string): FetchedContent {
    // Estrai metadata
    const metadata = this.extractMetadata(html)

    // Rimuovi script, style, commenti
    let cleaned = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, '')

    // Rimuovi tutti i tag HTML
    cleaned = cleaned.replace(/<[^>]+>/g, ' ')

    // Decodifica entità HTML
    cleaned = this.decodeHTMLEntities(cleaned)

    // Normalizza spazi
    cleaned = cleaned
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim()

    // Limita lunghezza per ottimizzare token
    if (cleaned.length > this.maxContentLength) {
      // Prendi inizio + fine per catturare intro e contatti
      const half = Math.floor(this.maxContentLength / 2)
      cleaned = cleaned.substring(0, half) + '\n...[CONTENT TRUNCATED]...\n' + cleaned.substring(cleaned.length - half)
    }

    const words = cleaned.split(/\s+/).length

    return {
      url,
      title: metadata.title || '',
      text_content: cleaned,
      metadata: {
        description: metadata.description,
        keywords: metadata.keywords,
        author: metadata.author,
        og_title: metadata.og_title,
        og_description: metadata.og_description,
      },
      word_count: words,
      fetched_at: new Date().toISOString(),
    }
  }

  /**
   * Estrai metadata da HTML
   */
  private extractMetadata(html: string): {
    title?: string
    description?: string
    keywords?: string[]
    author?: string
    og_title?: string
    og_description?: string
  } {
    const metadata: any = {}

    // Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) metadata.title = titleMatch[1].trim()

    // Meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    if (descMatch) metadata.description = descMatch[1].trim()

    // Meta keywords
    const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i)
    if (keywordsMatch) {
      metadata.keywords = keywordsMatch[1].split(',').map(k => k.trim())
    }

    // Author
    const authorMatch = html.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i)
    if (authorMatch) metadata.author = authorMatch[1].trim()

    // OpenGraph title
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
    if (ogTitleMatch) metadata.og_title = ogTitleMatch[1].trim()

    // OpenGraph description
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    if (ogDescMatch) metadata.og_description = ogDescMatch[1].trim()

    return metadata
  }

  /**
   * Decodifica entità HTML comuni
   */
  private decodeHTMLEntities(text: string): string {
    const entities: Record<string, string> = {
      '&nbsp;': ' ',
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&apos;': "'",
    }

    let decoded = text
    for (const [entity, char] of Object.entries(entities)) {
      decoded = decoded.replace(new RegExp(entity, 'g'), char)
    }

    return decoded
  }

  /**
   * Fetch multipli URL in parallelo (max 3 alla volta)
   */
  async fetchMultiple(urls: string[]): Promise<FetchedContent[]> {
    const results: FetchedContent[] = []
    const maxConcurrent = 3

    for (let i = 0; i < urls.length; i += maxConcurrent) {
      const batch = urls.slice(i, i + maxConcurrent)
      const promises = batch.map(url => this.fetchAndClean(url))
      const batchResults = await Promise.all(promises)

      results.push(...batchResults.filter(r => r !== null) as FetchedContent[])
    }

    return results
  }
}
