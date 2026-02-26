// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { FinancialPlanPDF } from '@/components/export/FinancialPlanPDF'
import { createElement } from 'react'
import { getServerSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  const planId = request.nextUrl.searchParams.get('planId')
  if (!planId) {
    return NextResponse.json({ error: 'planId richiesto' }, { status: 400 })
  }

  try {
    const financialPlan = await prisma.financialPlan.findUnique({
      where: { id: planId },
      include: {
        profile: {
          include: {
            client: true,
          },
        },
      },
    })

    if (!financialPlan) {
      return NextResponse.json({ error: 'Piano non trovato' }, { status: 404 })
    }

    const clientName = `${financialPlan.profile.client.nome} ${financialPlan.profile.client.cognome}`

    const plan = {
      obiettiviFinanziari: financialPlan.obiettiviFinanziari,
      analisiGap: financialPlan.analisiGap,
      sequenzaRaccomandata: financialPlan.sequenzaRaccomandata,
      raccomandazioniProdotti: financialPlan.raccomandazioniProdotti,
      sintesiValore: financialPlan.sintesiValore,
      spuntiFiscali: financialPlan.spuntiFiscali,
    }

    const buffer = await renderToBuffer(
      createElement(FinancialPlanPDF, {
        plan,
        clientName,
        createdAt: financialPlan.createdAt.toISOString(),
      })
    )

    const fileName = clientName.replace(/\s+/g, '_')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="piano-finanziario-${fileName}.pdf"`,
      },
    })
  } catch (error) {
    console.error('[Financial PDF Export] Error:', error)
    return NextResponse.json(
      { error: 'Errore durante la generazione del PDF' },
      { status: 500 }
    )
  }
}
