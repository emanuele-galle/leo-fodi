/**
 * Critique Agent
 * Agente che valuta la qualità degli output secondo rubrica specifica
 */

import { callAI, createMessages, parseJSONResponse } from '../ai/ai-client'
import type { CritiqueRubric, CritiqueResult } from './types'

export class CritiqueAgent {
  /**
   * Valuta output secondo rubrica specificata
   */
  async critique<T>(
    output: T,
    rubric: CritiqueRubric,
    context?: {
      target_name?: string
      previous_critiques?: CritiqueResult[]
    }
  ): Promise<CritiqueResult> {
    console.log(`\n🔍 [CritiqueAgent] Evaluating output for: ${rubric.name}`)

    try {
      const systemPrompt = this.buildCritiqueSystemPrompt(rubric)
      const userPrompt = this.buildCritiqueUserPrompt(output, rubric, context)

      const messages = createMessages(systemPrompt, userPrompt)

      const response = await callAI(messages, {
        temperature: 0.3,
        maxTokens: 2000,
        responseFormat: 'json_object',
      })

      const critique = parseJSONResponse<CritiqueResult>(response)

      // Valida struttura
      this.validateCritique(critique)

      // Determina se passed
      critique.passed = critique.score >= rubric.threshold

      console.log(
        `   Score: ${critique.score.toFixed(1)}/10 (threshold: ${rubric.threshold})`
      )
      console.log(`   Passed: ${critique.passed ? '✅' : '❌'}`)
      console.log(`   Issues found: ${critique.issues.length}`)

      return critique
    } catch (error) {
      console.error(`[CritiqueAgent] Error during critique:`, error)

      // Fallback: passa sempre se critica fallisce (fail-open)
      return {
        score: rubric.threshold, // Score minimo per passare
        passed: true,
        issues: [],
        suggestions: [],
        reasoning: `Critique failed: ${error instanceof Error ? error.message : 'Unknown error'}. Accepting output as-is.`,
      }
    }
  }

  /**
   * Costruisci system prompt per critique
   */
  private buildCritiqueSystemPrompt(rubric: CritiqueRubric): string {
    return `Sei un analista di intelligence senior specializzato in ${rubric.name}.

Il tuo compito è valutare criticamente l'output fornito secondo questa rubrica:

${rubric.factors
  .map(
    (f, i) => `
${i + 1}. ${f.name} (peso: ${(f.weight * 100).toFixed(0)}%)
   ${f.description}
`
  )
  .join('')}

ISTRUZIONI:
1. Esamina attentamente l'output fornito
2. Valuta OGNI fattore della rubrica con score 0-10
3. Calcola score finale come media ponderata
4. Identifica incongruenze, lacune logiche, supposizioni non verificate
5. Fornisci suggerimenti concreti per migliorare

IMPORTANTE:
- Sii rigoroso ma obiettivo
- Considera il contesto (dati disponibili, limiti OSINT)
- Suggerimenti devono essere actionable
- Se score < ${rubric.threshold}, l'output richiede revisione

Rispondi in JSON con questa struttura:
{
  "score": number (0-10, media ponderata),
  "issues": [
    {
      "factor": "nome fattore",
      "severity": "low" | "medium" | "high",
      "description": "descrizione problema",
      "suggestion": "come risolvere"
    }
  ],
  "suggestions": ["suggerimento generale 1", "suggerimento 2", ...],
  "reasoning": "spiegazione del punteggio e decisione finale"
}`
  }

  /**
   * Costruisci user prompt con output da valutare
   */
  private buildCritiqueUserPrompt<T>(
    output: T,
    rubric: CritiqueRubric,
    context?: {
      target_name?: string
      previous_critiques?: CritiqueResult[]
    }
  ): string {
    let prompt = `Valuta questo output secondo la rubrica "${rubric.name}":\n\n`

    if (context?.target_name) {
      prompt += `Target: ${context.target_name}\n\n`
    }

    prompt += `OUTPUT DA VALUTARE:\n${JSON.stringify(output, null, 2)}\n\n`

    if (context?.previous_critiques && context.previous_critiques.length > 0) {
      prompt += `CRITICHE PRECEDENTI (per contesto):\n`
      context.previous_critiques.forEach((c, i) => {
        prompt += `Iterazione ${i + 1}: Score ${c.score}/10\n`
        prompt += `- Issues: ${c.issues.length}\n`
        prompt += `- Suggestions: ${c.suggestions.join('; ')}\n\n`
      })
    }

    prompt += `Fornisci la tua valutazione in formato JSON.`

    return prompt
  }

  /**
   * Valida struttura risposta critique
   */
  private validateCritique(critique: any): asserts critique is CritiqueResult {
    if (typeof critique.score !== 'number' || critique.score < 0 || critique.score > 10) {
      throw new Error('Invalid score in critique result')
    }

    if (!Array.isArray(critique.issues)) {
      critique.issues = []
    }

    if (!Array.isArray(critique.suggestions)) {
      critique.suggestions = []
    }

    if (!critique.reasoning) {
      critique.reasoning = 'No reasoning provided'
    }
  }
}
