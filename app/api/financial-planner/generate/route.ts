/**
 * Financial Planner Generate API Route
 * Alias for /api/planning - redirects to existing planning endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { runFinancialWorkflow } from '@/lib/ai/financial-planner'
import { getServerUser } from '@/lib/auth/server'
import type { ErrorResponse } from '@/lib/types'

/**
 * POST /api/financial-planner/generate
 * Create financial plan for a client
 */
export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { clientId } = body

    if (!clientId) {
      return NextResponse.json<ErrorResponse>(
        { error: 'clientId is required' },
        { status: 400 }
      )
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(clientId)) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid clientId format. Must be a valid UUID.' },
        { status: 400 }
      )
    }

    // Run financial planning workflow
    const result = await runFinancialWorkflow(clientId)

    return NextResponse.json(
      {
        success: true,
        planId: result.planId,
        plan: result.plan,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API] Financial planner generate error:', error)

    let errorMessage = 'Failed to create financial plan'
    let statusCode = 500

    if (error instanceof Error) {
      errorMessage = error.message

      // Profile not found error
      if (errorMessage.includes('OSINT profile not found') || errorMessage.includes('Profile record not found')) {
        return NextResponse.json<ErrorResponse>(
          {
            error: 'Profilo OSINT non trovato. Il Financial Planner richiede un profilo OSINT completo del cliente. Per favore, crea prima un profilo OSINT usando l\'OSINT Profiler (menu principale → OSINT Profiler).',
          },
          { status: 404 }
        )
      }

      // XAI API errors
      if (errorMessage.includes('AI planning failed') || errorMessage.includes('XAI_API_KEY')) {
        statusCode = 503 // Service unavailable
      }

      // Database errors
      if (errorMessage.includes('database') || errorMessage.includes('Database')) {
        statusCode = 500
      }

      // Validation errors
      if (errorMessage.includes('validation') || errorMessage.includes('Invalid')) {
        statusCode = 400
      }
    }

    return NextResponse.json<ErrorResponse>(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}
