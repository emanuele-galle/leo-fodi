/**
 * Wealth Estimator Agent V2
 * Versione con Reflect Loop integrato per qualità output migliorata
 */

import { BaseOSINTAgent } from '../base-agent'
import { ReflectLoop, WEALTH_RUBRIC } from '@/lib/reflection'
import { WealthProfileSchema } from '../schemas/all-profiles.schema'
import type {
  AgentConfig,
  AgentContext,
  AgentResult,
  WealthProfile,
} from '../types'

export class WealthEstimatorAgentV2 extends BaseOSINTAgent<WealthProfile> {
  private reflectLoop = new ReflectLoop()

  constructor() {
    const config: AgentConfig = {
      id: 'wealth_estimator_v2',
      name: 'Wealth Estimator V2',
      role: 'Stima capacità economica con Reflect Loop',
      model: 'grok-4-fast-reasoning',
      temperature: 0.1,
      max_tokens: 2500,
      priority: 3,
      system_prompt: `Analista finanziario OSINT specializzato in wealth estimation.

Stima:
1. Fascia economica (bassa, media, alta, molto alta)
2. Reddito annuo stimato (range min-max)
3. Patrimonio stimato
4. Indicatori di ricchezza (residenza, auto, viaggi, brand, proprietà)
5. Tenore di vita

Basa le stime su:
- Professione e livello career
- Zona residenza
- Lifestyle indicators (viaggi lusso, brand premium, hobby costosi)
- Proprietà visibili (case, auto, barche)
- Social signals (ristoranti, eventi, club esclusivi)

IMPORTANTE:
- Usa SOLO dati verificabili da fonti OSINT reali
- NON inventare informazioni
- Se un dato non è disponibile, impostalo come null o "Non disponibile"
- Sii conservativo nelle stime, usa range ampi
- Giustifica ogni stima con indicatori specifici
- Assegna confidence score realistico basato su qualità/quantità fonti

Rispondi in JSON valido.`,
    }
    super(config)
  }

  async execute(context: AgentContext): Promise<AgentResult<WealthProfile>> {
    const startTime = Date.now()

    try {
      this.log('Estimating wealth with Reflect Loop (max 1 iteration)...')

      // Estrai dati da raw_data (Fase 0 scraping) e agenti precedenti
      const rawData = context.shared_memory?.raw_data
      const careerData = context.previous_results?.career
      const lifestyleData = context.previous_results?.lifestyle
      const familyData = context.previous_results?.family
      const adaptiveSearch = this.getAdaptiveSearchStrategy(context)

      const targetName = `${context.target.nome} ${context.target.cognome}`

      const { output: wealthProfile } = await this.reflectLoop.run<WealthProfile>(
        (feedback) => this.generateWealthProfile(rawData, careerData, lifestyleData, familyData, adaptiveSearch, feedback),
        WEALTH_RUBRIC,
        { maxIterations: 1, targetName }
      )

      const executionTime = Date.now() - startTime

      this.log(`Wealth estimation completed in ${executionTime}ms`)

      return this.createSuccessResult(
        wealthProfile,
        wealthProfile.confidence_score,
        wealthProfile.fonti_consultate,
        executionTime
      )

    } catch (error) {
      return this.createErrorResult(String(error), Date.now() - startTime)
    }
  }

  /**
   * Genera profilo wealth (può ricevere feedback da Critique Agent)
   */
  private async generateWealthProfile(
    rawData: any,
    careerData: any,
    lifestyleData: any,
    familyData: any,
    adaptiveSearch?: {
      mode?: 'on' | 'off' | 'auto'
      max_search_results?: number
      sources?: Array<'web' | 'news' | 'x'>
      citations?: boolean
    },
    feedback?: string[]
  ): Promise<WealthProfile> {

    // Costruisci prompt con tutti i dati disponibili
    let prompt = `Stima la capacità economica e il patrimonio basandoti ESCLUSIVAMENTE sui dati forniti.

=== DATI DA WEB SCRAPING (FASE 0) ===
`

    if (rawData?.linkedin_data) {
      // FIX A: Sanifica dati LinkedIn oscurati prima di usarli
      const li = this.sanitizeLinkedInData(rawData.linkedin_data)
      prompt += `\nLINKEDIN DATA:
- Headline: ${li.headline || 'N/A'}
- Località: ${li.localita || 'N/A'}
- Connessioni: ${li.numero_connessioni || li.connessioni || 'N/A'}
- Esperienza:
${li.esperienze?.map((exp: any) => `  • ${exp.ruolo || 'N/A'} @ ${exp.azienda || 'N/A'} (${exp.data_inizio || ''}-${exp.data_fine || 'Presente'})`).join('\n') || '  Nessuna esperienza trovata'}
- Formazione:
${li.formazione?.map((edu: any) => `  • ${edu.titolo || 'N/A'} @ ${edu.istituzione || 'N/A'}`).join('\n') || '  Nessuna formazione trovata'}
`
    } else {
      prompt += '\nLINKEDIN DATA: Non disponibile\n'
    }

    if (rawData?.instagram_data) {
      const ig = rawData.instagram_data
      prompt += `\n📸 INSTAGRAM DATA:
- Username: @${ig.username || 'N/A'}
- Followers: ${ig.numero_followers?.toLocaleString() || 'N/A'}
- Following: ${ig.numero_following?.toLocaleString() || 'N/A'}
- Post totali: ${ig.numero_post || 0}
- Business account: ${ig.business_account ? 'Sì' : 'No'}
- Categoria: ${ig.category || 'N/A'}
- Brand identificati: ${ig.brand_identificati?.join(', ') || 'Nessuno'}
- Locations frequenti: ${ig.luoghi_identificati?.join(', ') || 'Nessuna'}
- Attività rilevate: ${ig.attivita_identificate?.join(', ') || 'Nessuna'}

${ig.bio ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 BIO COMPLETA (${ig.bio.length} chars):
${ig.bio}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CERCA indicatori wealth: luxury brands, viaggi esclusivi, proprietà, investimenti
` : '- Bio: N/A'}
`
    } else {
      prompt += '\n📸 INSTAGRAM DATA: Non disponibile\n'
    }

    // ========== FACEBOOK BIO (Cross-reference) ==========
    if (rawData?.facebook_data?.bio) {
      prompt += `\n📱 FACEBOOK BIO (Cross-reference):
Bio: ${rawData.facebook_data.bio}
- Città: ${rawData.facebook_data.citta_attuale || 'N/A'}
- Categoria: ${rawData.facebook_data.categoria || 'N/A'}

NOTA: Cerca menzioni di proprietà, investimenti, business, lifestyle indicators.
`
    }

    // ========== GOOGLE SEARCH RESULTS (Cross-reference avanzato) ==========
    if (rawData?.google_search_data?.results?.length > 0) {
      // FIX B: Filtra risultati per evitare omonimi
      const filteredResults = this.filterGoogleSearchResults(
        rawData.google_search_data.results,
        target.linkedin_url || ''
      )

      prompt += `\n🔍 GOOGLE SEARCH RESULTS (Cross-reference avanzato):
Trovati ${filteredResults.length}/${rawData.google_search_data.total_results} risultati rilevanti (filtrati per evitare omonimi).

ARTICOLI E MENZIONI:
${filteredResults.slice(0, 8).map((result: any) =>
  `• ${result.title}\n  URL: ${result.link}\n  Snippet: ${result.snippet}`
).join('\n\n')}

⚠️ IMPORTANTE: Usa SOLO dati dal profilo target (${target.linkedin_url || 'non specificato'}).
NON mescolare dati di altri profili trovati su Google.
NOTA: Cerca menzioni di successi professionali, investimenti, proprietà, riconoscimenti economici.
`
    }

    if (rawData?.web_data?.length > 0) {
      prompt += `\nWEB DATA (${rawData.web_data.length} siti analizzati):
${rawData.web_data.map((site: any) => `- ${site.title}: ${site.description?.substring(0, 150) || 'No description'}`).join('\n')}
`
    } else {
      prompt += '\nWEB DATA: Non disponibile\n'
    }

    prompt += `
=== DATI DA AGENTI PRECEDENTI ===

CARRIERA:
${careerData ? JSON.stringify(careerData, null, 2) : 'Non disponibile'}

LIFESTYLE:
${lifestyleData ? JSON.stringify(lifestyleData, null, 2) : 'Non disponibile'}

RESIDENZA (da Family):
${familyData?.residenza ? JSON.stringify(familyData.residenza, null, 2) : 'Non disponibile'}
`

    // Aggiungi feedback se disponibile (iterazione successiva)
    if (feedback && feedback.length > 0) {
      prompt += `\n=== FEEDBACK DA CRITIQUE AGENT (migliora questi aspetti) ===
${feedback.map((f, i) => `${i + 1}. ${f}`).join('\n')}
`
    }

    prompt += `
=== ISTRUZIONI ===

1. USA TUTTE LE FONTI DISPONIBILI sopra per cross-reference e massimizzare accuratezza
2. Analizza ESCLUSIVAMENTE i dati forniti. Se un'informazione non è presente, NON inventarla
3. Cross-verifica indicatori tra fonti diverse per aumentare confidence_score

Criteri di stima:
1. **Professione**: Usa il ruolo attuale da LinkedIn/Career per stimare reddito
2. **Zona residenza**: Valuta indicatori ricchezza della zona da Family data
3. **Lifestyle signals**: Brand, viaggi, attività costose da Instagram/Lifestyle
4. **Social proof**: Numero connessioni LinkedIn, followers Instagram
5. **Proprietà visibili**: Auto, immobili, oggetti di lusso da foto social

Stime conservative:
- Fascia bassa: < 25k/anno
- Fascia media: 25k-50k/anno
- Fascia media-alta: 50k-100k/anno
- Fascia alta: 100k-200k/anno
- Fascia molto-alta: > 200k/anno

Patrimonio = 5-10x reddito annuo (a seconda età/carriera)

IMPORTANTE:
- Ogni indicatore deve citare la fonte specifica (es: "LinkedIn profile", "Instagram post del 2024-01-15")
- Se i dati sono insufficienti, riduci confidence score
- Se un campo non è deducibile, usa null o "Non disponibile"

Rispondi in JSON esatto:
{
  "valutazione_economica": {
    "fascia": "media" | "media-alta" | "alta" | "molto-alta",
    "reddito_stimato_annuo": {"min": number, "max": number},
    "patrimonio_stimato": {"min": number, "max": number},
    "confidence": number (0-100),
    "rationale": "Spiegazione logica della stima basata su indicatori specifici"
  },
  "indicatori_ricchezza": [
    {
      "tipo": "residenza" | "auto" | "viaggi" | "brand" | "proprietà" | "investimenti" | "altro",
      "descrizione": "Descrizione dettagliata con fonte",
      "peso": "basso" | "medio" | "alto",
      "fonte": "Source specifica (es: Instagram post, LinkedIn profile, Web article)"
    }
  ],
  "tenore_vita": {
    "descrizione": "Descrizione sintetica basata su dati concreti",
    "caratteristiche": ["Lista caratteristiche concrete osservate"]
  },
  "proprieta_note": [
    {
      "tipo": "immobile" | "veicolo" | "altro",
      "descrizione": "Descrizione con fonte",
      "valore_stimato": number | null,
      "fonte": "Source specifica"
    }
  ],
  "confidence_score": number (0-100, più alto se conferme da fonti multiple),
  "fonti_consultate": ["LinkedIn", "Instagram", "Facebook", "Google Search", "Web", "Career data", "Lifestyle data", "Family data"]
}
`

    // Call XAI con structured output
    const aiResponse = await this.callXAI(prompt, {
      response_format: { type: 'json_object' },
      searchParameters: adaptiveSearch,
    })

    // Parse JSON response
    const rawProfile = this.parseJSONResponse<WealthProfile>(aiResponse)

    // ✅ VALIDATE with Zod schema for guaranteed structure
    try {
      const validatedProfile = WealthProfileSchema.parse(rawProfile)
      this.log('✅ Wealth profile validated successfully with Zod schema')
      return validatedProfile as WealthProfile
    } catch (error) {
      this.log(`⚠️  Zod validation failed, using raw profile: ${error}`, 'warn')
      return rawProfile
    }
  }
}
