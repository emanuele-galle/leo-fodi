'use client'

/**
 * OSINT Profile Display V4 - COMPLETO con tutte le 13 sezioni
 *
 * SEZIONI OBBLIGATORIE (13):
 * 1. identita_presenza_online
 * 2. nucleo_familiare
 * 3. professione_carriera
 * 4. formazione_educazione ✨ NUOVO
 * 5. hobby_interessi
 * 6. valutazione_economica
 * 7. presenza_digitale
 * 8. segnali_autorita ✨ NUOVO
 * 9. modello_lavorativo
 * 10. visione_obiettivi ✨ NUOVO
 * 11. stile_vita
 * 12. mappatura_bisogni
 * 13. leve_ingaggio
 *
 * SEZIONI EXTRA:
 * - raccomandazioni_prodotti
 * - piano_contatto ✨ NUOVO
 * - visual_sources (immagini Instagram)
 */

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Users,
  Briefcase,
  Heart,
  DollarSign,
  Globe,
  Award,
  Target,
  Eye,
  MapPin,
  Zap,
  Phone,
  ShoppingCart,
  TrendingUp,
  Calendar,
  GraduationCap,
  Clock,
  Mail,
  MessageCircle,
  Instagram,
  Facebook,
  Linkedin,
  Image as ImageIcon,
  BarChart3,
  Lightbulb,
  CheckCircle2,
  BookOpen,
  Trophy,
  Star,
  TrendingDown,
  Shield,
  Sparkles,
  FileText,
  Send,
  PhoneCall,
} from 'lucide-react'
import type { CompleteOSINTProfile } from '@/lib/osint/types'
import Image from 'next/image'
import { formatEnumValue } from '@/lib/osint/enum-labels'

interface OSINTProfileDisplayV4Props {
  profile: CompleteOSINTProfile
}

export function OSINTProfileDisplayV4({ profile }: OSINTProfileDisplayV4Props) {
  // 🐛 FIX: profile.profile_data is the JSONB column containing the CompleteOSINTProfile
  // So we need to access profile.profile_data.family, not profileData.family
  const profileData = (profile as any).profile_data || profile || {}

  // Extract core data
  const overallScore = profileData.punteggio_complessivo ?? (profile as any).punteggio_complessivo ?? 0
  const sintesiEsecutiva = profileData.sintesi_esecutiva || (profile as any).sintesi_esecutiva || ''
  const completezzaProfilo = profileData.completezza_profilo ?? (profile as any).completezza_profilo ?? 0

  // Extract ALL 13 sections + extras
  // Database uses ENGLISH naming (from types.ts), not Italian (from backend prompts)
  const target = profileData.target || profile.target || {}
  const identita = profileData.identity || profileData.identita_presenza_online || {}
  const family = profileData.family || profileData.nucleo_familiare || {}
  const career = profileData.career || profileData.professione_carriera || {}
  const education = profileData.education || profileData.formazione_educazione || {}
  const hobbyInteressi = profileData.lifestyle || profileData.hobby_interessi || {}
  const wealth = profileData.wealth || profileData.valutazione_economica || {}
  const digitalPresence = profileData.social_graph || profileData.presenza_digitale || {}
  const authoritySignals = profileData.authority_signals || profileData.segnali_autorita || {}
  const workModel = profileData.work_model || profileData.modello_lavorativo || {}
  const vision = profileData.vision_goals || profileData.visione_obiettivi || {}
  const lifestyle = profileData.lifestyle || profileData.stile_vita || {}
  const needs = profileData.needs_mapping || profileData.mappatura_bisogni || {}
  const engagement = profileData.engagement || profileData.leve_ingaggio || {}

  // Extra sections
  const products = profileData.product_recommendations || profileData.raccomandazioni_prodotti || []
  const contactPlan = profileData.contact_plan || profileData.piano_contatto || {}
  const visualSources = profileData.visual_sources || profileData.content_analysis?.visual_sources || {}

  // ===================================================================
  // COMPLETE MAPPING FROM REAL DATABASE STRUCTURE
  // Based on actual API response structure (English field names)
  // ===================================================================

  // 1. FAMILY MAPPING
  const family_final = {
    stato_civile: family.nucleo_familiare_attuale?.coniuge?.nome ? 'Sposato/a' : 'Single',
    famiglia_attuale: {
      figli: family.nucleo_familiare_attuale?.figli || [],
      coniuge: family.nucleo_familiare_attuale?.coniuge
    },
    residenza: family.residenza?.citta || target.citta,
    ...family
  }

  // 2. CAREER MAPPING
  const career_final = {
    posizione_attuale: {
      titolo: career.professione_attuale?.ruolo,
      ruolo: career.professione_attuale?.ruolo,
      azienda: career.professione_attuale?.azienda,
      livello: career.professione_attuale?.livello,
      settore: career.professione_attuale?.settore
    },
    storico_professionale: career.storico_professionale || [],
    competenze_chiave: career.competenze_chiave || [],
    certificazioni: career.certificazioni || [],
    ...career
  }

  // 3. WEALTH MAPPING
  const wealth_final = {
    fascia_reddito_stimata: wealth.valutazione_economica?.fascia || 'MEDIA',
    capacita_spesa: wealth.valutazione_economica?.fascia || 'MEDIA',
    stabilita_finanziaria: wealth.confidence_score > 50 ? 'Buona' : 'Da verificare',
    tenore_vita: wealth.tenore_vita,
    proprieta_note: wealth.proprieta_note || [],
    indicatori_ricchezza: wealth.indicatori_ricchezza || [],
    ...wealth
  }

  // 4. DIGITAL PRESENCE MAPPING (from social_graph + target URLs + rawData)
  // FIX: Read actual data from rawData for each platform
  const rawData = profileData.rawData || {}
  const linkedinData = rawData.linkedin_data || {}
  const facebookData = rawData.facebook_data || {}
  const instagramData = rawData.instagram_data || {}

  const digitalPresence_final = {
    profili_principali: [
      ...(target.instagram_url ? [{
        piattaforma: 'Instagram',
        url: target.instagram_url,
        followers: instagramData.numero_followers || digitalPresence.rete_sociale?.followers_totali || 0,
        following: instagramData.numero_following || digitalPresence.rete_sociale?.following_totali || 0,
        engagement_rate: digitalPresence.rete_sociale?.engagement_rate || 0
      }] : []),
      ...(target.facebook_url ? [{
        piattaforma: 'Facebook',
        url: target.facebook_url,
        followers: facebookData.numero_followers || 0,
        following: 0
      }] : []),
      ...(target.linkedin_url ? [{
        piattaforma: 'LinkedIn',
        url: target.linkedin_url,
        followers: linkedinData.numero_followers || 0,
        following: linkedinData.numero_connessioni || 0
      }] : [])
    ],
    followers_totali: digitalPresence.rete_sociale?.followers_totali || 0,
    following_totali: digitalPresence.rete_sociale?.following_totali || 0,
    engagement_rate: digitalPresence.rete_sociale?.engagement_rate || 0,
    dimensione_rete: digitalPresence.rete_sociale?.dimensione || 'N/D',
    connessioni_chiave: digitalPresence.connessioni_chiave || [],
    influencer_seguiti: digitalPresence.influencer_seguiti || [],
    comunita_interesse: digitalPresence.comunita_interesse || [],
    ...digitalPresence
  }

  // 5. EDUCATION MAPPING
  const education_final = {
    titolo_studio_massimo: education.titolo_studio_massimo || { livello: null, campo_studio: null },
    certificazioni: education.certificazioni || [],
    formazione_continua: education.formazione_continua || [],
    sintesi_percorso: education.sintesi_percorso || 'Non disponibile',
    ...education
  }

  // 6. LIFESTYLE/HOBBY MAPPING
  const hobby_final = {
    hobby_passioni: lifestyle.hobby_passioni || hobbyInteressi.hobby_passioni || [],
    interessi_principali: lifestyle.interessi_principali || hobbyInteressi.interessi_principali || [],
    attivita_ricorrenti: lifestyle.attivita_ricorrenti || hobbyInteressi.attivita_ricorrenti || [],
    brand_preferiti: lifestyle.brand_preferiti || hobbyInteressi.brand_preferiti || [],
    viaggi: lifestyle.viaggi || {},
    stile_vita: lifestyle.stile_vita || {},
    ...lifestyle,
    ...hobbyInteressi
  }

  // 7. WORK MODEL MAPPING
  const work_final = {
    orari_lavoro: workModel.orari_lavoro || {},
    metodo_lavoro: workModel.metodo_lavoro || {},
    ambiente_lavoro: workModel.ambiente_lavoro || {},
    modalita_lavoro: workModel.modalita_lavoro || {},
    strumenti_tecnologie: workModel.strumenti_tecnologie || [],
    ...workModel
  }

  // 8. VISION & GOALS MAPPING
  const vision_final = {
    obiettivi_professionali: vision.obiettivi_professionali || [],
    progetti_futuri: vision.progetti_futuri || [],
    aspirazioni_personali: vision.aspirazioni_personali || [],
    valori_fondamentali: vision.valori_fondamentali || [],
    mentalita: vision.mentalita || {},
    ...vision
  }

  // 9. NEEDS MAPPING
  const needs_final = {
    bisogni_identificati: needs.bisogni_identificati || [],
    opportunita: needs.opportunita || [],
    vulnerabilita: needs.vulnerabilita || [],
    priorita_intervento: needs.priorita_intervento || [],
    ...needs
  }

  // 10. ENGAGEMENT MAPPING
  const engagement_final = {
    leve_principali: engagement.leve_principali || [],
    messaggi_chiave: engagement.messaggi_chiave || [],
    momenti_ideali: engagement.momenti_ideali || [],
    canali_comunicazione: engagement.canali_comunicazione || [],
    ostacoli_potenziali: engagement.ostacoli_potenziali || [],
    ...engagement
  }

  // 11. AUTHORITY SIGNALS MAPPING (Updated to new schema)
  const authority_final = {
    livello_influenza: authoritySignals.livello_influenza || authoritySignals.influence_level || 'N/D',
    premi_certificazioni: authoritySignals.premi_certificazioni || [],
    pubblicazioni: authoritySignals.pubblicazioni || [],
    community_attive: authoritySignals.community_attive || [],
    riconoscimenti_pubblici: authoritySignals.riconoscimenti_pubblici || [],
    ...authoritySignals
  }

  // Calculate age
  const calculateAge = (birthDate: string): number | null => {
    if (!birthDate) return null
    try {
      const birth = new Date(birthDate)
      const today = new Date()
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }
      return age
    } catch {
      return null
    }
  }

  const age = target.data_nascita ? calculateAge(target.data_nascita) : (target.eta || target.age || null)

  // Utility functions
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    if (score >= 60) return 'text-blue-700 bg-blue-50 border-blue-200'
    if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-200'
    return 'text-red-700 bg-red-50 border-red-200'
  }

  const getScoreBgGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-green-500'
    if (score >= 60) return 'from-blue-500 to-cyan-500'
    if (score >= 40) return 'from-amber-500 to-yellow-500'
    return 'from-red-500 to-rose-500'
  }

  const getWealthColor = (level: string) => {
    const levelLower = level?.toLowerCase() || ''
    if (levelLower.includes('alta') || levelLower.includes('high')) return 'bg-emerald-100 text-emerald-800 border-emerald-300'
    if (levelLower.includes('media') || levelLower.includes('medium')) return 'bg-blue-100 text-blue-800 border-blue-300'
    return 'bg-slate-100 text-slate-800 border-slate-300'
  }

  const getPriorityColor = (priority: string) => {
    const p = priority?.toLowerCase() || ''
    if (p.includes('alta') || p.includes('high') || p.includes('urgente')) return 'bg-red-100 text-red-800 border-red-300'
    if (p.includes('media') || p.includes('medium')) return 'bg-amber-100 text-amber-800 border-amber-300'
    return 'bg-green-100 text-green-800 border-green-300'
  }

  return (
    <div className="space-y-6">
      {/* HEADER: Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={`border-2 shadow-lg ${getScoreColor(overallScore)}`}>
          <CardContent className="pt-8 pb-8">
            <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">
                    {identita.nome_completo || `${target.nome || profile.target?.nome || 'N/D'} ${target.cognome || profile.target?.cognome || 'N/D'}`}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-lg">
                    {age && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 opacity-70" />
                        <span className="font-medium">{age} anni</span>
                      </div>
                    )}
                    {(identita.citta_area || target.citta || profile.target?.citta) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 opacity-70" />
                        <span className="font-medium">{identita.citta_area || target.citta || profile.target?.citta}</span>
                      </div>
                    )}
                    {identita.settore_principale && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 opacity-70" />
                        <span className="font-medium">{identita.settore_principale}</span>
                      </div>
                    )}
                  </div>
                </div>

                {sintesiEsecutiva && (
                  <div className="mt-4 p-5 bg-white/60 backdrop-blur rounded-lg border-2 border-current/20">
                    <p className="text-base leading-relaxed font-medium">
                      {sintesiEsecutiva}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className={`relative w-40 h-40 rounded-2xl bg-gradient-to-br ${getScoreBgGradient(overallScore)} p-1 shadow-xl`}>
                  <div className="w-full h-full bg-white rounded-xl flex flex-col items-center justify-center">
                    <div className="text-sm font-semibold text-slate-600 mb-1">Quality Score</div>
                    <div className={`text-5xl font-black bg-gradient-to-br ${getScoreBgGradient(overallScore)} bg-clip-text text-transparent`}>
                      {overallScore}
                    </div>
                    <div className="text-sm text-slate-500 font-medium mt-1">/ 100</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* SECTION 1: Dashboard KPI (4 metriche chiave) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-slate-200 shadow-md bg-white">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
            <CardTitle className="flex items-center gap-3 text-slate-900">
              <BarChart3 className="h-6 w-6 text-slate-700" />
              <span className="text-xl font-bold">Dashboard KPI</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* KPI 1: Nucleo Familiare */}
              <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-5 w-5 text-pink-700" />
                  <Badge variant="outline" className="bg-pink-100 text-pink-800 border-pink-300 text-xs font-semibold">
                    Famiglia
                  </Badge>
                </div>
                <div className="text-2xl font-black text-pink-900">
                  {family_final.stato_civile || 'N/D'}
                </div>
                <div className="text-xs text-pink-700 font-medium mt-1">
                  Figli: {family_final.famiglia_attuale?.figli?.length || 0}
                </div>
              </div>

              {/* KPI 2: Professione */}
              <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <Briefcase className="h-5 w-5 text-purple-700" />
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 text-xs font-semibold">
                    Carriera
                  </Badge>
                </div>
                <div className="text-lg font-bold text-purple-900 leading-tight">
                  {career_final.posizione_attuale?.titolo || career_final.posizione_attuale?.ruolo || 'N/D'}
                </div>
                <div className="text-xs text-purple-700 font-medium mt-1">
                  {career_final.posizione_attuale?.azienda || 'N/D'}
                </div>
              </div>

              {/* KPI 3: Capacità Economica */}
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="h-5 w-5 text-emerald-700" />
                  <Badge variant="outline" className={`${getWealthColor(wealth_final.fascia_reddito_stimata || '')} text-xs font-semibold`}>
                    Wealth
                  </Badge>
                </div>
                <div className="text-2xl font-black text-emerald-900">
                  {formatEnumValue(wealth_final.capacita_spesa || wealth_final.fascia_reddito_stimata || 'MEDIA')}
                </div>
                <div className="text-xs text-emerald-700 font-medium mt-1">
                  {wealth_final.stabilita_finanziaria || 'N/D'}
                </div>
              </div>

              {/* KPI 4: Social Network */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <Globe className="h-5 w-5 text-blue-700" />
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 text-xs font-semibold">
                    Social
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {digitalPresence_final.profili_principali?.map((profilo: any, index: number) => {
                    const hasData = profilo.followers && profilo.followers > 0
                    return (
                      <div key={index} className={`flex items-center justify-between p-1.5 rounded ${hasData ? 'bg-blue-100/50' : 'bg-slate-50'}`}>
                        <span className={`text-xs font-medium ${hasData ? 'text-blue-800' : 'text-slate-500'}`}>
                          {profilo.piattaforma}
                        </span>
                        <span className={`text-sm font-black ${hasData ? 'text-blue-900' : 'text-slate-400'}`}>
                          {hasData ? profilo.followers.toLocaleString() : 'N/D'}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="text-xs text-blue-700 font-medium mt-2 pt-2 border-t border-blue-200">
                  Engagement: {digitalPresence_final.engagement_rate || 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* SECTION 2: Formazione & Segnali Autorità (2 col) - ✨ NUOVO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Formazione ed Educazione */}
          <Card className="border-slate-200 shadow-md bg-white">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b-2 border-orange-200">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <GraduationCap className="h-6 w-6 text-orange-700" />
                <span className="text-lg font-bold">Formazione ed Educazione</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-4">
                {/* Check if ANY education data exists */}
                {!education_final.titolo_studio_massimo?.livello &&
                 (!education_final.certificazioni || education_final.certificazioni.length === 0) &&
                 (!education_final.formazione_continua || education_final.formazione_continua.length === 0) ? (
                  // No data placeholder
                  <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg text-center">
                    <GraduationCap className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 font-medium mb-1">Dati non disponibili</p>
                    <p className="text-xs text-slate-500">Le informazioni sulla formazione non sono state trovate nei profili social analizzati.</p>
                  </div>
                ) : (
                  <>
                    {/* Titolo di Studio Massimo */}
                    {education_final.titolo_studio_massimo?.livello && (
                      <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                        <div className="text-xs font-semibold text-orange-700 mb-1">Titolo di Studio</div>
                        <div className="text-base font-bold text-orange-900 mb-1">{formatEnumValue(education_final.titolo_studio_massimo.livello)}</div>
                        {education_final.titolo_studio_massimo.campo_studio && (
                          <div className="text-sm text-slate-700">{education_final.titolo_studio_massimo.campo_studio}</div>
                        )}
                        {education_final.titolo_studio_massimo.istituto && (
                          <div className="text-xs text-slate-600 mt-1">{education_final.titolo_studio_massimo.istituto}</div>
                        )}
                      </div>
                    )}

                    {/* Certificazioni */}
                    {education_final.certificazioni && education_final.certificazioni.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-2">Certificazioni</h4>
                        <div className="flex flex-wrap gap-2">
                          {education_final.certificazioni.map((cert: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Formazione Continua */}
                    {education_final.formazione_continua && education_final.formazione_continua.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-2">Formazione Continua</h4>
                        <ul className="space-y-1">
                          {education_final.formazione_continua.map((corso: string, index: number) => (
                            <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                              <span>{corso}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right: Segnali di Autorità */}
          <Card className="border-slate-200 shadow-md bg-white">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b-2 border-yellow-200">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <Trophy className="h-6 w-6 text-yellow-700" />
                <span className="text-lg font-bold">Segnali di Autorità</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-4">
                {/* Check if ANY authority data exists */}
                {!authority_final.livello_influenza &&
                 (!authority_final.premi_certificazioni || authority_final.premi_certificazioni.length === 0) &&
                 (!authority_final.pubblicazioni || authority_final.pubblicazioni.length === 0) &&
                 (!authority_final.community_attive || authority_final.community_attive.length === 0) &&
                 (!authority_final.riconoscimenti_pubblici || authority_final.riconoscimenti_pubblici.length === 0) ? (
                  // No data placeholder
                  <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg text-center">
                    <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 font-medium mb-1">Dati non disponibili</p>
                    <p className="text-xs text-slate-500">Non sono stati identificati segnali di autorità o riconoscimenti pubblici nei profili analizzati.</p>
                  </div>
                ) : (
                  <>
                    {/* Livello Influenza */}
                    {authority_final.livello_influenza && authority_final.livello_influenza !== 'N/D' && (
                      <div className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-center">
                        <div className="text-xs font-semibold text-yellow-700 mb-1">Livello Influenza</div>
                        <div className="text-2xl font-black text-yellow-900">{formatEnumValue(authority_final.livello_influenza)}</div>
                      </div>
                    )}

                    {/* Premi & Certificazioni */}
                    {authority_final.premi_certificazioni && authority_final.premi_certificazioni.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-600" />
                          Premi & Certificazioni
                        </h4>
                        <div className="space-y-2">
                          {authority_final.premi_certificazioni.map((premio: any, index: number) => (
                            <div key={index} className="p-2 bg-yellow-50 border-l-4 border-yellow-500 rounded-r">
                              <p className="text-sm text-slate-800 font-bold">{premio.nome}</p>
                              <p className="text-xs text-slate-600">{premio.organizzazione} {premio.anno && `(${premio.anno})`}</p>
                              {premio.descrizione && <p className="text-xs text-slate-500 mt-1">{premio.descrizione}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pubblicazioni */}
                    {authority_final.pubblicazioni && authority_final.pubblicazioni.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-yellow-600" />
                          Pubblicazioni
                        </h4>
                        <ul className="space-y-2">
                          {authority_final.pubblicazioni.map((pub: any, index: number) => (
                            <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                              <Star className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                              <div>
                                <p className="font-medium">{pub.titolo}</p>
                                <p className="text-xs text-slate-500">
                                  {formatEnumValue(pub.tipo)} {pub.piattaforma && `• ${pub.piattaforma}`} {pub.anno && `• ${pub.anno}`}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Community Attive */}
                    {authority_final.community_attive && authority_final.community_attive.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-2">Community & Gruppi</h4>
                        <div className="space-y-2">
                          {authority_final.community_attive.map((comm: any, index: number) => (
                            <div key={index} className="p-2 bg-violet-50 border-l-4 border-violet-500 rounded-r">
                              <p className="text-sm text-slate-800 font-medium">{comm.nome}</p>
                              <p className="text-xs text-slate-600">
                                {formatEnumValue(comm.ruolo)} • {comm.piattaforma} • Engagement: {formatEnumValue(comm.engagement_level)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Riconoscimenti Pubblici */}
                    {authority_final.riconoscimenti_pubblici && authority_final.riconoscimenti_pubblici.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-red-600" />
                          Riconoscimenti Pubblici
                        </h4>
                        <div className="space-y-2">
                          {authority_final.riconoscimenti_pubblici.map((ric: any, index: number) => (
                            <div key={index} className="p-2 bg-red-50 border-l-4 border-red-500 rounded-r">
                              <p className="text-sm text-slate-800 font-medium">{ric.tipo}</p>
                              <p className="text-xs text-slate-600">{ric.descrizione}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* SECTION 3: Hobby & Modello Lavorativo (2 col) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Hobby & Interessi */}
          <Card className="border-slate-200 shadow-md bg-white">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b-2 border-pink-200">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <Heart className="h-6 w-6 text-pink-700" />
                <span className="text-lg font-bold">Hobby & Interessi</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-4">
                {/* Interessi Principali */}
                {hobby_final.interessi_principali && hobby_final.interessi_principali.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Interessi Principali</h4>
                    <div className="flex flex-wrap gap-2">
                      {hobby_final.interessi_principali.map((interesse: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-pink-50 text-pink-900 border-pink-300 text-xs font-semibold">
                          {interesse}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hobby & Passioni (con dettagli) */}
                {hobby_final.hobby_passioni && hobby_final.hobby_passioni.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Hobby & Passioni</h4>
                    <div className="space-y-2">
                      {hobby_final.hobby_passioni.slice(0, 4).map((hobby: any, index: number) => (
                        <div key={index} className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="bg-pink-100 text-pink-800 text-xs">
                              {hobby.categoria || 'N/D'}
                            </Badge>
                            <span className="text-xs text-slate-500">Frequenza: {hobby.frequenza || 'N/D'}</span>
                          </div>
                          <p className="text-sm text-slate-800 font-medium">{hobby.descrizione || 'N/D'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brand Preferiti */}
                {hobby_final.brand_preferiti && hobby_final.brand_preferiti.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Brand Preferiti</h4>
                    <div className="flex flex-wrap gap-2">
                      {hobby_final.brand_preferiti.map((brand: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-rose-50 text-rose-900 border-rose-300 text-xs">
                          {brand}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stile di Vita */}
                {hobby_final.stile_vita?.descrizione && (
                  <div className="p-3 bg-pink-50 border-l-4 border-pink-500 rounded-r-lg">
                    <h4 className="text-xs font-bold text-pink-900 mb-1">Stile di Vita: {hobby_final.stile_vita.tipo || 'N/D'}</h4>
                    <p className="text-sm text-slate-800">{hobby_final.stile_vita.descrizione}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right: Modello Lavorativo */}
          <Card className="border-slate-200 shadow-md bg-white">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b-2 border-purple-200">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <Clock className="h-6 w-6 text-purple-700" />
                <span className="text-lg font-bold">Modello Lavorativo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-2 gap-3">
                {/* Orari Lavoro */}
                <div className="col-span-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="text-xs text-purple-700 font-semibold mb-1">Orari</div>
                  <div className="text-base font-bold text-purple-900">{work_final.orari_lavoro?.tipo || 'N/D'}</div>
                  <p className="text-xs text-slate-600 mt-1">{work_final.orari_lavoro?.descrizione}</p>
                  <div className="text-xs text-purple-700 mt-2">Work-Life Balance: <span className="font-bold">{formatEnumValue(work_final.orari_lavoro?.work_life_balance) || 'N/D'}</span></div>
                </div>

                {/* Metodo Lavoro */}
                {work_final.metodo_lavoro && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="text-xs text-purple-700 font-semibold mb-1">Approccio</div>
                    <div className="text-base font-bold text-purple-900">{work_final.metodo_lavoro.approccio || 'N/D'}</div>
                    <div className="text-xs text-slate-600 mt-1">Collaborazione: {work_final.metodo_lavoro.collaborazione || 'N/D'}</div>
                  </div>
                )}

                {/* Modalità Lavoro */}
                {work_final.modalita_lavoro && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="text-xs text-purple-700 font-semibold mb-1">Modalità</div>
                    <div className="text-base font-bold text-purple-900">{formatEnumValue(work_final.modalita_lavoro.tipo) || 'N/D'}</div>
                    <div className="text-xs text-slate-600 mt-1">Flessibilità: {formatEnumValue(work_final.modalita_lavoro.flessibilita) || 'N/D'}</div>
                  </div>
                )}

                {/* Ambiente Lavoro */}
                {work_final.ambiente_lavoro && (
                  <div className="col-span-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="text-xs text-purple-700 font-semibold mb-1">Ambiente</div>
                    <div className="text-sm font-bold text-purple-900">{work_final.ambiente_lavoro.tipo || 'N/D'}</div>
                    <p className="text-xs text-slate-600 mt-1">{work_final.ambiente_lavoro.descrizione}</p>
                    {work_final.ambiente_lavoro.team_size && (
                      <div className="text-xs text-purple-700 mt-2">Team Size: <span className="font-bold">{work_final.ambiente_lavoro.team_size}</span></div>
                    )}
                  </div>
                )}

                {/* Strumenti & Tecnologie */}
                {work_final.strumenti_tecnologie && work_final.strumenti_tecnologie.length > 0 && (
                  <div className="col-span-2">
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Strumenti & Tecnologie</h4>
                    <div className="flex flex-wrap gap-2">
                      {work_final.strumenti_tecnologie.map((tool: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-purple-50 text-purple-900 border-purple-300 text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* SECTION 4: Visione Obiettivi & Stile Vita (2 col) - ✨ NUOVO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Visione e Obiettivi */}
          <Card className="border-slate-200 shadow-md bg-white">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <Lightbulb className="h-6 w-6 text-indigo-700" />
                <span className="text-lg font-bold">Visione e Obiettivi</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-4">
                {/* Obiettivi Professionali */}
                {vision_final.obiettivi_professionali && vision_final.obiettivi_professionali.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Obiettivi Professionali</h4>
                    <div className="space-y-2">
                      {vision_final.obiettivi_professionali.map((obiettivo: any, index: number) => (
                        <div key={index} className="p-3 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={`text-xs ${obiettivo.priorita === 'alta' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                              {obiettivo.termine || 'N/D'}
                            </Badge>
                            <Badge variant="outline" className="bg-indigo-100 text-indigo-800 text-xs">
                              Priorità: {obiettivo.priorita || 'N/D'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-800 font-medium">{obiettivo.obiettivo || 'N/D'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progetti Futuri */}
                {vision_final.progetti_futuri && vision_final.progetti_futuri.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Progetti Futuri</h4>
                    <div className="space-y-2">
                      {vision_final.progetti_futuri.map((progetto: any, index: number) => (
                        <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="bg-purple-100 text-purple-800 text-xs">
                              {progetto.stato || 'N/D'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-800 font-medium">{progetto.progetto || 'N/D'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aspirazioni Personali */}
                {vision_final.aspirazioni_personali && vision_final.aspirazioni_personali.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Aspirazioni Personali</h4>
                    <ul className="space-y-1.5">
                      {vision_final.aspirazioni_personali.map((aspirazione: any, index: number) => (
                        <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                          <Target className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                          <div>
                            <Badge variant="outline" className="bg-teal-100 text-teal-800 text-xs mb-1">
                              {aspirazione.categoria || 'N/D'}
                            </Badge>
                            <p className="text-sm">{aspirazione.aspirazione || 'N/D'}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Valori Fondamentali */}
                {vision_final.valori_fondamentali && vision_final.valori_fondamentali.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Valori Fondamentali</h4>
                    <div className="space-y-2">
                      {vision_final.valori_fondamentali.map((valore: any, index: number) => (
                        <div key={index} className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                          <p className="text-sm font-bold text-indigo-900 mb-1">{valore.valore || 'N/D'}</p>
                          <p className="text-xs text-slate-600">{valore.descrizione || 'N/D'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right: Stile di Vita */}
          <Card className="border-slate-200 shadow-md bg-white">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b-2 border-teal-200">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <Eye className="h-6 w-6 text-teal-700" />
                <span className="text-lg font-bold">Stile di Vita</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-4">
                {/* Attività Ricorrenti */}
                {hobby_final.attivita_ricorrenti && hobby_final.attivita_ricorrenti.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Attività Ricorrenti</h4>
                    <ul className="space-y-1.5">
                      {hobby_final.attivita_ricorrenti.map((attivita: string, index: number) => (
                        <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-teal-600 mt-0.5 font-bold">•</span>
                          <span>{attivita}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Viaggi */}
                {hobby_final.viaggi && hobby_final.viaggi.destinazioni_preferite && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Viaggi</h4>
                    <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-teal-100 text-teal-800 text-xs">
                          Frequenza: {hobby_final.viaggi.frequenza || 'N/D'}
                        </Badge>
                        <Badge variant="outline" className="bg-cyan-100 text-cyan-800 text-xs">
                          Tipo: {hobby_final.viaggi.tipo_viaggio || 'N/D'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 font-semibold mb-1">Destinazioni preferite:</p>
                      <div className="flex flex-wrap gap-1">
                        {hobby_final.viaggi.destinazioni_preferite.map((dest: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-white text-teal-900 border-teal-300 text-xs">
                            {dest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Valori Espressi (da vision) */}
                {vision_final.valori_fondamentali && vision_final.valori_fondamentali.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Valori Espressi</h4>
                    <div className="space-y-2">
                      {vision_final.valori_fondamentali.map((item: any, index: number) => {
                        const valoreText = typeof item === 'string' ? item : (item.valore || item.descrizione || 'N/D')
                        const evidenza = typeof item === 'object' ? item.evidenza : null

                        return (
                          <div key={index} className="p-2 bg-teal-50 border-l-4 border-teal-500 rounded-r">
                            <p className="text-sm text-slate-800 font-medium">{valoreText}</p>
                            {evidenza && (
                              <p className="text-xs text-slate-600 mt-1 italic">{evidenza}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Eventi Vita Potenziali */}
                {lifestyle.eventi_vita_potenziali && lifestyle.eventi_vita_potenziali.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Eventi Vita Potenziali</h4>
                    <div className="flex flex-wrap gap-2">
                      {lifestyle.eventi_vita_potenziali.map((evento: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-cyan-50 text-cyan-900 border-cyan-300 text-xs">
                          {evento}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* SECTION 5: Mappatura Bisogni (full width) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="border-slate-200 shadow-md bg-white">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-200">
            <CardTitle className="flex items-center gap-3 text-slate-900">
              <Target className="h-6 w-6 text-amber-700" />
              <span className="text-xl font-bold">Mappatura Bisogni</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Bisogni Identificati (con categoria) */}
            {needs_final.bisogni_identificati && needs_final.bisogni_identificati.length > 0 && (
              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Bisogni Identificati</h4>
                <div className="space-y-3">
                  {needs_final.bisogni_identificati.map((bisogno: any, index: number) => (
                    <div key={index} className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`text-xs ${bisogno.priorita === 'alta' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                          {bisogno.categoria || 'N/D'}
                        </Badge>
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 text-xs">
                          Priorità: {bisogno.priorita || 'N/D'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-800 font-bold mb-1">{bisogno.bisogno || 'N/D'}</p>
                      {bisogno.gap_attuale && (
                        <p className="text-xs text-slate-600 italic">Gap attuale: {bisogno.gap_attuale}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Opportunità & Vulnerabilità */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Opportunità */}
              {needs_final.opportunita && needs_final.opportunita.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Opportunità</h4>
                  <div className="space-y-2">
                    {needs_final.opportunita.map((opp: any, index: number) => (
                      <div key={index} className="p-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                            {opp.timing || 'N/D'}
                          </Badge>
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-800 text-xs">
                            Potenziale: {opp.potenziale || 'N/D'}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-800 font-bold">{opp.tipo || 'N/D'}</p>
                        <p className="text-xs text-slate-600 mt-1">{opp.descrizione}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vulnerabilità */}
              {needs_final.vulnerabilita && needs_final.vulnerabilita.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Vulnerabilità</h4>
                  <div className="space-y-2">
                    {needs_final.vulnerabilita.map((vuln: any, index: number) => (
                      <div key={index} className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={`text-xs ${vuln.impatto === 'alto' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                            Impatto: {vuln.impatto || 'N/D'}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-800 font-bold">{vuln.area || 'N/D'}</p>
                        <p className="text-xs text-slate-600 mt-1">{vuln.descrizione}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Priorità Intervento */}
            {needs_final.priorita_intervento && needs_final.priorita_intervento.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Priorità di Intervento</h4>
                <div className="grid md:grid-cols-3 gap-3">
                  {needs_final.priorita_intervento.map((priorita: any, index: number) => (
                    <div key={index} className={`p-4 border-2 rounded-lg ${priorita.urgenza === 'alta' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                      <h5 className={`text-sm font-bold mb-2 ${priorita.urgenza === 'alta' ? 'text-red-900' : 'text-amber-900'}`}>
                        {priorita.area || 'N/D'}
                      </h5>
                      <Badge variant="outline" className={`text-xs mb-2 ${priorita.urgenza === 'alta' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        Urgenza: {priorita.urgenza || 'N/D'}
                      </Badge>
                      <p className="text-xs text-slate-700 mt-2">{priorita.motivazione}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* SECTION 6: Strategia Ingaggio (full width) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="border-slate-200 shadow-md bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200">
            <CardTitle className="flex items-center gap-3 text-slate-900">
              <Zap className="h-6 w-6 text-blue-700" />
              <span className="text-xl font-bold">Strategia di Ingaggio</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Leve Principali */}
            {engagement_final.leve_principali && engagement_final.leve_principali.length > 0 && (
              <div className="mb-6 space-y-3">
                <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Leve di Ingaggio</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {engagement_final.leve_principali.map((leva: any, index: number) => (
                    <div key={index} className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">
                          {leva.categoria || 'N/D'}
                        </Badge>
                        <Badge variant="outline" className="bg-cyan-100 text-cyan-800 text-xs">
                          Efficacia: {leva.efficacia || 'N/D'}
                        </Badge>
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 mb-1">{leva.leva || leva.titolo || 'N/D'}</h5>
                      <p className="text-xs text-slate-700 mb-2">{leva.descrizione}</p>
                      {leva.come_usarla && (
                        <p className="text-xs text-blue-700 italic">💡 {leva.come_usarla}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messaggi Chiave */}
            {engagement_final.messaggi_chiave && engagement_final.messaggi_chiave.length > 0 && (
              <div className="mb-6 space-y-3">
                <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Messaggi Chiave</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {engagement_final.messaggi_chiave.map((messaggio: any, index: number) => {
                    const messaggioText = typeof messaggio === 'string'
                      ? messaggio
                      : (messaggio.messaggio || messaggio.message || 'N/D')
                    const tono = typeof messaggio === 'object' ? messaggio.tono : null
                    const target_bisogno = typeof messaggio === 'object' ? messaggio.target_bisogno : null

                    return (
                      <div key={index} className="p-4 bg-cyan-50 border-l-4 border-cyan-500 rounded-r-lg">
                        {tono && (
                          <Badge variant="outline" className="bg-cyan-100 text-cyan-800 text-xs mb-2">
                            {tono}
                          </Badge>
                        )}
                        <p className="text-sm text-slate-800 font-medium mb-1">"{messaggioText}"</p>
                        {target_bisogno && (
                          <p className="text-xs text-slate-600 italic">Target: {target_bisogno}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              {/* Momenti Ideali */}
              {engagement_final.momenti_ideali && engagement_final.momenti_ideali.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Momenti Ideali</h4>
                  <div className="space-y-2">
                    {engagement_final.momenti_ideali.map((momento: any, index: number) => {
                      const momentoText = typeof momento === 'string'
                        ? momento
                        : (momento.momento || 'N/D')
                      const tipo = typeof momento === 'object' ? momento.tipo : null
                      const finestra = typeof momento === 'object' ? momento.finestra_temporale : null

                      return (
                        <div key={index} className="p-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                          {tipo && (
                            <Badge variant="outline" className="bg-green-100 text-green-800 text-xs mb-1">
                              {tipo}
                            </Badge>
                          )}
                          <p className="text-xs text-slate-800 font-medium">{momentoText}</p>
                          {finestra && (
                            <p className="text-xs text-slate-600 mt-1">⏰ {finestra}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Canali Comunicazione */}
              {engagement_final.canali_comunicazione && engagement_final.canali_comunicazione.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Canali Preferiti</h4>
                  <div className="space-y-2">
                    {engagement_final.canali_comunicazione.map((canale: any, index: number) => {
                      const canaleNome = typeof canale === 'object' ? (canale.canale || 'N/D') : canale
                      const efficacia = typeof canale === 'object' ? canale.efficacia : null
                      const frequenza = typeof canale === 'object' ? canale.frequenza_consigliata : null

                      return (
                        <div key={index} className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-slate-900">{canaleNome}</span>
                            {efficacia && (
                              <Badge variant="outline" className="bg-purple-100 text-purple-800 text-xs">
                                {efficacia}
                              </Badge>
                            )}
                          </div>
                          {frequenza && (
                            <p className="text-xs text-slate-600">Frequenza: {frequenza}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Ostacoli Potenziali */}
              {engagement_final.ostacoli_potenziali && engagement_final.ostacoli_potenziali.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Ostacoli da Superare</h4>
                  <div className="space-y-2">
                    {engagement_final.ostacoli_potenziali.map((ostacolo: any, index: number) => (
                      <div key={index} className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={`text-xs ${ostacolo.probabilita === 'alta' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                            {ostacolo.probabilita || 'N/D'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-800 font-bold mb-1">{ostacolo.ostacolo || 'N/D'}</p>
                        <p className="text-xs text-slate-600">✅ {ostacolo.strategia_superamento}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* SECTION 7: Piano di Contatto - ✨ NUOVO */}
      {(contactPlan.strategia || contactPlan.follow_up || contactPlan.checklist_privacy) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="border-slate-200 shadow-md bg-white">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <PhoneCall className="h-6 w-6 text-green-700" />
                <span className="text-xl font-bold">Piano di Contatto</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Strategia */}
                <div className="space-y-4">
                  {contactPlan.strategia && (
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                      <h4 className="text-sm font-bold text-green-900 mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Strategia di Contatto
                      </h4>
                      <p className="text-sm text-slate-800 leading-relaxed">{contactPlan.strategia}</p>
                    </div>
                  )}

                  {/* Follow-up */}
                  {contactPlan.follow_up && contactPlan.follow_up.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <Send className="h-4 w-4 text-green-600" />
                        Follow-up Plan
                      </h4>
                      <div className="space-y-2">
                        {contactPlan.follow_up.map((step: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                            <div className="w-6 h-6 rounded-full bg-green-200 text-green-900 flex items-center justify-center text-xs font-bold shrink-0">
                              {index + 1}
                            </div>
                            <p className="text-sm text-slate-800">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Checklist Privacy */}
                <div className="space-y-4">
                  {contactPlan.checklist_privacy && contactPlan.checklist_privacy.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        Checklist Privacy & Compliance
                      </h4>
                      <div className="space-y-2">
                        {contactPlan.checklist_privacy.map((item: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                            <span className="text-sm text-slate-800">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* SECTION 8: Analisi Visuale Instagram */}
      {visualSources?.post_instagram && visualSources.post_instagram.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="border-slate-200 shadow-md bg-white">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <ImageIcon className="h-6 w-6 text-purple-700" />
                <span className="text-xl font-bold">Analisi Visuale Social</span>
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 text-xs font-semibold ml-auto">
                  {visualSources.post_instagram.length} post analizzati
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {visualSources.post_instagram.slice(0, 10).map((post: any, index: number) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 shadow-sm group">
                    {post.url ? (
                      <div className="relative w-full h-full bg-slate-100">
                        <Image
                          src={post.url}
                          alt={`Post ${index + 1}`}
                          fill
                          className="object-cover brightness-110 contrast-105 group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                        {post.caption && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                            <p className="text-white text-xs font-semibold line-clamp-3 leading-tight">
                              {post.caption.substring(0, 80)}...
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-slate-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {visualSources.insights_visuali && (
                <div className="mt-6 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
                  <h4 className="text-sm font-bold text-purple-900 mb-3">Insights Visuali Estratti</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    {visualSources.insights_visuali.luoghi && visualSources.insights_visuali.luoghi.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-purple-700 block mb-1">Luoghi Identificati:</span>
                        <div className="flex flex-wrap gap-1">
                          {visualSources.insights_visuali.luoghi.slice(0, 5).map((luogo: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-purple-100 text-purple-900 border-purple-300 text-xs">
                              {luogo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {visualSources.insights_visuali.brand && visualSources.insights_visuali.brand.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-purple-700 block mb-1">Brand Visibili:</span>
                        <div className="flex flex-wrap gap-1">
                          {visualSources.insights_visuali.brand.slice(0, 5).map((brand: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-pink-100 text-pink-900 border-pink-300 text-xs">
                              {brand}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {visualSources.insights_visuali.oggetti && visualSources.insights_visuali.oggetti.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-purple-700 block mb-1">Oggetti Ricorrenti:</span>
                        <div className="flex flex-wrap gap-1">
                          {visualSources.insights_visuali.oggetti.slice(0, 5).map((oggetto: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-indigo-100 text-indigo-900 border-indigo-300 text-xs">
                              {oggetto}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* SECTION 9: Raccomandazioni Prodotti */}
      {products && products.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Card className="border-slate-200 shadow-md bg-white">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b-2 border-indigo-200">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <ShoppingCart className="h-6 w-6 text-indigo-700" />
                <span className="text-xl font-bold">Raccomandazioni Prodotti</span>
                <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300 text-xs font-semibold ml-auto">
                  {products.length} prodotti consigliati
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid md:grid-cols-3 gap-4">
                {products.slice(0, 9).map((prodotto: any, index: number) => {
                  const nome = prodotto.prodotto || prodotto.nome_prodotto || prodotto.product_name || 'N/D'
                  const categoria = prodotto.categoria || prodotto.category || 'N/D'
                  const priorita = prodotto.priorita || prodotto.priority || 'media'
                  const motivazione = prodotto.motivazione || prodotto.motivo_raccomandazione || prodotto.reason || ''

                  return (
                    <div key={index} className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-base font-bold text-indigo-900 leading-tight">{nome}</h4>
                        <Badge variant="outline" className={`${getPriorityColor(priorita)} text-xs font-bold shrink-0`}>
                          {priorita}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="mb-2 bg-white text-indigo-800 border-indigo-300 text-xs">
                        {categoria}
                      </Badge>
                      {motivazione && (
                        <p className="text-xs text-slate-700 leading-relaxed mt-2">{motivazione}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
