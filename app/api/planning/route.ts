/**
 * Planning API Route
 * Handles financial plan creation and retrieval
 */

import { NextRequest, NextResponse } from 'next/server'
import { planningRequestSchema } from '@/lib/validations/client'
import {
  runFinancialWorkflow,
  getFinancialPlanByClientId,
} from '@/lib/ai/financial-planner'
import type {
  PlanningSuccessResponse,
  PlanningGetResponse,
  ErrorResponse,
} from '@/lib/types'

/**
 * POST /api/planning
 * Create financial plan for a client
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate input
    const validationResult = planningRequestSchema.safeParse(body)

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((err) => err.message)
        .join(', ')

      return NextResponse.json<ErrorResponse>(
        { error: errorMessage },
        { status: 400 }
      )
    }

    const { clientId } = validationResult.data

    // NOTE: This endpoint uses the legacy financial planner which reads from the legacy OSINT profile.
    // Future: migrate to use prisma.osintProfile (new system) when financial-planner is updated.
    console.warn('[API] /api/planning: using legacy financial workflow. Ensure OSINT profile exists via /api/osint/profile for best results.')

    // Run financial planning workflow
    const result = await runFinancialWorkflow(clientId)

    // Return success response
    const response: PlanningSuccessResponse = {
      success: true,
      planId: result.planId,
      plan: result.plan,
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('[API] Planning POST error:', error)

    // Handle specific error types
    let errorMessage = 'Failed to create financial plan'
    let statusCode = 500

    if (error instanceof Error) {
      errorMessage = error.message

      // Profile not found error
      if (errorMessage.includes('OSINT profile not found')) {
        return NextResponse.json<ErrorResponse>(
          {
            error:
              'OSINT profile not found. Please create a profile first.',
          },
          { status: 404 }
        )
      }

      // XAI API errors
      if (errorMessage.includes('AI planning failed')) {
        statusCode = 503 // Service unavailable
      }

      // Database errors
      if (errorMessage.includes('database')) {
        statusCode = 500
      }

      // Validation errors
      if (
        errorMessage.includes('validation') ||
        errorMessage.includes('Invalid')
      ) {
        statusCode = 400
      }
    }

    return NextResponse.json<ErrorResponse>(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}

/**
 * GET /api/planning?clientId={uuid}
 * Retrieve existing financial plan
 */
export async function GET(request: NextRequest) {
  try {
    // Get clientId from query params
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json<ErrorResponse>(
        { error: 'clientId is required' },
        { status: 400 }
      )
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(clientId)) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid clientId format' },
        { status: 400 }
      )
    }

    // Get financial plan
    const plan = await getFinancialPlanByClientId(clientId)

    if (!plan) {
      return NextResponse.json<ErrorResponse>(
        {
          error:
            'Financial plan not found. Please create a plan first.',
        },
        { status: 404 }
      )
    }

    // Return success response
    const response: PlanningGetResponse = {
      success: true,
      plan,
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('[API] Planning GET error:', error)

    let errorMessage = 'Failed to retrieve financial plan'

    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json<ErrorResponse>(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

