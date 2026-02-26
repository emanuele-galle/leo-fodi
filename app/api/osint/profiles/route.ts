/**
 * OSINT Saved Profiles API
 * GET /api/osint/profiles - List profiles for authenticated user
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from '@/lib/auth/server'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''

    // Build where clause
    const where: any = { userId }
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { cognome: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Fetch profiles with count
    const [profiles, count] = await Promise.all([
      prisma.osintProfile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.osintProfile.count({ where }),
    ])

    // Transform profiles to include useful display info
    const transformed = profiles.map((profile) => ({
      id: profile.id,
      target_id: profile.targetId,
      nome: profile.nome,
      cognome: profile.cognome,
      nome_completo: `${profile.nome} ${profile.cognome}`,
      created_at: profile.createdAt,
      citta: (profile.profileData as any)?.target?.citta || null,
      punteggio: profile.punteggioComplessivo,
      completezza: profile.completezzaProfilo,
    }))

    return NextResponse.json({
      success: true,
      profiles: transformed,
      pagination: {
        total: count,
        limit,
        offset,
        has_more: count > offset + limit,
      },
    })

  } catch (error) {
    console.error('[API] Error listing profiles:', error)
    return NextResponse.json(
      {
        error: 'Errore durante il recupero dei profili',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
