import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const userRole = (session.user as { role?: string })?.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId richiesto' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { approved: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error approving user:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
