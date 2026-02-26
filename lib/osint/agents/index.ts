/**
 * OSINT Specialized Agents V2
 * Agent specializzati per profilazione completa con Reflect Loop
 *
 * Modelli XAI Grok-4-Fast assegnati:
 * - Family Investigator: grok-4-fast-non-reasoning (task strutturato, pattern matching)
 * - Career Analyzer: grok-4-fast-reasoning (reasoning su storico professionale)
 * - Education Profiler: grok-4-fast-non-reasoning (task semplice, data extraction)
 * - Lifestyle Analyst: grok-4-fast-reasoning (analisi comportamentale complessa)
 * - Wealth Estimator: grok-4-fast-reasoning (inferenze economiche complesse)
 * - Social Graph Builder: grok-4-fast-non-reasoning (elaborazione grafi, conteggi)
 * - Content Analyzer: grok-4-fast-reasoning (sentiment analysis, tema identification)
 */

// Core V2 Agents (Sezioni 1-7)
export { WealthEstimatorAgentV2 } from './wealth-estimator-agent-v2'
export { FamilyInvestigatorAgentV2 } from './family-investigator-agent-v2'
export {
  CareerAnalyzerAgentV2,
  EducationProfilerAgentV2,
  LifestyleAnalystAgentV2,
  SocialGraphBuilderAgentV2,
  ContentAnalyzerAgentV2,
} from './all-agents-v2'

// Advanced V2 Agents (Sezioni 8-13)
export { AuthoritySignalsAnalyzerAgentV2 } from './authority-signals-agent-v2'
export {
  WorkModelAnalyzerAgentV2,
  VisionGoalsAnalystAgentV2,
  NeedsMapperAgentV2,
  EngagementStrategistAgentV2,
} from './advanced-agents-v2'