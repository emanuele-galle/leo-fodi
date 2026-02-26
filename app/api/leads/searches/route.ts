/**
 * Search History API Endpoint
 * GET /api/leads/searches - Get all searches
 * DELETE /api/leads/searches - Delete a search by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch all searches ordered by creation date (newest first)
    const [searches, count] = await Promise.all([
      prisma.leadSearch.findMany({
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.leadSearch.count(),
    ])

    return NextResponse.json({
      success: true,
      searches: searches || [],
      total: count,
      limit,
      offset,
    })

  } catch (error) {
    console.error('[API] Search history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const searchId = searchParams.get('searchId')

    if (!searchId) {
      return NextResponse.json(
        { error: 'Search ID is required' },
        { status: 400 }
      )
    }

    // Delete the search from lead_searches table
    // Note: Cascading deletes will automatically remove associated leads
    await prisma.leadSearch.delete({
      where: { id: searchId },
    })

    return NextResponse.json({
      success: true,
      message: 'Search deleted successfully'
    })

  } catch (error) {
    console.error('[API] Delete search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
