/**
 * API Route: Lead Extraction
 * POST /api/leads/extract - Start new lead search
 * GET /api/leads/extract?searchId=xxx - Get search status
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getServerSession } from '@/lib/auth/server'
import { extractLeadsWorker } from '@/lib/leads/extraction-worker'
import type { LeadSearchParams } from '@/lib/types/lead-extraction'

const leadsExtractSchema = z.object({
  name: z.string().min(1),
  settore: z.string().optional(),
  fonti_selezionate: z.array(z.string()).min(1),
  sottocategoria: z.string().optional(),
  codice_ateco: z.array(z.string()).optional(),
  fatturato_min: z.string().optional(),
  fatturato_max: z.string().optional(),
  dipendenti_min: z.string().optional(),
  dipendenti_max: z.string().optional(),
  anno_fondazione_min: z.string().optional(),
  anno_fondazione_max: z.string().optional(),
  rating_min: z.number().optional(),
  comune: z.string().optional(),
  provincia: z.string().optional(),
  regione: z.string().optional(),
  nazione: z.string().optional(),
})

/**
 * POST - Start new lead extraction
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Non autenticato. Effettua il login per continuare.' },
        { status: 401 }
      )
    }

    const rawBody = await request.json()

    // Zod validation
    const parsed = leadsExtractSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input non valido', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const body = parsed.data

    // Prepare search parameters
    const searchParams: LeadSearchParams = {
      name: body.name,
      settore: body.settore || 'altro',
      sottocategoria: body.sottocategoria,
      codice_ateco: body.codice_ateco,
      fatturato_min: body.fatturato_min ? parseInt(body.fatturato_min) : undefined,
      fatturato_max: body.fatturato_max ? parseInt(body.fatturato_max) : undefined,
      dipendenti_min: body.dipendenti_min ? parseInt(body.dipendenti_min) : undefined,
      dipendenti_max: body.dipendenti_max ? parseInt(body.dipendenti_max) : undefined,
      anno_fondazione_min: body.anno_fondazione_min ? parseInt(body.anno_fondazione_min) : undefined,
      anno_fondazione_max: body.anno_fondazione_max ? parseInt(body.anno_fondazione_max) : undefined,
      rating_min: body.rating_min,
      comune: body.comune,
      provincia: body.provincia,
      regione: body.regione,
      nazione: body.nazione || 'IT',
      fonti_abilitate: body.fonti_selezionate,
      priorita_fonti: body.fonti_selezionate,
    }

    // Create search record in database with user_id
    const searchRecord = await prisma.leadSearch.create({
      data: {
        userId,
        name: searchParams.name,
        settore: searchParams.settore,
        sottocategoria: searchParams.sottocategoria,
        comune: searchParams.comune,
        provincia: searchParams.provincia,
        regione: searchParams.regione,
        nazione: searchParams.nazione,
        codiceAteco: searchParams.codice_ateco || [],
        fatturatoMin: searchParams.fatturato_min,
        fatturatoMax: searchParams.fatturato_max,
        dipendentiMin: searchParams.dipendenti_min,
        dipendentiMax: searchParams.dipendenti_max,
        annoFondazioneMin: searchParams.anno_fondazione_min,
        annoFondazioneMax: searchParams.anno_fondazione_max,
        ratingMin: searchParams.rating_min,
        fontiAbilitate: searchParams.fonti_abilitate,
        prioritaFonti: searchParams.priorita_fonti || [],
        status: 'pending',
        leadsTrovati: 0,
        leadsValidati: 0,
        fontiConsultate: 0,
      },
    })

    // Start extraction worker asynchronously (don't wait)
    extractLeadsWorker(searchRecord.id, searchParams).catch(async (error) => {
      console.error('Extraction worker error:', error)
      try {
        await prisma.leadSearch.update({
          where: { id: searchRecord.id },
          data: { status: 'failed' },
        })
      } catch (updateError) {
        console.error('Failed to update search status after worker error:', updateError)
      }
    })

    return NextResponse.json({
      success: true,
      searchId: searchRecord.id,
      message: 'Estrazione avviata con successo',
    })
  } catch (error) {
    console.error('Lead extraction error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Errore imprevisto',
      },
      { status: 500 }
    )
  }
}

/**
 * GET - Get search status and results
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Non autenticato. Effettua il login per continuare.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const searchId = searchParams.get('searchId')

    if (!searchId) {
      return NextResponse.json(
        { error: 'searchId parameter required' },
        { status: 400 }
      )
    }

    // Get search status - verify ownership
    const search = await prisma.leadSearch.findUnique({
      where: { id: searchId },
    })

    if (!search) {
      return NextResponse.json(
        { error: 'Ricerca non trovata' },
        { status: 404 }
      )
    }

    // IDOR protection: verify the search belongs to this user
    if (search.userId !== userId) {
      return NextResponse.json(
        { error: 'Ricerca non trovata' },
        { status: 404 }
      )
    }

    const { searchParams: urlParams } = new URL(request.url)
    const page = parseInt(urlParams.get('page') || '1')
    const limit = Math.min(parseInt(urlParams.get('limit') || '50'), 200)
    const skip = (page - 1) * limit

    // Get leads for this search with pagination
    const [leads, totalLeads, aggregation] = await Promise.all([
      prisma.lead.findMany({
        where: { searchId },
        orderBy: { affidabilitaScore: 'desc' },
        take: limit,
        skip,
      }),
      prisma.lead.count({ where: { searchId } }),
      prisma.lead.aggregate({
        where: { searchId },
        _count: { id: true },
        _avg: { affidabilitaScore: true },
      }),
    ])

    const validatedCount = await prisma.lead.count({
      where: { searchId, validazioneStatus: 'validated' },
    })
    const pendingCount = await prisma.lead.count({
      where: { searchId, validazioneStatus: 'pending' },
    })

    const summary = {
      total_leads: totalLeads,
      validated_leads: validatedCount,
      pending_leads: pendingCount,
      invalid_leads: totalLeads - validatedCount - pendingCount,
      avg_affidabilita: Math.round((aggregation._avg.affidabilitaScore || 0) * 100) / 100,
    }

    const responseData = {
      search,
      leads: leads || [],
      summary,
      pagination: {
        page,
        limit,
        total: totalLeads,
        totalPages: Math.ceil(totalLeads / limit),
      },
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Get search status error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Errore imprevisto',
      },
      { status: 500 }
    )
  }
}
