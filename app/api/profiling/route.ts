/**
 * Profiling API Route
 * Handles OSINT profile creation and retrieval
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'
import { clientFormSchema } from '@/lib/validations/client'
import { runOSINTWorkflow, getClient, getOSINTProfile } from '@/lib/ai/osint-profiler'
import type { ProfilingSuccessResponse, ProfilingGetResponse, ErrorResponse } from '@/lib/types'

/**
 * POST /api/profiling
 * Create new client and generate OSINT profile
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Unauthorized - user not authenticated' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate input
    const validationResult = clientFormSchema.safeParse(body)

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((err) => err.message)
        .join(', ')

      return NextResponse.json<ErrorResponse>(
        { error: errorMessage },
        { status: 400 }
      )
    }

    const clientData = validationResult.data

    // Run OSINT workflow with authenticated user's ID
    // DEPRECATED: This endpoint uses the legacy OSINT profiler. Use /api/osint/profile instead.
    console.warn('[API] /api/profiling is deprecated. Use /api/osint/profile for the new multi-agent OSINT system.')
    console.log(`[API] Creating profile for user: ${userId}`)
    const result = await runOSINTWorkflow(clientData, userId)

    // Return success response
    const response: ProfilingSuccessResponse = {
      success: true,
      clientId: result.clientId,
      profileId: result.profileId,
      profile: result.profile,
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Deprecation': 'true',
        'Link': '</api/osint/profile>; rel="successor-version"',
        'X-Deprecated-By': '/api/osint/profile',
      },
    })

  } catch (error) {
    console.error('[API] Profiling POST error:', error)

    // Handle specific error types
    let errorMessage = 'Failed to analyze client profile'
    let statusCode = 500

    if (error instanceof Error) {
      errorMessage = error.message

      // XAI API errors
      if (errorMessage.includes('AI analysis failed')) {
        statusCode = 503 // Service unavailable
      }

      // Database errors
      if (errorMessage.includes('database')) {
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

/**
 * GET /api/profiling?clientId={uuid}
 * Retrieve existing OSINT profile
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
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(clientId)) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid clientId format' },
        { status: 400 }
      )
    }

    // Get client
    const client = await getClient(clientId)

    if (!client) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Get profile
    const profile = await getOSINTProfile(clientId)

    if (!profile) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Profile not found for this client' },
        { status: 404 }
      )
    }

    // Return success response
    const response: ProfilingGetResponse = {
      success: true,
      client: {
        id: client.id,
        nome: client.nome,
        cognome: client.cognome,
        localita: client.localita,
        ruolo: client.ruolo,
        settore: client.settore,
        link_social: client.linkSocial,
        sito_web: client.sitoWeb,
        created_at: client.createdAt,
        updated_at: client.updatedAt,
      },
      profile,
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('[API] Profiling GET error:', error)

    let errorMessage = 'Failed to retrieve profile'

    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json<ErrorResponse>(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/profiling
 * CORS preflight handler
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}
