/**
 * Reflection & Critique System - Type Definitions
 * Sistema di auto-correzione con pattern "Reflect and Critique"
 */

// ==================== CRITIQUE ====================

export interface CritiqueRubric {
  name: string
  factors: Array<{
    name: string
    description: string
    weight: number // 0-1, totale deve essere 1.0
  }>
  threshold: number // Score minimo accettabile (0-10)
}

export interface CritiqueResult {
  score: number // 0-10
  passed: boolean
  issues: Array<{
    factor: string
    severity: 'low' | 'medium' | 'high'
    description: string
    suggestion?: string
  }>
  suggestions: string[]
  reasoning: string
}

// ==================== REFLECTION STATE ====================

export interface ReflectionState<T> {
  iteration: number
  max_iterations: number
  current_output: T | null
  best_output: T | null
  best_score: number
  critiques: CritiqueResult[]
  completed: boolean
  final_score: number
}

// ==================== CONFIDENCE SCORING ====================

export interface ConfidenceFactor {
  source_reliability: number // 0-1 (peso 30%)
  cross_validation: number // 0-1 (peso 40%)
  data_freshness: number // 0-1 (peso 15%)
  direct_vs_inferred: number // 0-1 (peso 15%)
}

export interface DataMetadata {
  source: string
  sources: string[] // per cross-validation
  timestamp: Date
  is_direct: boolean
}

export interface EnrichedDataPoint<T = any> {
  value: T
  metadata: {
    source: string
    sources: string[]
    timestamp: Date
    is_direct: boolean
    confidence_score: number
    confidence_breakdown: ConfidenceFactor
  }
}

// ==================== AGENT RUBRICS ====================

export const WEALTH_RUBRIC: CritiqueRubric = {
  name: 'Wealth Assessment',
  factors: [
    {
      name: 'Indicatori Coerenti',
      description: 'Gli indicatori di ricchezza sono coerenti tra loro (residenza, auto, viaggi, brand)',
      weight: 0.4,
    },
    {
      name: 'Fonti Multiple',
      description: 'Le stime sono supportate da dati provenienti da fonti multiple e indipendenti',
      weight: 0.3,
    },
    {
      name: 'Logica Stime',
      description: 'Le stime di reddito e patrimonio sono ragionevoli dato il profilo professionale',
      weight: 0.3,
    },
  ],
  threshold: 8.0,
}

export const FAMILY_RUBRIC: CritiqueRubric = {
  name: 'Family Profile',
  factors: [
    {
      name: 'Coerenza Familiare',
      description: 'Le informazioni sul nucleo familiare sono coerenti tra piattaforme diverse',
      weight: 0.4,
    },
    {
      name: 'Residenza Verificata',
      description: 'La residenza e il tipo di zona sono supportati da evidenze concrete',
      weight: 0.3,
    },
    {
      name: 'Relazioni Verificate',
      description: 'Le relazioni familiari identificate sono confermate da fonti multiple',
      weight: 0.3,
    },
  ],
  threshold: 8.0,
}

export const CAREER_RUBRIC: CritiqueRubric = {
  name: 'Career Profile',
  factors: [
    {
      name: 'Cronologia Logica',
      description: 'La cronologia lavorativa è logica e senza gap temporali sospetti',
      weight: 0.4,
    },
    {
      name: 'Livello Coerente',
      description: 'Il livello professionale assegnato è coerente con anzianità e ruoli',
      weight: 0.3,
    },
    {
      name: 'Competenze Verificate',
      description: 'Le competenze elencate sono supportate da esperienza lavorativa',
      weight: 0.3,
    },
  ],
  threshold: 7.5,
}

export const EDUCATION_RUBRIC: CritiqueRubric = {
  name: 'Education Profile',
  factors: [
    {
      name: 'Titoli Verificati',
      description: 'I titoli di studio sono verificabili da fonti ufficiali o profili professionali',
      weight: 0.5,
    },
    {
      name: 'Coerenza Percorso',
      description: 'Il percorso formativo è coerente con la carriera professionale',
      weight: 0.3,
    },
    {
      name: 'Fonti Attendibili',
      description: 'Le informazioni provengono da fonti attendibili (LinkedIn, CV pubblici)',
      weight: 0.2,
    },
  ],
  threshold: 7.5,
}

export const LIFESTYLE_RUBRIC: CritiqueRubric = {
  name: 'Lifestyle Analysis',
  factors: [
    {
      name: 'Pattern Comportamentali',
      description: 'Gli hobby e interessi identificati mostrano pattern ricorrenti verificabili',
      weight: 0.4,
    },
    {
      name: 'Coerenza Lifestyle',
      description: 'Stile di vita, viaggi e brand sono coerenti con la capacità economica stimata',
      weight: 0.3,
    },
    {
      name: 'Dati da Social Media',
      description: 'Le analisi sono basate su post, foto e attività social concrete',
      weight: 0.3,
    },
  ],
  threshold: 7.5,
}

export const SOCIAL_RUBRIC: CritiqueRubric = {
  name: 'Social Graph',
  factors: [
    {
      name: 'Connessioni Verificate',
      description: 'Le connessioni chiave sono verificabili e hanno relazioni documentate',
      weight: 0.4,
    },
    {
      name: 'Metriche Accurate',
      description: 'I numeri di followers, following ed engagement sono accurati e recenti',
      weight: 0.3,
    },
    {
      name: 'Gruppi Rilevanti',
      description: 'I gruppi e comunità identificati sono pertinenti al profilo del target',
      weight: 0.3,
    },
  ],
  threshold: 7.5,
}

export const CONTENT_RUBRIC: CritiqueRubric = {
  name: 'Content Analysis',
  factors: [
    {
      name: 'Temi Supportati',
      description: 'I temi ricorrenti sono supportati da post e contenuti concreti',
      weight: 0.4,
    },
    {
      name: 'Sentiment Accuracy',
      description: 'L\'analisi del sentiment è accurata e basata su linguaggio effettivo',
      weight: 0.3,
    },
    {
      name: 'Valori Coerenti',
      description: 'I valori emergenti sono coerenti con il contenuto analizzato',
      weight: 0.3,
    },
  ],
  threshold: 7.5,
}

// ==================== GENERATION FUNCTIONS ====================

export type GeneratorFunction<T> = (feedback?: string[]) => Promise<T>
export type CritiquerFunction<T> = (output: T) => Promise<CritiqueResult>
