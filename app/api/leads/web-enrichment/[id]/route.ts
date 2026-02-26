/**
 * Web Enrichment API Endpoint
 * POST /api/leads/web-enrichment/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from '@/lib/auth/server'
import { performWebEnrichment } from '@/lib/leads/enrichment/web-enricher'
import type { Lead } from '@/lib/types/lead-extraction'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params

    console.log(`[API] Starting web enrichment for lead: ${leadId}`)

    // Check user authentication
    const session = await getServerSession()
    const userId = session?.user?.id

    if (!userId) {
      console.error('[API] Authentication error: no session')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[API] User authenticated:', userId)

    // Fetch lead from database
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    })

    if (!lead) {
      console.log('[API] Lead not found with ID:', leadId)
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    console.log('[API] Lead found, starting enrichment...')

    // Perform web enrichment
    const enrichedLead = await performWebEnrichment(lead as unknown as Lead)

    // Update lead in database
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        sitoWeb: enrichedLead.sito_web,
        linkedinUrl: enrichedLead.linkedin_url,
        facebookUrl: enrichedLead.facebook_url,
        instagramUrl: enrichedLead.instagram_url,
        emailPrincipale: enrichedLead.email_principale,
        telefonoPrincipale: enrichedLead.telefono_principale,
        telefonoMobile: enrichedLead.telefono_mobile,
        note: enrichedLead.note,
        fontiConsultate: enrichedLead.fonti_consultate || [],
        affidabilitaScore: enrichedLead.affidabilita_score,
      },
    })

    console.log('[API] ✅ Web enrichment completed successfully')

    return NextResponse.json({
      success: true,
      lead: enrichedLead,
      message: 'Web enrichment completed successfully',
    })

  } catch (error) {
    console.error('[API] Web enrichment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
