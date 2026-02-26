import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    const [
      clientsCount,
      profilesCount,
      plansCount,
      leadsCount,
      pendingUsersCount,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.profile.count(),
      prisma.financialPlan.count(),
      prisma.lead.count(),
      prisma.user.count({ where: { approved: false } }),
    ])

    return NextResponse.json({
      totalClients: clientsCount,
      totalProfiles: profilesCount,
      totalFinancialPlans: plansCount,
      totalLeads: leadsCount,
      pendingUsers: pendingUsersCount,
    })
  } catch (error) {
    console.error('Error loading admin stats:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
