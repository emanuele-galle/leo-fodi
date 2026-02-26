/**
 * Enum Labels Helper
 * Mappa i valori enum degli agent in label human-readable per l'UI
 */

// ==================== EDUCATION ====================
export const EDUCATION_LEVEL_LABELS: Record<string, string> = {
  'licenza_media': 'Licenza Media',
  'diploma': 'Diploma',
  'diploma_scuola_superiore': 'Diploma Scuola Superiore',
  'laurea_triennale': 'Laurea Triennale',
  'laurea_magistrale': 'Laurea Magistrale',
  'master': 'Master',
  'dottorato': 'Dottorato',
  'non_determinato': 'Non Determinato',
}

// ==================== CAREER ====================
export const CAREER_LEVEL_LABELS: Record<string, string> = {
  'entry': 'Entry Level',
  'junior': 'Junior',
  'mid': 'Mid Level',
  'senior': 'Senior',
  'lead': 'Lead',
  'manager': 'Manager',
  'director': 'Director',
  'executive': 'Executive',
  'founder': 'Founder',
  'freelance': 'Freelance',
  'non_determinato': 'Non Determinato',
}

export const CAREER_TYPE_LABELS: Record<string, string> = {
  'dipendente': 'Dipendente',
  'freelance': 'Freelance',
  'imprenditore': 'Imprenditore',
  'consulente': 'Consulente',
  'partita_iva': 'Partita IVA',
  'collaboratore': 'Collaboratore',
  'non_determinato': 'Non Determinato',
}

// ==================== WEALTH ====================
export const WEALTH_LEVEL_LABELS: Record<string, string> = {
  'basso': 'Basso',
  'medio_basso': 'Medio-Basso',
  'medio': 'Medio',
  'medio_alto': 'Medio-Alto',
  'alto': 'Alto',
  'molto_alto': 'Molto Alto',
  'lusso': 'Lusso',
  'non_determinato': 'Non Determinato',
}

export const WEALTH_INDICATOR_TYPE_LABELS: Record<string, string> = {
  'residenza': 'Residenza',
  'auto': 'Auto',
  'viaggi': 'Viaggi',
  'brand': 'Brand',
  'proprietà': 'Proprietà',
  'investimenti': 'Investimenti',
  'hobby': 'Hobby',
  'eventi': 'Eventi',
  'altro': 'Altro',
}

// ==================== FAMILY ====================
export const MARITAL_STATUS_LABELS: Record<string, string> = {
  'single': 'Single',
  'fidanzato': 'Fidanzato/a',
  'sposato': 'Sposato/a',
  'convivente': 'Convivente',
  'separato': 'Separato/a',
  'divorziato': 'Divorziato/a',
  'vedovo': 'Vedovo/a',
  'non_determinato': 'Non Determinato',
}

export const RESIDENCE_TYPE_LABELS: Record<string, string> = {
  'centro': 'Centro',
  'periferia': 'Periferia',
  'residenziale': 'Zona Residenziale',
  'popolare': 'Zona Popolare',
  'esclusiva': 'Zona Esclusiva',
  'campagna': 'Campagna',
  'mare': 'Mare',
  'montagna': 'Montagna',
  'non_determinato': 'Non Determinato',
}

// ==================== LIFESTYLE ====================
export const LIFESTYLE_TYPE_LABELS: Record<string, string> = {
  'sportivo': 'Sportivo',
  'intellettuale': 'Intellettuale',
  'mondano': 'Mondano',
  'casalingo': 'Casalingo',
  'avventuroso': 'Avventuroso',
  'minimalista': 'Minimalista',
  'lusso': 'Lusso',
  'equilibrato': 'Equilibrato',
  'non_determinato': 'Non Determinato',
}

export const HOBBY_FREQUENCY_LABELS: Record<string, string> = {
  'quotidiana': 'Quotidiana',
  'settimanale': 'Settimanale',
  'mensile': 'Mensile',
  'occasionale': 'Occasionale',
  'rara': 'Rara',
  'alta': 'Alta',
  'media': 'Media',
  'bassa': 'Bassa',
}

// ==================== WORK MODEL ====================
export const WORK_MODE_LABELS: Record<string, string> = {
  'remoto': 'Remoto',
  'ibrido': 'Ibrido',
  'ufficio': 'Ufficio',
  'autonomo': 'Autonomo',
  'non_determinato': 'Non Determinato',
}

export const WORK_FLEXIBILITY_LABELS: Record<string, string> = {
  'alta': 'Alta',
  'media': 'Media',
  'bassa': 'Bassa',
  'non_determinato': 'Non Determinato',
}

export const WORK_SCHEDULE_LABELS: Record<string, string> = {
  'standard': 'Standard',
  'flessibile': 'Flessibile',
  'turni': 'Turni',
  'indipendente': 'Indipendente',
  'non_determinato': 'Non Determinato',
}

export const WORK_LIFE_BALANCE_LABELS: Record<string, string> = {
  'ottimo': 'Ottimo',
  'buono': 'Buono',
  'medio': 'Medio',
  'scarso': 'Scarso',
  'non_determinato': 'Non Determinato',
}

export const WORK_ENVIRONMENT_LABELS: Record<string, string> = {
  'corporate': 'Corporate',
  'startup': 'Startup',
  'pmi': 'PMI',
  'freelance': 'Freelance',
  'imprenditore': 'Imprenditore',
  'pubblica_amministrazione': 'Pubblica Amministrazione',
  'non_profit': 'Non Profit',
  'non_determinato': 'Non Determinato',
}

export const TEAM_SIZE_LABELS: Record<string, string> = {
  'solo': 'Solo',
  'piccolo': 'Piccolo (2-10)',
  'medio': 'Medio (11-50)',
  'grande': 'Grande (50+)',
  'non_determinato': 'Non Determinato',
}

export const WORK_APPROACH_LABELS: Record<string, string> = {
  'agile': 'Agile',
  'tradizionale': 'Tradizionale',
  'ibrido': 'Ibrido',
  'non_determinato': 'Non Determinato',
}

export const COLLABORATION_LEVEL_LABELS: Record<string, string> = {
  'alta': 'Alta',
  'media': 'Media',
  'bassa': 'Bassa',
  'non_determinato': 'Non Determinato',
}

// ==================== VISION & GOALS ====================
export const GOAL_PRIORITY_LABELS: Record<string, string> = {
  'alta': 'Alta',
  'media': 'Media',
  'bassa': 'Bassa',
}

export const GOAL_TIMEFRAME_LABELS: Record<string, string> = {
  'breve': 'Breve Termine (0-1 anno)',
  'medio': 'Medio Termine (1-3 anni)',
  'lungo': 'Lungo Termine (3+ anni)',
}

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  'in_corso': 'In Corso',
  'pianificazione': 'In Pianificazione',
  'completato': 'Completato',
  'sospeso': 'Sospeso',
}

export const ASPIRATION_TYPE_LABELS: Record<string, string> = {
  'carriera': 'Carriera',
  'finanziaria': 'Finanziaria',
  'lifestyle': 'Lifestyle',
  'famiglia': 'Famiglia',
  'crescita_personale': 'Crescita Personale',
  'sociale': 'Sociale',
  'impatto': 'Impatto Sociale',
}

// ==================== NEEDS MAPPING ====================
export const NEED_TYPE_LABELS: Record<string, string> = {
  'sicurezza': 'Sicurezza',
  'previdenza': 'Previdenza',
  'investimenti': 'Investimenti',
  'protezione': 'Protezione',
  'risparmio': 'Risparmio',
  'crescita_patrimonio': 'Crescita Patrimonio',
  'salute': 'Salute',
  'famiglia': 'Famiglia',
  'business': 'Business',
  'lifestyle': 'Lifestyle',
}

export const NEED_PRIORITY_LABELS: Record<string, string> = {
  'alta': 'Alta',
  'media': 'Media',
  'bassa': 'Bassa',
}

export const OPPORTUNITY_POTENTIAL_LABELS: Record<string, string> = {
  'alto': 'Alto',
  'medio': 'Medio',
  'basso': 'Basso',
}

export const OPPORTUNITY_TIMEFRAME_LABELS: Record<string, string> = {
  'immediato': 'Immediato',
  'breve_termine': 'Breve Termine',
  'medio_termine': 'Medio Termine',
  'lungo_termine': 'Lungo Termine',
}

export const VULNERABILITY_IMPACT_LABELS: Record<string, string> = {
  'alto': 'Alto',
  'medio': 'Medio',
  'basso': 'Basso',
}

// ==================== ENGAGEMENT ====================
export const ENGAGEMENT_LEVER_TYPE_LABELS: Record<string, string> = {
  'razionale': 'Razionale',
  'emotiva': 'Emotiva',
  'sociale': 'Sociale',
  'aspirazionale': 'Aspirazionale',
  'urgenza': 'Urgenza',
}

export const ENGAGEMENT_EFFECTIVENESS_LABELS: Record<string, string> = {
  'alta': 'Alta',
  'media': 'Media',
  'bassa': 'Bassa',
}

export const CONTACT_MOMENT_TYPE_LABELS: Record<string, string> = {
  'professionale': 'Professionale',
  'personale': 'Personale',
  'stagionale': 'Stagionale',
  'life_event': 'Evento di Vita',
  'post-evento': 'Post-Evento',
}

export const CHANNEL_PREFERENCE_LABELS: Record<string, string> = {
  'alta': 'Alta',
  'media': 'Media',
  'bassa': 'Bassa',
}

export const OBSTACLE_LEVEL_LABELS: Record<string, string> = {
  'alta': 'Alta',
  'media': 'Media',
  'bassa': 'Bassa',
}

// ==================== AUTHORITY SIGNALS ====================
export const INFLUENCE_LEVEL_LABELS: Record<string, string> = {
  'micro': 'Micro (< 10k)',
  'emerging': 'Emergente (10k-50k)',
  'established': 'Affermato (50k-100k)',
  'macro': 'Macro (100k-500k)',
  'celebrity': 'Celebrity (500k+)',
  'niche_expert': 'Esperto di Nicchia',
  'non_determinato': 'Non Determinato',
}

export const PUBLICATION_TYPE_LABELS: Record<string, string> = {
  'articolo': 'Articolo',
  'libro': 'Libro',
  'paper': 'Paper Accademico',
  'post': 'Post',
  'altro': 'Altro',
}

export const COMMUNITY_ROLE_LABELS: Record<string, string> = {
  'membro': 'Membro',
  'moderatore': 'Moderatore',
  'leader': 'Leader',
  'fondatore': 'Fondatore',
  'altro': 'Altro',
}

// ==================== GENERAL ====================
export const CONFIDENCE_LEVEL_LABELS: Record<string, string> = {
  'alto': 'Alto',
  'medio': 'Medio',
  'basso': 'Basso',
}

/**
 * Funzione generica per ottenere la label di un valore enum
 */
export function getEnumLabel(value: string | undefined | null, labelMap: Record<string, string>): string {
  if (!value) return 'N/D'

  // Se il valore è già formattato (contiene spazi maiuscole), restituiscilo così com'è
  if (/[A-Z]/.test(value) && value.includes(' ')) {
    return value
  }

  // Altrimenti cerca nella mappa
  return labelMap[value] || value
}

/**
 * Funzione di auto-detect per ottenere la label corretta in base al contesto
 */
export function formatEnumValue(value: string | undefined | null, context?: string): string {
  if (!value) return 'N/D'

  // Se già formattato, restituisci così com'è
  if (/[A-Z]/.test(value) && value.includes(' ')) {
    return value
  }

  // Prova a indovinare il tipo in base al valore
  if (EDUCATION_LEVEL_LABELS[value]) return EDUCATION_LEVEL_LABELS[value]
  if (CAREER_LEVEL_LABELS[value]) return CAREER_LEVEL_LABELS[value]
  if (WEALTH_LEVEL_LABELS[value]) return WEALTH_LEVEL_LABELS[value]
  if (MARITAL_STATUS_LABELS[value]) return MARITAL_STATUS_LABELS[value]
  if (LIFESTYLE_TYPE_LABELS[value]) return LIFESTYLE_TYPE_LABELS[value]
  if (WORK_MODE_LABELS[value]) return WORK_MODE_LABELS[value]
  if (INFLUENCE_LEVEL_LABELS[value]) return INFLUENCE_LEVEL_LABELS[value]
  if (PUBLICATION_TYPE_LABELS[value]) return PUBLICATION_TYPE_LABELS[value]
  if (COMMUNITY_ROLE_LABELS[value]) return COMMUNITY_ROLE_LABELS[value]

  // Fallback: capitalizza e sostituisci underscore
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
