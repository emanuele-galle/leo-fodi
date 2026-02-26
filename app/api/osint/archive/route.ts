import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const profiles = await prisma.osintProfile.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        targetId: true,
        createdAt: true,
        nome: true,
        cognome: true,
        profileData: true,
        punteggioComplessivo: true,
        completezzaProfilo: true,
        userId: true,
      },
    })

    return NextResponse.json({ profiles })
  } catch (error) {
    console.error('Error loading OSINT profiles:', error)
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
    const profileId = searchParams.get('id')

    if (!profileId) {
      return NextResponse.json({ error: 'id richiesto' }, { status: 400 })
    }

    await prisma.osintProfile.delete({
      where: { id: profileId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting OSINT profile:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
