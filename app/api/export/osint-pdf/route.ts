// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { OSINTPDFReport } from '@/components/export/OSINTPDFReport'
import { createElement } from 'react'
import { getServerSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  const profileId = request.nextUrl.searchParams.get('profileId')
  if (!profileId) {
    return NextResponse.json({ error: 'profileId richiesto' }, { status: 400 })
  }

  try {
    const osintProfile = await prisma.osintProfile.findUnique({
      where: { id: profileId },
    })

    if (!osintProfile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }

    const profileData = osintProfile.profileData as any
    const profileMeta = {
      created_at: osintProfile.createdAt.toISOString(),
      punteggio_complessivo: osintProfile.punteggioComplessivo ?? undefined,
      completezza_profilo: osintProfile.completezzaProfilo ?? undefined,
    }

    const buffer = await renderToBuffer(
      createElement(OSINTPDFReport, { profile: profileData, profileMeta })
    )

    const nome = `${osintProfile.nome}_${osintProfile.cognome}`.replace(/\s+/g, '_')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="profilo-osint-${nome}.pdf"`,
      },
    })
  } catch (error) {
    console.error('[OSINT PDF Export] Error:', error)
    return NextResponse.json(
      { error: 'Errore durante la generazione del PDF' },
      { status: 500 }
    )
  }
}
