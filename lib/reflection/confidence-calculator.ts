/**
 * Confidence Calculator
 * Calcola score di confidenza multi-fattore per dati OSINT
 */

import type { ConfidenceFactor, DataMetadata, EnrichedDataPoint } from './types'

export class ConfidenceCalculator {
  /**
   * Calcola confidence score per un data point
   */
  calculate<T>(value: T, metadata: DataMetadata): EnrichedDataPoint<T> {
    const factors: ConfidenceFactor = {
      source_reliability: this.scoreSourceReliability(metadata.source),
      cross_validation: this.scoreCrossValidation(metadata.sources),
      data_freshness: this.scoreDataFreshness(metadata.timestamp),
      direct_vs_inferred: metadata.is_direct ? 1.0 : 0.6,
    }

    // Pesi dei fattori (totale = 1.0)
    const weights = {
      source_reliability: 0.3,
      cross_validation: 0.4,
      data_freshness: 0.15,
      direct_vs_inferred: 0.15,
    }

    // Calcola score finale come media ponderata
    const confidence_score = Object.entries(factors).reduce((score, [key, value]) => {
      return score + value * weights[key as keyof typeof weights]
    }, 0)

    return {
      value,
      metadata: {
        source: metadata.source,
        sources: metadata.sources,
        timestamp: metadata.timestamp,
        is_direct: metadata.is_direct,
        confidence_score: Math.round(confidence_score * 100) / 100, // 2 decimali
        confidence_breakdown: factors,
      },
    }
  }

  /**
   * Score reliability della fonte (0-1)
   */
  private scoreSourceReliability(source: string): number {
    const reliabilityMap: Record<string, number> = {
      // Fonti ufficiali
      government_api: 1.0,
      infocamere_api: 1.0,
      official_registry: 0.95,

      // Siti web ufficiali
      official_website: 0.8,
      company_website: 0.8,

      // Social network professionali
      linkedin_profile: 0.75,

      // Social network personali (auto-dichiarati)
      facebook_profile: 0.5,
      instagram_profile: 0.5,
      twitter_profile: 0.5,

      // Web scraping generico
      web_scraping: 0.4,

      // Commenti/terze parti
      third_party_comment: 0.3,
      user_generated_content: 0.3,
    }

    return reliabilityMap[source.toLowerCase()] ?? 0.5 // Default: affidabilità media
  }

  /**
   * Score cross-validation (più fonti indipendenti = più affidabile)
   */
  private scoreCrossValidation(sources: string[]): number {
    const uniqueSources = new Set(sources).size

    if (uniqueSources === 0) return 0.5 // Nessuna fonte, score base

    // Score base + bonus per fonti aggiuntive
    const baseScore = 0.5
    const bonusPerSource = 0.2

    // Max score 1.0 raggiungibile con 3+ fonti indipendenti
    return Math.min(1.0, baseScore + (uniqueSources - 1) * bonusPerSource)
  }

  /**
   * Score data freshness con decay esponenziale
   */
  private scoreDataFreshness(timestamp: Date): number {
    const now = Date.now()
    const dataTime = timestamp.getTime()

    // Età in anni
    const ageInYears = (now - dataTime) / (365 * 24 * 60 * 60 * 1000)

    // Decay rate (lambda) - più alto = decay più rapido
    // 0.2 = dato perde ~20% confidence ogni anno
    const lambda = 0.2

    // Formula: score = e^(-lambda * t)
    const score = Math.exp(-lambda * ageInYears)

    return Math.max(0.1, score) // Min 0.1 anche per dati molto vecchi
  }

  /**
   * Calcola confidence medio per un array di data points
   */
  calculateAverage(dataPoints: EnrichedDataPoint[]): number {
    if (dataPoints.length === 0) return 0

    const sum = dataPoints.reduce(
      (acc, dp) => acc + dp.metadata.confidence_score,
      0
    )

    return Math.round((sum / dataPoints.length) * 100) / 100
  }

  /**
   * Filtra data points sotto threshold
   */
  filterByConfidence<T>(
    dataPoints: EnrichedDataPoint<T>[],
    minConfidence: number
  ): EnrichedDataPoint<T>[] {
    return dataPoints.filter((dp) => dp.metadata.confidence_score >= minConfidence)
  }

  /**
   * Ordina data points per confidence (desc)
   */
  sortByConfidence<T>(dataPoints: EnrichedDataPoint<T>[]): EnrichedDataPoint<T>[] {
    return [...dataPoints].sort(
      (a, b) => b.metadata.confidence_score - a.metadata.confidence_score
    )
  }
}
