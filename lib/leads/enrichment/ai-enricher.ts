/**
 * AI Lead Enrichment
 * Uses XAI (Grok) to extract email patterns, find referenti, and enrich data
 * Analyzes website content and social profiles to extract contacts
 */

import type { Lead, Referente } from '@/lib/types/lead-extraction'
import axios from 'axios'
import * as cheerio from 'cheerio'

interface EnrichmentResult {
  email_principale?: string
  email_secondaria?: string
  telefono_mobile?: string
  referenti: Referente[]
  linkedin_url?: string
  facebook_url?: string
  instagram_url?: string
  note_ai?: string
}

/**
 * Enrich lead with AI analysis
 */
export async function enrichLeadWithAI(lead: Lead): Promise<Lead> {
  console.log(`[AI-Enrichment] Starting enrichment for: ${lead.ragione_sociale}`)

  try {
    // Step 1: Fetch website content if available
    let websiteContent = ''
    if (lead.sito_web) {
      websiteContent = await fetchWebsiteContent(lead.sito_web)
    }

    // Step 2: Search for company on web
    const webResults = await searchWeb(lead.ragione_sociale, lead.citta)

    // Step 3: Use AI to extract contacts and referenti
    const enrichment = await extractContactsWithAI(lead, websiteContent, webResults)

    // Step 4: Merge enrichment data
    const enrichedLead: Lead = {
      ...lead,
      email_principale: enrichment.email_principale || lead.email_principale,
      telefono_mobile: enrichment.telefono_mobile || lead.telefono_mobile,
      linkedin_url: enrichment.linkedin_url || lead.linkedin_url,
      facebook_url: enrichment.facebook_url || lead.facebook_url,
      instagram_url: enrichment.instagram_url || lead.instagram_url,
      referenti: enrichment.referenti.length > 0 ? enrichment.referenti : lead.referenti,
      note: enrichment.note_ai ? `${lead.note || ''}\n\nAI Analysis: ${enrichment.note_ai}`.trim() : lead.note,
      fonti_consultate: [...(lead.fonti_consultate || []), 'ai_enrichment'],
      updated_at: new Date().toISOString(),
    }

    // Update affidabilita score if we found new data
    if (enrichment.email_principale || enrichment.referenti.length > 0) {
      const currentScore = enrichedLead.affidabilita_score || 0
      enrichedLead.affidabilita_score = Math.min(currentScore + 10, 100)
    }

    // Calculate lead score
    enrichedLead.extra_data = {
      ...(enrichedLead.extra_data || {}),
      lead_score: calculateLeadScore(lead, enrichment),
    }

    console.log(`[AI-Enrichment] ✅ Enriched with ${enrichment.referenti.length} referenti, score: ${enrichedLead.extra_data.lead_score}`)
    return enrichedLead
  } catch (error) {
    console.error(`[AI-Enrichment] Error enriching ${lead.ragione_sociale}:`, error)
    return lead // Return original lead if enrichment fails
  }
}

/**
 * Calculate lead quality score (0-100)
 */
function calculateLeadScore(lead: Lead, enrichment: EnrichmentResult): number {
  let score = 0

  // Email presente (+25)
  if (enrichment.email_principale || lead.email_principale) score += 25

  // Website presente (+15)
  if (lead.sito_web) score += 15

  // Numero di dipendenti (+10 se >10, +5 se 1-10, +15 se >50)
  const employees = lead.dipendenti || 0
  if (employees > 50) score += 15
  else if (employees > 10) score += 10
  else if (employees > 0) score += 5

  // Settore target per assicurazioni
  const targetSectors = ['assicurazioni', 'finanza', 'immobiliare', 'medico', 'legale', 'tecnologia', 'consulenza', 'servizi_professionali', 'edilizia', 'commercio']
  const sector = (lead.settore || '').toLowerCase()
  if (targetSectors.some(s => sector.includes(s))) score += 20

  // Telefono presente (+10)
  if (lead.telefono_principale || enrichment.telefono_mobile) score += 10

  // LinkedIn presente (+5)
  if (enrichment.linkedin_url || lead.linkedin_url) score += 5

  // Referenti trovati (+10)
  if (enrichment.referenti && enrichment.referenti.length > 0) score += 10

  return Math.min(score, 100)
}

/**
 * Fetch and parse website content
 */
async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    const $ = cheerio.load(response.data)

    // Remove scripts and styles
    $('script, style, nav, footer').remove()

    // Extract text content
    const text = $('body').text()

    // Clean and limit to first 5000 chars
    return text
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000)
  } catch (error) {
    console.error('[AI-Enrichment] Error fetching website:', error)
    return ''
  }
}

/**
 * Search web for company info
 */
async function searchWeb(companyName: string, city?: string): Promise<string> {
  // For now, return placeholder
  // In production, use Google Custom Search API or SerpAPI
  return `Search results for ${companyName} in ${city || 'Italy'}`
}

/**
 * Extract contacts using AI (XAI Grok)
 */
async function extractContactsWithAI(
  lead: Lead,
  websiteContent: string,
  webResults: string
): Promise<EnrichmentResult> {
  const apiKey = process.env.OPENROUTER_API_KEY
  const apiUrl = 'https://openrouter.ai/api/v1'

  if (!apiKey) {
    console.warn('[AI-Enrichment] OPENROUTER_API_KEY not configured, skipping AI enrichment')
    return { referenti: [] }
  }

  try {
    const prompt = `Analyze this Italian company and extract contact information and key people.

Company: ${lead.ragione_sociale}
Sector: ${lead.settore}
Location: ${lead.citta}, ${lead.provincia}
Current contacts: ${lead.telefono_principale || 'N/A'}, ${lead.email_principale || 'N/A'}

Website content:
${websiteContent || 'No website available'}

Web search results:
${webResults}

Please extract:
1. Main email (info@, contatti@, etc.) - must be valid format
2. Mobile phone numbers (Italian format +39 3XX XXXXXXX)
3. Key people (CEO, Owner, Manager) with their name, role, and contacts if available
4. Social media URLs (LinkedIn, Facebook, Instagram)
5. Any important notes about the company

Respond in JSON format:
{
  "email_principale": "email@company.it",
  "telefono_mobile": "+39 333 1234567",
  "referenti": [
    {
      "nome": "Mario",
      "cognome": "Rossi",
      "ruolo": "CEO",
      "telefono": "+39 333...",
      "email": "mario@...",
      "linkedin": "https://linkedin.com/in/..."
    }
  ],
  "linkedin_url": "https://linkedin.com/company/...",
  "facebook_url": "https://facebook.com/...",
  "instagram_url": "https://instagram.com/...",
  "note_ai": "Brief notes about the company"
}

IMPORTANT:
- Only include REAL data found in the content
- Do NOT invent or guess data
- Use N/A or omit fields if not found
- Validate email and phone formats
- Keep notes concise (max 100 chars)`

    const response = await axios.post(
      `${apiUrl}/chat/completions`,
      {
        model: 'anthropic/claude-haiku-4-5-20251001',
        messages: [
          {
            role: 'system',
            content: 'You are a business intelligence assistant specializing in extracting contact information from company data. Always respond in valid JSON format. Never invent data.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Low temperature for factual extraction
        max_tokens: 2000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://leo-fodi.fodivps2.cloud',
          'X-Title': 'LEO-FODI',
        },
        timeout: 30000,
      }
    )

    const aiResponse = response.data.choices[0].message.content

    // Parse JSON response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.warn('[AI-Enrichment] No JSON found in AI response')
      return { referenti: [] }
    }

    const enrichment: EnrichmentResult = JSON.parse(jsonMatch[0])

    // Validate and clean data
    return {
      email_principale: validateEmail(enrichment.email_principale),
      telefono_mobile: validatePhone(enrichment.telefono_mobile),
      referenti: (enrichment.referenti || []).map((r) => ({
        nome: r.nome,
        cognome: r.cognome,
        ruolo: r.ruolo,
        telefono: validatePhone(r.telefono),
        email: validateEmail(r.email),
        linkedin: validateUrl(r.linkedin),
      })),
      linkedin_url: validateUrl(enrichment.linkedin_url),
      facebook_url: validateUrl(enrichment.facebook_url),
      instagram_url: validateUrl(enrichment.instagram_url),
      note_ai: enrichment.note_ai?.substring(0, 100),
    }
  } catch (error) {
    console.error('[AI-Enrichment] AI extraction error:', error)
    return { referenti: [] }
  }
}

/**
 * Validate email format
 */
function validateEmail(email?: string): string | undefined {
  if (!email || email === 'N/A') return undefined

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) ? email : undefined
}

/**
 * Validate phone format (Italian)
 */
function validatePhone(phone?: string): string | undefined {
  if (!phone || phone === 'N/A') return undefined

  // Type guard: ensure phone is a string before calling .replace()
  if (typeof phone !== 'string') return undefined

  // Clean phone number
  const cleaned = phone.replace(/[\s\-()]/g, '')

  // Italian phone patterns
  const patterns = [
    /^\+39\d{9,10}$/, // +39 followed by 9-10 digits
    /^0\d{9,10}$/, // Starts with 0
    /^3\d{8,9}$/, // Mobile starting with 3
  ]

  return patterns.some((p) => p.test(cleaned)) ? phone : undefined
}

/**
 * Validate URL format
 */
function validateUrl(url?: string): string | undefined {
  if (!url || url === 'N/A') return undefined

  try {
    new URL(url)
    return url
  } catch {
    return undefined
  }
}

/**
 * Batch enrich multiple leads
 * UNLIMITED MODE: No rate limiting, process all leads in parallel
 */
export async function batchEnrichLeads(
  leads: Lead[],
  maxConcurrent: number = 10 // Increased default concurrent requests
): Promise<Lead[]> {
  console.log(`[AI-Enrichment] 🚀 UNLIMITED MODE: Batch enriching ${leads.length} leads (${maxConcurrent} concurrent)`)

  const enrichedLeads: Lead[] = []

  // Process in parallel batches for maximum performance
  for (let i = 0; i < leads.length; i += maxConcurrent) {
    const batch = leads.slice(i, i + maxConcurrent)

    const results = await Promise.all(
      batch.map((lead) => enrichLeadWithAI(lead))
    )

    enrichedLeads.push(...results)

    // NO RATE LIMITING - process at full speed
    console.log(`[AI-Enrichment] Progress: ${enrichedLeads.length}/${leads.length} leads processed`)
  }

  const enrichedCount = enrichedLeads.filter(
    (l, i) => l.referenti && l.referenti.length > (leads[i].referenti?.length || 0)
  ).length

  console.log(`[AI-Enrichment] ✅ Enriched ${enrichedCount} leads with new data`)
  return enrichedLeads
}
