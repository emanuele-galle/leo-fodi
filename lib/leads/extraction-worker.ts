/**
 * Lead Extraction Worker
 * Parallel extraction from multiple sources
 */

import { prisma } from '@/lib/db'
import type { LeadSearchParams, Lead } from '@/lib/types/lead-extraction'
import { googlePlacesExtractor } from './extractors/google-places'
import { pagineGialleExtractor } from './extractors/pagine-gialle'
import { yelpExtractor } from './extractors/yelp'
import { batchEnrichLeads } from './enrichment/ai-enricher'
import { normalizeProvincia, matchComune, getProvinceByRegione } from '@/lib/data/province-italiane'
// LinkedIn and Facebook are ONLY used in web enrichment, not in lead extraction

// Map of available extractors - OPTIMIZED FOR B2B LEAD GENERATION
// NOTE: LinkedIn and Facebook are ONLY used in web enrichment (see enrichment/web-enricher.ts)
const EXTRACTORS = {
  // ===== PRIORITY 1 - Official API Data (Highest Reliability) =====
  google_places: googlePlacesExtractor, // Google Places API - REAL DATA

  // ===== PRIORITY 2 - Static Scraping (Cheerio - High Performance) =====
  pagine_gialle: pagineGialleExtractor, // Pagine Gialle - Local businesses (50 leads/search)
  yelp: yelpExtractor, // Yelp - Services/Restaurants (50 leads/search)
}

/**
 * Main extraction worker function
 * Runs extraction from multiple sources in parallel
 */
export async function extractLeadsWorker(
  searchId: string,
  params: LeadSearchParams
): Promise<void> {
  console.log(`[Worker] Starting extraction for search ${searchId}`)

  const startTime = Date.now()

  try {
    // Update status to running
    await prisma.leadSearch.update({
      where: { id: searchId },
      data: {
        status: 'running',
        startedAt: new Date(),
      },
    })

    // Get enabled sources
    const enabledSources = params.fonti_abilitate || []
    console.log(`[Worker] Enabled sources from params:`, enabledSources)
    console.log(`[Worker] Available extractors:`, Object.keys(EXTRACTORS))

    const sourcesToRun = enabledSources.filter((source) => source in EXTRACTORS)
    const missingSources = enabledSources.filter((source) => !(source in EXTRACTORS))

    if (missingSources.length > 0) {
      console.warn(`[Worker] Missing extractors for:`, missingSources)
    }

    console.log(`[Worker] Running ${sourcesToRun.length} extractors:`, sourcesToRun)

    // Run extractors in parallel
    const extractionPromises = sourcesToRun.map(async (sourceName) => {
      const extractor = EXTRACTORS[sourceName as keyof typeof EXTRACTORS]

      if (!extractor) {
        console.warn(`[Worker] Extractor not found for: ${sourceName}`)
        return { source: sourceName, leads: [], error: 'Extractor not implemented' }
      }

      try {
        console.log(`[Worker] Running extractor: ${sourceName}`)
        const leads = await extractor.extract(params)

        // Save source records
        await Promise.all(
          leads.map((lead) =>
            prisma.leadSource.create({
              data: {
                leadId: lead.id,
                searchId: searchId,
                fonteNome: sourceName,
                fonteTipo: extractor.tipo,
                risultato: 'trovato',
                tempoEsecuzioneMs: Date.now() - startTime,
              },
            })
          )
        )

        console.log(`[Worker] ${sourceName}: Found ${leads.length} leads`)
        return { source: sourceName, leads, error: null }
      } catch (error) {
        console.error(`[Worker] Error in ${sourceName}:`, error)
        return {
          source: sourceName,
          leads: [],
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    })

    // Wait for all extractors to complete
    const results = await Promise.all(extractionPromises)

    // Aggregate all leads
    const allLeads: Lead[] = results.flatMap((r) => r.leads)

    // ===== GEOGRAPHIC FILTERS (in priority order) =====

    // 1. Filter by REGIONE (if specified) - includes all provinces in region
    let regioneFiltered = allLeads
    if (params.regione) {
      regioneFiltered = filterByRegione(allLeads, params.regione)
      console.log(
        `[Worker] Regione filter: ${allLeads.length} -> ${regioneFiltered.length} leads (regione: ${params.regione})`
      )
    }

    // 2. Filter by PROVINCIA (if specified) - overrides regione filter
    let provinciaFiltered = regioneFiltered
    if (params.provincia) {
      provinciaFiltered = filterByProvincia(regioneFiltered, params.provincia)
      console.log(
        `[Worker] Provincia filter: ${regioneFiltered.length} -> ${provinciaFiltered.length} leads (provincia: ${params.provincia})`
      )
    }

    // 3. Filter by COMUNE (if specified) - most specific filter
    let comuneFiltered = provinciaFiltered
    if (params.comune) {
      comuneFiltered = filterByComune(provinciaFiltered, params.comune)
      console.log(
        `[Worker] Comune filter: ${provinciaFiltered.length} -> ${comuneFiltered.length} leads (comune: ${params.comune})`
      )
    }

    // Filter by contact availability (prioritize mobile > fixed, exclude no contacts)
    const contactFiltered = filterAndPrioritizeContacts(comuneFiltered)

    console.log(
      `[Worker] Contact filter: ${provinciaFiltered.length} -> ${contactFiltered.length} leads (excluded no-contact)`
    )

    // Deduplicate leads by partita_iva or ragione_sociale
    let uniqueLeads = deduplicateLeads(contactFiltered)

    console.log(
      `[Worker] Total leads found: ${allLeads.length}, unique: ${uniqueLeads.length}`
    )

    // AI Enrichment - UNLIMITED MODE: Enrich ALL leads with websites
    const leadsToEnrich = uniqueLeads.filter(
      (lead) => lead.sito_web || lead.priorita === 'alta'
    )

    if (leadsToEnrich.length > 0 && process.env.XAI_API_KEY) {
      console.log(`[Worker] UNLIMITED MODE: AI enriching ${leadsToEnrich.length} leads...`)

      try {
        // Remove artificial limits - use default 10 concurrent
        const enrichedLeads = await batchEnrichLeads(leadsToEnrich)

        // Replace enriched leads in uniqueLeads array
        uniqueLeads = uniqueLeads.map((lead) => {
          const enriched = enrichedLeads.find((el) => el.id === lead.id)
          return enriched || lead
        })

        console.log('[Worker] AI enrichment completed - no limits applied')
      } catch (enrichError) {
        console.error('[Worker] AI enrichment failed:', enrichError)
        // Continue without enrichment if it fails
      }
    }

    // Save all unique leads to database
    if (uniqueLeads.length > 0) {
      try {
        await prisma.lead.createMany({
          data: uniqueLeads.map((lead) => ({
            id: lead.id,
            searchId: searchId,
            ragioneSociale: lead.ragione_sociale,
            nomeCommerciale: lead.nome_commerciale || null,
            partitaIva: lead.partita_iva || null,
            codiceFiscale: lead.codice_fiscale || null,
            formaGiuridica: lead.forma_giuridica || null,
            settore: lead.settore || null,
            categoria: lead.categoria || null,
            codiceAteco: lead.codice_ateco || null,
            indirizzo: lead.indirizzo || null,
            citta: lead.citta || null,
            cap: lead.cap || null,
            provincia: lead.provincia || null,
            regione: lead.regione || null,
            nazione: lead.nazione || null,
            telefonoPrincipale: lead.telefono_principale || null,
            telefonoCentralino: lead.telefono_centralino || null,
            telefonoMobile: lead.telefono_mobile || null,
            telefonoWhatsapp: lead.telefono_whatsapp || null,
            emailPrincipale: lead.email_principale || null,
            emailPec: lead.email_pec || null,
            sitoWeb: lead.sito_web || null,
            facebookUrl: lead.facebook_url || null,
            instagramUrl: lead.instagram_url || null,
            linkedinUrl: lead.linkedin_url || null,
            altriSocial: lead.altri_social || null,
            titolareNome: lead.titolare_nome || null,
            titolareCognome: lead.titolare_cognome || null,
            legaleRappresentante: lead.legale_rappresentante || null,
            referenti: lead.referenti as any || null,
            fatturato: lead.fatturato || null,
            dipendenti: lead.dipendenti || null,
            annoFondazione: lead.anno_fondazione || null,
            ratingCreditizio: lead.rating_creditizio || null,
            descrizione: lead.descrizione || null,
            note: lead.note || null,
            fontePrimaria: lead.fonte_primaria || null,
            fontiConsultate: lead.fonti_consultate || [],
            affidabilitaScore: lead.affidabilita_score || null,
            validazioneStatus: lead.validazione_status || null,
            dataEstrazione: lead.data_estrazione ? new Date(lead.data_estrazione) : null,
            attivo: true,
            daContattare: true,
            priorita: lead.priorita || null,
            extraData: lead.extra_data || null,
            rawDataSc: lead.raw_data_sc || null,
          })),
          skipDuplicates: true,
        })
      } catch (insertError) {
        console.error('[Worker] Error inserting leads:', insertError)
      }

      // ========== CLEANUP RAW DATA (Step 8.1: Event-Driven) ==========
      const leadsWithRawData = uniqueLeads.filter(lead => lead.raw_data_sc)

      if (leadsWithRawData.length > 0) {
        console.log(`[Worker] Cleaning up raw_data_sc for ${leadsWithRawData.length} leads...`)

        try {
          const leadIds = leadsWithRawData.map(lead => lead.id)
          await prisma.lead.updateMany({
            where: { id: { in: leadIds } },
            data: { rawDataSc: null },
          })
          console.log(`[Worker] Cleaned raw_data_sc for ${leadsWithRawData.length} leads`)
        } catch (cleanupException) {
          const error = cleanupException as Error
          console.warn(`[Worker] Exception during raw_data_sc cleanup: ${error.message}`)
        }
      }
    }

    // Count validated leads (affidabilita_score >= 70)
    const validatedCount = uniqueLeads.filter(
      (lead) => lead.affidabilita_score && lead.affidabilita_score >= 70
    ).length

    // Update search status to completed
    await prisma.leadSearch.update({
      where: { id: searchId },
      data: {
        status: 'completed',
        leadsTrovati: uniqueLeads.length,
        leadsValidati: validatedCount,
        fontiConsultate: sourcesToRun.length,
        completedAt: new Date(),
      },
    })

    const totalTime = Date.now() - startTime
    console.log(`[Worker] Extraction completed in ${totalTime}ms`)
  } catch (error) {
    console.error('[Worker] Fatal error:', error)

    // Update status to failed
    await prisma.leadSearch.update({
      where: { id: searchId },
      data: {
        status: 'failed',
        completedAt: new Date(),
      },
    })
  }
}

/**
 * Deduplicate leads based on partita_iva or ragione_sociale
 * Keep the lead with highest affidabilita_score
 */
function deduplicateLeads(leads: Lead[]): Lead[] {
  const seen = new Map<string, Lead>()

  for (const lead of leads) {
    // Create unique key based on partita_iva or ragione_sociale
    const key = lead.partita_iva
      ? `piva_${lead.partita_iva}`
      : `name_${lead.ragione_sociale.toLowerCase().trim()}`

    const existing = seen.get(key)

    if (!existing) {
      seen.set(key, lead)
    } else {
      // Keep lead with higher affidabilita_score
      const existingScore = existing.affidabilita_score || 0
      const newScore = lead.affidabilita_score || 0

      if (newScore > existingScore) {
        // Merge data from both leads
        seen.set(key, {
          ...existing,
          ...lead,
          fonti_consultate: [
            ...(existing.fonti_consultate || []),
            ...(lead.fonti_consultate || []),
          ],
        })
      }
    }
  }

  return Array.from(seen.values())
}

/**
 * Filter leads by provincia (SMART MATCH)
 * Accepts both provincia sigla (MI) and full name (Milano)
 * Normalizes input using official Italian province mapping
 */
function filterByProvincia(leads: Lead[], provincia: string): Lead[] {
  const normalizedSigla = normalizeProvincia(provincia)

  if (!normalizedSigla) {
    console.warn(`[filterByProvincia] Invalid provincia: "${provincia}"`)
    return leads
  }

  console.log(`[filterByProvincia] Filtering by provincia: "${provincia}" -> "${normalizedSigla}"`)

  const filtered = leads.filter((lead) => {
    if (!lead.provincia) return false
    const leadSigla = normalizeProvincia(lead.provincia)
    return leadSigla === normalizedSigla
  })

  console.log(
    `[filterByProvincia] Matched ${filtered.length}/${leads.length} leads for provincia "${normalizedSigla}"`
  )

  return filtered
}

/**
 * Filter and prioritize leads by contact availability
 * A lead is valid if it has AT LEAST ONE of: phone, email, website
 */
function filterAndPrioritizeContacts(leads: Lead[]): Lead[] {
  const leadsWithMobile: Lead[] = []
  const leadsWithFixedOnly: Lead[] = []
  const leadsWithEmailOrWebOnly: Lead[] = []

  for (const lead of leads) {
    const phones = [lead.telefono_principale, lead.telefono_mobile, lead.telefono_centralino].filter(Boolean)

    const mobilePhone = phones.find((p) => isMobilePhone(p))
    const fixedPhone = phones.find((p) => !isMobilePhone(p))

    if (mobilePhone) {
      leadsWithMobile.push({
        ...lead,
        telefono_principale: mobilePhone,
        telefono_mobile: mobilePhone,
        telefono_centralino: fixedPhone || lead.telefono_centralino,
      })
    } else if (fixedPhone) {
      leadsWithFixedOnly.push({
        ...lead,
        telefono_principale: fixedPhone,
        telefono_centralino: fixedPhone,
      })
    } else if (lead.email_principale || lead.sito_web) {
      // Lead valido se ha almeno email o sito web, anche senza telefono
      leadsWithEmailOrWebOnly.push(lead)
    }
    // Se non ha nessun contatto → scartato
  }

  console.log(
    `[Contact Filter] Mobile leads: ${leadsWithMobile.length}, Fixed-only: ${leadsWithFixedOnly.length}, Email/Web only: ${leadsWithEmailOrWebOnly.length}`
  )

  return [...leadsWithMobile, ...leadsWithFixedOnly, ...leadsWithEmailOrWebOnly]
}

/**
 * Check if a phone number is a mobile phone (Italian format)
 */
function isMobilePhone(phone: string | null | undefined): boolean {
  if (!phone) return false
  const cleaned = phone.replace(/\D/g, '')
  return /^(?:\+?39)?3\d{8,9}$/.test(cleaned)
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  const patterns = [
    /^\+39\s?\d{2,3}\s?\d{6,7}$/,
    /^0\d{1,3}\s?\d{6,7}$/,
    /^3\d{2}\s?\d{6,7}$/,
  ]

  const cleaned = phone.replace(/[\s\-()]/g, '')
  return patterns.some((pattern) => pattern.test(cleaned))
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(email)
}

/**
 * Calculate affidabilita score based on available data
 */
export function calculateAffidabilitaScore(lead: Partial<Lead>): number {
  let score = 0

  if (lead.partita_iva) score += 30

  const contactCount =
    (lead.telefono_principale ? 1 : 0) +
    (lead.email_principale ? 1 : 0) +
    (lead.sito_web ? 1 : 0)
  score += Math.min(contactCount * 7, 20)

  if (lead.indirizzo && lead.citta) score += 15
  if (lead.fatturato || lead.dipendenti) score += 15

  if (lead.telefono_principale && validatePhoneNumber(lead.telefono_principale)) {
    score += 10
  }

  if (lead.email_principale && validateEmail(lead.email_principale)) {
    score += 10
  }

  return Math.min(score, 100)
}

/**
 * Filter leads by regione (includes all provinces in that region)
 */
function filterByRegione(leads: Lead[], regione: string): Lead[] {
  const provinceInRegione = getProvinceByRegione(regione)

  if (provinceInRegione.length === 0) {
    console.warn(`[filterByRegione] Invalid regione: "${regione}"`)
    return leads
  }

  const sigleInRegione = new Set(provinceInRegione.map((p) => p.sigla))

  console.log(
    `[filterByRegione] Filtering by regione: "${regione}" (${sigleInRegione.size} province: ${Array.from(sigleInRegione).join(', ')})`
  )

  const filtered = leads.filter((lead) => {
    if (!lead.provincia) return false
    const leadSigla = normalizeProvincia(lead.provincia)
    return leadSigla && sigleInRegione.has(leadSigla)
  })

  console.log(
    `[filterByRegione] Matched ${filtered.length}/${leads.length} leads in regione "${regione}"`
  )

  return filtered
}

/**
 * Filter leads by comune (fuzzy matching)
 */
function filterByComune(leads: Lead[], comune: string): Lead[] {
  if (!comune || comune.length < 2) {
    console.warn(`[filterByComune] Comune too short: "${comune}"`)
    return leads
  }

  console.log(`[filterByComune] Filtering by comune: "${comune}"`)

  const filtered = leads.filter((lead) => {
    if (!lead.citta) return false
    return matchComune(lead.citta, comune)
  })

  console.log(
    `[filterByComune] Matched ${filtered.length}/${leads.length} leads for comune "${comune}"`
  )

  return filtered
}
