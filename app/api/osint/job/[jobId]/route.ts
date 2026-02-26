/**
 * OSINT Job Status API
 * GET /api/osint/job/[jobId]
 */

import { NextRequest, NextResponse } from 'next/server'
import { JobQueue } from '@/lib/osint/job-queue'
import { rateLimiter, RATE_LIMITS, getClientIdentifier } from '@/lib/osint/rate-limiter'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Rate limiting check
    const clientId = getClientIdentifier(request)
    const { maxRequests, windowMs } = RATE_LIMITS.JOB_STATUS
    const rateLimit = rateLimiter.check(clientId, maxRequests, windowMs)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Riprova tra qualche secondo.' },
        { status: 429 }
      )
    }

    const { jobId } = await params

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID è obbligatorio' },
        { status: 400 }
      )
    }

    const job = await JobQueue.getJob(jobId)

    if (!job) {
      return NextResponse.json(
        { error: 'Job non trovato' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      job: {
        job_id: job.jobId,
        status: job.status,
        progress: job.progress,
        current_phase: job.currentPhase,
        result: job.result,
        error: job.error,
        created_at: job.createdAt,
        started_at: job.startedAt,
        completed_at: job.completedAt,
      },
    })

  } catch (error) {
    console.error('[API] Error fetching job status:', error)
    return NextResponse.json(
      {
        error: 'Errore durante il recupero dello stato del job',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
