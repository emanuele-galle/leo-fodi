import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from '@/lib/auth/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  try {
    // Verify the requesting user is an admin
    const session = await getServerSession()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (currentUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Permessi insufficienti' },
        { status: 403 }
      )
    }

    // Get request body
    const { userId: targetUserId, newEmail } = await request.json()

    if (!targetUserId || !newEmail) {
      return NextResponse.json(
        { error: 'userId e newEmail sono obbligatori' },
        { status: 400 }
      )
    }

    // Update email in user table using Prisma
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { email: newEmail },
    })

    return NextResponse.json({
      success: true,
      message: 'Email aggiornata con successo',
      data: updatedUser,
    })
  } catch (error: any) {
    console.error('Error in update-email API:', error)
    return NextResponse.json(
      { error: error.message || 'Errore interno del server' },
      { status: 500 }
    )
  }
}
