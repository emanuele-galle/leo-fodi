/**
 * DEBUG API - Analizza logs profiling OSINT
 * GET /api/debug/profile-logs?cognome=Gallè
 *
 * NOTA: Questo endpoint è solo per debugging e dovrebbe essere rimosso in produzione
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Allow CORS for debugging
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Skip auth check for debugging (REMOVE IN PRODUCTION!)
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'This endpoint is only available in development' }, { status: 403 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const cognome = searchParams.get('cognome') || 'Gallè'

    console.log(`[DEBUG] Searching for profile: ${cognome}`)

    // 1. Trova profilo più recente
    const profiles = await prisma.osintProfile.findMany({
      where: {
        OR: [
          { cognome: { contains: cognome, mode: 'insensitive' } },
          { nome: { contains: cognome, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        nome: true,
        cognome: true,
        targetId: true,
        createdAt: true,
        punteggioComplessivo: true,
        completezzaProfilo: true,
        profileData: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }

    const profile = profiles[0]
    const profileData = profile.profileData as any

    // 2. Analizza dati
    const analysis = {
      profile_info: {
        id: profile.id,
        nome: profile.nome,
        cognome: profile.cognome,
        target_id: profile.targetId,
        created_at: profile.createdAt,
        punteggio: profile.punteggioComplessivo,
        completezza: profile.completezzaProfilo,
      },

      education: {
        exists: !!(profileData.education || profileData.formazione_educazione),
        confidence_score: profileData.education?.confidence_score || profileData.formazione_educazione?.confidence_score || 0,
        titolo_studio: profileData.education?.titolo_studio_massimo?.livello ||
                      profileData.formazione_educazione?.titolo_studio_massimo?.livello ||
                      'N/A',
        certificazioni_count: profileData.education?.certificazioni?.length ||
                             profileData.formazione_educazione?.certificazioni?.length ||
                             0,
        formazione_continua_count: profileData.education?.formazione_continua?.length ||
                                  profileData.formazione_educazione?.formazione_continua?.length ||
                                  0,
        raw_data: profileData.education || profileData.formazione_educazione || null,
      },

      authority_signals: {
        exists: !!(profileData.authority_signals || profileData.segnali_autorita),
        confidence_score: profileData.authority_signals?.confidence_score ||
                         profileData.segnali_autorita?.confidence_score ||
                         0,
        livello_influenza: profileData.authority_signals?.livello_influenza ||
                          profileData.segnali_autorita?.livello_influenza ||
                          'N/A',
        premi_count: profileData.authority_signals?.premi_certificazioni?.length ||
                    profileData.segnali_autorita?.premi_certificazioni?.length ||
                    0,
        pubblicazioni_count: profileData.authority_signals?.pubblicazioni?.length ||
                            profileData.segnali_autorita?.pubblicazioni?.length ||
                            0,
        community_count: profileData.authority_signals?.community_attive?.length ||
                        profileData.segnali_autorita?.community_attive?.length ||
                        0,
        raw_data: profileData.authority_signals || profileData.segnali_autorita || null,
      },

      social_graph: {
        exists: !!(profileData.social_graph || profileData.presenza_digitale),
        confidence_score: profileData.social_graph?.confidence_score ||
                         profileData.presenza_digitale?.confidence_score ||
                         0,
        followers_totali: profileData.social_graph?.rete_sociale?.followers_totali ||
                         profileData.presenza_digitale?.rete_sociale?.followers_totali ||
                         0,
        following_totali: profileData.social_graph?.rete_sociale?.following_totali ||
                         profileData.presenza_digitale?.rete_sociale?.following_totali ||
                         0,
        engagement_rate: profileData.social_graph?.rete_sociale?.engagement_rate ||
                        profileData.presenza_digitale?.rete_sociale?.engagement_rate ||
                        0,
        piattaforme: profileData.social_graph?.piattaforme_analizzate?.length ||
                    profileData.presenza_digitale?.piattaforme_analizzate?.length ||
                    0,
      },

      scraping_errors: profileData.errori || [],
      agents_used: profileData.agent_utilizzati || [],
      tempo_elaborazione: profileData.tempo_elaborazione || 'N/A',
      data_creazione: profileData.data_creazione || 'N/A',

      conclusions: {
        education_issue: !profileData.education?.titolo_studio_massimo?.livello &&
                        !profileData.formazione_educazione?.titolo_studio_massimo?.livello,
        authority_issue: !profileData.authority_signals?.livello_influenza ||
                        profileData.authority_signals?.livello_influenza === 'N/D',
        has_scraping_errors: (profileData.errori || []).length > 0,
        profile_age_days: Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      },

      recommendations: [] as Array<{ issue: string; reason: string; solution: string }>,
    }

    // Genera raccomandazioni
    if (analysis.conclusions.education_issue) {
      analysis.recommendations.push({
        issue: 'Education data missing',
        reason: analysis.education.confidence_score === 0 ? 'No data extracted from LinkedIn' : 'LinkedIn profile incomplete',
        solution: 'Verify target has public education section on LinkedIn, then re-run profiling',
      })
    }

    if (analysis.conclusions.authority_issue) {
      analysis.recommendations.push({
        issue: 'Authority signals missing',
        reason: 'No awards, certifications, or publications found',
        solution: 'This is normal if target has no public recognition. Not a technical issue.',
      })
    }

    if (analysis.conclusions.has_scraping_errors) {
      analysis.recommendations.push({
        issue: 'Scraping errors detected',
        reason: `${analysis.scraping_errors.length} errors during data extraction`,
        solution: 'Check error details and re-run profiling with better network connectivity',
      })
    }

    if (analysis.conclusions.profile_age_days > 7) {
      analysis.recommendations.push({
        issue: 'Profile data is old',
        reason: `Profile created ${analysis.conclusions.profile_age_days} days ago`,
        solution: 'Re-run OSINT profiling to get fresh data',
      })
    }

    return NextResponse.json(analysis, { status: 200 })

  } catch (error) {
    console.error('[DEBUG] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
