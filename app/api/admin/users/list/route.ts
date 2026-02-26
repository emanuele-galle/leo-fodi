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

    const [pendingUsers, approvedUsers] = await Promise.all([
      prisma.user.findMany({
        where: { approved: false },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findMany({
        where: { approved: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ])

    return NextResponse.json({ pendingUsers, approvedUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
