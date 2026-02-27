import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const userId = session.user.id

    const plans = await prisma.financialPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        profile: {
          include: {
            client: {
              select: {
                nome: true,
                cognome: true,
                localita: true,
              },
            },
          },
        },
      },
    })

    // Transform to expected format
    const transformed = plans.map((plan) => ({
      id: plan.id,
      profileId: plan.profileId,
      createdAt: plan.createdAt,
      clientNome: plan.profile?.client?.nome || '',
      clientCognome: plan.profile?.client?.cognome || '',
      clientLocalita: plan.profile?.client?.localita || '',
      obiettiviFinanziari: plan.obiettiviFinanziari,
      raccomandazioniProdotti: plan.raccomandazioniProdotti,
    }))

    return NextResponse.json({ plans: transformed })
  } catch (error) {
    console.error('Error loading financial plans:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('id')

    if (!planId) {
      return NextResponse.json({ error: 'id richiesto' }, { status: 400 })
    }

    // Verify ownership before delete
    const plan = await prisma.financialPlan.findUnique({
      where: { id: planId },
      select: { userId: true },
    })

    if (!plan || plan.userId !== session.user.id) {
      return NextResponse.json({ error: 'Piano non trovato' }, { status: 404 })
    }

    await prisma.financialPlan.delete({
      where: { id: planId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting financial plan:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
