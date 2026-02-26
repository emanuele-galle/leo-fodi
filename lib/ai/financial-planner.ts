/**
 * Financial Planner Agent
 * Handles financial plan creation and database operations
 */

import type { FinancialPlan, OSINTProfile, ObiettiviFinanziari, AnalisiGap, SequenzaItem, SpuntiFiscali, RaccomandazioneProdottoFinanziario, SintesiValore, TriggerVita, PrioritaContatto } from '@/lib/types'
import { prisma } from '@/lib/db'
import {
  callAI,
  parseJSONResponse,
  createMessages,
  AIError,
} from './ai-client'
import {
  FINANCIAL_SYSTEM_PROMPT,
  generateFinancialUserPrompt,
} from '@/lib/prompts/financial-agent'
import { getOSINTProfile } from './osint-profiler'
import { trackTokenUsage } from './token-tracker'

/**
 * Generate financial plan using AI
 */
export async function generateFinancialPlan(
  profile: OSINTProfile,
  profileId?: string,
  clientId?: string
): Promise<FinancialPlan> {
  const startTime = Date.now()

  try {
    console.log('[FINANCIAL] Generating plan for:', profile.identita_presenza_online.nome_completo)

    const systemPrompt = FINANCIAL_SYSTEM_PROMPT
    const userPrompt = generateFinancialUserPrompt(profile)
    const messages = createMessages(systemPrompt, userPrompt)

    const response = await callAI(messages, {
      temperature: 0.7,
      maxTokens: 8192,
      responseFormat: 'json_object',
    })

    const plan = parseJSONResponse<FinancialPlan>(response)
    console.log('[FINANCIAL] Plan generated successfully')
    validateFinancialPlan(plan)

    const executionTime = Date.now() - startTime
    await trackTokenUsage({
      section: 'financial_planning',
      operation: 'plan_generation',
      provider: 'openrouter',
      model: response.model || 'anthropic/claude-sonnet-4',
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
      clientId,
      profileId,
      requestParams: {
        temperature: 0.7,
        max_tokens: 8192,
        client_name: profile.identita_presenza_online.nome_completo,
      },
      responseSummary: {
        sections_generated: Object.keys(plan).length,
        products_recommended: plan.raccomandazioni_prodotti?.length || 0,
        sequenza_items: plan.sequenza_raccomandata?.length || 0,
      },
      executionTimeMs: executionTime,
      status: 'success',
    })

    return plan
  } catch (error) {
    const executionTime = Date.now() - startTime
    await trackTokenUsage({
      section: 'financial_planning',
      operation: 'plan_generation',
      provider: 'openrouter',
      model: 'anthropic/claude-sonnet-4',
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      clientId,
      profileId,
      executionTimeMs: executionTime,
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    if (error instanceof AIError) {
      console.error('[FINANCIAL] AI API error:', error.message)
      throw new Error(`AI planning failed: ${error.message}`)
    }

    console.error('[FINANCIAL] Failed to generate plan:', error)
    throw new Error('Failed to create financial plan')
  }
}

function validateFinancialPlan(plan: unknown): asserts plan is FinancialPlan {
  const requiredSections = [
    'obiettivi_finanziari',
    'analisi_gap',
    'sequenza_raccomandata',
    'spunti_fiscali',
    'raccomandazioni_prodotti',
    'sintesi_valore',
  ]

  for (const section of requiredSections) {
    if (!(section in (plan as Record<string, unknown>))) {
      throw new Error(`Missing required section: ${section}`)
    }
  }

  const typedPlan = plan as FinancialPlan

  if (!typedPlan.obiettivi_finanziari?.breve_termine) {
    throw new Error('Missing breve_termine in obiettivi_finanziari')
  }

  if (!Array.isArray(typedPlan.sequenza_raccomandata)) {
    throw new Error('sequenza_raccomandata must be an array')
  }

  if (!Array.isArray(typedPlan.raccomandazioni_prodotti)) {
    throw new Error('raccomandazioni_prodotti must be an array')
  }

  console.log('[FINANCIAL] Plan structure validated')
}

/**
 * Save financial plan to database
 */
export async function saveFinancialPlan(
  profileId: string,
  plan: FinancialPlan,
  userId?: string
): Promise<string> {
  try {
    const sintesiValoreExtended = {
      ...plan.sintesi_valore,
      ...(plan.trigger_vita && { trigger_vita: plan.trigger_vita }),
      ...(plan.priorita_contatto && { priorita_contatto: plan.priorita_contatto }),
    }

    const savedPlan = await prisma.financialPlan.create({
      data: {
        profileId,
        userId: userId || null,
        obiettiviFinanziari: plan.obiettivi_finanziari as any,
        analisiGap: plan.analisi_gap as any,
        sequenzaRaccomandata: plan.sequenza_raccomandata as any,
        spuntiFiscali: plan.spunti_fiscali as any,
        raccomandazioniProdotti: plan.raccomandazioni_prodotti as any,
        sintesiValore: sintesiValoreExtended as any,
      },
    })

    console.log(`[FINANCIAL] Plan saved: ${savedPlan.id}`)
    return savedPlan.id
  } catch (error) {
    console.error('[FINANCIAL] Failed to save plan:', error)
    throw new Error('Failed to save financial plan to database')
  }
}

/**
 * Get existing financial plan from database
 */
export async function getFinancialPlan(
  profileId: string
): Promise<FinancialPlan | null> {
  try {
    const planRow = await prisma.financialPlan.findUnique({
      where: { profileId },
    })

    if (!planRow) return null

    const sintesiRaw = planRow.sintesiValore as Record<string, unknown>
    const { trigger_vita, priorita_contatto, ...sintesiCore } = sintesiRaw

    const plan: FinancialPlan = {
      obiettivi_finanziari: planRow.obiettiviFinanziari as unknown as ObiettiviFinanziari,
      analisi_gap: planRow.analisiGap as unknown as AnalisiGap,
      sequenza_raccomandata: planRow.sequenzaRaccomandata as unknown as SequenzaItem[],
      spunti_fiscali: planRow.spuntiFiscali as unknown as SpuntiFiscali,
      raccomandazioni_prodotti: planRow.raccomandazioniProdotti as unknown as RaccomandazioneProdottoFinanziario[],
      sintesi_valore: sintesiCore as unknown as SintesiValore,
      ...(trigger_vita && { trigger_vita: trigger_vita as unknown as TriggerVita[] }),
      ...(priorita_contatto && { priorita_contatto: priorita_contatto as unknown as PrioritaContatto }),
    }

    return plan
  } catch (error) {
    console.error('[FINANCIAL] Failed to get plan:', error)
    throw new Error('Failed to retrieve financial plan from database')
  }
}

/**
 * Get financial plan by client ID
 */
export async function getFinancialPlanByClientId(
  clientId: string
): Promise<FinancialPlan | null> {
  try {
    const profileRow = await prisma.profile.findUnique({
      where: { clientId },
    })

    if (!profileRow) return null

    return await getFinancialPlan(profileRow.id)
  } catch (error) {
    console.error('[FINANCIAL] Failed to get plan by client ID:', error)
    throw new Error('Failed to retrieve financial plan')
  }
}

/**
 * Update existing financial plan
 */
export async function updateFinancialPlan(
  profileId: string,
  plan: FinancialPlan
): Promise<void> {
  try {
    const sintesiValoreExtended = {
      ...plan.sintesi_valore,
      ...(plan.trigger_vita && { trigger_vita: plan.trigger_vita }),
      ...(plan.priorita_contatto && { priorita_contatto: plan.priorita_contatto }),
    }

    await prisma.financialPlan.update({
      where: { profileId },
      data: {
        obiettiviFinanziari: plan.obiettivi_finanziari as any,
        analisiGap: plan.analisi_gap as any,
        sequenzaRaccomandata: plan.sequenza_raccomandata as any,
        spuntiFiscali: plan.spunti_fiscali as any,
        raccomandazioniProdotti: plan.raccomandazioni_prodotti as any,
        sintesiValore: sintesiValoreExtended as any,
      },
    })

    console.log(`[FINANCIAL] Plan updated for profile: ${profileId}`)
  } catch (error) {
    console.error('[FINANCIAL] Failed to update plan:', error)
    throw new Error('Failed to update financial plan in database')
  }
}

/**
 * Complete financial planning workflow
 */
export async function runFinancialWorkflow(clientId: string): Promise<{
  planId: string
  plan: FinancialPlan
}> {
  try {
    console.log('[FINANCIAL] Retrieving OSINT profile...')
    const profile = await getOSINTProfile(clientId)

    if (!profile) {
      throw new Error('OSINT profile not found. Please create a profile first.')
    }

    const profileRow = await prisma.profile.findUnique({
      where: { clientId },
    })

    if (!profileRow) {
      throw new Error('Profile record not found in database')
    }

    const existingPlan = await getFinancialPlan(profileRow.id)

    if (existingPlan) {
      console.log('[FINANCIAL] Plan already exists, returning existing plan')
      return { planId: profileRow.id, plan: existingPlan }
    }

    const plan = await generateFinancialPlan(profile, profileRow.id, clientId)
    const planId = await saveFinancialPlan(profileRow.id, plan)

    return { planId, plan }
  } catch (error) {
    console.error('[FINANCIAL] Workflow failed:', error)
    throw error
  }
}

/**
 * Regenerate financial plan (replace existing)
 */
export async function regenerateFinancialPlan(clientId: string): Promise<{
  planId: string
  plan: FinancialPlan
}> {
  try {
    const profile = await getOSINTProfile(clientId)
    if (!profile) throw new Error('OSINT profile not found')

    const profileRow = await prisma.profile.findUnique({
      where: { clientId },
    })
    if (!profileRow) throw new Error('Profile record not found')

    const plan = await generateFinancialPlan(profile, profileRow.id, clientId)

    const existingPlan = await getFinancialPlan(profileRow.id)

    if (existingPlan) {
      await updateFinancialPlan(profileRow.id, plan)
      console.log('[FINANCIAL] Plan regenerated and updated')
    } else {
      await saveFinancialPlan(profileRow.id, plan)
      console.log('[FINANCIAL] New plan created')
    }

    return { planId: profileRow.id, plan }
  } catch (error) {
    console.error('[FINANCIAL] Regeneration failed:', error)
    throw error
  }
}
