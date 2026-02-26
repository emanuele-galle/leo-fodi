import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = (session.user as any)?.role
    const isAdmin = userRole === 'admin'

    const searches = await prisma.leadSearch.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        comune: true,
        settore: true,
        createdAt: true,
        leadsTrovati: true,
        userId: true,
      },
    })

    // If admin, fetch user profiles for each search
    let userProfilesMap: Record<string, { email: string; name: string | null }> = {}

    if (isAdmin) {
      const userIds = [...new Set(searches.map((s) => s.userId).filter(Boolean))] as string[]

      if (userIds.length > 0) {
        const userProfiles = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true, name: true },
        })

        userProfiles.forEach((profile) => {
          userProfilesMap[profile.id] = {
            email: profile.email,
            name: profile.name,
          }
        })
      }
    }

    const formatted = searches.map((search) => {
      const userProfile = isAdmin && search.userId ? userProfilesMap[search.userId] : null

      return {
        id: search.id,
        searchName: search.name,
        comune: search.comune,
        settore: search.settore,
        createdAt: search.createdAt,
        leadCount: search.leadsTrovati || 0,
        ...(isAdmin && {
          userEmail: userProfile?.email || 'N/D',
          userFullName: userProfile?.name || 'N/D',
        }),
      }
    })

    return NextResponse.json({ searches: formatted, isAdmin })
  } catch (error) {
    console.error('Error loading lead searches:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
