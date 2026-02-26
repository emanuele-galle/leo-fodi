/**
 * Authority Signals Analyzer Agent V2
 * Analizza segnali di autorità, influenza, premi, certificazioni e riconoscimenti pubblici
 */

import { BaseOSINTAgent } from '../base-agent'
import { ReflectLoop, SOCIAL_RUBRIC } from '@/lib/reflection'
import type {
  AuthoritySignalsProfile,
  AgentConfig,
  AgentContext,
  AgentResult,
} from '../types'
import { AuthoritySignalsProfileSchema } from '../schemas/all-profiles.schema'

export class AuthoritySignalsAnalyzerAgentV2 extends BaseOSINTAgent<AuthoritySignalsProfile> {
  private reflectLoop = new ReflectLoop()

  constructor() {
    const config: AgentConfig = {
      id: 'authority_signals_v2',
      name: 'Authority Signals Analyzer V2',
      role: 'Analisi segnali di autorità e influenza',
      model: 'anthropic/claude-haiku-4-5-20251001',
      temperature: 0.1,
      max_tokens: 1500,
      priority: 2,
      system_prompt: `<role>Sei un analista OSINT specializzato in segnali di autorità e influenza online. Misuri l'influenza reale di un soggetto nel proprio settore e online.</role>

<instructions>
1. Classifica il livello di influenza: micro (<10k) / emerging (10k-100k) / established (100k-1M) / macro / celebrity / niche_expert
2. Identifica premi, certificazioni e riconoscimenti professionali con fonte specifica
3. Elenca pubblicazioni: articoli, libri, paper accademici, post virali con engagement elevato
4. Mappa community attive e ruoli di leadership: admin gruppi, speaker eventi, board member
5. Raccogli riconoscimenti pubblici e menzioni autorevoli (media, industria, peer)
</instructions>

<constraints>
- Usa SOLO dati verificabili da social media, bio, articoli pubblici
- NON inventare premi o pubblicazioni non menzionati nelle fonti
- Ogni elemento deve avere fonte specifica tracciabile
- Distingui micro-influencer di nicchia (alta autorevolezza settoriale) da celebrity (massa)
- Se dati insufficienti: confidence basso, livello conservativo
</constraints>

<output_format>JSON valido con tutti i campi dello schema richiesto</output_format>`,
    }
    super(config)
  }

  async execute(context: AgentContext): Promise<AgentResult<AuthoritySignalsProfile>> {
    const startTime = Date.now()

    try {
      this.log('Analyzing authority signals with Reflect Loop (max 1 iteration)...')

      const rawData = context.shared_memory?.raw_data
      const adaptiveSearch = this.getAdaptiveSearchStrategy(context)
      const targetName = `${context.target.nome} ${context.target.cognome}`

      const { output: authorityProfile } = await this.reflectLoop.run<AuthoritySignalsProfile>(
        (feedback) => this.generateAuthorityProfile(rawData, context.target, adaptiveSearch, feedback),
        SOCIAL_RUBRIC,
        { maxIterations: 1, targetName }
      )

      const executionTime = Date.now() - startTime

      return this.createSuccessResult(
        authorityProfile,
        authorityProfile.confidence_score,
        authorityProfile.fonti_consultate,
        executionTime
      )

    } catch (error) {
      return this.createErrorResult(String(error), Date.now() - startTime)
    }
  }

  private async generateAuthorityProfile(
    rawData: any,
    target: any,
    adaptiveSearch?: {
      mode?: 'on' | 'off' | 'auto'
      max_search_results?: number
      sources?: Array<'web' | 'news' | 'x'>
      citations?: boolean
    },
    feedback?: string[]
  ): Promise<AuthoritySignalsProfile> {
    const targetName = `${target.nome} ${target.cognome}`
    let prompt = `Analizza i segnali di autorità e influenza di ${targetName}.

=== OBIETTIVO ===
Identifica TUTTI i segnali che indicano autorità professionale, thought leadership, o influenza nel proprio campo.

=== DATI DA WEB SCRAPING ===
`

    // ========== LINKEDIN DATA (Fonte primaria per autorità professionale) ==========
    if (rawData?.linkedin_data) {
      // FIX A: Sanifica dati LinkedIn oscurati prima di usarli
      const li = this.sanitizeLinkedInData(rawData.linkedin_data)
      prompt += `\n📘 LINKEDIN DATA:
- Nome: ${li.nome_completo || 'N/A'}
- Headline: ${li.headline || 'N/A'}
- Followers: ${li.numero_followers?.toLocaleString() || 'N/A'}
- Connections: ${li.numero_connessioni?.toLocaleString() || 'N/A'}

📝 BIO/ABOUT:
${li.bio || 'Non disponibile'}

🏆 ESPERIENZE (cerca premi, riconoscimenti, leadership roles):
${li.esperienze?.length > 0 ? li.esperienze.map((exp: any) => {
        const desc = exp.descrizione ? `\n    ${exp.descrizione}` : ''
        return `  • ${exp.ruolo || 'N/A'} @ ${exp.azienda || 'N/A'} (${exp.data_inizio || 'N/A'} - ${exp.data_fine || 'Present'})${desc}`
      }).join('\n') : '  Nessuna esperienza'}

💡 SKILLS/ENDORSEMENTS (indicatori di expertise):
${li.skills?.length > 0 ? li.skills.map((s: any) => `  • ${s.nome || 'N/A'} (${s.endorsements || 0} endorsements)`).join('\n') : '  Nessuna skill'}

📚 CERTIFICAZIONI:
${li.certificazioni?.length > 0 ? li.certificazioni.map((cert: any) => `  • ${cert.nome || 'N/A'} - ${cert.organizzazione || 'N/A'} (${cert.data_rilascio || 'N/A'})`).join('\n') : '  Nessuna certificazione'}
`
    } else {
      prompt += '\n📘 LINKEDIN DATA: Non disponibile\n'
    }

    // ========== INSTAGRAM DATA (Influencer metrics) ==========
    if (rawData?.instagram_data) {
      const ig = rawData.instagram_data
      prompt += `\n📸 INSTAGRAM DATA:
- Username: ${ig.username || 'N/A'}
- Followers: ${ig.followers?.toLocaleString() || 'N/A'}
- Following: ${ig.following?.toLocaleString() || 'N/A'}
- Posts: ${ig.posts || 'N/A'}
- Bio: ${ig.bio || 'N/A'}
- Is Verified: ${ig.is_verified ? 'YES ✓' : 'No'}

NOTA: Analizza ratio followers/following e badge verifica per determinare livello influenza.
`
    }

    // ========== FACEBOOK DATA ==========
    if (rawData?.facebook_data?.bio) {
      prompt += `\n📱 FACEBOOK BIO:
${rawData.facebook_data.bio}

NOTA: Cerca menzioni di premi, pubblicazioni, speaking engagements.
`
    }

    // ========== GOOGLE SEARCH RESULTS (Articoli, menzioni, riconoscimenti) ==========
    const googleResults = rawData?.google_search_results || rawData?.google_search_data?.results || []
    if (googleResults.length > 0) {
      // FIX B: Filtra risultati per evitare omonimi
      const filteredResults = this.filterGoogleSearchResults(
        googleResults,
        target.linkedin_url || ''
      )

      prompt += `\n🔍 GOOGLE SEARCH RESULTS (${filteredResults.length}/${googleResults.length} risultati rilevanti, filtrati per evitare omonimi):\n`
      filteredResults.slice(0, 5).forEach((r: any, i: number) => {
        prompt += `  ${i + 1}. ${r.title || 'N/A'}\n     ${r.snippet || 'N/A'}\n     URL: ${r.link || 'N/A'}\n`
      })
      prompt += `\n⚠️ IMPORTANTE: Usa SOLO dati dal profilo target (${target.linkedin_url || 'non specificato'}).\nNON mescolare dati di altri profili trovati su Google.\n`
    }

    prompt += `
=== ISTRUZIONI ===

1. LIVELLO INFLUENZA - Determina in base a:
   - Followers count (micro: <10k, emerging: 10k-50k, established: 50k-100k, macro: 100k-500k, celebrity: 500k+)
   - Badge verifica (peso alto)
   - Engagement qualitativo (menzioni autorevoli, speaking, pubblicazioni)
   - Se esperto di nicchia con alta autorità ma pochi followers → "niche_expert"

2. PREMI & CERTIFICAZIONI:
   - Estrai SOLO premi/certificazioni espliciti trovati
   - Include organizzazione, anno, descrizione
   - Se non trovati → array vuoto

3. PUBBLICAZIONI:
   - Articoli su blog/medium, paper accademici, libri, post virali
   - Specifica tipo e piattaforma
   - Se non trovate → array vuoto

4. COMMUNITY:
   - Gruppi LinkedIn, forum, Slack/Discord communities dove è attivo
   - Indica ruolo (membro, moderatore, leader, fondatore)
   - Se non trovate → array vuoto

5. RICONOSCIMENTI PUBBLICI:
   - Menzioni in articoli, interviste, keynote speeches
   - Premio "Top X" o liste autorevoli
   - Se non trovati → array vuoto

Livelli influenza validi:
- micro (< 10k followers)
- emerging (10k-50k)
- established (50k-100k)
- macro (100k-500k)
- celebrity (500k+)
- niche_expert (alta autorità ma pochi followers)
- non_determinato (dati insufficienti)

Rispondi in JSON:
{
  "livello_influenza": "micro" | "emerging" | "established" | "macro" | "celebrity" | "niche_expert" | "non_determinato",
  "premi_certificazioni": [
    {
      "nome": "Nome premio/certificazione",
      "organizzazione": "Organizzazione",
      "anno": "2024" | null,
      "descrizione": "Descrizione",
      "fonte": "LinkedIn | Instagram | Google Search"
    }
  ],
  "pubblicazioni": [
    {
      "titolo": "Titolo pubblicazione",
      "tipo": "articolo" | "libro" | "paper" | "post" | "altro",
      "piattaforma": "Medium | Blog | Academic" | null,
      "anno": "2024" | null,
      "fonte": "Google Search | LinkedIn"
    }
  ],
  "community_attive": [
    {
      "nome": "Nome community",
      "ruolo": "membro" | "moderatore" | "leader" | "fondatore" | "altro",
      "piattaforma": "LinkedIn | Discord | Slack | Forum",
      "engagement_level": "alto" | "medio" | "basso",
      "fonte": "LinkedIn | Instagram"
    }
  ],
  "riconoscimenti_pubblici": [
    {
      "tipo": "Tipo riconoscimento",
      "descrizione": "Descrizione",
      "fonte": "Articolo | Intervista | Google Search"
    }
  ],
  "confidence_score": number (0-100, alto se dati verificabili, basso se deduzione),
  "fonti_consultate": ["LinkedIn", "Instagram", "Facebook", "Google Search"]
}
`

    if (feedback && feedback.length > 0) {
      prompt += `\n=== FEEDBACK ITERAZIONE PRECEDENTE ===\n${feedback.map((f, i) => `${i + 1}. ${f}`).join('\n')}\nMigliorare l'analisi tenendo conto del feedback sopra.\n`
    }

    const aiResponse = await this.callXAI(prompt, {
      response_format: { type: 'json_object' },
      searchParameters: adaptiveSearch,
    })

    // Parse JSON response
    const rawProfile = this.parseJSONResponse<AuthoritySignalsProfile>(aiResponse)

    // TODO: Implement Zod validation
    // const validatedProfile = this.validateWithZod(
    //   rawProfile,
    //   AuthoritySignalsProfileSchema,
    //   'authority_signals_v2'
    // )

    return rawProfile
  }
}
