/**
 * Website Contact Scraper (Production-Ready)
 * Usa Cheerio (no browser) per estrarre contatti da website
 * Compatibile con Vercel serverless
 */

import * as cheerio from 'cheerio'
import axios from 'axios'

export interface ContactData {
  emails: Array<{
    value: string
    source: string
    confidence: number
  }>
  phones: Array<{
    value: string
    source: string
    confidence: number
  }>
  addresses: Array<{
    value: string
    source: string
    confidence: number
  }>
  social_links: {
    facebook?: string
    instagram?: string
    linkedin?: string
    twitter?: string
    youtube?: string
  }
}

export class WebsiteContactScraper {
  private readonly timeout = 10000 // 10s timeout
  private readonly userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

  /**
   * Scrape contatti da website
   */
  async scrapeContacts(url: string): Promise<ContactData> {
    const startTime = Date.now()

    console.log(`[WebsiteScraper] Scraping contacts from: ${url}`)

    try {
      // 1. Normalizza URL
      const normalizedUrl = this.normalizeUrl(url)

      // 2. Fetch HTML
      const html = await this.fetchHtml(normalizedUrl)

      // 3. Parse con Cheerio
      const $ = cheerio.load(html)

      // 4. Estrai contatti
      const contacts: ContactData = {
        emails: this.extractEmails($, html),
        phones: this.extractPhones($, html),
        addresses: this.extractAddresses($, html),
        social_links: this.extractSocialLinks($),
      }

      // 5. Deduplicazione
      contacts.emails = this.deduplicateContacts(contacts.emails)
      contacts.phones = this.deduplicateContacts(contacts.phones)
      contacts.addresses = this.deduplicateContacts(contacts.addresses)

      const elapsed = Date.now() - startTime

      console.log(`[WebsiteScraper] ✅ Completed in ${elapsed}ms`)
      console.log(`   - Emails: ${contacts.emails.length}`)
      console.log(`   - Phones: ${contacts.phones.length}`)
      console.log(`   - Addresses: ${contacts.addresses.length}`)

      return contacts
    } catch (error) {
      console.error(`[WebsiteScraper] ❌ Error scraping ${url}:`, error)
      throw error
    }
  }

  /**
   * Fetch HTML da URL
   */
  private async fetchHtml(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': this.userAgent,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        maxRedirects: 5,
      })

      return response.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`[WebsiteScraper] Failed to fetch ${url}:`, errorMessage)
      throw new Error(`Failed to fetch website: ${errorMessage}`)
    }
  }

  /**
   * Estrai email da HTML
   */
  private extractEmails(
    $: cheerio.CheerioAPI,
    html: string
  ): Array<{ value: string; source: string; confidence: number }> {
    const emails: Array<{ value: string; source: string; confidence: number }> = []

    // Pattern 1: Mailto links (alta confidenza)
    $('a[href^="mailto:"]').each((_, el) => {
      const href = $(el).attr('href')
      if (href) {
        const email = href.replace('mailto:', '').split('?')[0].trim()
        if (this.isValidEmail(email)) {
          emails.push({
            value: email,
            source: 'mailto_link',
            confidence: 95,
          })
        }
      }
    })

    // Pattern 2: Meta tags (alta confidenza)
    const metaEmail = $('meta[property="og:email"]').attr('content')
    if (metaEmail && this.isValidEmail(metaEmail)) {
      emails.push({
        value: metaEmail,
        source: 'meta_tag',
        confidence: 90,
      })
    }

    // Pattern 3: Schema.org contact (alta confidenza)
    $('[itemtype*="schema.org/Organization"] [itemprop="email"]').each((_, el) => {
      const email = $(el).text().trim()
      if (this.isValidEmail(email)) {
        emails.push({
          value: email,
          source: 'schema_org',
          confidence: 90,
        })
      }
    })

    // Pattern 4: Regex su testo (media confidenza)
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    const textEmails = html.match(emailRegex) || []

    for (const email of textEmails) {
      if (this.isValidEmail(email) && !this.isBlacklistedEmail(email)) {
        emails.push({
          value: email.toLowerCase(),
          source: 'text_content',
          confidence: 70,
        })
      }
    }

    return emails
  }

  /**
   * Estrai numeri telefono da HTML
   */
  private extractPhones(
    $: cheerio.CheerioAPI,
    html: string
  ): Array<{ value: string; source: string; confidence: number }> {
    const phones: Array<{ value: string; source: string; confidence: number }> = []

    // Pattern 1: Tel links (alta confidenza)
    $('a[href^="tel:"]').each((_, el) => {
      const href = $(el).attr('href')
      if (href) {
        const phone = href.replace('tel:', '').trim()
        const normalized = this.normalizePhone(phone)
        if (normalized) {
          phones.push({
            value: normalized,
            source: 'tel_link',
            confidence: 95,
          })
        }
      }
    })

    // Pattern 2: Schema.org contact (alta confidenza)
    $('[itemtype*="schema.org/Organization"] [itemprop="telephone"]').each((_, el) => {
      const phone = $(el).text().trim()
      const normalized = this.normalizePhone(phone)
      if (normalized) {
        phones.push({
          value: normalized,
          source: 'schema_org',
          confidence: 90,
        })
      }
    })

    // Pattern 3: Regex su testo (media confidenza)
    // Pattern telefono italiano: +39, 0039, numeri fissi/mobile
    const phoneRegex =
      /(?:\+39|0039)?\s*(?:\d{2,3}[\s\-\.]?)?\d{6,10}|\b(?:3\d{2}[\s\-\.]?\d{6,7})\b/g
    const textPhones = html.match(phoneRegex) || []

    for (const phone of textPhones) {
      const normalized = this.normalizePhone(phone)
      if (normalized && normalized.length >= 9) {
        phones.push({
          value: normalized,
          source: 'text_content',
          confidence: 65,
        })
      }
    }

    return phones
  }

  /**
   * Estrai indirizzi da HTML
   */
  private extractAddresses(
    $: cheerio.CheerioAPI,
    html: string
  ): Array<{ value: string; source: string; confidence: number }> {
    const addresses: Array<{ value: string; source: string; confidence: number }> = []

    // Pattern 1: Schema.org address (alta confidenza)
    $('[itemtype*="schema.org/PostalAddress"]').each((_, el) => {
      const street = $(el).find('[itemprop="streetAddress"]').text().trim()
      const city = $(el).find('[itemprop="addressLocality"]').text().trim()
      const zip = $(el).find('[itemprop="postalCode"]').text().trim()

      if (street || city) {
        const fullAddress = [street, zip, city].filter(Boolean).join(', ')
        addresses.push({
          value: fullAddress,
          source: 'schema_org',
          confidence: 90,
        })
      }
    })

    // Pattern 2: Meta tags
    const metaAddress = $('meta[property="og:street-address"]').attr('content')
    if (metaAddress) {
      addresses.push({
        value: metaAddress,
        source: 'meta_tag',
        confidence: 85,
      })
    }

    // Pattern 3: Footer/Contact section
    const addressKeywords = ['indirizzo', 'sede', 'address', 'location', 'via', 'piazza']
    $('footer, .contact, .address, #address, #contatti').each((_, el) => {
      const text = $(el).text().toLowerCase()
      for (const keyword of addressKeywords) {
        if (text.includes(keyword)) {
          const addressText = $(el).text().trim()
          if (addressText.length > 10 && addressText.length < 200) {
            addresses.push({
              value: addressText,
              source: 'footer_section',
              confidence: 60,
            })
          }
        }
      }
    })

    return addresses
  }

  /**
   * Estrai social links
   */
  private extractSocialLinks($: cheerio.CheerioAPI): {
    facebook?: string
    instagram?: string
    linkedin?: string
    twitter?: string
    youtube?: string
  } {
    const social: any = {}

    $('a[href*="facebook.com"]')
      .first()
      .each((_, el) => {
        social.facebook = $(el).attr('href')
      })

    $('a[href*="instagram.com"]')
      .first()
      .each((_, el) => {
        social.instagram = $(el).attr('href')
      })

    $('a[href*="linkedin.com"]')
      .first()
      .each((_, el) => {
        social.linkedin = $(el).attr('href')
      })

    $('a[href*="twitter.com"], a[href*="x.com"]')
      .first()
      .each((_, el) => {
        social.twitter = $(el).attr('href')
      })

    $('a[href*="youtube.com"]')
      .first()
      .each((_, el) => {
        social.youtube = $(el).attr('href')
      })

    return social
  }

  /**
   * Valida email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/
    return emailRegex.test(email)
  }

  /**
   * Blacklist email comuni (non contatti reali)
   */
  private isBlacklistedEmail(email: string): boolean {
    const blacklist = [
      'example.com',
      'test.com',
      'domain.com',
      'email.com',
      'yoursite.com',
      'yourdomain.com',
      'sampleemail.com',
      'noreply',
      'no-reply',
      'support@example',
    ]

    return blacklist.some((blocked) => email.toLowerCase().includes(blocked))
  }

  /**
   * Normalizza numero telefono
   */
  private normalizePhone(phone: string): string {
    // Rimuovi spazi, trattini, parentesi, punti
    let normalized = phone.replace(/[\s\-\(\)\.\+]/g, '')

    // Aggiungi prefisso +39 se manca
    if (normalized.startsWith('00')) {
      normalized = '+' + normalized.substring(2)
    } else if (!normalized.startsWith('+') && !normalized.startsWith('39')) {
      normalized = '+39' + normalized
    } else if (normalized.startsWith('39') && !normalized.startsWith('+')) {
      normalized = '+' + normalized
    }

    return normalized
  }

  /**
   * Normalizza URL
   */
  private normalizeUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url
    }
    return url
  }

  /**
   * Deduplicazione contatti
   */
  private deduplicateContacts<T extends { value: string; confidence: number }>(
    contacts: T[]
  ): T[] {
    const seen = new Map<string, T>()

    for (const contact of contacts) {
      const key = contact.value.toLowerCase()

      // Se già presente, mantieni quello con confidence maggiore
      if (!seen.has(key) || (seen.get(key)?.confidence || 0) < contact.confidence) {
        seen.set(key, contact)
      }
    }

    return Array.from(seen.values())
  }

  /**
   * Scrape multiple pages (contact page, about page, etc.)
   */
  async scrapeMultiplePages(baseUrl: string): Promise<ContactData> {
    const pages = [
      baseUrl, // Homepage
      `${baseUrl}/contatti`,
      `${baseUrl}/contact`,
      `${baseUrl}/contact-us`,
      `${baseUrl}/chi-siamo`,
      `${baseUrl}/about`,
      `${baseUrl}/about-us`,
    ]

    const allContacts: ContactData = {
      emails: [],
      phones: [],
      addresses: [],
      social_links: {},
    }

    for (const pageUrl of pages) {
      try {
        console.log(`[WebsiteScraper] Trying page: ${pageUrl}`)
        const contacts = await this.scrapeContacts(pageUrl)

        // Merge contatti
        allContacts.emails.push(...contacts.emails)
        allContacts.phones.push(...contacts.phones)
        allContacts.addresses.push(...contacts.addresses)

        // Merge social links (prendi il primo trovato)
        if (!allContacts.social_links.facebook && contacts.social_links.facebook) {
          allContacts.social_links.facebook = contacts.social_links.facebook
        }
        if (!allContacts.social_links.instagram && contacts.social_links.instagram) {
          allContacts.social_links.instagram = contacts.social_links.instagram
        }
        if (!allContacts.social_links.linkedin && contacts.social_links.linkedin) {
          allContacts.social_links.linkedin = contacts.social_links.linkedin
        }
      } catch (error) {
        // Ignora errori 404 su pagine specifiche
        console.log(`[WebsiteScraper] Page not found: ${pageUrl}`)
      }
    }

    // Deduplicazione finale
    allContacts.emails = this.deduplicateContacts(allContacts.emails)
    allContacts.phones = this.deduplicateContacts(allContacts.phones)
    allContacts.addresses = this.deduplicateContacts(allContacts.addresses)

    return allContacts
  }
}
