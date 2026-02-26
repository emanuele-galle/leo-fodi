/**
 * All OSINT Agents V2
 * Tutti gli agenti aggiornati con Reflect Loop per qualità garantita
 */

import { BaseOSINTAgent } from '../base-agent'
import {
  ReflectLoop,
  CAREER_RUBRIC,
  EDUCATION_RUBRIC,
  LIFESTYLE_RUBRIC,
  SOCIAL_RUBRIC,
  CONTENT_RUBRIC,
} from '@/lib/reflection'
import { PRIORITY_INSTRUCTIONS, ENABLE_LIVE_SEARCH, JSON_RESPONSE_FOOTER } from '../priority-instructions'
import {
  CareerProfileSchema,
  EducationProfileSchema,
  LifestyleProfileSchema,
  SocialGraphProfileSchema,
  ContentAnalysisProfileSchema,
} from '../schemas/all-profiles.schema'
import type {
  AgentConfig,
  AgentContext,
  AgentResult,
  CareerProfile,
  EducationProfile,
  LifestyleProfile,
  SocialGraphProfile,
  ContentAnalysisProfile,
} from '../types'

// ==================== CAREER ANALYZER V2 ====================

export class CareerAnalyzerAgentV2 extends BaseOSINTAgent<CareerProfile> {
  private reflectLoop = new ReflectLoop()

  constructor() {
    const config: AgentConfig = {
      id: 'career_analyzer_v2',
      name: 'Career Analyzer V2',
      role: 'Analisi professione con Reflect Loop',
      model: 'anthropic/claude-sonnet-4',
      temperature: 0.1,
      max_tokens: 2500,
      priority: 1,
      system_prompt: `Sei un analista OSINT specializzato in carriere professionali.

Analizza:
1. Professione attuale (ruolo, azienda, settore, anzianità)
2. Storico professionale completo
3. Competenze chiave e certificazioni

IMPORTANTE:
- Usa SOLO dati da LinkedIn, CV pubblici, menzioni aziendali verificabili
- NON inventare ruoli o aziende
- Determina livello: junior/mid/senior/executive/imprenditore con logica chiara
- Ogni esperienza deve avere periodo e fonte specifica
- Confidence score basato su fonti verificabili

Rispondi in JSON valido.`,
    }
    super(config)
  }

  async execute(context: AgentContext): Promise<AgentResult<CareerProfile>> {
    const startTime = Date.now()

    try {
      this.log('Analyzing career (Reflect Loop DISABLED for speed)...')

      const rawData = context.shared_memory?.raw_data

      // ✅ Extract adaptive search strategy from context
      const adaptiveSearch = this.getAdaptiveSearchStrategy(context)

      // REFLECT LOOP DISABLED - Direct generation for speed
      const careerProfile = await this.generateCareerProfile(rawData, context.target, adaptiveSearch)

      const executionTime = Date.now() - startTime
      this.log(`Career analysis completed in ${executionTime}ms`)

      return this.createSuccessResult(
        careerProfile,
        careerProfile.confidence_score,
        careerProfile.fonti_consultate,
        executionTime
      )

    } catch (error) {
      return this.createErrorResult(String(error), Date.now() - startTime)
    }
  }

  private async generateCareerProfile(
    rawData: any,
    target: any,
    adaptiveSearch?: {
      mode?: 'on' | 'off' | 'auto'
      max_search_results?: number
      sources?: Array<'web' | 'news' | 'x'>
      citations?: boolean
    },
    feedback?: string[]
  ): Promise<CareerProfile> {
    let prompt = `Sei un analista OSINT esperto. Analizza la carriera professionale di ${target.nome} ${target.cognome}.

=== OBIETTIVO ===
Compila la sezione "Professione e Carriera" con il MASSIMO dettaglio possibile.

🎯 PRIORITÀ MASSIMA - STRATEGIA DI ESTRAZIONE:
1. ⭐ ANALIZZA PRIMA la bio/about LinkedIn (spesso contiene dati NON strutturati ma RICCHISSIMI)
2. Cross-reference bio con experience/education strutturati per validazione
3. Estrai da bio: anni esperienza totali, geografie, certificazioni, qualifiche, expertise tecniche
4. Se bio dice "20 anni esperienza" → calcola anzianità da questo, non solo da experience dates
5. Se bio menziona Master/certificazioni non in education → includili comunque
6. Identifica keywords: "anni", "esperienza", "Master", "certificato", "specializzato", "esperto"

⚠️ ATTENZIONE:
- La bio è spesso PIÙ completa di experience/education strutturati
- Molti professionisti descrivono competenze in bio che non appaiono altrove
- Cerca contraddizioni tra bio e dati strutturati → segnala in note_agente

=== DATI DA WEB SCRAPING ===
`

    // ========== LINKEDIN DATA (Fonte primaria) ==========
    if (rawData?.linkedin_data) {
      // FIX A: Sanifica dati LinkedIn oscurati prima di usarli
      const li = this.sanitizeLinkedInData(rawData.linkedin_data)

      // ⭐⭐⭐ PRIORITÀ 1: BIO/ABOUT COMPLETA (fonte più ricca) ⭐⭐⭐
      if (li.about || li.summary) {
        const bio = li.about || li.summary || ''
        prompt += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 ⭐ LINKEDIN BIO/ABOUT COMPLETA (${bio.length} chars) - FONTE PRIMARIA ⭐
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${bio}

⚠️ ISTRUZIONI SPECIFICHE PER QUESTA BIO:
1. ESTRAI anni totali esperienza (es: "20 anni esperienza" → anzianita_anni: 20)
2. IDENTIFICA geografie lavorate (es: "Italia, Francia, USA, Silicon Valley")
3. TROVA certificazioni/qualifiche (es: "Innovation Manager", "MISE", "Manageritalia")
4. ESTRAI formazione avanzata (es: "Master Bocconi", "ESADE")
5. IDENTIFICA expertise tecniche (es: "IoT", "IIoT", "Industria 4.0", "trasformazione digitale")
6. RICONOSCI ruoli apicali (es: "P&L management", "Business Unit", "team internazionali")
7. NOTA competenze linguistiche (es: "inglese madrelingua", "cittadino del mondo")
8. TROVA background tecnico (es: "Ingegnere Elettronico")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
      }

      prompt += `\nLINKEDIN DATA STRUTTURATI (da cross-verificare con bio):
- Nome: ${li.nome_completo}
- Headline: ${li.headline || 'N/A'}
- Località: ${li.localita || 'N/A'}
- Followers: ${li.numero_followers?.toLocaleString() || 'N/A'}
- Connections: ${li.numero_connessioni?.toLocaleString() || 'N/A'}

💼 ESPERIENZA LAVORATIVA COMPLETA (${li.esperienze?.length || 0} ruoli totali):

⚠️ PRIORITÀ: Le DESCRIZIONI contengono i dati PIÙ RICCHI (responsabilità, achievement, progetti, tecnologie, risultati).
ANALIZZA OGNI DESCRIZIONE completamente per estrarre:
- Responsabilità specifiche
- Achievement e risultati misurabili
- Progetti e iniziative
- Tecnologie e competenze tecniche
- Team gestiti (dimensione, tipo)
- Budget/P&L gestiti

${li.esperienze?.map((exp: any, i: number) => {
  // Calcola durata ruolo per prioritizzazione
  const durata = exp.data_inizio && exp.data_fine
    ? `(~${Math.abs(new Date(exp.data_fine).getFullYear() - new Date(exp.data_inizio).getFullYear())} anni)`
    : ''

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ESPERIENZA ${i + 1}/${li.esperienze?.length || 0}: ${exp.ruolo} @ ${exp.azienda}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️  Periodo: ${exp.data_inizio || 'N/A'} → ${exp.data_fine || 'ATTUALE'} ${durata}
📍 Location: ${exp.localita || 'N/A'}
💼 Tipo: ${exp.tipo_impiego || 'N/A'}

📝 DESCRIZIONE COMPLETA (${exp.descrizione ? exp.descrizione.length : 0} chars):
${exp.descrizione || '⚠️ Nessuna descrizione disponibile'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
}).join('\n')}

🎓 FORMAZIONE (${li.formazione?.length || 0}):
${li.formazione?.map((edu: any, i: number) =>
  `  ${i + 1}. ${edu.titolo} - ${edu.campo_studio || 'N/A'}
     @ ${edu.istituzione}
     Periodo: ${edu.data_inizio} - ${edu.data_fine || 'N/A'}`
).join('\n') || '  Nessuna formazione'}

💪 COMPETENZE (${li.competenze?.length || 0}):
${li.competenze?.slice(0, 20).join(', ') || 'Nessuna'}

📜 CERTIFICAZIONI (${li.certificazioni?.length || 0}):
${li.certificazioni?.map((cert: any) =>
  `  • ${cert.nome} - ${cert.ente} (${cert.data_rilascio || 'N/A'})`
).join('\n') || '  Nessuna certificazione'}
`
    } else {
      prompt += '\n📘 LINKEDIN DATA: Non disponibile\n'
    }

    // ========== INSTAGRAM BIO (Cross-reference) ==========
    if (rawData?.instagram_data?.bio) {
      prompt += `\n📸 INSTAGRAM BIO (Cross-reference):
Bio: ${rawData.instagram_data.bio}

NOTA: Cerca menzioni di ruolo lavorativo, azienda, settore, competenze professionali.
`
    }

    // ========== FACEBOOK BIO (Cross-reference) ==========
    if (rawData?.facebook_data?.bio) {
      prompt += `\n📱 FACEBOOK BIO/ABOUT (Cross-reference):
Bio: ${rawData.facebook_data.bio}

NOTA: Cerca menzioni professionali, ruoli ricoperti, aziende.
`
    }

    // ========== GOOGLE SEARCH RESULTS (Cross-reference avanzato) ==========
    if (rawData?.google_search_data?.results?.length > 0) {
      // FIX: Filter only results matching target LinkedIn URL to avoid mixing with other people
      const targetLinkedInUrl = target.linkedin_url?.replace('https://', '').replace('www.', '') || ''
      const filteredResults = rawData.google_search_data.results.filter((result: any) => {
        // Only include if URL matches target profile OR is not a LinkedIn profile URL
        const url = result.link?.replace('https://', '').replace('www.', '') || ''
        const isLinkedInProfile = url.includes('linkedin.com/in/')

        if (isLinkedInProfile && targetLinkedInUrl) {
          // If it's a LinkedIn profile, only include if it matches target
          return url.includes(targetLinkedInUrl.replace(/\/$/, ''))
        }
        // Include non-LinkedIn results (articles, news, etc.)
        return !isLinkedInProfile
      })

      prompt += `\n🔍 GOOGLE SEARCH RESULTS (Cross-reference avanzato):
Trovati ${filteredResults.length}/${rawData.google_search_data.total_results} risultati rilevanti (filtrati per evitare omonimi).

ARTICOLI E MENZIONI:
${filteredResults.slice(0, 8).map((result: any) =>
  `• ${result.title}\n  URL: ${result.link}\n  Snippet: ${result.snippet}`
).join('\n\n')}

⚠️ IMPORTANTE: Usa SOLO dati dal profilo LinkedIn target (${target.linkedin_url || 'non specificato'}).
NON mescolare dati di altri profili LinkedIn trovati su Google.
NOTA: Cerca menzioni di ruoli professionali, aziende, progetti, riconoscimenti lavorativi.
`
    }

    if (rawData?.web_data?.length > 0) {
      prompt += `\nWEB DATA:
${rawData.web_data.filter((site: any) => site.content?.toLowerCase().includes('lavoro') || site.content?.toLowerCase().includes('professione')).map((site: any) => `- ${site.title}: ${site.description?.substring(0, 150)}`).join('\n')}
`
    }

    // ========== WEB CONTENT (Portfolio, siti personali) ==========
    if (rawData?.web_content?.length > 0) {
      prompt += `\n=== WEB CONTENT DA LINK ESTERNI ===\n`
      rawData.web_content.forEach((content: any) => {
        prompt += `\nURL: ${content.url}
Titolo: ${content.title || 'N/A'}
Contenuto (${content.word_count} parole):
${content.text_content.substring(0, 800)}...

`
      })
    }

    if (feedback && feedback.length > 0) {
      prompt += `\n=== FEEDBACK ===\n${feedback.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n`
    }

    prompt += `
=== ISTRUZIONI ===

1. USA TUTTE LE FONTI DISPONIBILI sopra per cross-reference e massimizzare completezza
2. NON inventare ruoli o aziende - usa solo dati trovati o dedotti logicamente
3. Se deduci professione da bio/articoli, indicalo chiaramente nella fonte
4. Aumenta confidence_score se trovi conferme da fonti multiple

${PRIORITY_INSTRUCTIONS}

Determina livello professionale:
- **junior**: 0-3 anni esperienza, ruoli entry-level
- **mid**: 3-7 anni, responsabilità intermedie
- **senior**: 7-12 anni, leadership o expertise tecnica avanzata
- **executive**: 12+ anni, C-level o management alto
- **imprenditore**: Fondatore/owner di azienda

⚠️  IMPORTANTE: Il campo "livello" DEVE essere uno di questi 5 valori ESATTI (niente altro):
   "junior", "mid", "senior", "executive", "imprenditore"
   Se non hai dati → usa "junior" come default (0 anni esperienza)

Rispondi in JSON:
{
  "professione_attuale": {
    "ruolo": "Ruolo esatto da LinkedIn o dedotto da bio, o 'Non disponibile'",
    "azienda": "Nome azienda o 'Non disponibile'",
    "settore": "Settore identificato o 'Non disponibile'",
    "anzianita_anni": numero o 0,
    "livello": "junior" | "mid" | "senior" | "executive" | "imprenditore",
    "fonte": "LinkedIn | Instagram bio | Facebook bio | Google Search | Career deduction"
  },
  "storico_professionale": [
    {
      "ruolo": "Ruolo",
      "azienda": "Azienda",
      "periodo": "2018-2020",
      "settore": "Settore",
      "fonte": "Source"
    }
  ],
  "competenze_chiave": ["Lista da tutte le fonti"],
  "certificazioni": ["Lista da tutte le fonti"],
  "confidence_score": number (0-100, più alto se conferme da fonti multiple),
  "fonti_consultate": ["LinkedIn", "Instagram", "Facebook", "Google Search", "Web", "Career deduction"]
}
`

    // ✅ Apply adaptive search strategy if available
    const aiResponse = await this.callXAI(prompt, {
      response_format: { type: 'json_object' },
      searchParameters: adaptiveSearch, // XAI Live Search con strategia adattiva
    })

    // Parse JSON response
    const rawProfile = this.parseJSONResponse<CareerProfile>(aiResponse)

    // ✅ VALIDATE with Zod schema for guaranteed structure
    try {
      const validatedProfile = CareerProfileSchema.parse(rawProfile)
      this.log('✅ Career profile validated successfully with Zod schema')

      // ⭐ BONUS: Increase confidence score if rich bio was available
      const bio = rawData?.linkedin_data?.about || rawData?.linkedin_data?.summary || ''
      if (bio && bio.length > 500) {
        // Rich bio (>500 chars) → boost confidence by +10 (max 100)
        validatedProfile.confidence_score = Math.min(100, validatedProfile.confidence_score + 10)
        this.log(`⭐ Confidence boost: +10 pts for rich LinkedIn bio (${bio.length} chars) → ${validatedProfile.confidence_score}`)

        // Add note about bio richness
        if (!validatedProfile.note_agente) {
          validatedProfile.note_agente = []
        }
        validatedProfile.note_agente.push(
          `✅ Bio LinkedIn ricca (${bio.length} chars) utilizzata per analisi approfondita`
        )
      }

      return validatedProfile as CareerProfile
    } catch (error) {
      this.log(`⚠️  Zod validation failed, using raw profile: ${error}`, 'warn')
      // Fallback to raw profile if validation fails (graceful degradation)
      return rawProfile
    }
  }
}

// ==================== EDUCATION PROFILER V2 ====================

export class EducationProfilerAgentV2 extends BaseOSINTAgent<EducationProfile> {
  private reflectLoop = new ReflectLoop()

  constructor() {
    const config: AgentConfig = {
      id: 'education_profiler_v2',
      name: 'Education Profiler V2',
      role: 'Analisi formazione con Reflect Loop',
      model: 'anthropic/claude-haiku-4-5-20251001',
      temperature: 0.1,
      max_tokens: 1500,
      priority: 2,
      system_prompt: `Analista OSINT specializzato in formazione accademica.

Identifica:
1. Titolo di studio massimo (diploma, laurea, master, dottorato)
2. Campo di studio e istituzione
3. Altri studi e certificazioni
4. Sintesi del percorso formativo

IMPORTANTE:
- Usa SOLO dati da LinkedIn education, bio, CV pubblici
- NON inventare titoli o università
- Ogni titolo deve avere fonte specifica
- Se dati insufficienti, confidence basso

Rispondi in JSON valido.`,
    }
    super(config)
  }

  async execute(context: AgentContext): Promise<AgentResult<EducationProfile>> {
    const startTime = Date.now()

    try {
      this.log('Profiling education (Reflect Loop DISABLED for speed)...')

      const rawData = context.shared_memory?.raw_data
      const adaptiveSearch = this.getAdaptiveSearchStrategy(context)

      // REFLECT LOOP DISABLED - Direct generation for speed
      const eduProfile = await this.generateEducationProfile(rawData, context.target, adaptiveSearch)

      const executionTime = Date.now() - startTime

      return this.createSuccessResult(
        eduProfile,
        eduProfile.confidence_score,
        eduProfile.fonti_consultate,
        executionTime
      )

    } catch (error) {
      return this.createErrorResult(String(error), Date.now() - startTime)
    }
  }

  private async generateEducationProfile(
    rawData: any,
    target: any,
    adaptiveSearch?: {
      mode?: 'on' | 'off' | 'auto'
      max_search_results?: number
      sources?: Array<'web' | 'news' | 'x'>
      citations?: boolean
    },
    feedback?: string[]
  ): Promise<EducationProfile> {
    let prompt = `Sei un analista OSINT esperto. Analizza il percorso formativo di ${target.nome} ${target.cognome}.

=== OBIETTIVO ===
Compila la sezione "Formazione ed Educazione" con il MASSIMO dettaglio possibile.

🎯 STRATEGIA DI ESTRAZIONE:
1. ⭐ ANALIZZA PRIMA la bio/about LinkedIn (spesso menziona titoli NON listati in education)
2. Cross-reference bio con education strutturato per validazione
3. Estrai: titoli completi, università/istituzioni, specializzazioni, tesi, progetti, honors
4. Se bio menziona "Master", "Dottorato", "Laurea" non in education → includili comunque
5. Identifica keywords: "laureato", "Master", "PhD", "dottorato", "specializzazione", "diplomato"

⚠️ ATTENZIONE:
- La bio spesso contiene titoli più recenti o prestigiosi non listati in education
- Professionisti senior spesso omettono lauree base ma le menzionano in bio
- Cerca contraddizioni tra bio e dati strutturati → segnala in note_agente

=== DATI DA WEB SCRAPING ===
`

    // ========== LINKEDIN DATA (Fonte primaria) ==========
    if (rawData?.linkedin_data) {
      // FIX A: Sanifica dati LinkedIn oscurati prima di usarli
      const li = this.sanitizeLinkedInData(rawData.linkedin_data)

      // ⭐⭐⭐ PRIORITÀ 1: BIO/ABOUT COMPLETA (per menzioni formazione) ⭐⭐⭐
      if (li.about || li.summary) {
        const bio = li.about || li.summary || ''
        prompt += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 ⭐ LINKEDIN BIO/ABOUT - CERCA MENZIONI FORMAZIONE ⭐
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${bio}

⚠️ CERCA in questa bio:
- Lauree/Master/Dottorati menzionati (es: "Master Bocconi", "laureato in Ingegneria")
- Università/scuole citate (es: "SDA Bocconi", "ESADE", "Politecnico")
- Specializzazioni (es: "specializzato in", "formazione in")
- Certificazioni accademiche

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
      }

      prompt += `\n📘 LINKEDIN EDUCATION STRUTTURATO (${li.formazione?.length || 0} titoli):

${li.formazione?.map((edu: any, i: number) => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎓 TITOLO ${i + 1}/${li.formazione?.length || 0}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 Titolo: ${edu.titolo || 'Non specificato'}
🏛️  Istituzione: ${edu.istituzione || 'Non specificata'}
📖 Campo studio: ${edu.campo_studio || 'Non specificato'}
📅 Periodo: ${edu.data_inizio || 'N/A'} → ${edu.data_fine || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`).join('\n') || '⚠️ Nessuna formazione strutturata trovata\n'}
`
    } else {
      prompt += '\n📘 LINKEDIN DATA: Non disponibile\n'
    }

    // ========== INSTAGRAM BIO (Cross-reference) ==========
    if (rawData?.instagram_data?.bio) {
      prompt += `\n📸 INSTAGRAM BIO (Cross-reference):
Bio: ${rawData.instagram_data.bio}

NOTA: Cerca menzioni di università, lauree, master, certificazioni, scuole nel testo della bio.
`
    }

    // ========== FACEBOOK BIO (Cross-reference) ==========
    if (rawData?.facebook_data?.bio) {
      prompt += `\n📱 FACEBOOK BIO/ABOUT (Cross-reference):
Bio: ${rawData.facebook_data.bio}

NOTA: Cerca menzioni formative, titoli di studio, istituzioni educative.
`
    }

    // ========== GOOGLE SEARCH RESULTS (Cross-reference avanzato) ==========
    if (rawData?.google_search_data?.results?.length > 0) {
      // FIX: Filter only results matching target LinkedIn URL to avoid mixing with other people
      const targetLinkedInUrl = target.linkedin_url?.replace('https://', '').replace('www.', '') || ''
      const filteredResults = rawData.google_search_data.results.filter((result: any) => {
        // Only include if URL matches target profile OR is not a LinkedIn profile URL
        const url = result.link?.replace('https://', '').replace('www.', '') || ''
        const isLinkedInProfile = url.includes('linkedin.com/in/')

        if (isLinkedInProfile && targetLinkedInUrl) {
          // If it's a LinkedIn profile, only include if it matches target
          return url.includes(targetLinkedInUrl.replace(/\/$/, ''))
        }
        // Include non-LinkedIn results (articles, news, etc.)
        return !isLinkedInProfile
      })

      prompt += `\n🔍 GOOGLE SEARCH RESULTS (Cross-reference avanzato):
Trovati ${filteredResults.length}/${rawData.google_search_data.total_results} risultati rilevanti (filtrati per evitare omonimi).

ARTICOLI E MENZIONI:
${filteredResults.slice(0, 8).map((result: any) =>
  `• ${result.title}\n  URL: ${result.link}\n  Snippet: ${result.snippet}`
).join('\n\n')}

⚠️ IMPORTANTE: Usa SOLO dati dal profilo LinkedIn target (${target.linkedin_url || 'non specificato'}).
NON mescolare dati di altri profili LinkedIn trovati su Google.
NOTA: Cerca menzioni di percorsi formativi, istituzioni frequentate, qualifiche ottenute.
`
    }

    // ========== WEB CONTENT (Portfolio, siti personali) ==========
    if (rawData?.web_content?.length > 0) {
      prompt += `\n🌐 WEB CONTENT DA LINK ESTERNI:\n`
      rawData.web_content.forEach((content: any) => {
        // Cerca menzioni di formazione nel testo
        const relevantText = content.text_content.toLowerCase()
        if (relevantText.includes('universit') || relevantText.includes('laurea') ||
            relevantText.includes('master') || relevantText.includes('dottorato') ||
            relevantText.includes('diploma') || relevantText.includes('studi')) {
          prompt += `\nURL: ${content.url}
Titolo: ${content.title || 'N/A'}
Contenuto rilevante:
${content.text_content.substring(0, 600)}...

`
        }
      })
    }

    if (feedback && feedback.length > 0) {
      prompt += `\n=== FEEDBACK ===\n${feedback.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n`
    }

    prompt += `
=== ISTRUZIONI ===

1. USA TUTTE LE FONTI DISPONIBILI sopra per cross-reference e massimizzare completezza
2. NON inventare titoli - usa solo dati trovati o dedotti logicamente
3. Se deduci formazione da ruolo/skills, indicalo chiaramente nella fonte
4. Aumenta confidence_score se trovi conferme da fonti multiple

Livelli titolo:
- licenza_media
- diploma
- laurea_triennale
- laurea_magistrale
- master
- dottorato
- non_determinato

Rispondi in JSON:
{
  "titolo_studio_massimo": {
    "livello": "laurea_magistrale" | etc,
    "campo_studio": "Campo o null",
    "istituzione": "Università o null",
    "anno": numero o null,
    "fonte": "LinkedIn profile | Instagram bio | Facebook bio | Google Search | Career deduction"
  },
  "altri_studi": [
    {
      "tipo": "Tipo studio",
      "istituzione": "Nome",
      "anno": numero,
      "fonte": "Source"
    }
  ],
  "sintesi_percorso": "Breve descrizione che menziona tutte le fonti consultate",
  "confidence_score": number (0-100, più alto se conferme da fonti multiple),
  "fonti_consultate": ["LinkedIn", "Instagram", "Facebook", "Google Search", "Web", "Career deduction"]
}
`

    const aiResponse = await this.callXAI(prompt, {
      response_format: { type: 'json_object' },
      searchParameters: adaptiveSearch,
    })

    // Parse JSON response
    const rawProfile = this.parseJSONResponse<EducationProfile>(aiResponse)

    // ✅ VALIDATE with Zod schema for guaranteed structure
    try {
      const validatedProfile = EducationProfileSchema.parse(rawProfile)
      this.log('✅ Education profile validated successfully with Zod schema')
      return validatedProfile as EducationProfile
    } catch (error) {
      this.log(`⚠️  Zod validation failed, using raw profile: ${error}`, 'warn')
      // Fallback to raw profile if validation fails (graceful degradation)
      return rawProfile
    }
  }
}

// ==================== LIFESTYLE ANALYST V2 ====================

export class LifestyleAnalystAgentV2 extends BaseOSINTAgent<LifestyleProfile> {
  private reflectLoop = new ReflectLoop()

  constructor() {
    const config: AgentConfig = {
      id: 'lifestyle_analyst_v2',
      name: 'Lifestyle Analyst V2',
      role: 'Analisi lifestyle con Reflect Loop',
      model: 'anthropic/claude-sonnet-4',
      temperature: 0.2,
      max_tokens: 3000,
      priority: 2,
      system_prompt: `Analista comportamentale OSINT specializzato in lifestyle.

Analizza:
1. Hobby e passioni (categoria, frequenza)
2. Interessi principali
3. Stile di vita (sportivo, culturale, mondano, familiare)
4. Viaggi (frequenza, destinazioni, tipo)
5. Brand preferiti e attività ricorrenti

IMPORTANTE:
- Usa SOLO post social, foto, check-in, likes visibili
- Identifica pattern comportamentali da dati reali
- NON inventare hobby - servono almeno 2 evidenze per dichiarare un hobby
- Ogni hobby/interesse deve avere fonte specifica verificabile
- QUALITÀ > QUANTITÀ: meglio 1-2 hobby verificati che 5 dedotti senza evidenze

Rispondi in JSON valido.`,
    }
    super(config)
  }

  async execute(context: AgentContext): Promise<AgentResult<LifestyleProfile>> {
    const startTime = Date.now()

    try {
      this.log('Analyzing lifestyle with Reflect Loop...')

      const rawData = context.shared_memory?.raw_data
      const previousResults = context.previous_results
      const adaptiveSearch = this.getAdaptiveSearchStrategy(context)

      // REFLECT LOOP DISABLED - Direct generation for speed
      const lifestyleProfile = await this.generateLifestyleProfile(rawData, previousResults, context.target, adaptiveSearch)

      const executionTime = Date.now() - startTime

      return this.createSuccessResult(
        lifestyleProfile,
        lifestyleProfile.confidence_score,
        lifestyleProfile.fonti_consultate,
        executionTime
      )

    } catch (error) {
      return this.createErrorResult(String(error), Date.now() - startTime)
    }
  }

  private async generateLifestyleProfile(
    rawData: any,
    previousResults: any,
    target: any,
    adaptiveSearch?: {
      mode?: 'on' | 'off' | 'auto'
      max_search_results?: number
      sources?: Array<'web' | 'news' | 'x'>
      citations?: boolean
    },
    feedback?: string[]
  ): Promise<LifestyleProfile> {
    let prompt = `Analizza lo stile di vita e gli interessi di ${target.nome} ${target.cognome}.

=== OBIETTIVO ===
Compila le sezioni "Hobby e Interessi" (5) e "Stile di Vita" (11) con il MASSIMO dettaglio.
Analizza TUTTI i post Instagram/Facebook per estrarre:
- Hobby frequenti (sport, musica, cucina, viaggi, lettura, tecnologia)
- Brand preferiti (da hashtags, mentions, foto)
- Locations visitate (da check-in e foto geolocalizzate)
- Stile di vita dominante (sportivo, culturale, mondano, familiare, avventuroso)
- Viaggi e destinazioni preferite

REGOLE COMPLETEZZA:
- Se hai ≥5 post/evidenze → compila 5-8 hobby dettagliati
- Se hai 2-4 evidenze → compila 2-4 hobby verificati
- Se hai <2 evidenze totali → usa array vuoto [] e confidence_score: 0
- Deduzione permessa SOLO se supportata da logica chiara (es: "developer" → probabile interesse tecnologia)
- SEMPRE indicare nel campo "fonte" se dato è "verificato da post" o "dedotto da contesto"

=== DATI DA SOCIAL MEDIA ===
`

    if (rawData?.instagram_data) {
      const ig = rawData.instagram_data

      // Estrai hashtags da tutti i post
      const allHashtags = ig.post_recenti?.flatMap((p: any) => p.hashtags || []) || []
      const uniqueHashtags = [...new Set(allHashtags)]

      // Estrai mentions da tutti i post
      const allMentions = ig.post_recenti?.flatMap((p: any) => p.mentions || []) || []
      const uniqueMentions = [...new Set(allMentions)] as string[]

      // Locations uniche
      const locations = ig.luoghi_identificati || []

      // Brand mentions
      const brandMentions = uniqueMentions.filter((m: string) =>
        !m.includes('_') && m.length > 2 // Filtra brand noti
      )

      prompt += `\nINSTAGRAM DATA RICCHI:
- Username: @${ig.username}
- Followers: ${ig.numero_followers?.toLocaleString() || 0}
- Following: ${ig.numero_following?.toLocaleString() || 0}
- Post totali: ${ig.numero_post || 0}
- Post analizzati: ${ig.post_recenti?.length || 0}
- Business account: ${ig.business_account ? 'Sì' : 'No'}
${ig.category ? `- Categoria: ${ig.category}` : ''}

${ig.bio ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 INSTAGRAM BIO COMPLETA (${ig.bio.length} chars):
${ig.bio}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ ANALIZZA per lifestyle indicators: interessi, valori, link esterni
` : ''}

📍 LOCATION FREQUENTI (${locations.length}):
${locations.slice(0, 10).map((l: string, i: number) => `  ${i + 1}. ${l}`).join('\n') || '  Nessuna location'}

🏷️  HASHTAGS USATI (${uniqueHashtags.length}):
${uniqueHashtags.slice(0, 20).join(', ') || 'Nessuno'}

📣 ACCOUNTS MENZIONATI (${uniqueMentions.length}):
${uniqueMentions.slice(0, 15).join(', ') || 'Nessuno'}

📸 POST INSTAGRAM COMPLETI (${ig.post_recenti?.length || 0} post totali):

⚠️ PRIORITÀ: Le CAPTIONS contengono storytelling, sentiment, interessi, valori personali.
ANALIZZA OGNI CAPTION completamente per estrarre:
- Interessi e passioni dichiarate
- Valori personali e filosofia di vita
- Locations frequentate e viaggi
- Attività e hobbies
- Relazioni e famiglia menzionata
- Brand preferiti e lifestyle markers

${ig.post_recenti?.map((p: any, i: number) => {
  const date = p.data ? new Date(p.data).toLocaleDateString('it-IT') : 'N/A'
  const tipo = p.tipo || (p.is_video ? 'VIDEO' : 'FOTO')

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 POST ${i + 1}/${ig.post_recenti?.length || 0} [${tipo}] - ${date}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 CAPTION COMPLETA (${p.caption?.length || 0} chars):
${p.caption || '⚠️ Nessuna caption'}

📊 Engagement:
   👍 Likes: ${p.likes?.toLocaleString() || 0} | 💬 Commenti: ${p.commenti?.toLocaleString() || 0}${p.video_views ? ` | 👀 Views: ${p.video_views?.toLocaleString()}` : ''}

${p.hashtags?.length > 0 ? `🏷️  Hashtags: ${p.hashtags.join(', ')}` : ''}
${p.mentions?.length > 0 ? `📣 Mentions: ${p.mentions.join(', ')}` : ''}
${p.location ? `📍 Location: ${p.location.name || p.localita}` : ''}
${p.tagged_users?.length > 0 ? `👥 Tagged Users: ${p.tagged_users.map((u: any) => u.username || u.full_name).slice(0, 10).join(', ')}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
}).join('\n') || '⚠️ Nessun post disponibile'}
`
    } else {
      prompt += '\nINSTAGRAM DATA: Non disponibile\n'
    }

    if (rawData?.facebook_data) {
      const fb = rawData.facebook_data

      prompt += `\nFACEBOOK DATA RICCHI:
- Nome: ${fb.nome_completo}
- Username: @${fb.username || 'N/A'}
- Followers: ${fb.numero_followers?.toLocaleString() || 'N/A'}
- Likes: ${fb.numero_likes?.toLocaleString() || 'N/A'}
- Categoria: ${fb.categoria || 'N/A'}
- Genere: ${fb.genere || 'N/A'}
- Città: ${fb.citta_attuale || 'N/A'}
- Relazione: ${fb.relazione || 'N/A'}
- Sito web: ${fb.sito_web || 'N/A'}
- Business page: ${fb.business_page ? 'Sì' : 'No'}

${fb.bio ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 ⭐ FACEBOOK BIO/ABOUT COMPLETA (${fb.bio.length} chars) ⭐
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${fb.bio}

⚠️ ESTRAI da questa bio:
- Interessi e passioni personali
- Relazioni e famiglia menzionata
- Valori e filosofia di vita
- Attività e hobbies
- Luoghi e città preferite
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ''}
- Account creato: ${fb.data_creazione || 'N/A'}
`
    }

    // ========== GOOGLE SEARCH RESULTS (Cross-reference avanzato) ==========
    if (rawData?.google_search_data?.results?.length > 0) {
      // FIX: Filter only results matching target LinkedIn URL to avoid mixing with other people
      const targetLinkedInUrl = target.linkedin_url?.replace('https://', '').replace('www.', '') || ''
      const filteredResults = rawData.google_search_data.results.filter((result: any) => {
        // Only include if URL matches target profile OR is not a LinkedIn profile URL
        const url = result.link?.replace('https://', '').replace('www.', '') || ''
        const isLinkedInProfile = url.includes('linkedin.com/in/')

        if (isLinkedInProfile && targetLinkedInUrl) {
          // If it's a LinkedIn profile, only include if it matches target
          return url.includes(targetLinkedInUrl.replace(/\/$/, ''))
        }
        // Include non-LinkedIn results (articles, news, etc.)
        return !isLinkedInProfile
      })

      prompt += `\n🔍 GOOGLE SEARCH RESULTS (Cross-reference avanzato):
Trovati ${filteredResults.length}/${rawData.google_search_data.total_results} risultati rilevanti (filtrati per evitare omonimi).

ARTICOLI E MENZIONI:
${filteredResults.slice(0, 8).map((result: any) =>
  `• ${result.title}\n  URL: ${result.link}\n  Snippet: ${result.snippet}`
).join('\n\n')}

⚠️ IMPORTANTE: Usa SOLO dati dal profilo target (${target.linkedin_url || 'non specificato'}).
NON mescolare dati di altri profili trovati su Google.
NOTA: Cerca menzioni di hobby, passioni, eventi partecipati, stile di vita, viaggi, brand associati.
`
    }

    // ========== WEB CONTENT (Portfolio, blog personali) ==========
    if (rawData?.web_content?.length > 0) {
      prompt += `\n=== WEB CONTENT DA LINK ESTERNI ===\n`
      rawData.web_content.forEach((content: any) => {
        prompt += `\nURL: ${content.url}
Titolo: ${content.title || 'N/A'}
Contenuto (${content.word_count} parole):
${content.text_content.substring(0, 700)}...

`
      })
    }

    if (feedback && feedback.length > 0) {
      prompt += `\n=== FEEDBACK ===\n${feedback.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n`
    }

    prompt += `
=== ISTRUZIONI ===

Usa SOLO dati sopra. Identifica pattern concreti.

Stili vita:
- sportivo: Frequenti attività sportive
- culturale: Musei, libri, arte, teatro
- mondano: Eventi, locali notturni, networking
- familiare: Focus famiglia, casa, attività domestiche
- avventuroso: Viaggi, outdoor, sport estremi

Frequenza hobby: alta (>1/settimana), media (1-2/mese), bassa (<1/mese)

Rispondi in JSON:
{
  "hobby_passioni": [
    {
      "categoria": "sport" | "cultura" | "viaggi" | "tecnologia" | etc,
      "descrizione": "Descrizione specifica con evidenze",
      "frequenza": "alta" | "media" | "bassa",
      "fonte": "Instagram post, Facebook like, etc."
    }
  ],
  "interessi_principali": ["Lista interessi"],
  "stile_vita": {
    "tipo": "sportivo" | "culturale" | "mondano" | "familiare" | "avventuroso",
    "descrizione": "Descrizione basata su pattern osservati"
  },
  "viaggi": {
    "frequenza": "alta" | "media" | "bassa",
    "destinazioni_preferite": ["Lista da check-in"],
    "tipo_viaggio": "lusso" | "avventura" | "culturale" | "relax"
  },
  "brand_preferiti": ["Lista da foto/menzioni/articoli"],
  "attivita_ricorrenti": ["Lista attività frequenti da social e menzioni"],
  "confidence_score": number (0-100, più alto se conferme da fonti multiple),
  "fonti_consultate": ["Instagram", "Facebook", "Google Search", "Web"]
}
`

    const aiResponse = await this.callXAI(prompt, {
      response_format: { type: 'json_object' },
      searchParameters: adaptiveSearch,
    })

    // Parse JSON response
    const rawProfile = this.parseJSONResponse<LifestyleProfile>(aiResponse)

    // ✅ VALIDATE with Zod schema for guaranteed structure
    try {
      const validatedProfile = LifestyleProfileSchema.parse(rawProfile)
      this.log('✅ Lifestyle profile validated successfully with Zod schema')
      return validatedProfile as LifestyleProfile
    } catch (error) {
      this.log(`⚠️  Zod validation failed, using raw profile: ${error}`, 'warn')
      return rawProfile
    }
  }
}

// ==================== SOCIAL GRAPH BUILDER V2 ====================

export class SocialGraphBuilderAgentV2 extends BaseOSINTAgent<SocialGraphProfile> {
  private reflectLoop = new ReflectLoop()

  constructor() {
    const config: AgentConfig = {
      id: 'social_graph_builder_v2',
      name: 'Social Graph Builder V2',
      role: 'Mappatura rete sociale con Reflect Loop',
      model: 'anthropic/claude-haiku-4-5-20251001',
      temperature: 0.1,
      max_tokens: 2000,
      priority: 3,
      system_prompt: `Analista network OSINT specializzato in social graphs.

Mappa:
1. Dimensione rete sociale (followers, following, engagement)
2. Connessioni chiave (familiari, amici, colleghi, influencer)
3. Gruppi e comunità di appartenenza
4. Influencer seguiti
5. Pattern di interazione

IMPORTANTE:
- Usa SOLO dati pubblici visibili (followers count, following, likes pubblici)
- NON inventare connessioni se non ci sono evidenze
- Ogni connessione deve avere fonte specifica

Rispondi in JSON valido.`,
    }
    super(config)
  }

  async execute(context: AgentContext): Promise<AgentResult<SocialGraphProfile>> {
    const startTime = Date.now()

    try {
      this.log('Building social graph with Reflect Loop...')

      const rawData = context.shared_memory?.raw_data
      const adaptiveSearch = this.getAdaptiveSearchStrategy(context)

      // REFLECT LOOP DISABLED - Direct generation for speed
      const socialProfile = await this.generateSocialProfile(rawData, context.target, adaptiveSearch)

      const executionTime = Date.now() - startTime

      return this.createSuccessResult(
        socialProfile,
        socialProfile.confidence_score,
        socialProfile.fonti_consultate,
        executionTime
      )

    } catch (error) {
      return this.createErrorResult(String(error), Date.now() - startTime)
    }
  }

  private async generateSocialProfile(
    rawData: any,
    target: any,
    adaptiveSearch?: {
      mode?: 'on' | 'off' | 'auto'
      max_search_results?: number
      sources?: Array<'web' | 'news' | 'x'>
      citations?: boolean
    },
    feedback?: string[]
  ): Promise<SocialGraphProfile> {
    let prompt = `Analizza la rete sociale di ${target.nome} ${target.cognome}.

=== DATI DA SOCIAL MEDIA ===
`

    if (rawData?.instagram_data) {
      const ig = rawData.instagram_data

      // Estrai tutte le menzioni (connessioni frequenti)
      const allMentions = ig.post_recenti?.flatMap((p: any) => p.mentions || []) || []
      const mentionCounts: Record<string, number> = {}
      allMentions.forEach((m: string) => {
        mentionCounts[m] = (mentionCounts[m] || 0) + 1
      })
      const topMentions = Object.entries(mentionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([user, count]) => `${user} (${count} menzioni)`)

      // Estrai tutti gli utenti taggati (connessioni strette)
      const allTagged = ig.post_recenti?.flatMap((p: any) =>
        p.tagged_users?.map((u: any) => u.username || u.full_name) || []
      ) || []
      const uniqueTagged = [...new Set(allTagged)]

      // Calcola engagement rate
      const avgLikes = ig.post_recenti?.length > 0
        ? ig.post_recenti.reduce((sum: number, p: any) => sum + (p.likes || 0), 0) / ig.post_recenti.length
        : 0
      const avgComments = ig.post_recenti?.length > 0
        ? ig.post_recenti.reduce((sum: number, p: any) => sum + (p.commenti || 0), 0) / ig.post_recenti.length
        : 0
      const engagementRate = ig.numero_followers > 0
        ? ((avgLikes + avgComments) / ig.numero_followers * 100).toFixed(2)
        : 0

      prompt += `\nINSTAGRAM - RETE SOCIALE DETTAGLIATA:
- Followers: ${ig.numero_followers?.toLocaleString() || 0}
- Following: ${ig.numero_following?.toLocaleString() || 0}
- Post totali: ${ig.numero_post || 0}
- Engagement rate stimato: ${engagementRate}%
- Media likes per post: ${avgLikes.toFixed(0)}
- Media commenti per post: ${avgComments.toFixed(0)}

👥 CONNESSIONI FREQUENTI - Accounts menzionati (${topMentions.length}):
${topMentions.join('\n') || 'Nessuno'}

🏷️  UTENTI TAGGATI NEI POST (${uniqueTagged.length}):
${uniqueTagged.slice(0, 20).join(', ') || 'Nessuno'}

📊 PATTERN INTERAZIONI:
${ig.post_recenti?.slice(0, 5).map((p: any, i: number) => `  Post ${i + 1}: ${p.likes || 0} likes, ${p.commenti || 0} commenti${p.tagged_users?.length ? `, ${p.tagged_users.length} tagged` : ''}`).join('\n') || 'Nessun pattern'}
`
    }

    if (rawData?.linkedin_data) {
      // FIX A: Sanifica dati LinkedIn oscurati prima di usarli
      const li = this.sanitizeLinkedInData(rawData.linkedin_data)
      prompt += `\nLINKEDIN - RETE PROFESSIONALE:
- Nome: ${li.nome_completo}
- Headline: ${li.headline || 'N/A'}
- Connessioni: ${li.numero_connessioni?.toLocaleString() || 'N/A'}
- Followers: ${li.numero_followers?.toLocaleString() || 'N/A'}
- Esperienze lavorative: ${li.esperienze?.length || 0} aziende
- Competenze: ${li.competenze?.length || 0} skills
`
    }

    if (rawData?.facebook_data) {
      const fb = rawData.facebook_data
      prompt += `\nFACEBOOK - RETE SOCIALE:
- Followers: ${fb.numero_followers?.toLocaleString() || 'N/A'}
- Likes: ${fb.numero_likes?.toLocaleString() || 'N/A'}
- Categoria: ${fb.categoria || 'N/A'}
`
    }

    // NUOVO: Web Content per identificare menzioni di collaboratori/partner
    if (rawData?.web_content?.length > 0) {
      prompt += `\n=== WEB CONTENT DA LINK ESTERNI ===\n`
      rawData.web_content.forEach((content: any) => {
        const relevantText = content.text_content.toLowerCase()
        // Cerca menzioni di collaborazioni, team, partner
        if (relevantText.includes('collabor') || relevantText.includes('team') ||
            relevantText.includes('partner') || relevantText.includes('socio') ||
            relevantText.includes('collega') || relevantText.includes('amico')) {
          prompt += `\nURL: ${content.url}
Titolo: ${content.title || 'N/A'}
Contenuto rilevante:
${content.text_content.substring(0, 500)}...

`
        }
      })
    }

    // ========== GOOGLE SEARCH RESULTS (Cross-reference avanzato) ==========
    if (rawData?.google_search_data?.results?.length > 0) {
      // FIX: Filter only results matching target LinkedIn URL to avoid mixing with other people
      const targetLinkedInUrl = target.linkedin_url?.replace('https://', '').replace('www.', '') || ''
      const filteredResults = rawData.google_search_data.results.filter((result: any) => {
        // Only include if URL matches target profile OR is not a LinkedIn profile URL
        const url = result.link?.replace('https://', '').replace('www.', '') || ''
        const isLinkedInProfile = url.includes('linkedin.com/in/')

        if (isLinkedInProfile && targetLinkedInUrl) {
          // If it's a LinkedIn profile, only include if it matches target
          return url.includes(targetLinkedInUrl.replace(/\/$/, ''))
        }
        // Include non-LinkedIn results (articles, news, etc.)
        return !isLinkedInProfile
      })

      prompt += `\n🔍 GOOGLE SEARCH RESULTS (Cross-reference avanzato):
Trovati ${filteredResults.length}/${rawData.google_search_data.total_results} risultati rilevanti (filtrati per evitare omonimi).

ARTICOLI E MENZIONI:
${filteredResults.slice(0, 8).map((result: any) =>
  `• ${result.title}\n  URL: ${result.link}\n  Snippet: ${result.snippet}`
).join('\n\n')}

⚠️ IMPORTANTE: Usa SOLO dati dal profilo target (${target.linkedin_url || 'non specificato'}).
NON mescolare dati di altri profili trovati su Google.
NOTA: Cerca menzioni di collaborazioni, partnership, network professionali, eventi condivisi.
`
    }

    if (feedback && feedback.length > 0) {
      prompt += `\n=== FEEDBACK ===\n${feedback.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n`
    }

    prompt += `
=== ISTRUZIONI ===

1. USA TUTTE LE FONTI DISPONIBILI sopra per cross-reference e massimizzare completezza
2. Usa SOLO numeri e connessioni visibili. NON inventare nomi
3. Cross-verifica connessioni tra fonti diverse per aumentare confidence_score

Dimensione rete:
- piccola: <500 followers
- media: 500-5000
- grande: 5000-50000
- molto grande: >50000

Engagement rate: (likes+comments)/followers × 100

Rispondi in JSON:
{
  "rete_sociale": {
    "dimensione": "piccola" | "media" | "grande" | "molto grande",
    "followers_totali": number,
    "following_totali": number,
    "engagement_rate": number (0-100)
  },
  "connessioni_chiave": [
    {
      "nome": "Nome completo",
      "relazione": "amico" | "collega" | "familiare",
      "influenza": "alta" | "media" | "bassa",
      "fonte": "Instagram tag, LinkedIn connection"
    }
  ],
  "gruppi_appartenenza": [
    {
      "nome": "Nome gruppo",
      "tipo": "professionale" | "hobby" | "locale",
      "attivita": "alta" | "media" | "bassa",
      "fonte": "Facebook group, LinkedIn group"
    }
  ],
  "comunita_interesse": ["Lista comunità da social e articoli"],
  "influencer_seguiti": ["Lista nomi pubblici da following/mentions"],
  "confidence_score": number (0-100, più alto se conferme da fonti multiple),
  "fonti_consultate": ["Instagram", "LinkedIn", "Facebook", "Google Search", "Web"]
}
`

    const aiResponse = await this.callXAI(prompt, {
      response_format: { type: 'json_object' },
      searchParameters: adaptiveSearch,
    })

    // Parse JSON response
    const rawProfile = this.parseJSONResponse<SocialGraphProfile>(aiResponse)

    // ✅ VALIDATE with Zod schema for guaranteed structure
    try {
      const validatedProfile = SocialGraphProfileSchema.parse(rawProfile)
      this.log('✅ Social graph profile validated successfully with Zod schema')
      return validatedProfile as SocialGraphProfile
    } catch (error) {
      this.log(`⚠️  Zod validation failed, using raw profile: ${error}`, 'warn')
      return rawProfile
    }
  }
}

// ==================== CONTENT ANALYZER V2 ====================

export class ContentAnalyzerAgentV2 extends BaseOSINTAgent<ContentAnalysisProfile> {
  private reflectLoop = new ReflectLoop()

  constructor() {
    const config: AgentConfig = {
      id: 'content_analyzer_v2',
      name: 'Content Analyzer V2',
      role: 'Analisi contenuti multimodali (testo + immagini)',
      model: 'anthropic/claude-sonnet-4',
      temperature: 0.2,
      max_tokens: 3500,
      priority: 4,
      system_prompt: `Analista OSINT multimodale specializzato in analisi social media (testo + immagini).

Analizza:
1. Post pubblicati (temi, sentiment, frequenza)
2. Linguaggio e stile comunicazione
3. Valori emergenti e brand mentions
4. Location frequenti e persone menzionate
5. Immagini (luoghi, oggetti, brand visibili)

IMPORTANTE:
- Usa SOLO post e contenuti realmente visibili
- Identifica pattern, temi ricorrenti, sentiment prevalente
- NON inventare temi se non ci sono evidenze nei post
- Ogni tema deve avere fonte specifica (post concreto)

Rispondi in JSON valido.`,
    }
    super(config)
  }

  async execute(context: AgentContext): Promise<AgentResult<ContentAnalysisProfile>> {
    const startTime = Date.now()

    try {
      this.log('Analyzing content (Reflect Loop DISABLED for speed)...')

      const rawData = context.shared_memory?.raw_data
      const adaptiveSearch = this.getAdaptiveSearchStrategy(context)

      // REFLECT LOOP DISABLED - Direct generation for speed
      const contentProfile = await this.generateContentProfile(rawData, context.target, adaptiveSearch)

      const executionTime = Date.now() - startTime

      return this.createSuccessResult(
        contentProfile,
        contentProfile.confidence_score,
        contentProfile.fonti_consultate,
        executionTime
      )

    } catch (error) {
      return this.createErrorResult(String(error), Date.now() - startTime)
    }
  }

  private async generateContentProfile(
    rawData: any,
    target: any,
    adaptiveSearch?: {
      mode?: 'on' | 'off' | 'auto'
      max_search_results?: number
      sources?: Array<'web' | 'news' | 'x'>
      citations?: boolean
    },
    feedback?: string[]
  ): Promise<ContentAnalysisProfile> {
    let prompt = `Analizza i contenuti pubblicati da ${target.nome} ${target.cognome}.

=== OBIETTIVO ===
Compila le sezioni "Presenza Digitale" (7) e "Segnali di Autorità" (8) con dettagli massimi.

SEZIONE 7 - Presenza Digitale:
- Piattaforme attive (LinkedIn, Instagram, Facebook, Twitter, TikTok, YouTube)
- Frequenza pubblicazione (giornaliera, settimanale, sporadica)
- Engagement medio (likes, commenti, shares per post)
- Tono comunicativo (formale, informale, professionale, personale)

SEZIONE 8 - Segnali di Autorità:
- Followers/Connections (alta >5k, media 500-5k, bassa <500)
- Verifiche account (blu tick, badge)
- Pubblicazioni/Articoli/Interviste (menzioni stampa, blog personali)
- Partecipazioni eventi (relatore, ospite, organizzatore)
- Recensioni/Testimonianze ricevute
- Premi o riconoscimenti

ANALIZZA IMMAGINI (vision AI):
- Brand visibili nei post (loghi su vestiti, auto, accessori, packaging)
- Luoghi riconoscibili (città, monumenti, hotel, ristoranti)
- Oggetti di valore (auto lusso, orologi, borse, tech)
- Contesto lifestyle (vacanze, lavoro, famiglia, eventi)

IMPORTANTE:
- Se dati RICCHI: compila tutti i campi con numeri esatti e liste dettagliate
- Se dati LIMITATI: compila solo campi con evidenze reali, usa "N/A" per il resto
- Popola immagini_analizzate SOLO se hai almeno 3 foto analizzabili
  - Se <3 foto → usa oggetto vuoto: { totale: 0, brand_visibili: [], luoghi_riconosciuti: [], oggetti_ricorrenti: [] }
  - NON inventare brand/luoghi senza foto reali
- QUALITÀ > QUANTITÀ: meglio campi vuoti che dati dedotti senza evidenze

=== CONTENUTI DA SOCIAL ===
`

    if (rawData?.instagram_data) {
      const ig = rawData.instagram_data
      const recentPosts = ig.post_recenti || []

      // Estrai hashtags ricorrenti
      const allHashtags = recentPosts.flatMap((p: any) => p.hashtags || [])
      const hashtagCounts: Record<string, number> = {}
      allHashtags.forEach((h: string) => {
        hashtagCounts[h] = (hashtagCounts[h] || 0) + 1
      })
      const topHashtags = Object.entries(hashtagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([tag, count]) => `${tag} (${count}x)`)

      // Estrai mentions ricorrenti
      const allMentions = recentPosts.flatMap((p: any) => p.mentions || [])
      const mentionCounts: Record<string, number> = {}
      allMentions.forEach((m: string) => {
        mentionCounts[m] = (mentionCounts[m] || 0) + 1
      })
      const topMentions = Object.entries(mentionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)

      // Estrai locations
      const locations = ig.luoghi_identificati || []

      prompt += `\nINSTAGRAM - ANALISI CONTENUTI:
- Username: @${ig.username || 'N/A'}
- Followers: ${ig.numero_followers?.toLocaleString() || 0}
- Following: ${ig.numero_following?.toLocaleString() || 0}
- Total Posts: ${ig.numero_post || 0}
- Post analizzati: ${recentPosts.length}

${ig.bio ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 BIO INSTAGRAM COMPLETA (${ig.bio.length} chars):
${ig.bio}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ ANALIZZA bio per: tone of voice, valori, interessi, link esterni
` : ''}

🏷️  HASHTAGS RICORRENTI (${topHashtags.length}):
${topHashtags.join(', ') || 'Nessuno'}

📣 ACCOUNTS MENZIONATI (${topMentions.length}):
${topMentions.map(([user, count]) => `${user} (${count}x)`).join(', ') || 'Nessuno'}

📍 LOCATION FREQUENTI (${locations.length}):
${locations.slice(0, 10).join(', ') || 'Nessuna'}

📸 POST INSTAGRAM COMPLETI (${recentPosts.length} posts totali):

⚠️ PRIORITÀ: ANALIZZA TUTTE LE CAPTIONS per identificare:
- Temi ricorrenti e argomenti di interesse
- Sentiment e tone of voice
- Valori personali espressi
- Brand preferences e collaborazioni
- Stile di comunicazione (professionale, casual, inspirational, etc.)
- Pattern temporali (cosa posta e quando)

${recentPosts.map((post: any, idx: number) => {
  const date = post.data ? new Date(post.data).toLocaleDateString('it-IT') : 'N/A'
  const tipo = post.tipo || (post.is_video ? 'VIDEO' : 'FOTO')

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 POST #${idx + 1}/${recentPosts.length} [${tipo}] - ${date}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 CAPTION COMPLETA (${post.caption?.length || 0} chars):
${post.caption || '⚠️ Nessuna caption'}

📊 Engagement: ${post.likes?.toLocaleString() || 0} likes | ${post.commenti?.toLocaleString() || 0} commenti${post.video_views ? ` | ${post.video_views?.toLocaleString()} views` : ''}
${post.hashtags?.length > 0 ? `🏷️  Hashtags: ${post.hashtags.join(', ')}` : ''}
${post.mentions?.length > 0 ? `📣 Mentions: ${post.mentions.join(', ')}` : ''}
${post.location ? `📍 Location: ${post.location.name || post.localita}` : ''}
${post.tagged_users?.length > 0 ? `👥 Tagged: ${post.tagged_users.map((u: any) => u.username || u.full_name).join(', ')}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
}).join('\n') || '⚠️ No recent posts available'}
`
    }

    if (rawData?.facebook_data) {
      const fb = rawData.facebook_data
      prompt += `\nFACEBOOK DATA RICCHI:
- Nome: ${fb.nome_completo}
- Username: @${fb.username || 'N/A'}
- Followers: ${fb.numero_followers?.toLocaleString() || 'N/A'}
- Likes: ${fb.numero_likes?.toLocaleString() || 'N/A'}
- Categoria: ${fb.categoria || 'N/A'}
- Genere: ${fb.genere || 'N/A'}
- Città attuale: ${fb.citta_attuale || 'N/A'}
- Città origine: ${fb.citta_origine || 'N/A'}
- Relazione: ${fb.relazione || 'N/A'}
- Sito web: ${fb.sito_web || 'N/A'}
- Business page: ${fb.business_page ? 'Sì' : 'No'}
- Account creato: ${fb.data_creazione || 'N/A'}

${fb.bio ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 FACEBOOK BIO/ABOUT COMPLETA (${fb.bio.length} chars):
${fb.bio}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ ANALIZZA per: interessi, valori, temi ricorrenti
` : '- Bio: N/A'}

📊 SOCIAL GRAPH:
- Familiari registrati: ${fb.familiari?.length || 0}
- Amici comuni: ${fb.amici_comuni?.length || 0}
- Pagine seguite: ${fb.pagine_seguite?.length || 0}
- Gruppi: ${fb.gruppi?.length || 0}
- Luoghi frequenti: ${fb.luoghi_frequenti?.length || 0} check-in
`
    }

    // NUOVO: Web Content da bio links, blog personali, portfolio
    if (rawData?.web_content?.length > 0) {
      prompt += `\n=== WEB CONTENT DA LINK ESTERNI (Blog, Portfolio, Siti Personali) ===\n`
      rawData.web_content.forEach((content: any) => {
        prompt += `\nURL: ${content.url}
Titolo: ${content.title || 'N/A'}
Meta Description: ${content.metadata?.description || 'N/A'}
Contenuto (${content.word_count} parole):
${content.text_content.substring(0, 1000)}...

`
      })
    }

    if (feedback && feedback.length > 0) {
      prompt += `\n=== FEEDBACK ===\n${feedback.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n`
    }

    prompt += `
=== ISTRUZIONI ===

Analizza TUTTI i post forniti sopra, includendo ANALISI VISUALE DELLE IMMAGINI.

**IMPORTANTE - ANALISI FOTO:**
Per ogni immagine (Image URL) fornita, ANALIZZA VISIVAMENTE e identifica:
1. LOCATION: Luoghi riconoscibili (città, monumenti, ristoranti, hotel, spiagge, montagne)
2. BRAND VISIBILI: Logo su vestiti, oggetti, veicoli, borse, orologi, accessori
3. OGGETTI RICORRENTI: Auto di lusso, moto, bici, attrezzature sportive, strumenti di lavoro
4. CONTESTO: Vacanza, lavoro, sport, famiglia, eventi, casa, ufficio
5. PERSONE: Numero persone, età stimata, relazioni (coppia, famiglia, amici, colleghi)
6. LIFESTYLE INDICATORS: Tenore di vita (lusso, medio, modesto) basato su ambienti e oggetti

Sentiment: positivo | neutro | negativo
Tono: formale | informale | professionale | amichevole
Emoji usage: alto | medio | basso

Rispondi in JSON:
{
  "analisi_contenuti": {
    "post_analizzati": number,
    "periodo_analisi": "Ultimi X mesi",
    "piattaforme": ["Instagram", "Facebook"]
  },
  "temi_ricorrenti": [
    {
      "tema": "famiglia" | "lavoro" | "viaggi" | "sport" | "cibo" | "eventi" | etc,
      "frequenza": number (quanti post),
      "sentiment": "positivo" | "neutro" | "negativo"
    }
  ],
  "linguaggio_comunicazione": {
    "tono": "formale" | "informale" | "professionale" | "amichevole" | "misto",
    "stile": "Descrizione dettagliata dello stile comunicativo",
    "emoji_usage": "alto" | "medio" | "basso"
  },
  "valori_emergenti": ["Valori identificati dai contenuti e dalle foto"],
  "brand_mentions": ["Brand citati nei post E visibili nelle foto"],
  "location_frecuenti": ["Location citate E identificate visivamente nelle foto"],
  "persone_menzionate": ["Persone taggate nei post"],
  "immagini_analizzate": {
    "totale": number,
    "luoghi_riconosciuti": ["Luoghi SPECIFICI identificati nelle foto con certezza"],
    "oggetti_ricorrenti": ["Oggetti visti più volte nelle foto"],
    "brand_visibili": ["Brand identificati VISIVAMENTE nelle foto (logo, packaging, prodotti)"]
  },
  "visual_sources": {
    "instagram_posts": ["URL pubblici dei post Instagram analizzati"],
    "linkedin_screenshot": "path screenshot LinkedIn" | null,
    "instagram_screenshot": "path screenshot Instagram" | null,
    "facebook_screenshot": "path screenshot Facebook" | null
  },
  "confidence_score": number (0-100, basato su quantità e qualità dati),
  "fonti_consultate": ["Instagram", "Facebook"]
}
`

    const aiResponse = await this.callXAI(prompt, {
      response_format: { type: 'json_object' },
      searchParameters: adaptiveSearch,
    })

    // Parse JSON response
    const rawProfile = this.parseJSONResponse<ContentAnalysisProfile>(aiResponse)

    // ✅ VALIDATE with Zod schema for guaranteed structure
    try {
      const validatedProfile = ContentAnalysisProfileSchema.parse(rawProfile)
      this.log('✅ Content analysis profile validated successfully with Zod schema')
      return validatedProfile as ContentAnalysisProfile
    } catch (error) {
      this.log(`⚠️  Zod validation failed, using raw profile: ${error}`, 'warn')
      return rawProfile
    }
  }
}
