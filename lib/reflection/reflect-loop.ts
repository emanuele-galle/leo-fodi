/**
 * Reflect Loop
 * Ciclo di generazione → critica → rigenerazione
 * Usa pattern iterativo senza LangGraph per semplicità
 */

import { CritiqueAgent } from './critique-agent'
import type {
  ReflectionState,
  CritiqueRubric,
  CritiqueResult,
  GeneratorFunction,
  CritiquerFunction,
} from './types'

export class ReflectLoop {
  private critiqueAgent = new CritiqueAgent()

  /**
   * Esegue ciclo di riflessione e auto-correzione
   *
   * @param generator - Funzione che genera/rigenera output (può ricevere feedback)
   * @param rubric - Rubrica di valutazione
   * @param options - Configurazione loop
   * @returns Output validato (best effort se max iterations)
   */
  async run<T>(
    generator: GeneratorFunction<T>,
    rubric: CritiqueRubric,
    options: {
      maxIterations?: number
      targetName?: string
      onIteration?: (state: ReflectionState<T>) => void
    } = {}
  ): Promise<{ output: T; state: ReflectionState<T> }> {
    const maxIterations = options.maxIterations ?? 3

    const state: ReflectionState<T> = {
      iteration: 0,
      max_iterations: maxIterations,
      current_output: null,
      best_output: null,
      best_score: 0,
      critiques: [],
      completed: false,
      final_score: 0,
    }

    console.log(
      `\n🔄 [ReflectLoop] Starting reflection cycle for: ${rubric.name}`
    )
    console.log(`   Max iterations: ${maxIterations}`)
    console.log(`   Threshold: ${rubric.threshold}/10`)

    while (state.iteration < maxIterations) {
      state.iteration++

      console.log(`\n--- Iteration ${state.iteration}/${maxIterations} ---`)

      try {
        // ========== GENERAZIONE ==========
        console.log(`[ReflectLoop] Generating output...`)

        const feedback =
          state.critiques.length > 0
            ? state.critiques[state.critiques.length - 1].suggestions
            : undefined

        const output = await generator(feedback)
        state.current_output = output

        // ========== CRITICA ==========
        console.log(`[ReflectLoop] Evaluating output...`)

        const critique = await this.critiqueAgent.critique(output, rubric, {
          target_name: options.targetName,
          previous_critiques: state.critiques,
        })

        state.critiques.push(critique)

        // Aggiorna best output se migliore
        if (critique.score > state.best_score) {
          state.best_score = critique.score
          state.best_output = output
          console.log(
            `   📈 New best score: ${state.best_score.toFixed(1)}/10`
          )
        }

        // Callback per monitoring esterno
        if (options.onIteration) {
          options.onIteration(state)
        }

        // ========== CHECK THRESHOLD ==========
        if (critique.passed) {
          state.completed = true
          state.final_score = critique.score

          console.log(
            `\n✅ [ReflectLoop] Quality threshold met! (${critique.score.toFixed(1)}/10)`
          )
          console.log(
            `   Completed in ${state.iteration} iteration(s)`
          )

          return {
            output: output,
            state,
          }
        }

        // Se non passa, logga issues e continua
        console.log(
          `   ⚠️ Score ${critique.score.toFixed(1)}/10 below threshold`
        )
        console.log(`   Issues: ${critique.issues.length}`)

        if (critique.suggestions.length > 0) {
          console.log(`   Suggestions for next iteration:`)
          critique.suggestions.forEach((s, i) => {
            console.log(`     ${i + 1}. ${s}`)
          })
        }
      } catch (error) {
        console.error(
          `[ReflectLoop] Error in iteration ${state.iteration}:`,
          error
        )

        // Se errore ma abbiamo un output precedente, usa quello
        if (state.best_output) {
          console.log(`   Using best previous output (score: ${state.best_score})`)
          break
        }

        throw error
      }
    }

    // ========== MAX ITERATIONS REACHED ==========
    console.log(
      `\n⚠️ [ReflectLoop] Max iterations reached (${maxIterations})`
    )

    if (state.best_output) {
      state.final_score = state.best_score
      console.log(
        `   Returning best output with score: ${state.best_score.toFixed(1)}/10`
      )

      return {
        output: state.best_output,
        state,
      }
    }

    // Fallback ultimo: usa current anche se non passa threshold
    console.log(
      `   ⚠️ No output passed threshold, returning last attempt`
    )

    return {
      output: state.current_output!,
      state,
    }
  }

  /**
   * Wrapper semplificato con solo generator e critiquer custom
   */
  async runCustom<T>(
    generator: GeneratorFunction<T>,
    critiquer: CritiquerFunction<T>,
    options: {
      threshold?: number
      maxIterations?: number
    } = {}
  ): Promise<{ output: T; iterations: number; finalScore: number }> {
    const threshold = options.threshold ?? 8.0
    const maxIterations = options.maxIterations ?? 3

    let iteration = 0
    let bestOutput: T | null = null
    let bestScore = 0

    console.log(`\n🔄 [ReflectLoop] Custom reflection cycle`)
    console.log(`   Threshold: ${threshold}/10`)

    while (iteration < maxIterations) {
      iteration++

      const output = await generator(
        iteration > 1 ? [`Improve based on previous critique`] : undefined
      )

      const critique = await critiquer(output)

      if (critique.score > bestScore) {
        bestScore = critique.score
        bestOutput = output
      }

      console.log(
        `   Iteration ${iteration}: Score ${critique.score.toFixed(1)}/10`
      )

      if (critique.score >= threshold) {
        console.log(`   ✅ Threshold met!`)
        return {
          output: output,
          iterations: iteration,
          finalScore: critique.score,
        }
      }
    }

    console.log(
      `   ⚠️ Max iterations reached, best score: ${bestScore.toFixed(1)}/10`
    )

    return {
      output: bestOutput!,
      iterations: iteration,
      finalScore: bestScore,
    }
  }
}
