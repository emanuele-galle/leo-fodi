/**
 * OSINT Multi-Agent Orchestrator
 * Coordina l'esecuzione di tutti gli agent in fasi ottimizzate
 */

// Import V2 Agents (with Reflect Loop for quality)
import {
  FamilyInvestigatorAgentV2,
  CareerAnalyzerAgentV2,
  EducationProfilerAgentV2,
  LifestyleAnalystAgentV2,
  WealthEstimatorAgentV2,
  SocialGraphBuilderAgentV2,
  ContentAnalyzerAgentV2,
  AuthoritySignalsAnalyzerAgentV2,
  WorkModelAnalyzerAgentV2,
  VisionGoalsAnalystAgentV2,
  NeedsMapperAgentV2,
  EngagementStrategistAgentV2,
} from './agents'

import type {
  ProfilingTarget,
  CompleteOSINTProfile,
  OrchestrationPlan,
  AgentContext,
} from './types'

import { DataGatheringCoordinator } from '../scraping/data-gathering-coordinator'
import type { RawOSINTData } from '../scraping/types'
import {
  analyzeDataCompleteness,
  getAdaptiveSearchStrategy,
  getEnrichmentPrompt,
  logSearchStrategy,
} from './adaptive-search-strategy'

export class OSINTOrchestrator {
  private agents: Map<string, any> = new Map()
  private dataGathering: DataGatheringCoordinator

  constructor() {
    // Inizializza Data Gathering Coordinator
    this.dataGathering = new DataGatheringCoordinator()

    // Inizializza tutti gli agent V2 (with Reflect Loop)
    this.agents.set('family', new FamilyInvestigatorAgentV2())
    this.agents.set('career', new CareerAnalyzerAgentV2())
    this.agents.set('education', new EducationProfilerAgentV2())
    this.agents.set('lifestyle', new LifestyleAnalystAgentV2())
    this.agents.set('wealth', new WealthEstimatorAgentV2())
    this.agents.set('social', new SocialGraphBuilderAgentV2())
    this.agents.set('content', new ContentAnalyzerAgentV2())

    // Advanced Agents V2 (Sezioni 8-13)
    this.agents.set('authority_signals', new AuthoritySignalsAnalyzerAgentV2())
    this.agents.set('work_model', new WorkModelAnalyzerAgentV2())
    this.agents.set('vision_goals', new VisionGoalsAnalystAgentV2())
    this.agents.set('needs_mapping', new NeedsMapperAgentV2())
    this.agents.set('engagement', new EngagementStrategistAgentV2())

    console.log('✅ [ORCHESTRATOR] All 12 agents initialized with V2 (7 base + 5 advanced)')
  }

  /**
   * Esegue profilazione OSINT completa su un target
   */
  async profileTarget(target: ProfilingTarget): Promise<CompleteOSINTProfile> {
    const startTime = Date.now()

    console.log(`\n🎯 [ORCHESTRATOR] Starting OSINT profiling for: ${target.nome} ${target.cognome}`)
    console.log(`📋 [ORCHESTRATOR] Consent verified: ${target.consenso_profilazione}`)

    if (!target.consenso_profilazione) {
      throw new Error('Consenso profilazione mancante - operazione non autorizzata')
    }

    const profile: Partial<CompleteOSINTProfile> = {
      target,
      agent_utilizzati: [],
      errori: [],
    }

    try {
      // ========== FASE 0: Data Gathering (Web Scraping) ==========
      console.log('\n🌐 [PHASE 0] Data Gathering - WEB SCRAPING')
      let rawData: RawOSINTData | null = null

      try {
        rawData = await this.dataGathering.gatherData(target)

        const stats = this.dataGathering.getStats(rawData)
        console.log(`   - Sources scraped: ${stats.fonti_successo}/${stats.fonti_totali}`)
        console.log(`   - Success rate: ${stats.tasso_successo}%`)

        // ✅ ADAPTIVE SEARCH STRATEGY - Analyze data completeness
        const completeness = analyzeDataCompleteness(rawData)
        const searchStrategy = getAdaptiveSearchStrategy(completeness.level, 'orchestrator')

        console.log('\n🎯 [AdaptiveSearch] Data Completeness Analysis:')
        console.log(`   - Level: ${completeness.level} (${completeness.score}%)`)
        console.log(`   - Missing fields: ${completeness.missingFields.length}`)
        console.log(`   - Strategy: ${searchStrategy.priority} priority`)
        console.log(`   - XAI Live Search: ${searchStrategy.searchParameters.mode} mode, max ${searchStrategy.searchParameters.max_search_results} results`)

        if (completeness.suggestions.length > 0) {
          console.log(`   - Suggestions:`)
          completeness.suggestions.forEach(s => console.log(`     • ${s}`))
        }

        // ✅ Generate enrichment prompt with email/phone if available
        const contactInfo = {
          email: target.email,
          phone: target.phone,
        }
        const enrichmentPrompt = getEnrichmentPrompt(
          completeness.missingFields,
          completeness.suggestions,
          contactInfo
        )

        if (enrichmentPrompt) {
          console.log('\n📧 [AdaptiveSearch] Contact info available - enrichment prompt generated')
          if (target.email) console.log(`   - Email: ${target.email}`)
          if (target.phone) console.log(`   - Phone: ${target.phone}`)
        }

        // Store search strategy and enrichment prompt in shared context for agents
        ;(rawData as any)._adaptiveSearchStrategy = searchStrategy
        ;(rawData as any)._enrichmentPrompt = enrichmentPrompt

        // Aggiungi raw data al context condiviso per gli agenti
        profile.agent_utilizzati!.push('data_gathering')
      } catch (error) {
        console.error('❌ [PHASE 0] Data Gathering failed:', error)
        profile.errori!.push({
          agent: 'data_gathering',
          errore: error instanceof Error ? error.message : 'Unknown error',
        })
      }

      // ========== DATA INTEGRITY CHECK ==========
      // Verifica che i dati bio non vengano persi nel passaggio agli agent
      if (rawData?.linkedin_data) {
        const bio = rawData.linkedin_data.about || rawData.linkedin_data.summary || ''
        if (bio) {
          console.log(`\n🔍 [DATA CHECK] LinkedIn bio available: ${bio.length} chars`)
          console.log(`   Preview: ${bio.substring(0, 150)}...`)
        } else {
          console.warn(`⚠️  [DATA CHECK] LinkedIn bio NOT found in rawData`)
        }
      }

      // ========== FASE 1: Ricerca Base Parallela ==========
      console.log('\n📍 [PHASE 1] Base Research (Family, Career, Education) - PARALLEL')
      const phase1Results = await this.executePhase1(target, rawData)

      profile.family = phase1Results.family.success ? phase1Results.family.data : null
      profile.career = phase1Results.career.success ? phase1Results.career.data : null
      profile.education = phase1Results.education.success ? phase1Results.education.data : null

      if (phase1Results.family.success) profile.agent_utilizzati!.push('family')
      if (phase1Results.career.success) profile.agent_utilizzati!.push('career')
      if (phase1Results.education.success) profile.agent_utilizzati!.push('education')

      // Aggiungi errori
      if (!phase1Results.family.success) {
        profile.errori!.push({ agent: 'family', errore: phase1Results.family.error || 'Unknown' })
      }
      if (!phase1Results.career.success) {
        profile.errori!.push({ agent: 'career', errore: phase1Results.career.error || 'Unknown' })
      }
      if (!phase1Results.education.success) {
        profile.errori!.push({ agent: 'education', errore: phase1Results.education.error || 'Unknown' })
      }

      // ========== FASE 2: Lifestyle Analysis ==========
      console.log('\n🎨 [PHASE 2] Lifestyle Analysis - SEQUENTIAL')
      const phase2Result = await this.executePhase2(target, profile, rawData)

      profile.lifestyle = phase2Result.success ? phase2Result.data : null
      if (phase2Result.success) {
        profile.agent_utilizzati!.push('lifestyle')
      } else {
        profile.errori!.push({ agent: 'lifestyle', errore: phase2Result.error || 'Unknown' })
      }

      // ========== FASE 3: Advanced Analysis Parallela ==========
      console.log('\n💰 [PHASE 3] Advanced Analysis (Wealth, Social Graph) - PARALLEL')
      const phase3Results = await this.executePhase3(target, profile, rawData)

      profile.wealth = phase3Results.wealth.success ? phase3Results.wealth.data : null
      profile.social_graph = phase3Results.social.success ? phase3Results.social.data : null

      if (phase3Results.wealth.success) profile.agent_utilizzati!.push('wealth')
      if (phase3Results.social.success) profile.agent_utilizzati!.push('social')

      if (!phase3Results.wealth.success) {
        profile.errori!.push({ agent: 'wealth', errore: phase3Results.wealth.error || 'Unknown' })
      }
      if (!phase3Results.social.success) {
        profile.errori!.push({ agent: 'social', errore: phase3Results.social.error || 'Unknown' })
      }

      // ========== FASE 4: Content Deep Dive ==========
      console.log('\n📸 [PHASE 4] Content Analysis - SEQUENTIAL')
      const phase4Result = await this.executePhase4(target, profile, rawData)

      profile.content_analysis = phase4Result.success ? phase4Result.data : null
      if (phase4Result.success) {
        profile.agent_utilizzati!.push('content')
      } else {
        profile.errori!.push({ agent: 'content', errore: phase4Result.error || 'Unknown' })
      }

      // ========== FASE 4B: Authority Signals Analysis - SEQUENTIAL ==========
      console.log('\n🏆 [PHASE 4B] Authority Signals Analysis - SEQUENTIAL')
      const context = {
        target,
        previous_results: profile,
        shared_memory: { raw_data: rawData },
      }
      const authorityResult = await this.agents.get('authority_signals')!.execute(context)

      profile.authority_signals = authorityResult.success ? authorityResult.data : null
      if (authorityResult.success) {
        profile.agent_utilizzati!.push('authority_signals')
      } else {
        profile.errori!.push({ agent: 'authority_signals', errore: authorityResult.error || 'Unknown' })
      }

      // ========== FASE 5: Advanced Analysis (Work Model, Vision/Goals) - PARALLEL ==========
      console.log('\n🚀 [PHASE 5] Advanced Analysis (Work Model, Vision) - PARALLEL')
      const phase5Results = await this.executePhase5(target, profile, rawData)

      profile.work_model = phase5Results.work_model.success ? phase5Results.work_model.data : null
      profile.vision_goals = phase5Results.vision_goals.success ? phase5Results.vision_goals.data : null

      if (phase5Results.work_model.success) profile.agent_utilizzati!.push('work_model')
      if (phase5Results.vision_goals.success) profile.agent_utilizzati!.push('vision_goals')

      if (!phase5Results.work_model.success) {
        profile.errori!.push({ agent: 'work_model', errore: phase5Results.work_model.error || 'Unknown' })
      }
      if (!phase5Results.vision_goals.success) {
        profile.errori!.push({ agent: 'vision_goals', errore: phase5Results.vision_goals.error || 'Unknown' })
      }

      // ========== FASE 6: Strategic Analysis (Needs, Engagement) - SEQUENTIAL ==========
      console.log('\n🎯 [PHASE 6] Strategic Analysis (Needs, Engagement) - SEQUENTIAL')
      const phase6Results = await this.executePhase6(target, profile)

      profile.needs_mapping = phase6Results.needs_mapping.success ? phase6Results.needs_mapping.data : null
      profile.engagement = phase6Results.engagement.success ? phase6Results.engagement.data : null

      if (phase6Results.needs_mapping.success) profile.agent_utilizzati!.push('needs_mapping')
      if (phase6Results.engagement.success) profile.agent_utilizzati!.push('engagement')

      if (!phase6Results.needs_mapping.success) {
        profile.errori!.push({ agent: 'needs_mapping', errore: phase6Results.needs_mapping.error || 'Unknown' })
      }
      if (!phase6Results.engagement.success) {
        profile.errori!.push({ agent: 'engagement', errore: phase6Results.engagement.error || 'Unknown' })
      }

      // ========== FASE 7: Sintesi Finale ==========
      console.log('\n📝 [PHASE 7] Executive Summary Generation')
      const sintesi = await this.generateExecutiveSummary(profile as CompleteOSINTProfile)

      const executionTime = Date.now() - startTime

      const completeProfile: CompleteOSINTProfile = {
        ...profile as any,
        rawData: rawData, // ✅ SAVE RAW DATA for future reference and debugging
        sintesi_esecutiva: sintesi,
        punteggio_complessivo: this.calculateOverallScore(profile as CompleteOSINTProfile),
        completezza_profilo: this.calculateCompleteness(profile as CompleteOSINTProfile),
        data_profilazione: new Date().toISOString(),
        tempo_elaborazione_ms: executionTime,
      }

      console.log(`\n✅ [ORCHESTRATOR] Profiling completed in ${(executionTime / 1000).toFixed(2)}s`)
      console.log(`   - Agents used: ${completeProfile.agent_utilizzati.length}/11 (7 base + 4 advanced)`)
      console.log(`   - Overall score: ${completeProfile.punteggio_complessivo}/100`)
      console.log(`   - Completeness: ${completeProfile.completezza_profilo}%`)
      console.log(`   - Errors: ${completeProfile.errori.length}`)

      return completeProfile

    } catch (error) {
      console.error('[ORCHESTRATOR] ❌ Fatal error during profiling:', error)
      throw error
    }
  }

  /**
   * FASE 1: Family, Career, Education (paralleli)
   */
  private async executePhase1(target: ProfilingTarget, rawData: RawOSINTData | null) {
    // ⭐ LOGGING: Verify bio AND experience descriptions are passed to agents
    if (rawData?.linkedin_data) {
      const bio = rawData.linkedin_data.about || rawData.linkedin_data.summary || ''
      const experiencesWithDesc = rawData.linkedin_data.esperienze?.filter(exp => exp.descrizione && exp.descrizione.length > 50) || []
      const totalDescChars = rawData.linkedin_data.esperienze?.reduce((sum, exp) => sum + (exp.descrizione?.length || 0), 0) || 0

      console.log(`[Phase1] Passing LinkedIn data to agents:`)
      console.log(`   - Bio available: ${bio ? 'YES (' + bio.length + ' chars)' : 'NO'}`)
      console.log(`   - Experience: ${rawData.linkedin_data.esperienze?.length || 0} roles`)
      console.log(`     └─ With descriptions: ${experiencesWithDesc.length}/${rawData.linkedin_data.esperienze?.length || 0} (${totalDescChars.toLocaleString()} chars total)`)
      console.log(`   - Education: ${rawData.linkedin_data.formazione?.length || 0} schools`)
    }

    const context: AgentContext = {
      target,
      shared_memory: {
        raw_data: rawData, // Passa raw data agli agenti
      },
    }

    const [familyResult, careerResult, educationResult] = await Promise.allSettled([
      this.agents.get('family').execute(context),
      this.agents.get('career').execute(context),
      this.agents.get('education').execute(context),
    ])

    // Check minimum success threshold
    const successCount = [familyResult, careerResult, educationResult]
      .filter(r => r.status === 'fulfilled').length

    if (successCount < 2) {
      // At least 2 out of 3 agents must succeed
      const errors = [familyResult, careerResult, educationResult]
        .filter(r => r.status === 'rejected')
        .map(r => (r as PromiseRejectedResult).reason)

      throw new Error(`Phase 1 failed: insufficient data collected (${successCount}/3 agents succeeded). Errors: ${errors.join(', ')}`)
    }

    return {
      family: familyResult.status === 'fulfilled' ? familyResult.value : { success: false, error: String(familyResult.reason) },
      career: careerResult.status === 'fulfilled' ? careerResult.value : { success: false, error: String(careerResult.reason) },
      education: educationResult.status === 'fulfilled' ? educationResult.value : { success: false, error: String(educationResult.reason) },
    }
  }

  /**
   * FASE 2: Lifestyle Analysis (usa risultati Fase 1)
   */
  private async executePhase2(target: ProfilingTarget, previousResults: Partial<CompleteOSINTProfile>, rawData: RawOSINTData | null) {
    const context: AgentContext = {
      target,
      previous_results: previousResults,
      shared_memory: {
        raw_data: rawData, // Passa raw data per Instagram/Facebook/LinkedIn
      },
    }

    return await this.agents.get('lifestyle').execute(context)
  }

  /**
   * FASE 3: Wealth & Social Graph (paralleli, usano risultati precedenti)
   */
  private async executePhase3(target: ProfilingTarget, previousResults: Partial<CompleteOSINTProfile>, rawData: RawOSINTData | null) {
    const context: AgentContext = {
      target,
      previous_results: previousResults,
      shared_memory: {
        raw_data: rawData, // Passa raw data per Instagram/Facebook/LinkedIn
      },
    }

    const [wealthResult, socialResult] = await Promise.allSettled([
      this.agents.get('wealth').execute(context),
      this.agents.get('social').execute(context),
    ])

    return {
      wealth: wealthResult.status === 'fulfilled' ? wealthResult.value : { success: false, error: String(wealthResult.reason) },
      social: socialResult.status === 'fulfilled' ? socialResult.value : { success: false, error: String(socialResult.reason) },
    }
  }

  /**
   * FASE 4: Content Analysis (usa tutti i risultati precedenti)
   */
  private async executePhase4(target: ProfilingTarget, previousResults: Partial<CompleteOSINTProfile>, rawData: RawOSINTData | null) {
    const context: AgentContext = {
      target,
      previous_results: previousResults,
      shared_memory: {
        raw_data: rawData, // Passa raw data per Instagram/Facebook/LinkedIn
      },
    }

    return await this.agents.get('content').execute(context)
  }

  /**
   * FASE 5: Advanced Analysis - Work Model & Vision/Goals (paralleli)
   */
  private async executePhase5(target: ProfilingTarget, previousResults: Partial<CompleteOSINTProfile>, rawData: RawOSINTData | null) {
    const context: AgentContext = {
      target,
      previous_results: previousResults,
      shared_memory: {
        raw_data: rawData,
      },
    }

    const [workModelResult, visionGoalsResult] = await Promise.allSettled([
      this.agents.get('work_model').execute(context),
      this.agents.get('vision_goals').execute(context),
    ])

    return {
      work_model: workModelResult.status === 'fulfilled' ? workModelResult.value : { success: false, error: String(workModelResult.reason) },
      vision_goals: visionGoalsResult.status === 'fulfilled' ? visionGoalsResult.value : { success: false, error: String(visionGoalsResult.reason) },
    }
  }

  /**
   * FASE 6: Strategic Analysis - Needs Mapping & Engagement (sequenziali)
   */
  private async executePhase6(target: ProfilingTarget, previousResults: Partial<CompleteOSINTProfile>) {
    const context: AgentContext = {
      target,
      previous_results: previousResults,
      shared_memory: {},
    }

    // Needs Mapping prima (identifica bisogni)
    const needsMappingResult = await this.agents.get('needs_mapping').execute(context)

    // Aggiorna context con needs mapping per Engagement
    if (needsMappingResult.success) {
      context.previous_results!.needs_mapping = needsMappingResult.data
    }

    // Engagement strategist usa i bisogni identificati
    const engagementResult = await this.agents.get('engagement').execute(context)

    return {
      needs_mapping: needsMappingResult,
      engagement: engagementResult,
    }
  }

  /**
   * Genera sintesi esecutiva del profilo
   */
  private async generateExecutiveSummary(profile: CompleteOSINTProfile): Promise<string> {
    const sections: string[] = []

    // Sezione Famiglia
    if (profile.family && profile.family.nucleo_familiare_attuale && profile.family.residenza) {
      const family = profile.family
      const hasSpouse = family.nucleo_familiare_attuale.coniuge?.nome
      const hasChildren = (family.nucleo_familiare_attuale.figli?.length || 0) > 0
      const familyStatus = hasSpouse ?
        (hasChildren ? 'sposato/a con figli' : 'sposato/a') :
        'single o stato civile non determinato'

      // Build residenza intelligentemente (evita "Non determinato a città")
      const tipoZona = family.residenza.tipo_zona &&
                       family.residenza.tipo_zona !== 'non_determinato' &&
                       (family.residenza.tipo_zona as any) !== 'Non determinato'
                       ? family.residenza.tipo_zona : null
      const citta = family.residenza.citta &&
                   family.residenza.citta !== 'non_determinato' &&
                   family.residenza.citta !== 'Non determinato'
                   ? family.residenza.citta : null

      let residenzaText = ''
      if (citta && tipoZona) {
        residenzaText = ` Residenza in ${tipoZona} a ${citta}`
      } else if (citta) {
        residenzaText = ` Residenza a ${citta}`
      } else if (tipoZona) {
        residenzaText = ` Residenza in ${tipoZona}`
      }

      sections.push(`NUCLEO FAMILIARE: ${familyStatus}.${residenzaText}`)
    }

    // Sezione Carriera
    if (profile.career && profile.career.professione_attuale) {
      const career = profile.career
      const ruolo = career.professione_attuale.ruolo &&
                   career.professione_attuale.ruolo !== 'non_determinato'
                   ? career.professione_attuale.ruolo : null

      if (ruolo) { // Solo se c'è ruolo valido
        const livello = career.professione_attuale.livello &&
                       career.professione_attuale.livello !== 'non_determinato'
                       ? `(${career.professione_attuale.livello})` : ''
        const azienda = career.professione_attuale.azienda ? ` presso ${career.professione_attuale.azienda}` : ''

        sections.push(`PROFESSIONE: ${ruolo} ${livello}${azienda}`)
      }
    }

    // Sezione Formazione
    if (profile.education && profile.education.titolo_studio_massimo?.livello) {
      const edu = profile.education
      const livello = edu.titolo_studio_massimo.livello?.replace(/_/g, ' ')

      if (livello && livello !== 'non determinato') { // Solo se valido
        const campo = edu.titolo_studio_massimo.campo_studio ? ` in ${edu.titolo_studio_massimo.campo_studio}` : ''
        sections.push(`FORMAZIONE: ${livello}${campo}`)
      }
    }

    // Sezione Lifestyle
    if (profile.lifestyle && profile.lifestyle.stile_vita?.tipo) {
      const lifestyle = profile.lifestyle
      const tipo = lifestyle.stile_vita.tipo
      const interessi = lifestyle.interessi_principali?.filter(i => i && i !== 'non_determinato').slice(0, 3)

      if (tipo && (tipo as any) !== 'non_determinato') { // Solo se valido
        let lifestyleText = `LIFESTYLE: ${tipo}`
        if (interessi && interessi.length > 0) {
          lifestyleText += `. Interessi: ${interessi.join(', ')}`
        }
        sections.push(lifestyleText)
      }
    }

    // Sezione Wealth
    if (profile.wealth && profile.wealth.valutazione_economica?.fascia) {
      const wealth = profile.wealth
      const fascia = wealth.valutazione_economica.fascia?.replace(/_/g, '-').toUpperCase()

      if (fascia && fascia !== 'NON-DETERMINATO') { // Solo se valido
        const tenore = wealth.tenore_vita?.descrizione
        let wealthText = `CAPACITÀ ECONOMICA: ${fascia}`
        if (tenore && tenore !== 'Non disponibile') {
          wealthText += `. ${tenore}`
        }
        sections.push(wealthText)
      }
    }

    // Sezione Social
    if (profile.social_graph && profile.social_graph.rete_sociale) {
      const social = profile.social_graph
      const dimensione = social.rete_sociale.dimensione
      const connessioni = social.connessioni_chiave?.length || 0

      if (dimensione && (dimensione as any) !== 'non_determinato') { // Solo se valido
        let socialText = `RETE SOCIALE: ${dimensione}`
        if (connessioni > 0) {
          socialText += ` con ${connessioni} connessioni chiave`
        }
        sections.push(socialText)
      }
    }

    // Se non ci sono sezioni valide, ritorna un messaggio generico
    if (sections.length === 0) {
      return 'Profilo OSINT in elaborazione - dati in raccolta'
    }

    return sections.join('. ') + '.'
  }

  /**
   * Calcola punteggio complessivo (media confidence scores)
   */
  private calculateOverallScore(profile: CompleteOSINTProfile): number {
    const scores: number[] = []

    if (profile.family) scores.push(profile.family.confidence_score)
    if (profile.career) scores.push(profile.career.confidence_score)
    if (profile.education) scores.push(profile.education.confidence_score)
    if (profile.lifestyle) scores.push(profile.lifestyle.confidence_score)
    if (profile.wealth) scores.push(profile.wealth.confidence_score)
    if (profile.social_graph) scores.push(profile.social_graph.confidence_score)
    if (profile.content_analysis) scores.push(profile.content_analysis.confidence_score)

    if (scores.length === 0) return 0

    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  /**
   * Calcola completezza profilo (% agent completati con successo)
   */
  private calculateCompleteness(profile: CompleteOSINTProfile): number {
    const totalAgents = 12 // 7 base + 5 advanced
    const completedAgents = [
      // Base agents (7)
      profile.family,
      profile.career,
      profile.education,
      profile.lifestyle,
      profile.wealth,
      profile.social_graph,
      profile.content_analysis,
      // Advanced agents (5)
      profile.authority_signals,
      profile.work_model,
      profile.vision_goals,
      profile.needs_mapping,
      profile.engagement,
    ].filter(Boolean).length

    return Math.round((completedAgents / totalAgents) * 100)
  }

  /**
   * Genera piano di orchestrazione (per debug/preview)
   */
  generateOrchestrationPlan(): OrchestrationPlan {
    return {
      phases: [
        {
          phase_number: 1,
          phase_name: 'Base Research',
          agents: ['family', 'career', 'education'],
          parallel: true,
        },
        {
          phase_number: 2,
          phase_name: 'Lifestyle Analysis',
          agents: ['lifestyle'],
          parallel: false,
        },
        {
          phase_number: 3,
          phase_name: 'Advanced Analysis',
          agents: ['wealth', 'social'],
          parallel: true,
        },
        {
          phase_number: 4,
          phase_name: 'Content Deep Dive',
          agents: ['content'],
          parallel: false,
        },
      ],
      estimated_time_ms: 300000, // 5 minuti stima
      estimated_cost_usd: 0.50, // Stima costo API
    }
  }
}
