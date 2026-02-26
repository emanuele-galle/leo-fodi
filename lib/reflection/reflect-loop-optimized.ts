/**
 * Optimized Reflect Loop
 * Versione ottimizzata con early exit e caching
 */

import { CritiqueAgent } from './critique-agent'
import type {
  ReflectionState,
  CritiqueRubric,
  CritiqueResult,
  GeneratorFunction,
} from './types'

export class ReflectLoopOptimized {
  private critiqueAgent = new CritiqueAgent()
  private cache = new Map<string, { output: any; score: number }>()

  /**
   * Esegue ciclo di riflessione ottimizzato con caching ed early exit
   */
  async run<T>(
    generator: GeneratorFunction<T>,
    rubric: CritiqueRubric,
    options: {
      maxIterations?: number
      targetName?: string
      onIteration?: (state: ReflectionState<T>) => void
      earlyExitScore?: number // Default 9.0 - se raggiungi questo score, esci subito
      enableCaching?: boolean // Default true
    } = {}
  ): Promise<{ output: T; state: ReflectionState<T> }> {
    const maxIterations = options.maxIterations ?? 3
    const earlyExitScore = options.earlyExitScore ?? 9.0
    const enableCaching = options.enableCaching !== false

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
      `\n🚀 [ReflectLoopOptimized] Starting for: ${rubric.name}`
    )
    console.log(`   Max iterations: ${maxIterations}`)
    console.log(`   Threshold: ${rubric.threshold}/10`)
    console.log(`   Early exit: ${earlyExitScore}/10`)
    console.log(`   Caching: ${enableCaching ? 'enabled' : 'disabled'}`)

    while (state.iteration < maxIterations) {
      state.iteration++

      console.log(`\n--- Iteration ${state.iteration}/${maxIterations} ---`)

      try {
        // ========== GENERAZIONE ==========
        const feedback =
          state.critiques.length > 0
            ? state.critiques[state.critiques.length - 1].suggestions
            : undefined

        const output = await generator(feedback)
        state.current_output = output

        // ========== CHECK CACHE (se stesso output di iterazione precedente) ==========
        if (enableCaching) {
          const outputHash = JSON.stringify(output).substring(0, 100)
          const cached = this.cache.get(outputHash)

          if (cached && cached.score === state.best_score) {
            console.log(`   💾 Cache hit - output identico, skipping critique`)

            // Usa score cached
            if (cached.score >= rubric.threshold) {
              state.completed = true
              state.final_score = cached.score
              console.log(`   ✅ Cached score ${cached.score.toFixed(1)}/10 meets threshold`)
              return { output: cached.output, state }
            }

            // Se non passa threshold ma è identico, esci per evitare loop
            console.log(`   ⚠️ Output identico ma sotto threshold, exiting to avoid loop`)
            break
          }
        }

        // ========== CRITICA ==========
        console.log(`[ReflectLoopOptimized] Evaluating output...`)

        const critique = await this.critiqueAgent.critique(output, rubric, {
          target_name: options.targetName,
          previous_critiques: state.critiques,
        })

        state.critiques.push(critique)

        // Aggiorna cache
        if (enableCaching) {
          const outputHash = JSON.stringify(output).substring(0, 100)
          this.cache.set(outputHash, { output, score: critique.score })
        }

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

        // ========== EARLY EXIT (score molto alto) ==========
        if (critique.score >= earlyExitScore) {
          state.completed = true
          state.final_score = critique.score

          console.log(
            `\n🎉 [ReflectLoopOptimized] EARLY EXIT! Excellent score (${critique.score.toFixed(1)}/10)`
          )
          console.log(
            `   Completed in ${state.iteration} iteration(s)`
          )

          return {
            output: output,
            state,
          }
        }

        // ========== CHECK THRESHOLD ==========
        if (critique.passed) {
          state.completed = true
          state.final_score = critique.score

          console.log(
            `\n✅ [ReflectLoopOptimized] Quality threshold met! (${critique.score.toFixed(1)}/10)`
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
          critique.suggestions.slice(0, 3).forEach((s, i) => {
            console.log(`     ${i + 1}. ${s}`)
          })
        }

        // ========== PERFORMANCE OPTIMIZATION: Se miglioramento < 5%, rischia di loopare ==========
        if (state.critiques.length >= 2) {
          const previousScore = state.critiques[state.critiques.length - 2].score
          const improvement = critique.score - previousScore

          if (improvement < 0.5) {
            console.log(
              `   ⚡ Low improvement (+${improvement.toFixed(2)}), exiting to avoid diminishing returns`
            )
            break
          }
        }

      } catch (error) {
        console.error(
          `[ReflectLoopOptimized] Error in iteration ${state.iteration}:`,
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
      `\n⚠️ [ReflectLoopOptimized] Max iterations reached (${maxIterations})`
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
   * Cancella cache
   */
  clearCache() {
    this.cache.clear()
    console.log('[ReflectLoopOptimized] Cache cleared')
  }

  /**
   * Ottieni stats cache
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      hits: 0, // TODO: track hits
    }
  }
}
