/**
 * Search Leads API Endpoint
 * GET /api/leads/searches/[id]/leads - Get all leads for a specific search
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: searchId } = await params

    // Fetch all leads for this search
    const leads = await prisma.lead.findMany({
      where: { searchId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      leads: leads || [],
      total: leads?.length || 0,
    })

  } catch (error) {
    console.error('[API] Search leads error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
