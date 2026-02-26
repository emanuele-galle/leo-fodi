/**
 * DELETE /api/admin/delete-profile
 * Deletes a cached profile by client name
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nome = searchParams.get('nome')
    const cognome = searchParams.get('cognome')

    if (!nome || !cognome) {
      return NextResponse.json(
        { error: 'Missing nome or cognome parameter' },
        { status: 400 }
      )
    }

    // Step 1: Find client
    const client = await prisma.client.findFirst({
      where: { nome, cognome },
      select: { id: true, nome: true, cognome: true },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Step 2: Delete profile (cascade will delete financial_plans too)
    await prisma.profile.deleteMany({
      where: { clientId: client.id },
    })

    return NextResponse.json({
      success: true,
      message: `Profile deleted for ${client.nome} ${client.cognome}`,
      client_id: client.id,
    })

  } catch (error) {
    console.error('[API] Delete profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
