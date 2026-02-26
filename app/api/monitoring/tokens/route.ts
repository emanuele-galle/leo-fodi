/**
 * API Route: Token Monitoring
 * Serves AI token usage data for the client-side monitoring page
 */

import { NextResponse } from 'next/server'
import { getCurrentMonthSummary, getTokenUsageStats } from '@/lib/ai/token-tracker'

export async function GET() {
  try {
    const monthSummary = await getCurrentMonthSummary()

    return NextResponse.json({
      success: true,
      data: monthSummary || [],
    })
  } catch (error) {
    console.error('[TokenMonitoringAPI] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get token stats' },
      { status: 500 }
    )
  }
}
