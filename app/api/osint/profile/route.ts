/**
 * OSINT Multi-Agent Profiling API
 * POST /api/osint/profile - Create async profiling job
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { OSINTOrchestrator } from '@/lib/osint/orchestrator'
import { JobQueue } from '@/lib/osint/job-queue'
import { rateLimiter, RATE_LIMITS, getClientIdentifier } from '@/lib/osint/rate-limiter'
import { prisma } from '@/lib/db'
import { getServerSession } from '@/lib/auth/server'
import { getBoss, QUEUES } from '@/lib/queue/boss'
import type { ProfilingTarget } from '@/lib/osint/types'

const osintProfileSchema = z.object({
  nome: z.string().min(2),
  cognome: z.string().min(2),
  email: z.string().email().optional(),
  data_nascita: z.string().optional(),
  citta: z.string().optional(),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  facebook_url: z.string().url().optional().or(z.literal('')),
  instagram_url: z.string().url().optional().or(z.literal('')),
  consenso_profilazione: z.boolean(),
  data_consenso: z.string().min(1),
  note: z.string().optional(),
  id: z.string().optional(),
  sync: z.boolean().optional(),
})

/**
 * POST /api/osint/profile
 * Creates a new profiling job and starts async processing
 * Returns job_id immediately for polling
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession()
    const userId = session?.user?.id

    // Rate limiting check (disabled in development)
    const isDevelopment = process.env.NODE_ENV === 'development'

    if (!isDevelopment) {
      const clientId = getClientIdentifier(request)
      const { maxRequests, windowMs } = RATE_LIMITS.OSINT_PROFILING
      const rateLimit = await rateLimiter.check(clientId, maxRequests, windowMs)

      if (!rateLimit.allowed) {
        const resetDate = new Date(rateLimit.resetAt).toISOString()
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: `Hai raggiunto il limite di ${maxRequests} richieste per ora. Riprova dopo ${resetDate}`,
            resetAt: resetDate,
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Remaining': rateLimit.remaining.toString(),
              'X-RateLimit-Reset': resetDate,
              'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
            },
          }
        )
      }
    }

    const rawBody = await request.json()

    // Zod validation
    const parsed = osintProfileSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input non valido', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const body = parsed.data

    // Check if this is a synchronous request (legacy support)
    const isSync = body.sync === true

    // Costruisci target
    const target: ProfilingTarget = {
      id: body.id || `target_${Date.now()}`,
      nome: body.nome,
      cognome: body.cognome,
      data_nascita: body.data_nascita,
      citta: body.citta,
      linkedin_url: body.linkedin_url,
      facebook_url: body.facebook_url,
      instagram_url: body.instagram_url,
      consenso_profilazione: body.consenso_profilazione,
      data_consenso: body.data_consenso,
      note: body.note,
    }

    // If sync mode (legacy), execute immediately
    if (isSync) {
      console.log(`[API] Starting SYNC OSINT profiling for: ${target.nome} ${target.cognome}`)
      const orchestrator = new OSINTOrchestrator()
      const profile = await orchestrator.profileTarget(target)

      // Save to database
      await saveProfileToDatabase(profile, userId)

      console.log(`[API] ✅ Sync profiling completed successfully`)
      return NextResponse.json({
        success: true,
        profile,
        message: 'Profiling OSINT completato con successo',
      })
    }

    // ASYNC MODE (default): Create job and process in background
    console.log(`[API] Creating ASYNC profiling job for: ${target.nome} ${target.cognome}`)

    // Create job in database
    const jobId = await JobQueue.createJob(target)

    // Enqueue job via pg-boss for durable background processing
    try {
      const boss = await getBoss()
      await boss.send(QUEUES.OSINT_JOB, { jobId, targetData: target, userId: userId || null }, { retryLimit: 2, retryDelay: 30 })
      console.log(`[API] Job enqueued to pg-boss queue: ${QUEUES.OSINT_JOB}`)
    } catch (queueError) {
      console.warn(`[API] pg-boss unavailable, falling back to in-process background:`, queueError)
      // Fallback: run in-process if pg-boss fails (e.g. DB schema not migrated yet)
      processJobInBackground(jobId, target, userId).catch(async (error) => {
        console.error(`[WORKER] Job ${jobId} failed:`, error)
        try {
          await JobQueue.failJob(jobId, error instanceof Error ? error.message : 'Unknown error')
        } catch (updateError) {
          console.error(`[WORKER] Failed to update job ${jobId} status:`, updateError)
        }
      })
    }

    console.log(`[API] ✅ Job created with ID: ${jobId}`)

    return NextResponse.json({
      success: true,
      job_id: jobId,
      message: 'Job di profiling creato. Usa il job_id per monitorare lo stato.',
    })

  } catch (error) {
    console.error('[API] OSINT profiling error:', error)
    return NextResponse.json(
      {
        error: 'Errore durante il profiling OSINT',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * Background job processor
 */
async function processJobInBackground(jobId: string, target: ProfilingTarget, userId?: string) {
  try {
    console.log(`[WORKER] Starting job ${jobId}`)
    await JobQueue.startJob(jobId)

    const orchestrator = new OSINTOrchestrator()

    // Hook into orchestrator to update progress
    const profile = await orchestrator.profileTarget(target)

    // Save profile to database
    await saveProfileToDatabase(profile, userId)

    // Mark job as completed
    await JobQueue.completeJob(jobId, profile)
    console.log(`[WORKER] ✅ Job ${jobId} completed successfully`)

  } catch (error) {
    console.error(`[WORKER] ❌ Job ${jobId} failed:`, error)
    await JobQueue.failJob(
      jobId,
      error instanceof Error ? error.message : String(error)
    )
  }
}

/**
 * Save profile to osint_profiles table using upsert to prevent race conditions
 */
async function saveProfileToDatabase(profile: any, userId?: string) {
  try {
    const profilePayload = {
      nome: profile.target.nome,
      cognome: profile.target.cognome,
      profileData: profile,
      punteggioComplessivo: profile.punteggio_complessivo,
      completezzaProfilo: profile.completezza_profilo,
      agentUtilizzati: profile.agent_utilizzati || [],
      consensoProfilazione: profile.target.consenso_profilazione,
      dataConsenso: profile.target.data_consenso ? new Date(profile.target.data_consenso) : null,
      userId: userId || null,
    }

    await prisma.osintProfile.upsert({
      where: { targetId: profile.target.id },
      update: profilePayload,
      create: { ...profilePayload, targetId: profile.target.id },
    })
  } catch (error) {
    console.error('[DB] Failed to save profile:', error)
    throw error
  }
}

/**
 * GET /api/osint/profile - Get orchestration plan
 */
export async function GET(request: NextRequest) {
  try {
    const orchestrator = new OSINTOrchestrator()
    const plan = orchestrator.generateOrchestrationPlan()

    return NextResponse.json({
      success: true,
      plan,
      message: 'Piano di orchestrazione OSINT',
    })

  } catch (error) {
    console.error('[API] Error generating plan:', error)
    return NextResponse.json(
      { error: 'Errore generazione piano' },
      { status: 500 }
    )
  }
}
