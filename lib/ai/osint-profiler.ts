/**
 * OSINT Profiler Agent
 * Handles OSINT profile creation and database operations
 */

import type { ClientFormData, OSINTProfile } from '@/lib/types'
import { prisma } from '@/lib/db'
import {
  callAI,
  parseJSONResponse,
  createMessages,
  AIError,
} from './ai-client'
import {
  OSINT_SYSTEM_PROMPT,
  generateOSINTUserPrompt,
} from '@/lib/prompts/osint-agent'
import { trackTokenUsage } from './token-tracker'

/**
 * Create client record in database
 */
export async function createClient(
  clientData: ClientFormData,
  userId?: string
) {
  try {
    const client = await prisma.client.create({
      data: {
        nome: clientData.nome,
        cognome: clientData.cognome,
        localita: clientData.localita || null,
        ruolo: clientData.ruolo || null,
        settore: clientData.settore || null,
        linkSocial: clientData.link_social || [],
        sitoWeb: clientData.sito_web || null,
        userId: userId || null,
      },
    })

    console.log(`[OSINT] Client created: ${client.id} (user_id: ${userId || 'NULL'})`)
    return client
  } catch (error) {
    console.error('[OSINT] Failed to create client:', error)
    throw new Error('Failed to create client in database')
  }
}

/**
 * Generate OSINT profile using AI
 */
export async function generateOSINTProfile(
  clientData: ClientFormData,
  clientId?: string
): Promise<OSINTProfile> {
  const startTime = Date.now()

  try {
    console.log('[OSINT] Generating profile for:', clientData.nome, clientData.cognome)

    const systemPrompt = OSINT_SYSTEM_PROMPT
    const userPrompt = generateOSINTUserPrompt(clientData)
    const messages = createMessages(systemPrompt, userPrompt)

    const response = await callAI(messages, {
      temperature: 0.7,
      maxTokens: 4096,
      responseFormat: 'json_object',
    })

    const profile = parseJSONResponse<OSINTProfile>(response)

    console.log('[OSINT] Profile generated successfully')
    validateOSINTProfile(profile)

    const executionTime = Date.now() - startTime
    await trackTokenUsage({
      section: 'osint_profiling',
      operation: 'profile_generation',
      provider: 'openrouter',
      model: response.model || 'anthropic/claude-sonnet-4',
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
      clientId: clientId,
      requestParams: {
        temperature: 0.7,
        max_tokens: 4096,
        client_name: `${clientData.nome} ${clientData.cognome}`,
      },
      responseSummary: {
        sections_generated: Object.keys(profile).length,
        has_recommendations: Array.isArray(profile.raccomandazioni_prodotti),
      },
      executionTimeMs: executionTime,
      status: 'success',
    })

    return profile
  } catch (error) {
    const executionTime = Date.now() - startTime
    await trackTokenUsage({
      section: 'osint_profiling',
      operation: 'profile_generation',
      provider: 'openrouter',
      model: 'anthropic/claude-sonnet-4',
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      clientId: clientId,
      executionTimeMs: executionTime,
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    if (error instanceof AIError) {
      console.error('[OSINT] AI API error:', error.message)
      throw new Error(`AI analysis failed: ${error.message}`)
    }

    console.error('[OSINT] Failed to generate profile:', error)
    throw new Error('Failed to analyze client profile')
  }
}

/**
 * Validate OSINT profile structure
 */
function validateOSINTProfile(profile: unknown): asserts profile is OSINTProfile {
  const requiredSections = [
    'identita_presenza_online',
    'presenza_digitale',
    'segnali_autorita',
    'modello_lavorativo',
    'visione_obiettivi',
    'stile_vita',
    'mappatura_bisogni',
    'leve_ingaggio',
    'raccomandazioni_prodotti',
    'piano_contatto',
  ]

  for (const section of requiredSections) {
    if (!(section in (profile as Record<string, unknown>))) {
      throw new Error(`Missing required section: ${section}`)
    }
  }

  const typedProfile = profile as OSINTProfile

  if (!typedProfile.identita_presenza_online?.nome_completo) {
    throw new Error('Missing nome_completo in identita_presenza_online')
  }

  if (!Array.isArray(typedProfile.raccomandazioni_prodotti)) {
    throw new Error('raccomandazioni_prodotti must be an array')
  }

  console.log('[OSINT] Profile structure validated')
}

/**
 * Save OSINT profile to database
 */
export async function saveOSINTProfile(
  clientId: string,
  profile: OSINTProfile,
  userId?: string
): Promise<string> {
  try {
    const savedProfile = await prisma.profile.create({
      data: {
        clientId,
        userId: userId || null,
        identitaPresenzaOnline: profile.identita_presenza_online as any,
        presenzaDigitale: profile.presenza_digitale as any,
        segnaliAutorita: profile.segnali_autorita as any,
        modelloLavorativo: profile.modello_lavorativo as any,
        visioneObiettivi: profile.visione_obiettivi as any,
        stileVita: profile.stile_vita as any,
        mappaturaBisogni: profile.mappatura_bisogni as any,
        leveIngaggio: profile.leve_ingaggio as any,
        raccomandazioniProdotti: profile.raccomandazioni_prodotti as any,
        pianoContatto: profile.piano_contatto as any,
      },
    })

    console.log(`[OSINT] Profile saved: ${savedProfile.id} (user_id: ${userId || 'NULL'})`)
    return savedProfile.id
  } catch (error) {
    console.error('[OSINT] Failed to save profile:', error)
    throw new Error('Failed to save profile to database')
  }
}

/**
 * Get existing OSINT profile from database
 * Remaps camelCase DB fields to snake_case OSINTProfile interface
 */
export async function getOSINTProfile(
  clientId: string
): Promise<OSINTProfile | null> {
  try {
    const profileRow = await prisma.profile.findUnique({
      where: { clientId },
    })

    if (!profileRow) return null

    // Remap camelCase DB fields to snake_case OSINTProfile interface
    const mapped: OSINTProfile = {
      identita_presenza_online: (profileRow as any).identitaPresenzaOnline as any,
      presenza_digitale: (profileRow as any).presenzaDigitale as any,
      segnali_autorita: (profileRow as any).segnaliAutorita as any,
      modello_lavorativo: (profileRow as any).modelloLavorativo as any,
      visione_obiettivi: (profileRow as any).visioneObiettivi as any,
      stile_vita: (profileRow as any).stileVita as any,
      mappatura_bisogni: (profileRow as any).mappaturaBisogni as any,
      leve_ingaggio: (profileRow as any).leveIngaggio as any,
      raccomandazioni_prodotti: (profileRow as any).raccomandazioniProdotti as any,
      piano_contatto: (profileRow as any).pianoContatto as any,
    }

    return mapped
  } catch (error) {
    console.error('[OSINT] Failed to get profile:', error)
    throw new Error('Failed to retrieve profile from database')
  }
}

/**
 * Update existing OSINT profile
 */
export async function updateOSINTProfile(
  clientId: string,
  profile: OSINTProfile
): Promise<void> {
  try {
    await prisma.profile.update({
      where: { clientId },
      data: {
        identitaPresenzaOnline: profile.identita_presenza_online as any,
        presenzaDigitale: profile.presenza_digitale as any,
        segnaliAutorita: profile.segnali_autorita as any,
        modelloLavorativo: profile.modello_lavorativo as any,
        visioneObiettivi: profile.visione_obiettivi as any,
        stileVita: profile.stile_vita as any,
        mappaturaBisogni: profile.mappatura_bisogni as any,
        leveIngaggio: profile.leve_ingaggio as any,
        raccomandazioniProdotti: profile.raccomandazioni_prodotti as any,
        pianoContatto: profile.piano_contatto as any,
      },
    })

    console.log(`[OSINT] Profile updated for client: ${clientId}`)
  } catch (error) {
    console.error('[OSINT] Failed to update profile:', error)
    throw new Error('Failed to update profile in database')
  }
}

/**
 * Get client by ID
 */
export async function getClient(clientId: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })
    return client
  } catch (error) {
    console.error('[OSINT] Failed to get client:', error)
    throw new Error('Failed to retrieve client from database')
  }
}

/**
 * Complete OSINT workflow: create client + generate profile + save
 */
export async function runOSINTWorkflow(
  clientData: ClientFormData,
  userId?: string
): Promise<{
  clientId: string
  profileId: string
  profile: OSINTProfile
}> {
  try {
    const client = await createClient(clientData, userId)
    const profile = await generateOSINTProfile(clientData, client.id)
    const profileId = await saveOSINTProfile(client.id, profile, userId)

    return { clientId: client.id, profileId, profile }
  } catch (error) {
    console.error('[OSINT] Workflow failed:', error)
    throw error
  }
}
