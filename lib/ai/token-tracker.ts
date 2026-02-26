/**
 * AI Token Usage Tracker
 * Tracks AI API usage and token consumption per section
 */

import { prisma } from '@/lib/db'

export type AISection = 'lead_finder' | 'osint_profiling' | 'financial_planning' | 'other'
export type AIProvider = 'openrouter' | 'openai' | 'anthropic' | 'other'
export type AIStatus = 'success' | 'error' | 'timeout'

export interface TokenUsageParams {
  section: AISection | string
  operation: string
  provider?: AIProvider | string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  costPer1kPrompt?: number
  costPer1kCompletion?: number
  totalCost?: number
  searchId?: string
  clientId?: string
  profileId?: string
  requestParams?: Record<string, any>
  responseSummary?: Record<string, any>
  executionTimeMs?: number
  status?: AIStatus | string
  errorMessage?: string
  userId?: string
}

/**
 * Track AI token usage in database
 */
export async function trackTokenUsage(params: TokenUsageParams): Promise<void> {
  try {
    let totalCost = params.totalCost
    if (!totalCost && params.costPer1kPrompt && params.costPer1kCompletion) {
      const promptCost = (params.promptTokens / 1000) * params.costPer1kPrompt
      const completionCost = (params.completionTokens / 1000) * params.costPer1kCompletion
      totalCost = promptCost + completionCost
    }

    await prisma.aiTokenUsage.create({
      data: {
        section: params.section,
        operation: params.operation,
        provider: params.provider || 'openrouter',
        model: params.model,
        promptTokens: params.promptTokens,
        completionTokens: params.completionTokens,
        totalTokens: params.totalTokens,
        costPer1kPrompt: params.costPer1kPrompt,
        costPer1kCompletion: params.costPer1kCompletion,
        totalCost: totalCost,
        searchId: params.searchId,
        clientId: params.clientId,
        profileId: params.profileId,
        requestParams: params.requestParams as any,
        responseSummary: params.responseSummary as any,
        executionTimeMs: params.executionTimeMs,
        status: params.status || 'success',
        errorMessage: params.errorMessage,
        userId: params.userId,
      },
    })
  } catch (error) {
    console.error('[TokenTracker] Error saving token usage:', error)
  }
}

/**
 * XAI/OpenRouter cost rates per 1k tokens
 */
export const XAI_COSTS: Record<string, { prompt: number; completion: number }> = {
  'grok-beta': { prompt: 0.005, completion: 0.015 },
  'grok-2': { prompt: 0.005, completion: 0.015 },
  'grok-3': { prompt: 0.005, completion: 0.015 },
  'grok-4-fast-reasoning': { prompt: 0.005, completion: 0.015 },
}

/**
 * Calculate cost for XAI/OpenRouter usage
 */
export function calculateXAICost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const costs = XAI_COSTS[model] || XAI_COSTS['grok-beta']
  return (promptTokens / 1000) * costs.prompt + (completionTokens / 1000) * costs.completion
}

/**
 * Get token usage statistics
 */
export async function getTokenUsageStats(
  section?: string,
  startDate?: Date,
  endDate?: Date
) {
  try {
    const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const end = endDate || new Date()

    const where: any = {
      createdAt: { gte: start, lte: end },
      status: 'success',
    }
    if (section) where.section = section

    const data = await prisma.aiTokenUsage.findMany({ where })

    const stats = {
      totalRequests: data.length,
      totalPromptTokens: data.reduce((sum, item) => sum + (item.promptTokens || 0), 0),
      totalCompletionTokens: data.reduce((sum, item) => sum + (item.completionTokens || 0), 0),
      totalTokens: data.reduce((sum, item) => sum + (item.totalTokens || 0), 0),
      totalCost: data.reduce((sum, item) => sum + (item.totalCost || 0), 0),
      avgExecutionTimeMs: data.length > 0
        ? data.reduce((sum, item) => sum + (item.executionTimeMs || 0), 0) / data.length
        : 0,
      bySection: {} as Record<string, any>,
      byProvider: {} as Record<string, any>,
    }

    data.forEach((item) => {
      const sec = item.section
      if (!stats.bySection[sec]) stats.bySection[sec] = { requests: 0, tokens: 0, cost: 0 }
      stats.bySection[sec].requests++
      stats.bySection[sec].tokens += item.totalTokens || 0
      stats.bySection[sec].cost += item.totalCost || 0
    })

    data.forEach((item) => {
      const prov = item.provider
      if (!stats.byProvider[prov]) stats.byProvider[prov] = { requests: 0, tokens: 0, cost: 0 }
      stats.byProvider[prov].requests++
      stats.byProvider[prov].tokens += item.totalTokens || 0
      stats.byProvider[prov].cost += item.totalCost || 0
    })

    return stats
  } catch (error) {
    console.error('[TokenTracker] Exception fetching token usage stats:', error)
    return null
  }
}

/**
 * Get current month summary grouped by section
 */
export async function getCurrentMonthSummary() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const data = await prisma.aiTokenUsage.findMany({
      where: {
        createdAt: { gte: startOfMonth },
        status: 'success',
      },
    })

    // Group by section
    const sectionMap: Record<string, {
      section: string
      requests_count: number
      total_tokens: number
      total_cost: number
      avg_execution_time_ms: number
      last_request_at: string
      _totalExecTime: number
    }> = {}

    data.forEach((item) => {
      const sec = item.section || 'other'
      if (!sectionMap[sec]) {
        sectionMap[sec] = {
          section: sec,
          requests_count: 0,
          total_tokens: 0,
          total_cost: 0,
          avg_execution_time_ms: 0,
          last_request_at: item.createdAt.toISOString(),
          _totalExecTime: 0,
        }
      }
      sectionMap[sec].requests_count++
      sectionMap[sec].total_tokens += item.totalTokens || 0
      sectionMap[sec].total_cost += item.totalCost || 0
      sectionMap[sec]._totalExecTime += item.executionTimeMs || 0
      if (new Date(item.createdAt) > new Date(sectionMap[sec].last_request_at)) {
        sectionMap[sec].last_request_at = item.createdAt.toISOString()
      }
    })

    // Calculate averages and clean up
    return Object.values(sectionMap).map(({ _totalExecTime, ...rest }) => ({
      ...rest,
      avg_execution_time_ms: rest.requests_count > 0 ? _totalExecTime / rest.requests_count : 0,
    }))
  } catch (error) {
    console.error('[TokenTracker] Exception fetching current month summary:', error)
    return null
  }
}
