import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const userRole = (session.user as { role?: string })?.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Start of current week (Monday)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - mondayOffset)
    weekStart.setHours(0, 0, 0, 0)

    const [
      clientsCount,
      profilesCount,
      plansCount,
      leadsCount,
      pendingUsersCount,
      recentProfiles,
      recentPlans,
      weeklyAIUsage,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.profile.count(),
      prisma.financialPlan.count(),
      prisma.lead.count(),
      prisma.user.count({ where: { approved: false } }),
      prisma.profile.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          client: { select: { nome: true, cognome: true } },
        },
      }),
      prisma.financialPlan.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          profileId: true,
          createdAt: true,
          profile: { select: { client: { select: { nome: true, cognome: true } } } },
        },
      }),
      prisma.aiTokenUsage.aggregate({
        where: { createdAt: { gte: weekStart } },
        _sum: { totalCost: true },
      }),
    ])

    return NextResponse.json({
      totalClients: clientsCount,
      totalProfiles: profilesCount,
      totalFinancialPlans: plansCount,
      totalLeads: leadsCount,
      pendingUsers: pendingUsersCount,
      recentProfiles: recentProfiles.map(p => ({
        id: p.id,
        clientName: p.client ? `${p.client.nome} ${p.client.cognome}` : 'N/A',
        date: p.createdAt,
      })),
      recentPlans: recentPlans.map(p => ({
        id: p.id,
        profileId: p.profileId,
        clientName: p.profile?.client ? `${p.profile.client.nome} ${p.profile.client.cognome}` : 'N/A',
        date: p.createdAt,
      })),
      weeklyAICost: weeklyAIUsage._sum.totalCost || 0,
    })
  } catch (error) {
    console.error('Error loading admin stats:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
