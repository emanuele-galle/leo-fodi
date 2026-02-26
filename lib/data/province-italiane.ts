/**
 * Mapping completo delle province italiane
 * Supporta ricerca per sigla, nome completo e capoluogo
 */

export interface ProvinciaInfo {
  sigla: string
  nome: string
  capoluogo: string
  regione: string
  alias?: string[] // Varianti comuni del nome
}

/**
 * Tutte le 107 province italiane (aggiornato 2025)
 */
export const PROVINCE_ITALIANE: ProvinciaInfo[] = [
  // Lombardia
  { sigla: 'MI', nome: 'Milano', capoluogo: 'Milano', regione: 'Lombardia' },
  { sigla: 'BG', nome: 'Bergamo', capoluogo: 'Bergamo', regione: 'Lombardia' },
  { sigla: 'BS', nome: 'Brescia', capoluogo: 'Brescia', regione: 'Lombardia' },
  { sigla: 'CO', nome: 'Como', capoluogo: 'Como', regione: 'Lombardia' },
  { sigla: 'CR', nome: 'Cremona', capoluogo: 'Cremona', regione: 'Lombardia' },
  { sigla: 'LC', nome: 'Lecco', capoluogo: 'Lecco', regione: 'Lombardia' },
  { sigla: 'LO', nome: 'Lodi', capoluogo: 'Lodi', regione: 'Lombardia' },
  { sigla: 'MN', nome: 'Mantova', capoluogo: 'Mantova', regione: 'Lombardia' },
  { sigla: 'MB', nome: 'Monza e Brianza', capoluogo: 'Monza', regione: 'Lombardia', alias: ['Monza', 'Brianza'] },
  { sigla: 'PV', nome: 'Pavia', capoluogo: 'Pavia', regione: 'Lombardia' },
  { sigla: 'SO', nome: 'Sondrio', capoluogo: 'Sondrio', regione: 'Lombardia' },
  { sigla: 'VA', nome: 'Varese', capoluogo: 'Varese', regione: 'Lombardia' },

  // Lazio
  { sigla: 'RM', nome: 'Roma', capoluogo: 'Roma', regione: 'Lazio' },
  { sigla: 'FR', nome: 'Frosinone', capoluogo: 'Frosinone', regione: 'Lazio' },
  { sigla: 'LT', nome: 'Latina', capoluogo: 'Latina', regione: 'Lazio' },
  { sigla: 'RI', nome: 'Rieti', capoluogo: 'Rieti', regione: 'Lazio' },
  { sigla: 'VT', nome: 'Viterbo', capoluogo: 'Viterbo', regione: 'Lazio' },

  // Campania
  { sigla: 'NA', nome: 'Napoli', capoluogo: 'Napoli', regione: 'Campania' },
  { sigla: 'AV', nome: 'Avellino', capoluogo: 'Avellino', regione: 'Campania' },
  { sigla: 'BN', nome: 'Benevento', capoluogo: 'Benevento', regione: 'Campania' },
  { sigla: 'CE', nome: 'Caserta', capoluogo: 'Caserta', regione: 'Campania' },
  { sigla: 'SA', nome: 'Salerno', capoluogo: 'Salerno', regione: 'Campania' },

  // Sicilia
  { sigla: 'PA', nome: 'Palermo', capoluogo: 'Palermo', regione: 'Sicilia' },
  { sigla: 'AG', nome: 'Agrigento', capoluogo: 'Agrigento', regione: 'Sicilia' },
  { sigla: 'CL', nome: 'Caltanissetta', capoluogo: 'Caltanissetta', regione: 'Sicilia' },
  { sigla: 'CT', nome: 'Catania', capoluogo: 'Catania', regione: 'Sicilia' },
  { sigla: 'EN', nome: 'Enna', capoluogo: 'Enna', regione: 'Sicilia' },
  { sigla: 'ME', nome: 'Messina', capoluogo: 'Messina', regione: 'Sicilia' },
  { sigla: 'RG', nome: 'Ragusa', capoluogo: 'Ragusa', regione: 'Sicilia' },
  { sigla: 'SR', nome: 'Siracusa', capoluogo: 'Siracusa', regione: 'Sicilia' },
  { sigla: 'TP', nome: 'Trapani', capoluogo: 'Trapani', regione: 'Sicilia' },

  // Veneto
  { sigla: 'VE', nome: 'Venezia', capoluogo: 'Venezia', regione: 'Veneto' },
  { sigla: 'BL', nome: 'Belluno', capoluogo: 'Belluno', regione: 'Veneto' },
  { sigla: 'PD', nome: 'Padova', capoluogo: 'Padova', regione: 'Veneto' },
  { sigla: 'RO', nome: 'Rovigo', capoluogo: 'Rovigo', regione: 'Veneto' },
  { sigla: 'TV', nome: 'Treviso', capoluogo: 'Treviso', regione: 'Veneto' },
  { sigla: 'VR', nome: 'Verona', capoluogo: 'Verona', regione: 'Veneto' },
  { sigla: 'VI', nome: 'Vicenza', capoluogo: 'Vicenza', regione: 'Veneto' },

  // Piemonte
  { sigla: 'TO', nome: 'Torino', capoluogo: 'Torino', regione: 'Piemonte' },
  { sigla: 'AL', nome: 'Alessandria', capoluogo: 'Alessandria', regione: 'Piemonte' },
  { sigla: 'AT', nome: 'Asti', capoluogo: 'Asti', regione: 'Piemonte' },
  { sigla: 'BI', nome: 'Biella', capoluogo: 'Biella', regione: 'Piemonte' },
  { sigla: 'CN', nome: 'Cuneo', capoluogo: 'Cuneo', regione: 'Piemonte' },
  { sigla: 'NO', nome: 'Novara', capoluogo: 'Novara', regione: 'Piemonte' },
  { sigla: 'VB', nome: 'Verbano-Cusio-Ossola', capoluogo: 'Verbania', regione: 'Piemonte', alias: ['Verbania', 'VCO'] },
  { sigla: 'VC', nome: 'Vercelli', capoluogo: 'Vercelli', regione: 'Piemonte' },

  // Emilia-Romagna
  { sigla: 'BO', nome: 'Bologna', capoluogo: 'Bologna', regione: 'Emilia-Romagna' },
  { sigla: 'FC', nome: 'Forlì-Cesena', capoluogo: 'Forlì', regione: 'Emilia-Romagna', alias: ['Forlì', 'Cesena'] },
  { sigla: 'FE', nome: 'Ferrara', capoluogo: 'Ferrara', regione: 'Emilia-Romagna' },
  { sigla: 'MO', nome: 'Modena', capoluogo: 'Modena', regione: 'Emilia-Romagna' },
  { sigla: 'PR', nome: 'Parma', capoluogo: 'Parma', regione: 'Emilia-Romagna' },
  { sigla: 'PC', nome: 'Piacenza', capoluogo: 'Piacenza', regione: 'Emilia-Romagna' },
  { sigla: 'RA', nome: 'Ravenna', capoluogo: 'Ravenna', regione: 'Emilia-Romagna' },
  { sigla: 'RE', nome: 'Reggio Emilia', capoluogo: 'Reggio Emilia', regione: 'Emilia-Romagna', alias: ['Reggio Emilia'] },
  { sigla: 'RN', nome: 'Rimini', capoluogo: 'Rimini', regione: 'Emilia-Romagna' },

  // Puglia
  { sigla: 'BA', nome: 'Bari', capoluogo: 'Bari', regione: 'Puglia' },
  { sigla: 'BT', nome: 'Barletta-Andria-Trani', capoluogo: 'Barletta', regione: 'Puglia', alias: ['Barletta', 'Andria', 'Trani', 'BAT'] },
  { sigla: 'BR', nome: 'Brindisi', capoluogo: 'Brindisi', regione: 'Puglia' },
  { sigla: 'FG', nome: 'Foggia', capoluogo: 'Foggia', regione: 'Puglia' },
  { sigla: 'LE', nome: 'Lecce', capoluogo: 'Lecce', regione: 'Puglia' },
  { sigla: 'TA', nome: 'Taranto', capoluogo: 'Taranto', regione: 'Puglia' },

  // Calabria
  { sigla: 'CZ', nome: 'Catanzaro', capoluogo: 'Catanzaro', regione: 'Calabria' },
  { sigla: 'CS', nome: 'Cosenza', capoluogo: 'Cosenza', regione: 'Calabria' },
  { sigla: 'KR', nome: 'Crotone', capoluogo: 'Crotone', regione: 'Calabria' },
  { sigla: 'RC', nome: 'Reggio Calabria', capoluogo: 'Reggio Calabria', regione: 'Calabria', alias: ['Reggio Calabria'] },
  { sigla: 'VV', nome: 'Vibo Valentia', capoluogo: 'Vibo Valentia', regione: 'Calabria' },

  // Toscana
  { sigla: 'FI', nome: 'Firenze', capoluogo: 'Firenze', regione: 'Toscana' },
  { sigla: 'AR', nome: 'Arezzo', capoluogo: 'Arezzo', regione: 'Toscana' },
  { sigla: 'GR', nome: 'Grosseto', capoluogo: 'Grosseto', regione: 'Toscana' },
  { sigla: 'LI', nome: 'Livorno', capoluogo: 'Livorno', regione: 'Toscana' },
  { sigla: 'LU', nome: 'Lucca', capoluogo: 'Lucca', regione: 'Toscana' },
  { sigla: 'MS', nome: 'Massa-Carrara', capoluogo: 'Massa', regione: 'Toscana', alias: ['Massa', 'Carrara'] },
  { sigla: 'PI', nome: 'Pisa', capoluogo: 'Pisa', regione: 'Toscana' },
  { sigla: 'PT', nome: 'Pistoia', capoluogo: 'Pistoia', regione: 'Toscana' },
  { sigla: 'PO', nome: 'Prato', capoluogo: 'Prato', regione: 'Toscana' },
  { sigla: 'SI', nome: 'Siena', capoluogo: 'Siena', regione: 'Toscana' },

  // Sardegna
  { sigla: 'CA', nome: 'Cagliari', capoluogo: 'Cagliari', regione: 'Sardegna' },
  { sigla: 'CI', nome: 'Carbonia-Iglesias', capoluogo: 'Carbonia', regione: 'Sardegna', alias: ['Carbonia', 'Iglesias'] },
  { sigla: 'NU', nome: 'Nuoro', capoluogo: 'Nuoro', regione: 'Sardegna' },
  { sigla: 'OG', nome: 'Ogliastra', capoluogo: 'Tortolì', regione: 'Sardegna', alias: ['Tortolì', 'Lanusei'] },
  { sigla: 'OR', nome: 'Oristano', capoluogo: 'Oristano', regione: 'Sardegna' },
  { sigla: 'OT', nome: 'Olbia-Tempio', capoluogo: 'Olbia', regione: 'Sardegna', alias: ['Olbia', 'Tempio'] },
  { sigla: 'SS', nome: 'Sassari', capoluogo: 'Sassari', regione: 'Sardegna' },
  { sigla: 'VS', nome: 'Medio Campidano', capoluogo: 'Villacidro', regione: 'Sardegna', alias: ['Villacidro', 'Sanluri'] },
  { sigla: 'SU', nome: 'Sud Sardegna', capoluogo: 'Carbonia', regione: 'Sardegna' },

  // Liguria
  { sigla: 'GE', nome: 'Genova', capoluogo: 'Genova', regione: 'Liguria' },
  { sigla: 'IM', nome: 'Imperia', capoluogo: 'Imperia', regione: 'Liguria' },
  { sigla: 'SP', nome: 'La Spezia', capoluogo: 'La Spezia', regione: 'Liguria', alias: ['La Spezia', 'Spezia'] },
  { sigla: 'SV', nome: 'Savona', capoluogo: 'Savona', regione: 'Liguria' },

  // Marche
  { sigla: 'AN', nome: 'Ancona', capoluogo: 'Ancona', regione: 'Marche' },
  { sigla: 'AP', nome: 'Ascoli Piceno', capoluogo: 'Ascoli Piceno', regione: 'Marche', alias: ['Ascoli'] },
  { sigla: 'FM', nome: 'Fermo', capoluogo: 'Fermo', regione: 'Marche' },
  { sigla: 'MC', nome: 'Macerata', capoluogo: 'Macerata', regione: 'Marche' },
  { sigla: 'PU', nome: 'Pesaro e Urbino', capoluogo: 'Pesaro', regione: 'Marche', alias: ['Pesaro', 'Urbino'] },

  // Abruzzo
  { sigla: 'AQ', nome: "L'Aquila", capoluogo: "L'Aquila", regione: 'Abruzzo', alias: ['Aquila'] },
  { sigla: 'CH', nome: 'Chieti', capoluogo: 'Chieti', regione: 'Abruzzo' },
  { sigla: 'PE', nome: 'Pescara', capoluogo: 'Pescara', regione: 'Abruzzo' },
  { sigla: 'TE', nome: 'Teramo', capoluogo: 'Teramo', regione: 'Abruzzo' },

  // Umbria
  { sigla: 'PG', nome: 'Perugia', capoluogo: 'Perugia', regione: 'Umbria' },
  { sigla: 'TR', nome: 'Terni', capoluogo: 'Terni', regione: 'Umbria' },

  // Basilicata
  { sigla: 'PZ', nome: 'Potenza', capoluogo: 'Potenza', regione: 'Basilicata' },
  { sigla: 'MT', nome: 'Matera', capoluogo: 'Matera', regione: 'Basilicata' },

  // Molise
  { sigla: 'CB', nome: 'Campobasso', capoluogo: 'Campobasso', regione: 'Molise' },
  { sigla: 'IS', nome: 'Isernia', capoluogo: 'Isernia', regione: 'Molise' },

  // Friuli-Venezia Giulia
  { sigla: 'TS', nome: 'Trieste', capoluogo: 'Trieste', regione: 'Friuli-Venezia Giulia' },
  { sigla: 'GO', nome: 'Gorizia', capoluogo: 'Gorizia', regione: 'Friuli-Venezia Giulia' },
  { sigla: 'PN', nome: 'Pordenone', capoluogo: 'Pordenone', regione: 'Friuli-Venezia Giulia' },
  { sigla: 'UD', nome: 'Udine', capoluogo: 'Udine', regione: 'Friuli-Venezia Giulia' },

  // Trentino-Alto Adige
  { sigla: 'TN', nome: 'Trento', capoluogo: 'Trento', regione: 'Trentino-Alto Adige' },
  { sigla: 'BZ', nome: 'Bolzano', capoluogo: 'Bolzano', regione: 'Trentino-Alto Adige', alias: ['Bozen'] },

  // Valle d'Aosta
  { sigla: 'AO', nome: "Valle d'Aosta", capoluogo: 'Aosta', regione: "Valle d'Aosta", alias: ['Aosta', 'Vallée d\'Aoste'] },
]

/**
 * Mappa ottimizzata per lookup veloce: input → sigla provincia
 * Include tutte le varianti possibili (sigla, nome, capoluogo, alias)
 */
const PROVINCIA_LOOKUP_MAP = new Map<string, string>()

// Build lookup map (case-insensitive)
PROVINCE_ITALIANE.forEach((provincia) => {
  const sigla = provincia.sigla.toUpperCase()

  // Add sigla
  PROVINCIA_LOOKUP_MAP.set(sigla, sigla)

  // Add nome provincia
  PROVINCIA_LOOKUP_MAP.set(provincia.nome.toUpperCase(), sigla)

  // Add capoluogo
  PROVINCIA_LOOKUP_MAP.set(provincia.capoluogo.toUpperCase(), sigla)

  // Add alias
  provincia.alias?.forEach((alias) => {
    PROVINCIA_LOOKUP_MAP.set(alias.toUpperCase(), sigla)
  })

  // Add common variations
  PROVINCIA_LOOKUP_MAP.set(`PROVINCIA DI ${provincia.nome.toUpperCase()}`, sigla)
  PROVINCIA_LOOKUP_MAP.set(`PROV. ${provincia.nome.toUpperCase()}`, sigla)
  PROVINCIA_LOOKUP_MAP.set(`PROV. DI ${provincia.nome.toUpperCase()}`, sigla)
})

/**
 * Normalizza input provincia a sigla ufficiale (es. "Milano" → "MI")
 * @param input - Input utente (sigla, nome, capoluogo)
 * @returns Sigla provincia normalizzata o null se non trovata
 *
 * @example
 * normalizeProvincia('Milano') // 'MI'
 * normalizeProvincia('MI') // 'MI'
 * normalizeProvincia('Provincia di Milano') // 'MI'
 * normalizeProvincia('Roma') // 'RM'
 * normalizeProvincia('invalid') // null
 */
export function normalizeProvincia(input: string): string | null {
  if (!input || input.length < 2) return null

  const normalized = input.toUpperCase().trim()

  // Direct lookup
  const sigla = PROVINCIA_LOOKUP_MAP.get(normalized)
  if (sigla) return sigla

  // Try removing common prefixes
  const withoutPrefix = normalized
    .replace(/^PROVINCIA\s+(DI\s+)?/i, '')
    .replace(/^PROV\.\s+(DI\s+)?/i, '')
    .trim()

  return PROVINCIA_LOOKUP_MAP.get(withoutPrefix) || null
}

/**
 * Get provincia info by sigla
 */
export function getProvinciaInfo(sigla: string): ProvinciaInfo | null {
  return PROVINCE_ITALIANE.find((p) => p.sigla === sigla.toUpperCase()) || null
}

/**
 * Search province by query (for autocomplete)
 */
export function searchProvince(query: string): ProvinciaInfo[] {
  if (!query || query.length < 2) return []

  const normalizedQuery = query.toLowerCase()

  return PROVINCE_ITALIANE.filter(
    (p) =>
      p.sigla.toLowerCase().includes(normalizedQuery) ||
      p.nome.toLowerCase().includes(normalizedQuery) ||
      p.capoluogo.toLowerCase().includes(normalizedQuery) ||
      p.alias?.some((a) => a.toLowerCase().includes(normalizedQuery))
  ).slice(0, 10) // Limit to 10 results
}

/**
 * Normalizza nome comune per matching consistente
 * Gestisce varianti comuni, prefissi, accenti e case
 *
 * @param comune - Nome comune da normalizzare
 * @returns Nome comune normalizzato per confronto
 *
 * @example
 * normalizeComune('Milano') // 'milano'
 * normalizeComune('MILANO') // 'milano'
 * normalizeComune('San Giovanni Valdarno') // 'san giovanni valdarno'
 * normalizeComune('S. Giovanni Valdarno') // 'san giovanni valdarno'
 * normalizeComune('Reggio Emilia') // 'reggio emilia'
 * normalizeComune("L'Aquila") // 'aquila'
 */
export function normalizeComune(comune: string): string {
  if (!comune || comune.length < 2) return ''

  let normalized = comune
    .toLowerCase()
    .trim()
    // Remove accents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  // Expand common abbreviations
  const abbreviations: Record<string, string> = {
    "s\\.": 'san',
    "st\\.": 'santo',
    "sta\\.": 'santa',
    "s\\.ta": 'santa',
    "n\\.": 'nuovo',
    "v\\.": 'vecchio',
  }

  Object.entries(abbreviations).forEach(([abbr, full]) => {
    const regex = new RegExp(`\\b${abbr}\\s`, 'gi')
    normalized = normalized.replace(regex, `${full} `)
  })

  // Normalize multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim()

  // Remove apostrophes and common prefixes for better matching
  // E.g., "L'Aquila" → "aquila" (but keep original for display)
  const withoutPrefix = normalized.replace(/^(l'|d'|dell')\s*/i, '')

  return withoutPrefix
}

/**
 * Verifica se due nomi comuni matchano (fuzzy matching)
 * Usa normalizzazione per gestire varianti
 *
 * @param comune1 - Primo comune
 * @param comune2 - Secondo comune
 * @returns true se i comuni matchano
 *
 * @example
 * matchComune('Milano', 'MILANO') // true
 * matchComune('San Giovanni', 'S. Giovanni') // true
 * matchComune("L'Aquila", 'Aquila') // true
 * matchComune('Roma', 'Milano') // false
 */
export function matchComune(comune1: string, comune2: string): boolean {
  if (!comune1 || !comune2) return false

  const norm1 = normalizeComune(comune1)
  const norm2 = normalizeComune(comune2)

  // Exact match dopo normalizzazione
  if (norm1 === norm2) return true

  // Partial match (uno contiene l'altro) per casi come "Roma" vs "Roma Capitale"
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    // Ma solo se la lunghezza è simile (max 20% differenza)
    const minLen = Math.min(norm1.length, norm2.length)
    const maxLen = Math.max(norm1.length, norm2.length)
    return maxLen / minLen <= 1.2
  }

  return false
}

/**
 * Get province by regione
 * Restituisce tutte le province di una regione
 *
 * @param regione - Nome regione
 * @returns Array di province info
 *
 * @example
 * getProvinceByRegione('Lombardia') // [{ sigla: 'MI', ... }, { sigla: 'BG', ... }, ...]
 */
export function getProvinceByRegione(regione: string): ProvinciaInfo[] {
  if (!regione) return []

  const normalizedRegione = regione.toLowerCase().trim()

  return PROVINCE_ITALIANE.filter(
    (p) => p.regione.toLowerCase() === normalizedRegione
  )
}
