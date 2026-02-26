/**
 * AI Client - OpenRouter (multi-model)
 * Compatible with OpenAI chat/completions format
 */

import { getCachedAI, setCachedAI } from '@/lib/cache/ai-cache'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1'
const DEFAULT_MODEL = process.env.AI_MODEL || 'anthropic/claude-sonnet-4'

const MAX_RETRIES = 3
const BASE_DELAY = 1000
const MAX_DELAY = 10000

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class AIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message)
    this.name = 'AIError'
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getRetryDelay(attempt: number): number {
  const delay = Math.min(BASE_DELAY * Math.pow(2, attempt), MAX_DELAY)
  const jitter = delay * 0.25 * Math.random()
  return Math.floor(delay + jitter)
}

export async function callAI(
  messages: AIMessage[],
  options: {
    temperature?: number
    maxTokens?: number
    responseFormat?: 'json_object' | 'text'
    model?: string
  } = {}
): Promise<AIResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey || apiKey.trim() === '' || apiKey === 'PLACEHOLDER_OPENROUTER_KEY') {
    throw new AIError('OPENROUTER_API_KEY is missing or invalid')
  }

  const model = options.model || DEFAULT_MODEL

  // Cache lookup (skip for non-deterministic calls with temperature > 0.1)
  const cacheKey = JSON.stringify(messages)
  if ((options.temperature ?? 0.7) <= 0.1) {
    try {
      const cached = await getCachedAI(cacheKey, model)
      if (cached) {
        console.log(`[AI] Cache hit for model: ${model}`)
        return {
          id: 'cached',
          object: 'chat.completion',
          created: Date.now(),
          model,
          choices: [{ index: 0, message: { role: 'assistant', content: cached }, finish_reason: 'stop' }],
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        }
      }
    } catch {
      // Cache lookup failed - proceed with API call
    }
  }

  const requestBody: Record<string, unknown> = {
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
  }

  if (options.responseFormat === 'json_object') {
    requestBody.response_format = { type: 'json_object' }
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`[AI] Attempt ${attempt + 1}/${MAX_RETRIES} - Model: ${model}`)

      const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://leo-fodi.fodivps2.cloud',
          'X-Title': 'LEO-FODI',
        },
        body: JSON.stringify(requestBody),
      })

      if (response.status === 429) {
        console.warn(`[AI] Rate limit hit (attempt ${attempt + 1})`)
        if (attempt < MAX_RETRIES - 1) {
          const delay = getRetryDelay(attempt)
          console.log(`[AI] Retrying in ${delay}ms...`)
          await sleep(delay)
          continue
        }
        throw new AIError('Rate limit exceeded. Please try again later.', 429)
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage =
          errorData.error?.message ||
          errorData.message ||
          `AI API error: ${response.status} ${response.statusText}`
        throw new AIError(errorMessage, response.status, errorData)
      }

      const data: AIResponse = await response.json()
      console.log(`[AI] Success - Tokens used: ${data.usage?.total_tokens || 'N/A'}`)

      // Store successful response in cache (only for low-temperature / deterministic calls)
      if ((options.temperature ?? 0.7) <= 0.1) {
        const responseContent = data.choices?.[0]?.message?.content
        if (responseContent) {
          setCachedAI(cacheKey, model, responseContent).catch(() => {
            // Non-critical: cache store failure should not break the response
          })
        }
      }

      return data
    } catch (error) {
      lastError = error as Error
      if (
        error instanceof AIError &&
        error.statusCode &&
        error.statusCode !== 429 &&
        error.statusCode < 500
      ) {
        throw error
      }
      if (attempt < MAX_RETRIES - 1) {
        const delay = getRetryDelay(attempt)
        console.warn(`[AI] Error: ${error instanceof Error ? error.message : 'Unknown'}`)
        console.log(`[AI] Retrying in ${delay}ms...`)
        await sleep(delay)
        continue
      }
    }
  }

  throw new AIError(
    `AI API call failed after ${MAX_RETRIES} attempts: ${lastError?.message || 'Unknown error'}`,
    undefined,
    lastError
  )
}

export function extractContent(response: AIResponse): string {
  if (!response.choices || response.choices.length === 0) {
    throw new AIError('No choices in AI response')
  }
  const content = response.choices[0].message.content
  if (!content || content.trim() === '') {
    throw new AIError('Empty content in AI response')
  }
  return content.trim()
}

export function parseJSONResponse<T>(response: AIResponse): T {
  const content = extractContent(response)

  try {
    return JSON.parse(content) as T
  } catch (error) {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]) as T
      } catch {
        // Fall through
      }
    }

    const firstBrace = content.indexOf('{')
    const lastBrace = content.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(content.substring(firstBrace, lastBrace + 1)) as T
      } catch {
        // Fall through
      }
    }

    throw new AIError(
      `Failed to parse JSON response: ${error instanceof Error ? error.message : 'Invalid JSON'}`,
      undefined,
      { content }
    )
  }
}

export function createMessages(
  systemPrompt: string,
  userPrompt: string
): AIMessage[] {
  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]
}
