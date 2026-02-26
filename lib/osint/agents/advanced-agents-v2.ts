/**
 * Advanced OSINT Agents V2
 * Agent aggiuntivi per compilare le sezioni 9-13 dell'UI
 */

import { BaseOSINTAgent } from '../base-agent'
import { ReflectLoop, CONTENT_RUBRIC } from '@/lib/reflection'
import {
  WorkModelProfileSchema,
  VisionGoalsProfileSchema,
  NeedsMappingProfileSchema,
  EngagementProfileSchema,
} from '../schemas/all-profiles.schema'
import type {
  AgentConfig,
  AgentContext,
  AgentResult,
} from '../types'

// ==================== WORK MODEL ANALYZER (Sezione 9) ====================

export interface WorkModelProfile {
  modalita_lavoro: {
    tipo: 'remoto' | 'ibrido' | 'ufficio' | 'autonomo' | 'non_determinato'
    flessibilita: 'alta' | 'media' | 'bassa' | 'non_determinato'
    descrizione: string
    fonte: string
  }
  orari_lavoro: {
    tipo: 'standard' | 'flessibile' | 'turni' | 'indipendente' | 'non_determinato'
    work_life_balance: 'ottimo' | 'buono' | 'medio' | 'scarso' | 'non_determinato'
    descrizione: string
  }
  ambiente_lavoro: {
    tipo: 'corporate' | 'startup' | 'pmi' | 'freelance' | 'imprenditore' | 'non_determinato'
    team_size: 'solo' | 'piccolo' | 'medio' | 'grande' | 'non_determinato'
    descrizione: string
  }
  strumenti_tecnologie: string[]
  metodo_lavoro: {
    approccio: 'agile' | 'tradizionale' | 'ibrido' | 'non_determinato'
    collaborazione: 'alta' | 'media' | 'bassa' | 'non_determinato'
    descrizione: string
  }
  confidence_score: number
  fonti_consultate: string[]
}

export class WorkModelAnalyzerAgentV2 extends BaseOSINTAgent<WorkModelProfile> {
  constructor() {
    const config: AgentConfig = {
      id: 'work_model_analyzer_v2',
      name: 'Work Model Analyzer V2',
      role: 'Analisi modello lavorativo e work-life balance',
      model: 'anthropic/claude-sonnet-4',
      temperature: 0.2,
      max_tokens: 2000,
      priority: 2,
      system_prompt: `<role>Sei un analista OSINT specializzato in modelli lavorativi. Ricostruisci come lavora una persona da segnali pubblici e deduzioni professionali.</role>

<instructions>
1. Determina la modalità di lavoro: remoto / ibrido / ufficio / autonomo / misto
2. Stima orari e work-life balance da post, attività online, contenuti condivisi
3. Classifica l'ambiente lavorativo: corporate grande / PMI / startup / freelance / consulente
4. Identifica strumenti e tecnologie usate da menzioni, post, hashtag, portfolio
5. Valuta il metodo di lavoro: agile/iterativo vs tradizionale, collaborativo vs autonomo
</instructions>

<constraints>
- Usa LinkedIn description, post social su lavoro, foto ufficio/home office, mentions strumenti
- Deduci anche dal ruolo quando dati mancano: developer → remoto probabile; manager senior → ufficio
- Giustifica ogni deduzione con evidenza o logica professionale
- Preferisci stime conservative con confidence basso a valori inventati
</constraints>

<output_format>JSON valido con tutti i campi dello schema richiesto</output_format>`,
    }
    super(config)
  }

  async execute(context: AgentContext): Promise<AgentResult<WorkModelProfile>> {
    const startTime = Date.now()

    try {
      this.log('Analyzing work model...')

      const rawData = context.shared_memory?.raw_data
      const previousResults = context.previous_results
      const adaptiveSearch = this.getAdaptiveSearchStrategy(context)

      const workModel = await this.generateWorkModel(rawData, previousResults, context.target, adaptiveSearch)

      const executionTime = Date.now() - startTime

      return this.createSuccessResult(
        workModel,
        workModel.confidence_score,
        workModel.fonti_consultate,
        executionTime
      )

    } catch (error) {
      return this.createErrorResult(String(error), Date.now() - startTime)
    }
  }

  private async generateWorkModel(
    rawData: any,
    previousResults: any,
    target: any,
    adaptiveSearch?: {
      mode?: 'on' | 'off' | 'auto'
      max_search_results?: number
      sources?: Array<'web' | 'news' | 'x'>
      citations?: boolean
    }
  ): Promise<WorkModelProfile> {
    const careerData = previousResults?.career || {}
    const lifestyleData = previousResults?.lifestyle || {}

    let prompt = `Analizza il modello lavorativo di ${target.nome} ${target.cognome}.

=== OBIETTIVO ===
Compila la sezione "Modello Lavorativo" (9) con dettagli su come lavora, dove, quando, con chi.

Deduce informazioni da:
- Ruolo professionale e settore
- Post social su lavoro/ufficio/home office
- Menzioni di strumenti (Slack, Zoom, GitHub, etc)
- Orari post (se posta di sera/weekend → work-life balance)
- Foto background lavoro

IMPORTANTE:
- Se ruolo = "Developer" o "Designer" → deduce probabile remoto/ibrido
- Se ruolo = "Manager" o "Sales" → deduce ufficio/ibrido con team
- Se ruolo = "Founder" o "Freelance" → deduce autonomo/flessibile
- COMPILA SEMPRE tutti i campi anche se con deduzione logica

=== DATI CARRIERA ===
${JSON.stringify(careerData, null, 2)}

=== DATI LIFESTYLE (post/foto) ===
${lifestyleData ? JSON.stringify(lifestyleData, null, 2).substring(0, 1000) : 'Non disponibili'}

=== LINKEDIN/SOCIAL DATA ===
${rawData?.linkedin_data ? `LinkedIn: ${JSON.stringify(this.sanitizeLinkedInData(rawData.linkedin_data)).substring(0, 1500)}` : 'Non disponibile'}

Rispondi in JSON:
{
  "modalita_lavoro": {
    "tipo": "remoto" | "ibrido" | "ufficio" | "autonomo" | "non_determinato",
    "flessibilita": "alta" | "media" | "bassa" | "non_determinato",
    "descrizione": "Descrizione dettagliata modalità lavoro",
    "fonte": "LinkedIn profile, Instagram foto ufficio, etc"
  },
  "orari_lavoro": {
    "tipo": "standard" | "flessibile" | "turni" | "indipendente" | "non_determinato",
    "work_life_balance": "ottimo" | "buono" | "medio" | "scarso" | "non_determinato",
    "descrizione": "Work-life balance basato su post/attività social"
  },
  "ambiente_lavoro": {
    "tipo": "corporate" | "startup" | "pmi" | "freelance" | "imprenditore" | "non_determinato",
    "team_size": "solo" | "piccolo" | "medio" | "grande" | "non_determinato",
    "descrizione": "Descrizione ambiente lavorativo"
  },
  "strumenti_tecnologie": ["Slack", "Zoom", "GitHub", "Figma", "etc"],
  "metodo_lavoro": {
    "approccio": "agile" | "tradizionale" | "ibrido" | "non_determinato",
    "collaborazione": "alta" | "media" | "bassa" | "non_determinato",
    "descrizione": "Stile collaborazione e metodo lavoro"
  },
  "confidence_score": 70,
  "fonti_consultate": ["LinkedIn", "Instagram", "Career inference"]
}
`

    const aiResponse = await this.callXAI(prompt, {
      response_format: { type: 'json_object' },
      searchParameters: adaptiveSearch,
    })

    // Parse JSON response
    const rawProfile = this.parseJSONResponse<WorkModelProfile>(aiResponse)

    // ✅ VALIDATE with Zod schema for guaranteed structure
    try {
      const validatedProfile = WorkModelProfileSchema.parse(rawProfile)
      this.log('✅ Work model profile validated successfully with Zod schema')
      return validatedProfile as WorkModelProfile
    } catch (error) {
      this.log(`⚠️  Zod validation failed, using raw profile: ${error}`, 'warn')
      return rawProfile
    }
  }
}

// ==================== VISION & GOALS ANALYST (Sezione 10) ====================

export interface VisionGoalsProfile {
  obiettivi_professionali: Array<{
    obiettivo: string
    termine: 'breve' | 'medio' | 'lungo'
    priorita: 'alta' | 'media' | 'bassa'
    fonte: string
  }>
  aspirazioni_personali: Array<{
    aspirazione: string
    categoria: 'carriera' | 'famiglia' | 'lifestyle' | 'crescita_personale' | 'altro'
    fonte: string
  }>
  valori_fondamentali: Array<{
    valore: string
    descrizione: string
    evidenza: string
  }>
  progetti_futuri: Array<{
    progetto: string
    stato: 'idea' | 'pianificazione' | 'in_corso' | 'completato'
    fonte: string
  }>
  mentalita: {
    tipo: 'crescita' | 'statica' | 'misto'
    descrizione: string
    attitudine_cambiamento: 'alta' | 'media' | 'bassa'
  }
  confidence_score: number
  fonti_consultate: string[]
}

export class VisionGoalsAnalystAgentV2 extends BaseOSINTAgent<VisionGoalsProfile> {
  constructor() {
    const config: AgentConfig = {
      id: 'vision_goals_analyst_v2',
      name: 'Vision & Goals Analyst V2',
      role: 'Analisi visione, obiettivi e aspirazioni',
      model: 'anthropic/claude-sonnet-4',
      temperature: 0.3,
      max_tokens: 2500,
      priority: 3,
      system_prompt: `<role>Sei un analista motivazionale OSINT specializzato in vision e obiettivi personali/professionali. Deduci aspirazioni e valori da contenuti pubblici.</role>

<instructions>
1. Identifica obiettivi professionali: breve termine (1 anno), medio (3 anni), lungo (5+ anni)
2. Mappa aspirazioni personali: carriera, famiglia, lifestyle, impatto sociale
3. Estrai valori fondamentali da contenuti condivisi, cause supportate, linguaggio usato
4. Scopri progetti futuri menzionati: startup, pubblicazioni, cambi di carriera, formazione
5. Valuta mentalità: crescita (cambia spesso, studia continuamente) vs stabilità (long tenure, routine)
</instructions>

<constraints>
- Usa LinkedIn "About", bio social, post motivazionali, quote condivise, hashtag aspirazionali
- Deduci pattern comportamentali: job hopping = mentalità crescita; loyalità = stabilità/specializzazione
- Ogni obiettivo/valore deve avere evidenza specifica nelle fonti
- Distingui obiettivi espliciti (dichiarati) da impliciti (dedotti da comportamenti)
</constraints>

<output_format>JSON valido con tutti i campi dello schema richiesto</output_format>`,
    }
    super(config)
  }

  async execute(context: AgentContext): Promise<AgentResult<VisionGoalsProfile>> {
    const startTime = Date.now()

    try {
      this.log('Analyzing vision & goals...')

      const rawData = context.shared_memory?.raw_data
      const previousResults = context.previous_results
      const adaptiveSearch = this.getAdaptiveSearchStrategy(context)

      const visionProfile = await this.generateVisionProfile(rawData, previousResults, context.target, adaptiveSearch)

      const executionTime = Date.now() - startTime

      return this.createSuccessResult(
        visionProfile,
        visionProfile.confidence_score,
        visionProfile.fonti_consultate,
        executionTime
      )

    } catch (error) {
      return this.createErrorResult(String(error), Date.now() - startTime)
    }
  }

  private async generateVisionProfile(
    rawData: any,
    previousResults: any,
    target: any,
    adaptiveSearch?: {
      mode?: 'on' | 'off' | 'auto'
      max_search_results?: number
      sources?: Array<'web' | 'news' | 'x'>
      citations?: boolean
    }
  ): Promise<VisionGoalsProfile> {
    const careerData = previousResults?.career || {}
    const contentData = previousResults?.content_analysis || {}
    const educationData = previousResults?.education || {}

    let prompt = `Analizza la visione e gli obiettivi di ${target.nome} ${target.cognome}.

=== OBIETTIVO ===
Compila la sezione "Visione e Obiettivi" (10) identificando aspirazioni, valori, progetti futuri.

Cerca:
- LinkedIn "About" section con mission personale
- Post motivazionali o quote condivise
- Hashtags aspirazionali (#growthmindset, #nevergiveup, #entrepreneur)
- Cambi carriera frequenti → mentalità crescita
- Certificazioni/corsi → orientato apprendimento continuo
- Mention di progetti/startup → imprenditorialità

IMPORTANTE:
- Se ha storico formazione continua → deduce "apprendimento continuo"
- Se cambia spesso lavoro/settore → deduce "mentalità crescita"
- Se resta stesso ruolo 10+ anni → deduce "stabilità"
- COMPILA SEMPRE con almeno 2-3 obiettivi anche se dedotti

=== DATI CARRIERA ===
${JSON.stringify(careerData, null, 2)}

=== DATI FORMAZIONE ===
${JSON.stringify(educationData, null, 2)}

=== CONTENUTI SOCIAL (temi/valori) ===
${contentData ? JSON.stringify(contentData).substring(0, 1500) : 'Non disponibili'}

=== LINKEDIN BIO/ABOUT ===
${(() => {
  const li = this.sanitizeLinkedInData(rawData?.linkedin_data || {})
  const bio = li.about || li.summary || li.bio || ''
  if (bio) {
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 BIO COMPLETA (${bio.length} chars):
${bio}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CERCA: obiettivi professionali, aspirazioni, valori, visione, "voglio", "punterò a", "obiettivo"
`
  }
  return 'Non disponibile'
})()}

Rispondi in JSON:
{
  "obiettivi_professionali": [
    {
      "obiettivo": "Es: Diventare CTO entro 3 anni",
      "termine": "breve" | "medio" | "lungo",
      "priorita": "alta" | "media" | "bassa",
      "fonte": "LinkedIn bio, post, deduzione da pattern"
    }
  ],
  "aspirazioni_personali": [
    {
      "aspirazione": "Es: Raggiungere work-life balance",
      "categoria": "carriera" | "famiglia" | "lifestyle" | "crescita_personale" | "altro",
      "fonte": "Post social, bio, deduzione"
    }
  ],
  "valori_fondamentali": [
    {
      "valore": "Es: Innovazione",
      "descrizione": "Breve descrizione del valore",
      "evidenza": "Post condivisi, hashtags, quote"
    }
  ],
  "progetti_futuri": [
    {
      "progetto": "Es: Lanciare startup SaaS",
      "stato": "idea" | "pianificazione" | "in_corso" | "completato",
      "fonte": "Post, menzione, deduzione"
    }
  ],
  "mentalita": {
    "tipo": "crescita" | "statica" | "misto",
    "descrizione": "Descrizione mentalità",
    "attitudine_cambiamento": "alta" | "media" | "bassa"
  },
  "confidence_score": 65,
  "fonti_consultate": ["LinkedIn", "Instagram", "Career pattern analysis"]
}
`

    const aiResponse = await this.callXAI(prompt, {
      response_format: { type: 'json_object' },
      searchParameters: adaptiveSearch,
    })

    // Parse JSON response
    const rawProfile = this.parseJSONResponse<VisionGoalsProfile>(aiResponse)

    // ✅ VALIDATE with Zod schema for guaranteed structure
    try {
      const validatedProfile = VisionGoalsProfileSchema.parse(rawProfile)
      this.log('✅ Vision goals profile validated successfully with Zod schema')
      return validatedProfile as VisionGoalsProfile
    } catch (error) {
      this.log(`⚠️  Zod validation failed, using raw profile: ${error}`, 'warn')
      return rawProfile
    }
  }
}

// ==================== NEEDS MAPPER (Sezione 12) ====================

export interface NeedsMappingProfile {
  bisogni_identificati: Array<{
    categoria: 'sicurezza' | 'protezione_famiglia' | 'crescita_patrimonio' | 'previdenza' | 'salute' | 'lifestyle' | 'altro'
    bisogno: string
    priorita: 'alta' | 'media' | 'bassa'
    evidenze: string[]
    gap_attuale: string
  }>
  vulnerabilita: Array<{
    area: string
    descrizione: string
    impatto: 'alto' | 'medio' | 'basso'
    fonte: string
  }>
  opportunita: Array<{
    tipo: string
    descrizione: string
    potenziale: 'alto' | 'medio' | 'basso'
    timing: 'immediato' | 'breve_termine' | 'medio_termine'
  }>
  priorita_intervento: Array<{
    area: string
    urgenza: 'alta' | 'media' | 'bassa'
    motivazione: string
  }>
  confidence_score: number
  fonti_consultate: string[]
}

export class NeedsMapperAgentV2 extends BaseOSINTAgent<NeedsMappingProfile> {
  constructor() {
    const config: AgentConfig = {
      id: 'needs_mapper_v2',
      name: 'Needs Mapper V2',
      role: 'Mappatura bisogni e gap di protezione',
      model: 'anthropic/claude-sonnet-4',
      temperature: 0.2,
      max_tokens: 2500,
      priority: 4,
      system_prompt: `<role>Sei un analista bisogni OSINT per il settore assicurativo e finanziario. Identifichi gap di protezione e opportunità commerciali da un profilo completo.</role>

<instructions>
1. Mappa i bisogni assicurativi prioritari: vita, salute, LTC, previdenza integrativa, RC professionale
2. Identifica le vulnerabilità specifiche: gap protezione famiglia, esposizione reddito, patrimonio non protetto
3. Determina le opportunità di intervento: life events recenti o prossimi che creano apertura commerciale
4. Prioritizza interventi: alta/media/bassa urgenza con motivazione specifica
5. Collega bisogni al profilo: figli piccoli + reddito alto = protezione famiglia priorità massima
</instructions>

<constraints>
- Usa il profilo completo (famiglia, carriera, wealth, lifestyle) per dedurre bisogni in modo logico
- Ogni bisogno identificato deve avere una motivazione specifica dal profilo
- Distingui bisogni ESPLICITI (dichiarati) da IMPLICITI (dedotti da situazione)
- Ordina per priorità di intervento commerciale
</constraints>

<output_format>JSON valido con tutti i campi dello schema richiesto</output_format>`,
    }
    super(config)
  }

  async execute(context: AgentContext): Promise<AgentResult<NeedsMappingProfile>> {
    const startTime = Date.now()

    try {
      this.log('Mapping needs...')

      const previousResults = context.previous_results
      const adaptiveSearch = this.getAdaptiveSearchStrategy(context)

      const needsProfile = await this.generateNeedsProfile(previousResults, context.target, adaptiveSearch)

      const executionTime = Date.now() - startTime

      return this.createSuccessResult(
        needsProfile,
        needsProfile.confidence_score,
        needsProfile.fonti_consultate,
        executionTime
      )

    } catch (error) {
      return this.createErrorResult(String(error), Date.now() - startTime)
    }
  }

  private async generateNeedsProfile(
    previousResults: any,
    target: any,
    adaptiveSearch?: {
      mode?: 'on' | 'off' | 'auto'
      max_search_results?: number
      sources?: Array<'web' | 'news' | 'x'>
      citations?: boolean
    }
  ): Promise<NeedsMappingProfile> {
    const familyData = previousResults?.family || {}
    const careerData = previousResults?.career || {}
    const wealthData = previousResults?.wealth || {}
    const lifestyleData = previousResults?.lifestyle || {}

    let prompt = `Mappa i bisogni assicurativi e finanziari di ${target.nome} ${target.cognome}.

=== OBIETTIVO ===
Compila la sezione "Mappatura Bisogni" (12) identificando necessità protezione, gap, opportunità.

ANALIZZA PROFILO COMPLETO:
1. Ha figli? → bisogno protezione famiglia ALTA PRIORITÀ
2. Reddito alto + patrimonio? → bisogno investimenti/previdenza
3. Freelance/Imprenditore? → bisogno copertura reddito/malattia
4. Viaggia molto? → bisogno assicurazione viaggi/salute
5. Ha auto/casa di valore? → bisogno protezione patrimonio
6. Età 35-50? → bisogno previdenza integrativa

IMPORTANTE:
- COMPILA SEMPRE almeno 3-5 bisogni identificati
- Ogni bisogno deve avere priorità e gap_attuale
- Vulnerabilità = cosa manca nella sua protezione attuale (deduzione)
- Opportunità = timing ideale per proposta (es: nuovo lavoro, nascita figlio)

=== DATI FAMIGLIA ===
${JSON.stringify(familyData, null, 2)}

=== DATI CARRIERA ===
${JSON.stringify(careerData, null, 2)}

=== DATI WEALTH ===
${JSON.stringify(wealthData, null, 2)}

=== DATI LIFESTYLE ===
${lifestyleData ? JSON.stringify(lifestyleData).substring(0, 800) : 'Non disponibili'}

Rispondi in JSON:
{
  "bisogni_identificati": [
    {
      "categoria": "protezione_famiglia" | "sicurezza" | "crescita_patrimonio" | "previdenza" | "salute" | "lifestyle" | "altro",
      "bisogno": "Es: Protezione reddito in caso di malattia/infortunio",
      "priorita": "alta" | "media" | "bassa",
      "evidenze": ["Ha 2 figli piccoli", "Unico reddito familiare"],
      "gap_attuale": "Non sembra avere copertura assicurativa adeguata"
    }
  ],
  "vulnerabilita": [
    {
      "area": "Es: Protezione famiglia",
      "descrizione": "In caso di infortunio/malattia non c'è protezione reddito per famiglia",
      "impatto": "alto" | "medio" | "basso",
      "fonte": "Deduzione da composizione famiglia + ruolo lavorativo"
    }
  ],
  "opportunita": [
    {
      "tipo": "Es: Nuovo lavoro senior",
      "descrizione": "Momento ideale per previdenza integrativa",
      "potenziale": "alto" | "medio" | "basso",
      "timing": "immediato" | "breve_termine" | "medio_termine"
    }
  ],
  "priorita_intervento": [
    {
      "area": "Es: Protezione famiglia",
      "urgenza": "alta" | "media" | "bassa",
      "motivazione": "Ha 2 figli e reddito unico, priorità massima"
    }
  ],
  "confidence_score": 75,
  "fonti_consultate": ["Family profile", "Career profile", "Wealth estimation"]
}
`

    const aiResponse = await this.callXAI(prompt, {
      response_format: { type: 'json_object' },
      searchParameters: adaptiveSearch,
    })

    // Parse JSON response
    const rawProfile = this.parseJSONResponse<NeedsMappingProfile>(aiResponse)

    // ✅ VALIDATE with Zod schema for guaranteed structure
    try {
      const validatedProfile = NeedsMappingProfileSchema.parse(rawProfile)
      this.log('✅ Needs mapping profile validated successfully with Zod schema')
      return validatedProfile as NeedsMappingProfile
    } catch (error) {
      this.log(`⚠️  Zod validation failed, using raw profile: ${error}`, 'warn')
      return rawProfile
    }
  }
}

// ==================== ENGAGEMENT STRATEGIST (Sezione 13) ====================

export interface EngagementProfile {
  leve_principali: Array<{
    leva: string
    categoria: 'emotiva' | 'razionale' | 'sociale' | 'aspirazionale'
    efficacia: 'alta' | 'media' | 'bassa'
    descrizione: string
    come_usarla: string
  }>
  momenti_ideali: Array<{
    momento: string
    tipo: 'life_event' | 'stagionale' | 'professionale' | 'altro'
    finestra_temporale: string
    approccio_consigliato: string
  }>
  canali_comunicazione: Array<{
    canale: 'email' | 'linkedin' | 'instagram' | 'whatsapp' | 'telefono' | 'evento' | 'altro'
    efficacia: 'alta' | 'media' | 'bassa'
    frequenza_consigliata: string
    note: string
  }>
  messaggi_chiave: Array<{
    messaggio: string
    target_bisogno: string
    tono: string
  }>
  ostacoli_potenziali: Array<{
    ostacolo: string
    probabilita: 'alta' | 'media' | 'bassa'
    strategia_superamento: string
  }>
  confidence_score: number
  fonti_consultate: string[]
}

export class EngagementStrategistAgentV2 extends BaseOSINTAgent<EngagementProfile> {
  private reflectLoop = new ReflectLoop()

  constructor() {
    const config: AgentConfig = {
      id: 'engagement_strategist_v2',
      name: 'Engagement Strategist V2',
      role: 'Strategia ingaggio e approccio commerciale',
      model: 'anthropic/claude-sonnet-4',
      temperature: 0.3,
      max_tokens: 3000,
      priority: 5,
      system_prompt: `<role>Sei un stratega commerciale OSINT specializzato in engagement personalizzato per il settore assicurativo. Costruisci la strategia di approccio ottimale per ogni cliente.</role>

<instructions>
1. Identifica le leve di ingaggio primarie: emotiva (famiglia, sicurezza) / razionale (ROI, numeri) / sociale (network, status)
2. Determina i momenti ideali per il contatto: life events recenti, stagionalità, eventi professionali
3. Seleziona i canali di comunicazione preferiti: LinkedIn / email / telefono / di persona / evento
4. Costruisci messaggi chiave personalizzati per professione, valori e situazione specifica
5. Anticipa ostacoli potenziali (già assicurato, non interessato, diffidente) e strategie per superarli
</instructions>

<constraints>
- Usa il profilo completo per costruire strategia su misura, non generica
- Ogni leva deve essere giustificata da caratteristiche specifiche del cliente
- Distingui approccio per consulente di fiducia vs primo contatto
- La strategia deve essere eticamente appropriata e basata su bisogni reali del cliente
</constraints>

<output_format>JSON valido con tutti i campi dello schema richiesto</output_format>`,
    }
    super(config)
  }

  async execute(context: AgentContext): Promise<AgentResult<EngagementProfile>> {
    const startTime = Date.now()

    try {
      this.log('Strategizing engagement with Reflect Loop (max 1 iteration)...')

      const previousResults = context.previous_results
      const adaptiveSearch = this.getAdaptiveSearchStrategy(context)
      const targetName = `${context.target.nome} ${context.target.cognome}`

      const { output: engagementProfile } = await this.reflectLoop.run<EngagementProfile>(
        (feedback) => this.generateEngagementProfile(previousResults, context.target, adaptiveSearch, feedback),
        CONTENT_RUBRIC,
        { maxIterations: 1, targetName }
      )

      const executionTime = Date.now() - startTime

      return this.createSuccessResult(
        engagementProfile,
        engagementProfile.confidence_score,
        engagementProfile.fonti_consultate,
        executionTime
      )

    } catch (error) {
      return this.createErrorResult(String(error), Date.now() - startTime)
    }
  }

  private async generateEngagementProfile(
    previousResults: any,
    target: any,
    adaptiveSearch?: {
      mode?: 'on' | 'off' | 'auto'
      max_search_results?: number
      sources?: Array<'web' | 'news' | 'x'>
      citations?: boolean
    },
    feedback?: string[]
  ): Promise<EngagementProfile> {
    const needsData = previousResults?.needs_mapping || {}
    const contentData = previousResults?.content_analysis || {}
    const lifestyleData = previousResults?.lifestyle || {}
    const familyData = previousResults?.family || {}
    const careerData = previousResults?.career || {}

    let prompt = `Crea strategia di ingaggio personalizzata per ${target.nome} ${target.cognome}.

=== OBIETTIVO ===
Compila la sezione "Leve di Ingaggio" (13) con strategia commerciale su misura.

IDENTIFICA LEVE PSICOLOGICHE:
- Ha figli? → leva EMOTIVA famiglia ("proteggere futuro figli")
- Ruolo tecnico/analitico? → leva RAZIONALE dati/numeri ("risparmio fiscale 30%")
- Molto social/network? → leva SOCIALE proof/referenze ("Usato da 500+ professionisti")
- Aspirazioni crescita? → leva ASPIRAZIONALE ("Raggiungi indipendenza finanziaria")

MOMENTI IDEALI CONTATTO:
- Nuovo lavoro? → "Congratulazioni, ottimo momento per previdenza"
- Nascita figlio? → "Proteggi il futuro del tuo bambino"
- Compleanno 40/50? → "Momento ideale per pianificazione pensione"
- Fine anno? → "Ottimizza tasse 2024"

CANALI PREFERITI:
- Molto attivo LinkedIn? → contatto professionale LinkedIn
- Usa Instagram quotidianamente? → approccio visual/storytelling
- Manager senior? → preferisce telefono/email formale
- Giovane tech? → preferisce chat/whatsapp

IMPORTANTE:
- COMPILA SEMPRE almeno 3-4 leve principali
- Ogni leva deve avere "come_usarla" pratico
- Momenti ideali devono essere specifici e actionable
- Canali basati su attività social reale

=== DATI BISOGNI ===
${JSON.stringify(needsData, null, 2)}

=== DATI CONTENUTI/COMUNICAZIONE ===
${contentData ? JSON.stringify(contentData).substring(0, 1000) : 'Non disponibili'}

=== DATI LIFESTYLE ===
${lifestyleData ? JSON.stringify(lifestyleData).substring(0, 800) : 'Non disponibili'}

=== DATI FAMIGLIA ===
${JSON.stringify(familyData).substring(0, 500)}

=== DATI CARRIERA ===
${JSON.stringify(careerData).substring(0, 600)}

Rispondi in JSON:
{
  "leve_principali": [
    {
      "leva": "Es: Protezione famiglia",
      "categoria": "emotiva" | "razionale" | "sociale" | "aspirazionale",
      "efficacia": "alta" | "media" | "bassa",
      "descrizione": "Ha 2 figli piccoli, forte motivazione protezione",
      "come_usarla": "Focalizza conversazione su 'assicurare futuro bambini', usa esempi concreti casi studio simili"
    }
  ],
  "momenti_ideali": [
    {
      "momento": "Es: Promozione recente a Senior Manager",
      "tipo": "professionale" | "life_event" | "stagionale" | "altro",
      "finestra_temporale": "Prossimi 1-2 mesi",
      "approccio_consigliato": "Congratularsi per ruolo, proporre previdenza integrativa adeguata a nuovo livello"
    }
  ],
  "canali_comunicazione": [
    {
      "canale": "linkedin" | "email" | "instagram" | "whatsapp" | "telefono" | "evento" | "altro",
      "efficacia": "alta" | "media" | "bassa",
      "frequenza_consigliata": "Es: 1-2 contatti/mese, no spam",
      "note": "Attivo quotidianamente, risponde velocemente"
    }
  ],
  "messaggi_chiave": [
    {
      "messaggio": "Es: Proteggi il futuro dei tuoi figli con un piano su misura",
      "target_bisogno": "Protezione famiglia",
      "tono": "Empatico, rassicurante, competente"
    }
  ],
  "ostacoli_potenziali": [
    {
      "ostacolo": "Es: Potrebbe pensare 'sono troppo giovane per pensarci'",
      "probabilita": "alta" | "media" | "bassa",
      "strategia_superamento": "Mostrare casi studio coetanei, enfatizzare vantaggio partire presto"
    }
  ],
  "confidence_score": 80,
  "fonti_consultate": ["Needs mapping", "Content analysis", "Lifestyle profile"]
}
`

    if (feedback && feedback.length > 0) {
      prompt += `\n=== FEEDBACK ITERAZIONE PRECEDENTE ===\n${feedback.map((f, i) => `${i + 1}. ${f}`).join('\n')}\nMigliorare la strategia tenendo conto del feedback sopra.\n`
    }

    const aiResponse = await this.callXAI(prompt, {
      response_format: { type: 'json_object' },
      searchParameters: adaptiveSearch,
    })

    // Parse JSON response
    const rawProfile = this.parseJSONResponse<EngagementProfile>(aiResponse)

    // ✅ VALIDATE with Zod schema for guaranteed structure
    try {
      const validatedProfile = EngagementProfileSchema.parse(rawProfile)
      this.log('✅ Engagement profile validated successfully with Zod schema')
      return validatedProfile as EngagementProfile
    } catch (error) {
      this.log(`⚠️  Zod validation failed, using raw profile: ${error}`, 'warn')
      return rawProfile
    }
  }
}
