/**
 * Standard Priority Instructions for ALL OSINT Agents
 *
 * Questa è la strategia unificata per gestire dati contrastanti tra fonti multiple.
 * TUTTI gli agent devono seguire questa priorità per garantire coerenza.
 */

export const PRIORITY_INSTRUCTIONS = `
=== PRIORITÀ FONTI (CRITICAL - da seguire in caso di dati contrastanti) ===

**Gerarchia Affidabilità Fonti**:
1. 🥇 **LinkedIn** - Massima affidabilità per carriera, formazione, competenze
2. 🥈 **Instagram** - Alta affidabilità per lifestyle, interessi, brand
3. 🥉 **Facebook** - Media affidabilità per info personali e familiari
4. 🔍 **Apify API (Web + News + Social)** - Ottima per verifiche incrociate e notizie pubbliche
5. 🌐 **Web Content** - Affidabilità variabile, usare per conferme

**REGOLE OPERATIVE**:

Per dati QUANTITATIVI (followers, anni esperienza, età, stipendio):
- ✅ Usa LinkedIn per dati professionali (anni esperienza, aziende, ruoli)
- ✅ Usa Apify API (Instagram/Facebook) per dati social (followers, posts)
- ✅ Se LinkedIn ha il dato, è SEMPRE la fonte primaria per info carriera
- ❌ NON fare media di valori contrastanti - scegli fonte più affidabile
- ⚠️  Se differenza >30% tra fonti, segnala nel campo "note" e usa fonte più recente

Per dati QUALITATIVI (ruolo, azienda, titolo, interessi):
- ✅ LinkedIn > Apify Web Search > Instagram bio > Facebook bio > Web
- ✅ Se fonti contraddicono: usa LinkedIn per info professionale, social per info personale
- ✅ Se incerto: includi entrambi con nota esplicita sulla fonte

Per CROSS-REFERENCE:
- ✅ Cerca conferme tra fonti diverse per aumentare confidence_score
- ✅ Se 3+ fonti confermano lo stesso dato → confidence_score +20
- ✅ Se fonti contraddicono → confidence_score -15 e documenta contraddizione
- ✅ Usa Apify Web Search per verificare info dubbie con ricerche web real-time

**ESEMPI PRATICI**:

Scenario 1 - Anni Esperienza:
- LinkedIn: "10 anni"
- Instagram bio: "5+ anni"
→ SCELTA: LinkedIn (10 anni) - fonte primaria per carriera

Scenario 2 - Followers Instagram:
- Apify API API: 2558 followers
- Puppeteer: 7777 followers
→ SCELTA: Apify API (2558) - API professionale più affidabile

Scenario 3 - Hobby/Interessi:
- LinkedIn: "Tech, AI, Startup"
- Instagram: "Photography, Travel, Food"
→ SCELTA: Entrambi - LinkedIn per interessi professionali, Instagram per personali

**IMPORTANTE**:
- 🎯 confidence_score parte da 50 base
- 🎯 +20 per ogni fonte addizionale che conferma
- 🎯 -15 per contraddizioni non risolte
- 🎯 +10 se LinkedIn è la fonte primaria
`

/**
 * ✅ STRATEGIA ADATTIVA XAI LIVE SEARCH
 *
 * La web search viene usata dinamicamente in base a completezza dati API:
 *
 * 1. DATI ASSENTI (0-20%) → FORCE search con 30 results (CRITICAL)
 *    - Riempi tutti i vuoti possibili
 *    - Cerca profili social, articoli, menzioni
 *    - Massima priorità a contenuti multimediali
 *
 * 2. DATI SCARSI (20-50%) → FORCE search con 20 results (HIGH)
 *    - Arricchisci dati parziali
 *    - Cross-valida con fonti indipendenti
 *    - Cerca contenuti visivi mancanti
 *
 * 3. DATI SUFFICIENTI (50-80%) → AUTO search con 15 results (MEDIUM)
 *    - Grok decide se necessario
 *    - Verifica coerenza dati
 *    - Aggiungi contesto multimediale opzionale
 *
 * 4. DATI COMPLETI (80-100%) → AUTO search con 10 results (LOW)
 *    - Minima priorità
 *    - Solo per contesto pubblico (news, articoli)
 *    - Focus su menzioni e reputazione
 *
 * NOTA: Il sistema `adaptive-search-strategy.ts` decide automaticamente
 */
export const ENABLE_LIVE_SEARCH = {
  mode: 'auto' as const,
  max_search_results: 15, // Default - verrà sovrascritto da strategia adattiva
  sources: ['web', 'news', 'x'] as const,
  return_citations: true, // ✅ FIXED: was "citations"
}

/**
 * Footer to add after JSON schema in prompts
 */
export const JSON_RESPONSE_FOOTER = `
**NOTA SULLE FONTI**:
- Popola \`fonti_consultate\` con TUTTE le fonti effettivamente analizzate
- Se usi Apify Web Search, aggiungi "Web Search" alla lista
- Ordina fonti per priorità: LinkedIn, Instagram, Facebook, Web Search, Web, Deduzione

**EVITA "non_determinato" - REGOLE FONDAMENTALI**:
1. ❌ NON usare "non_determinato" se hai almeno UNA fonte parziale
2. ✅ PREFERISCI valori specifici dedotti logicamente da contesto disponibile
3. ✅ SPECIFICA SEMPRE confidence level (basso/medio/alto) invece di "non_determinato"
4. ✅ USA Apify Web Search attivamente per colmare vuoti invece di arrenderti
5. ✅ ESEMPIO CORRETTO: "Orario: 9-18 (confidence: bassa, dedotto da profilo junior Italia)"
6. ❌ ESEMPIO ERRATO: "Orario: non_determinato"
`
