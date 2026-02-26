import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/user-stats
 * Restituisce statistiche complete per la dashboard utente
 */
export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const session = await getServerSession()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Ottieni statistiche base (contatori totali)
    const [clientsCount, profilesCount, plansCount, leadsCount] = await Promise.all([
      prisma.client.count({ where: { userId } }),
      prisma.profile.count({ where: { userId } }),
      prisma.financialPlan.count({ where: { userId } }),
      prisma.lead.count({ where: { search: { userId } } }),
    ])

    // Calcola statistiche mese corrente
    const currentMonthStart = new Date()
    currentMonthStart.setDate(1)
    currentMonthStart.setHours(0, 0, 0, 0)

    const [
      currentMonthClients,
      currentMonthProfiles,
      currentMonthPlans,
      currentMonthLeads,
    ] = await Promise.all([
      prisma.client.count({
        where: { userId, createdAt: { gte: currentMonthStart } },
      }),
      prisma.profile.count({
        where: { userId, createdAt: { gte: currentMonthStart } },
      }),
      prisma.financialPlan.count({
        where: { userId, createdAt: { gte: currentMonthStart } },
      }),
      prisma.lead.count({
        where: { search: { userId }, createdAt: { gte: currentMonthStart } },
      }),
    ])

    // Calcola statistiche settimana corrente
    const currentWeekStart = new Date()
    const dayOfWeek = currentWeekStart.getDay()
    const diff = currentWeekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    currentWeekStart.setDate(diff)
    currentWeekStart.setHours(0, 0, 0, 0)

    const [currentWeekClients, currentWeekProfiles, currentWeekPlans, currentWeekLeads] =
      await Promise.all([
        prisma.client.count({
          where: { userId, createdAt: { gte: currentWeekStart } },
        }),
        prisma.profile.count({
          where: { userId, createdAt: { gte: currentWeekStart } },
        }),
        prisma.financialPlan.count({
          where: { userId, createdAt: { gte: currentWeekStart } },
        }),
        prisma.lead.count({
          where: { search: { userId }, createdAt: { gte: currentWeekStart } },
        }),
      ])

    // TODO: Monthly trend - implement with raw query if needed
    const monthlyTrend = null

    // TODO: La tabella user_activity_log non esiste nel database
    const recentActivity = null

    // Ottieni ultimi clienti creati
    const recentClients = await prisma.client.findMany({
      where: { userId },
      select: { id: true, nome: true, cognome: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Ottieni ultimi profili creati
    const recentProfiles = await prisma.profile.findMany({
      where: { userId },
      select: {
        id: true,
        createdAt: true,
        client: { select: { id: true, nome: true, cognome: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Ottieni ultimi piani creati
    const recentPlans = await prisma.financialPlan.findMany({
      where: { userId },
      select: {
        id: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            client: { select: { id: true, nome: true, cognome: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Ottieni ultimi lead generati
    const recentLeads = await prisma.lead.findMany({
      where: { search: { userId } },
      select: { id: true, ragioneSociale: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Costruisci risposta
    const stats = {
      totals: {
        clients: clientsCount,
        profiles: profilesCount,
        plans: plansCount,
        leads: leadsCount,
      },
      currentMonth: {
        clients: currentMonthClients,
        profiles: currentMonthProfiles,
        plans: currentMonthPlans,
        leads: currentMonthLeads,
      },
      currentWeek: {
        clients: currentWeekClients,
        profiles: currentWeekProfiles,
        plans: currentWeekPlans,
        leads: currentWeekLeads,
      },
      monthlyTrend: monthlyTrend || [],
      recentActivity: recentActivity || [],
      recent: {
        clients: recentClients || [],
        profiles: recentProfiles || [],
        plans: recentPlans || [],
        leads: recentLeads || [],
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Errore durante il recupero delle statistiche' },
      { status: 500 }
    )
  }
}
