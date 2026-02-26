/**
 * Lead Contact Status API Endpoint
 * GET /api/leads/contact-status - Get contact status for leads
 * POST /api/leads/contact-status - Set/update contact status for a lead
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from '@/lib/auth/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const leadIds = searchParams.get('leadIds')?.split(',') // Comma-separated lead IDs

    if (!leadIds || leadIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one lead ID is required' },
        { status: 400 }
      )
    }

    // Fetch contact status for all requested leads
    const statuses = await prisma.leadContactStatus.findMany({
      where: { leadId: { in: leadIds } },
    })

    // Get unique user IDs
    const userIds = [...new Set(statuses.map(s => s.userId))]

    // Fetch user profiles separately
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    })

    // Create user map for quick lookup
    const userMap = new Map(users.map(u => [u.id, u]))

    // Transform to a map for easy lookup
    const statusMap: Record<string, any> = {}
    statuses.forEach((status) => {
      const userProfile = userMap.get(status.userId)
      statusMap[status.leadId] = {
        contact_status: status.contactStatus,
        user: userProfile
          ? {
              id: userProfile.id,
              name: userProfile.name || userProfile.email,
              email: userProfile.email,
            }
          : null,
        contacted_at: status.contactedAt,
        notes: status.notes,
      }
    })

    return NextResponse.json({
      success: true,
      statuses: statusMap,
    })

  } catch (error) {
    console.error('[API] Contact status GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadId, contactStatus, notes } = body

    // Validation
    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    if (!contactStatus || !['none', 'contacted', 'do_not_contact'].includes(contactStatus)) {
      return NextResponse.json(
        { error: 'Invalid contact status. Must be: none, contacted, or do_not_contact' },
        { status: 400 }
      )
    }

    // Get current user
    const session = await getServerSession()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Insert or update contact status using UPSERT
    const status = await prisma.leadContactStatus.upsert({
      where: { leadId },
      update: {
        contactStatus,
        userId,
        notes: notes || null,
        contactedAt: new Date(),
      },
      create: {
        leadId,
        contactStatus,
        userId,
        notes: notes || null,
        contactedAt: new Date(),
      },
    })

    // Fetch user profile separately
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    })

    return NextResponse.json({
      success: true,
      status: {
        lead_id: status.leadId,
        contact_status: status.contactStatus,
        user: userProfile
          ? {
              id: userProfile.id,
              name: userProfile.name || 'N/D',
              email: userProfile.email,
            }
          : null,
        contacted_at: status.contactedAt,
        notes: status.notes,
      },
    })

  } catch (error) {
    console.error('[API] Contact status POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
