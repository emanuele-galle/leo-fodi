import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from '@/lib/auth/server'

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
    const { userId: targetUserId, newPassword } = await request.json()

    if (!targetUserId || !newPassword) {
      return NextResponse.json(
        { error: 'userId e newPassword sono obbligatori' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La password deve essere di almeno 6 caratteri' },
        { status: 400 }
      )
    }

    // Update password hash in account table using Better Auth's ctx
    // Better Auth stores password in the account table with providerId 'credential'
    const { createHash } = await import('better-auth/crypto')
    const hashedPassword = await createHash(newPassword)

    const updatedAccount = await prisma.account.updateMany({
      where: {
        userId: targetUserId,
        providerId: 'credential',
      },
      data: {
        password: hashedPassword,
      },
    })

    if (updatedAccount.count === 0) {
      return NextResponse.json(
        { error: 'Account credential non trovato per questo utente' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password aggiornata con successo',
    })
  } catch (error: any) {
    console.error('Error in update-password API:', error)
    return NextResponse.json(
      { error: error.message || 'Errore interno del server' },
      { status: 500 }
    )
  }
}
