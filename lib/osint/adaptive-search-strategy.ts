/**
 * Adaptive Apify Web Search Strategy
 *
 * Sistema intelligente che decide quando e come usare Apify Web Search
 * in base alla completezza dei dati già raccolti dalle API.
 */

/**
 * Search parameters for adaptive strategy
 * (OpenRouter doesn't have live search, but we keep the interface for future use)
 */
export interface SearchParameters {
  mode?: 'on' | 'off' | 'auto'
  max_search_results?: number
  sources?: string[]
  return_citations?: boolean
}

/**
 * Livelli di completezza dati
 */
export enum DataCompletenessLevel {
  EMPTY = 'empty',           // 0-20% - Dati assenti o molto scarsi
  SCARCE = 'scarce',         // 20-50% - Dati parziali, necessario arricchimento
  SUFFICIENT = 'sufficient', // 50-80% - Dati sufficienti, web search opzionale
  RICH = 'rich',             // 80-100% - Dati completi, web search solo per contesto
}

/**
 * Analizza completezza dati raccolti dalle API
 */
export function analyzeDataCompleteness(rawData: any): {
  level: DataCompletenessLevel
  score: number
  missingFields: string[]
  suggestions: string[]
} {
  let score = 0
  const missingFields: string[] = []
  const suggestions: string[] = []

  // Analisi LinkedIn (peso 40%)
  if (rawData?.linkedin_data) {
    const li = rawData.linkedin_data

    // ⭐ BIO/ABOUT ha MASSIMA priorità (spesso più ricca di dati strutturati)
    const bio = li.about || li.summary || li.bio || ''
    if (bio) {
      // Bio ricca (>500 chars) = 15 punti (equivalente a experience completo)
      // Bio media (100-500 chars) = 10 punti
      // Bio corta (<100 chars) = 5 punti
      if (bio.length > 500) {
        score += 15
        console.log(`[AdaptiveSearch] ⭐ LinkedIn bio RICCA: ${bio.length} chars (+15 pts)`)
      } else if (bio.length > 100) {
        score += 10
      } else {
        score += 5
      }
    } else {
      missingFields.push('linkedin_bio_about')
      suggestions.push('LinkedIn bio/about missing - critical for rich career insights')
    }

    if (li.esperienze?.length > 0) score += 15
    else missingFields.push('linkedin_esperienze')

    if (li.formazione?.length > 0) score += 10
    else missingFields.push('linkedin_formazione')

    if (li.competenze?.length > 0) score += 10
    else missingFields.push('linkedin_competenze')
  } else {
    score += 0
    missingFields.push('linkedin_data')
    suggestions.push('LinkedIn profile essential - use Apify to search for professional info')
  }

  // Analisi Instagram (peso 30%)
  if (rawData?.instagram_data) {
    const ig = rawData.instagram_data
    if (ig.numero_followers > 0) score += 10
    if (ig.bio) score += 10
    else missingFields.push('instagram_bio')

    if (ig.post_recenti?.length > 0) score += 10
    else {
      missingFields.push('instagram_posts')
      suggestions.push('No Instagram posts - use Apify to search for visual content and lifestyle insights')
    }
  } else {
    score += 0
    missingFields.push('instagram_data')
    suggestions.push('Instagram data missing - use Apify to search for social presence')
  }

  // Analisi Facebook (peso 20%)
  if (rawData?.facebook_data) {
    const fb = rawData.facebook_data
    if (fb.bio) score += 10
    if (fb.numero_likes > 0) score += 10
  } else {
    score += 0
    missingFields.push('facebook_data')
  }

  // Analisi Google Search (peso 10%)
  if (rawData?.google_search_data?.results?.length > 0) {
    score += 10
  } else {
    missingFields.push('google_search')
    suggestions.push('No public mentions - use Apify to search for articles, news, interviews')
  }

  // Determina livello (soglie abbassate per attivare FORCE mode più aggressivamente)
  let level: DataCompletenessLevel
  if (score <= 30) level = DataCompletenessLevel.EMPTY    // Era 20 → 30 (più aggressivo)
  else if (score <= 60) level = DataCompletenessLevel.SCARCE  // Era 50 → 60 (più aggressivo)
  else if (score <= 85) level = DataCompletenessLevel.SUFFICIENT // Era 80 → 85
  else level = DataCompletenessLevel.RICH

  return { level, score, missingFields, suggestions }
}

/**
 * Decide strategia Apify Web Search in base a completezza dati
 */
export function getAdaptiveSearchStrategy(
  completeness: DataCompletenessLevel,
  agentType: string
): {
  searchParameters: SearchParameters
  reason: string
  priority: 'critical' | 'high' | 'medium' | 'low'
} {
  switch (completeness) {
    case DataCompletenessLevel.EMPTY:
      // DATI ASSENTI - Web search CRITICAL per riempire vuoti
      return {
        searchParameters: {
          mode: 'on', // FORCE search
          max_search_results: 30, // Massima completezza
          sources: ['web', 'news', 'x'],
          return_citations: true,
        },
        reason: 'Critical: API data missing or very scarce. Apify Web Search essential to fill gaps.',
        priority: 'critical',
      }

    case DataCompletenessLevel.SCARCE:
      // DATI SCARSI - Web search HIGH priority per arricchimento
      return {
        searchParameters: {
          mode: 'on', // FORCE search
          max_search_results: 20,
          sources: ['web', 'news', 'x'],
          return_citations: true,
        },
        reason: 'High: API data partial. Apify Web Search needed for enrichment and cross-validation.',
        priority: 'high',
      }

    case DataCompletenessLevel.SUFFICIENT:
      // DATI SUFFICIENTI - Web search AUTO per verifiche e contesto
      return {
        searchParameters: {
          mode: 'auto', // Grok decides
          max_search_results: 15,
          sources: ['web', 'news', 'x'],
          return_citations: true,
        },
        reason: 'Medium: API data sufficient. Apify Web Search optional for context and validation.',
        priority: 'medium',
      }

    case DataCompletenessLevel.RICH:
      // DATI COMPLETI - Web search MINIMAL per contesto multimediale
      return {
        searchParameters: {
          mode: 'auto', // Grok decides
          max_search_results: 10,
          sources: ['web', 'news', 'x'], // Focus su news/articoli pubblici
          return_citations: true,
        },
        reason: 'Low: API data rich and complete. Apify Web Search for multimedia context and public mentions only.',
        priority: 'low',
      }
  }
}

/**
 * Prompt aggiuntivo per Apify quando dati sono scarsi
 */
export function getEnrichmentPrompt(
  missingFields: string[],
  suggestions: string[],
  contactInfo?: { email?: string; phone?: string }
): string {
  if (missingFields.length === 0 && !contactInfo?.email && !contactInfo?.phone) return ''

  let prompt = `
=== DATI MANCANTI DA API ===
I seguenti campi sono assenti o incompleti:
${missingFields.map(f => `- ${f}`).join('\n')}

🔍 USA Apify LIVE SEARCH per:
${suggestions.map(s => `• ${s}`).join('\n')}`

  // Aggiungi sezione email/phone se presenti
  if (contactInfo?.email || contactInfo?.phone) {
    prompt += `

📧 INFORMAZIONI CONTATTO DISPONIBILI:
${contactInfo.email ? `- Email: ${contactInfo.email}` : ''}
${contactInfo.phone ? `- Telefono: ${contactInfo.phone}` : ''}

🔎 RICERCHE SPECIFICHE SU EMAIL/TELEFONO:
• Cerca profili social collegati all'email (LinkedIn, Facebook, Twitter, GitHub)
• Cerca menzioni dell'email in articoli, post, commenti pubblici
• Cerca il numero di telefono in listing business (Google My Business, Pagine Gialle)
• Cerca menzioni del telefono in siti web aziendali o profili pubblici
• Verifica presenza in directory professionali o database pubblici`
  }

  prompt += `

ISTRUZIONI SEARCH:
1. Cerca informazioni mancanti usando query semantiche intelligenti
2. Se email/phone presenti, usali per trovare profili social e menzioni pubbliche
3. Cerca contenuti multimediali (foto profilo, post Instagram/Facebook) per contesto
4. Verifica notizie, articoli, interviste pubbliche
5. Cross-valida dati API con fonti web indipendenti
6. Se trovi contraddizioni, documenta con citazioni

**IMPORTANTE**: La web search può accedere a:
- Profili social pubblici (visualizzazione contenuti)
- Articoli e menzioni pubbliche
- News e interviste
- Portfolio e siti personali
- Post e contenuti multimediali
- Directory business e listing professionali
`

  return prompt
}

/**
 * Log strategia adattiva per debugging
 */
export function logSearchStrategy(
  completeness: { level: DataCompletenessLevel; score: number },
  strategy: ReturnType<typeof getAdaptiveSearchStrategy>
): void {
  console.log('\n🎯 [AdaptiveSearch] Strategy selected:')
  console.log(`   - Data Completeness: ${completeness.level} (${completeness.score}%)`)
  console.log(`   - Search Mode: ${strategy.searchParameters.mode}`)
  console.log(`   - Max Results: ${strategy.searchParameters.max_search_results}`)
  console.log(`   - Priority: ${strategy.priority}`)
  console.log(`   - Reason: ${strategy.reason}`)
}
