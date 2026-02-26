/**
 * API Route: Token Monitoring
 * Serves AI token usage data for the client-side monitoring page
 */

import { NextResponse } from 'next/server'
import { getCurrentMonthSummary, getTokenUsageStats } from '@/lib/ai/token-tracker'
import { getServerUser } from '@/lib/auth/server'

export async function GET() {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Accesso non autorizzato' }, { status: 403 })
  }

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
