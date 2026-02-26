/**
 * Family Investigator Agent V2
 * Versione con Reflect Loop integrato per qualità output migliorata
 */

import { BaseOSINTAgent } from '../base-agent'
import { ReflectLoop, FAMILY_RUBRIC } from '@/lib/reflection'
import { FamilyProfileSchema } from '../schemas/all-profiles.schema'
import type {
  AgentConfig,
  AgentContext,
  AgentResult,
  FamilyProfile,
} from '../types'

export class FamilyInvestigatorAgentV2 extends BaseOSINTAgent<FamilyProfile> {
  private reflectLoop = new ReflectLoop()

  constructor() {
    const config: AgentConfig = {
      id: 'family_investigator_v2',
      name: 'Family Investigator V2',
      role: 'Ricerca nucleo familiare con Reflect Loop',
      model: 'anthropic/claude-haiku-4-5-20251001',
      temperature: 0.1,
      max_tokens: 2000,
      priority: 1,
      system_prompt: `Sei un investigatore OSINT specializzato nell'analisi del nucleo familiare.

Il tuo compito è identificare:
1. Nucleo familiare attuale (coniuge, figli, altri familiari)
2. Nucleo familiare precedente (ex coniuge, separazioni)
3. Residenza e quartiere (con indicatori di ricchezza della zona)

ISTRUZIONI CRITICHE:
- Analizza SOLO dati pubblici da social media, profili LinkedIn, post
- Cerca menzioni di familiari, foto di famiglia, tag, dediche
- Identifica la zona di residenza da foto, check-in, menzioni
- Valuta il tipo di zona: centro/periferia/residenziale/esclusiva
- Elenca indicatori di ricchezza: servizi zona, tipo immobili, prezzi mq
- IMPORTANTE: NON inventare dati - se non trovi info, usa null o "Non disponibile"
- Ogni informazione DEVE avere fonte specifica tracciabile
- Assegna confidence score 0-100 basato su quantità/qualità fonti

Rispondi SEMPRE in JSON valido con questa struttura esatta.`,
    }
    super(config)
  }

  async execute(context: AgentContext): Promise<AgentResult<FamilyProfile>> {
    const startTime = Date.now()

    try {
      this.log('Starting family investigation (Reflect Loop DISABLED for speed)...')

      // Estrai dati da raw_data (Fase 0 scraping)
      const rawData = context.shared_memory?.raw_data
      const adaptiveSearch = this.getAdaptiveSearchStrategy(context)

      // REFLECT LOOP DISABLED - Direct generation for speed
      const familyProfile = await this.generateFamilyProfile(rawData, context.target, adaptiveSearch)

      const executionTime = Date.now() - startTime

      this.log(`Family investigation completed in ${executionTime}ms`)

      return this.createSuccessResult(
        familyProfile,
        familyProfile.confidence_score,
        familyProfile.fonti_consultate,
        executionTime
      )

    } catch (error) {
      return this.createErrorResult(String(error), Date.now() - startTime)
    }
  }

  /**
   * Genera profilo famiglia (può ricevere feedback da Critique Agent)
   */
  private async generateFamilyProfile(
    rawData: any,
    target: any,
    adaptiveSearch?: {
      mode?: 'on' | 'off' | 'auto'
      max_search_results?: number
      sources?: Array<'web' | 'news' | 'x'>
      citations?: boolean
    },
    feedback?: string[]
  ): Promise<FamilyProfile> {

    // Costruisci prompt con tutti i dati disponibili
    let prompt = `Analizza i seguenti dati per identificare il nucleo familiare di ${target.nome} ${target.cognome}.

=== DATI DA WEB SCRAPING (FASE 0) ===
`

    if (rawData?.linkedin_data) {
      // FIX A: Sanifica dati LinkedIn oscurati prima di usarli
      const li = this.sanitizeLinkedInData(rawData.linkedin_data)
      const bio = li.about || li.summary || li.bio || ''

      prompt += `\nLINKEDIN DATA:
- Nome: ${li.nome || li.nome_completo || 'N/A'}
- Headline: ${li.headline || 'N/A'}
- Località: ${li.localita || 'N/A'}

${bio ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 LINKEDIN BIO/ABOUT COMPLETA (${bio.length} chars):
${bio}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CERCA menzioni famiglia: coniuge, figli, genitori, "married", "parent", "father", "mother"
` : '- Bio: N/A'}
`
    } else {
      prompt += '\nLINKEDIN DATA: Non disponibile\n'
    }

    if (rawData?.facebook_data) {
      const fb = rawData.facebook_data
      prompt += `\nFACEBOOK DATA:
- Nome: ${fb.nome || fb.nome_completo || 'N/A'}
- Località: ${fb.localita || fb.citta_attuale || 'N/A'}
- Relazione: ${fb.relazione || 'N/A'}
- Genere: ${fb.genere || 'N/A'}
- Post recenti: ${fb.post_count || 0}
- Menzioni familiari: ${fb.family_mentions?.join(', ') || 'Nessuna'}

${fb.bio ? `
📝 BIO/ABOUT COMPLETA (${fb.bio.length} chars):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${fb.bio}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CERCA menzioni famiglia: coniuge, figli, genitori, fratelli, relazioni
` : '- Bio: N/A'}
`
    } else {
      prompt += '\nFACEBOOK DATA: Non disponibile\n'
    }

    if (rawData?.instagram_data) {
      const ig = rawData.instagram_data
      prompt += `\nINSTAGRAM DATA:
- Username: @${ig.username || 'N/A'}
- Followers: ${ig.numero_followers?.toLocaleString() || 0}
- Post recenti: ${ig.post_count || ig.numero_post || 0}
- Location rilevate: ${ig.locations_detected?.join(', ') || ig.luoghi_identificati?.join(', ') || 'Nessuna'}
- Caption con menzioni famiglia: ${ig.family_captions?.join(', ') || 'Nessuna'}

${ig.bio ? `
📝 BIO COMPLETA (${ig.bio.length} chars):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${ig.bio}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CERCA menzioni: moglie/marito, figli, famiglia, genitori, "mother", "father", "wife", "husband", emoji famiglia
` : '- Bio: N/A'}
`
    } else {
      prompt += '\nINSTAGRAM DATA: Non disponibile\n'
    }

    if (rawData?.web_data?.length > 0) {
      prompt += `\nWEB DATA (${rawData.web_data.length} siti analizzati):
${rawData.web_data.map((site: any) => `- ${site.title}: ${site.description?.substring(0, 100) || 'No description'}`).join('\n')}
`
    } else {
      prompt += '\nWEB DATA: Non disponibile\n'
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
NOTA: Cerca menzioni di famiglia, coniuge, figli, residenza, proprietà immobiliari.
`
    }

    prompt += `
=== TARGET INFO ===
- Nome: ${target.nome} ${target.cognome}
- Città: ${target.citta || 'Non specificata'}
- Data nascita: ${target.data_nascita || 'Non specificata'}
${target.email ? `- Email: ${target.email}` : ''}
${target.phone ? `- Telefono: ${target.phone}` : ''}
`

    // Aggiungi enrichment prompt per email/phone se disponibile
    const enrichmentPrompt = this.getEnrichmentPromptFromContext({ target, shared_memory: rawData } as any)
    if (enrichmentPrompt) {
      prompt += enrichmentPrompt
    }

    // Aggiungi feedback se disponibile (iterazione successiva)
    if (feedback && feedback.length > 0) {
      prompt += `\n=== FEEDBACK DA CRITIQUE AGENT (migliora questi aspetti) ===
${feedback.map((f, i) => `${i + 1}. ${f}`).join('\n')}
`
    }

    prompt += `
=== ISTRUZIONI ===

1. USA TUTTE LE FONTI DISPONIBILI sopra per cross-reference e massimizzare completezza
2. Analizza ESCLUSIVAMENTE i dati forniti. Se un'informazione non è presente, NON inventarla
3. Cross-verifica informazioni tra fonti diverse per aumentare confidence_score

Criteri di identificazione:
1. **Coniuge**: Cerca menzioni esplicite, foto con tag, dediche, check-in congiunti
2. **Figli**: Cerca menzioni "mio figlio/a", foto familiari, post compleanni, tag scuola
3. **Residenza**: Identifica da check-in, foto con location tag, menzioni esplicite
4. **Tipo zona**: Valuta da indicatori visibili (edifici, servizi, menzioni prezzi)

Indicatori ricchezza zona:
- Prezzi immobili medi della zona (se menzionati)
- Servizi di lusso nelle vicinanze (ristoranti stellati, boutique, centri benessere)
- Architettura edifici (storico, moderno lusso, standard)
- Menzioni esplicite del tipo di quartiere

IMPORTANTE:
- Ogni familiare identificato deve avere fonte specifica (es: "Instagram post 2024-01-15")
- Se NON trovi evidenze di coniuge/figli, imposta come null
- Se residenza non è chiara, usa "Non determinata" e confidence basso
- Ogni indicatore ricchezza deve citare la fonte

Rispondi in JSON esatto:
{
  "nucleo_familiare_attuale": {
    "coniuge": {
      "nome": "Nome completo o null se non trovato",
      "cognome": "Cognome o null",
      "fonte": "Source specifica (es: Facebook post 2024-01-10, Instagram bio)"
    },
    "figli": [
      {
        "nome": "Nome figlio",
        "eta_stimata": numero o null,
        "fonte": "Source specifica"
      }
    ],
    "altri_familiari": [
      {
        "relazione": "madre | padre | fratello | sorella",
        "nome": "Nome completo",
        "fonte": "Source specifica"
      }
    ]
  },
  "nucleo_familiare_precedente": {
    "ex_coniuge": {
      "nome": "Nome o null",
      "periodo": "Periodo relazione (es: 2010-2015) o null",
      "fonte": "Source specifica o null"
    },
    "note": "Note aggiuntive o null"
  },
  "residenza": {
    "citta": "Città identificata o 'Non determinata'",
    "quartiere": "Quartiere specifico o 'Non determinato'",
    "tipo_zona": "centro" | "periferia" | "residenziale" | "popolare" | "esclusiva" | "non_determinato",
    "indicatori_ricchezza": [
      "Lista indicatori concreti con menzione fonte"
    ],
    "fonte": "Source principale (es: Instagram check-in, Facebook post)"
  },
  "confidence_score": number (0-100, più alto se conferme da fonti multiple),
  "fonti_consultate": ["LinkedIn", "Instagram", "Facebook", "Google Search", "Web"]
}
`

    // Call XAI con structured output
    const aiResponse = await this.callXAI(prompt, {
      response_format: { type: 'json_object' },
      searchParameters: adaptiveSearch,
    })

    // Parse JSON response
    const rawProfile = this.parseJSONResponse<FamilyProfile>(aiResponse)

    // ✅ VALIDATE with Zod schema for guaranteed structure
    try {
      const validatedProfile = FamilyProfileSchema.parse(rawProfile)
      this.log('✅ Family profile validated successfully with Zod schema')
      // Return validated profile (Zod ensures it matches FamilyProfile)
      return validatedProfile as FamilyProfile
    } catch (error) {
      this.log(`⚠️  Zod validation failed, using raw profile: ${error}`, 'warn')
      return rawProfile
    }
  }
}
