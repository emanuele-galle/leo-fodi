/**
 * API Cost Tracking System
 * Tracks API usage and costs for monitoring budget
 */

import { prisma } from '@/lib/db'

export interface ApiUsageLog {
  id?: string
  api_name: string // 'google_places', 'google_maps', etc.
  operation: string // 'text_search', 'place_details', etc.
  requests_count: number
  cost_per_request: number
  total_cost: number
  cached: boolean
  search_id?: string
  params?: Record<string, any>
  created_at?: string
}

export interface ApiCostSummary {
  api_name: string
  total_requests: number
  cached_requests: number
  billable_requests: number
  total_cost: number
  cost_saved_by_cache: number
}

class CostTracker {
  // Cost per request for different APIs (in USD)
  private costs = {
    google_places_text_search: 0.017, // $17 per 1000
    google_places_place_details: 0.017, // $17 per 1000
    google_maps_geocoding: 0.005, // $5 per 1000
  }

  // In-memory tracking for current session
  private sessionStats = {
    requests: 0,
    cost: 0,
    cached: 0,
    costSaved: 0,
  }

  /**
   * Track a single API request
   */
  async trackRequest(log: Omit<ApiUsageLog, 'id' | 'created_at'>): Promise<void> {
    try {
      // Update session stats
      this.sessionStats.requests++
      if (log.cached) {
        this.sessionStats.cached++
        this.sessionStats.costSaved += log.total_cost
      } else {
        this.sessionStats.cost += log.total_cost
      }

      // Save to database
      await prisma.apiUsageLog.create({
        data: {
          provider: log.api_name,
          endpoint: log.operation || 'search',
          cost: log.total_cost,
          tokensUsed: log.requests_count,
          success: true,
          metadata: {
            operation: log.operation,
            requests_count: log.requests_count,
            cost_per_request: log.cost_per_request,
            cached: log.cached,
            search_id: log.search_id,
            params: log.params,
          },
        },
      })

      console.log(
        `[CostTracker] ${log.api_name} - ${log.operation}: $${log.total_cost.toFixed(4)} ${log.cached ? '(CACHED)' : ''}`
      )
    } catch (error) {
      console.error('[CostTracker] Failed to track request:', error)
    }
  }

  /**
   * Track Google Places text search
   */
  async trackGooglePlacesSearch(
    resultsCount: number,
    cached: boolean,
    searchId?: string,
    params?: Record<string, any>
  ): Promise<void> {
    const costPerRequest = this.costs.google_places_text_search
    const totalCost = cached ? 0 : costPerRequest

    await this.trackRequest({
      api_name: 'google_places',
      operation: 'text_search',
      requests_count: 1,
      cost_per_request: costPerRequest,
      total_cost: totalCost,
      cached,
      search_id: searchId,
      params: { ...params, results_count: resultsCount },
    })
  }

  /**
   * Track Google Places details request
   */
  async trackGooglePlacesDetails(
    cached: boolean,
    searchId?: string,
    placeId?: string
  ): Promise<void> {
    const costPerRequest = this.costs.google_places_place_details
    const totalCost = cached ? 0 : costPerRequest

    await this.trackRequest({
      api_name: 'google_places',
      operation: 'place_details',
      requests_count: 1,
      cost_per_request: costPerRequest,
      total_cost: totalCost,
      cached,
      search_id: searchId,
      params: { place_id: placeId },
    })
  }

  /**
   * Get cost summary for a specific time period
   */
  async getCostSummary(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    total: ApiCostSummary
    byApi: ApiCostSummary[]
  }> {
    try {
      const where: any = {}
      if (startDate) where.createdAt = { ...where.createdAt, gte: startDate }
      if (endDate) where.createdAt = { ...where.createdAt, lte: endDate }

      const logs = await prisma.apiUsageLog.findMany({ where })

      if (!logs || logs.length === 0) {
        return { total: this.getEmptySummary(), byApi: [] }
      }

      // Aggregate by API
      const byApiMap = new Map<string, ApiCostSummary>()

      for (const log of logs) {
        const apiName = log.provider
        const metadata = log.metadata as any || {}
        const requestsCount = metadata.requests_count || log.tokensUsed || 1
        const cached = metadata.cached || false
        const costPerRequest = metadata.cost_per_request || log.cost

        if (!byApiMap.has(apiName)) {
          byApiMap.set(apiName, {
            api_name: apiName,
            total_requests: 0,
            cached_requests: 0,
            billable_requests: 0,
            total_cost: 0,
            cost_saved_by_cache: 0,
          })
        }

        const summary = byApiMap.get(apiName)!
        summary.total_requests += requestsCount

        if (cached) {
          summary.cached_requests += requestsCount
          summary.cost_saved_by_cache += costPerRequest * requestsCount
        } else {
          summary.billable_requests += requestsCount
          summary.total_cost += log.cost
        }
      }

      // Calculate totals
      const byApi = Array.from(byApiMap.values())
      const total: ApiCostSummary = {
        api_name: 'all',
        total_requests: byApi.reduce((sum, api) => sum + api.total_requests, 0),
        cached_requests: byApi.reduce((sum, api) => sum + api.cached_requests, 0),
        billable_requests: byApi.reduce((sum, api) => sum + api.billable_requests, 0),
        total_cost: byApi.reduce((sum, api) => sum + api.total_cost, 0),
        cost_saved_by_cache: byApi.reduce((sum, api) => sum + api.cost_saved_by_cache, 0),
      }

      return { total, byApi }
    } catch (error) {
      console.error('[CostTracker] Failed to get cost summary:', error)
      return { total: this.getEmptySummary(), byApi: [] }
    }
  }

  /**
   * Get session stats (since server started)
   */
  getSessionStats(): {
    requests: number
    cost: number
    cached: number
    costSaved: number
    cacheHitRate: number
  } {
    const cacheHitRate =
      this.sessionStats.requests > 0
        ? (this.sessionStats.cached / this.sessionStats.requests) * 100
        : 0

    return {
      ...this.sessionStats,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
    }
  }

  /**
   * Get cost for current month
   */
  async getCurrentMonthCost(): Promise<ApiCostSummary> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const { total } = await this.getCostSummary(startOfMonth)
    return total
  }

  /**
   * Get cost for today
   */
  async getTodayCost(): Promise<ApiCostSummary> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { total } = await this.getCostSummary(today)
    return total
  }

  /**
   * Check if budget limit is exceeded
   */
  async checkBudgetLimit(monthlyLimit: number): Promise<{
    exceeded: boolean
    currentCost: number
    limit: number
    percentUsed: number
  }> {
    const monthlyCost = await this.getCurrentMonthCost()
    const percentUsed = (monthlyCost.total_cost / monthlyLimit) * 100

    return {
      exceeded: monthlyCost.total_cost >= monthlyLimit,
      currentCost: monthlyCost.total_cost,
      limit: monthlyLimit,
      percentUsed: Math.round(percentUsed * 100) / 100,
    }
  }

  /**
   * Get empty summary structure
   */
  private getEmptySummary(): ApiCostSummary {
    return {
      api_name: 'all',
      total_requests: 0,
      cached_requests: 0,
      billable_requests: 0,
      total_cost: 0,
      cost_saved_by_cache: 0,
    }
  }

  /**
   * Reset session stats (e.g., when server restarts)
   */
  resetSessionStats(): void {
    this.sessionStats = {
      requests: 0,
      cost: 0,
      cached: 0,
      costSaved: 0,
    }
    console.log('[CostTracker] Session stats reset')
  }
}

// Singleton instance
export const costTracker = new CostTracker()
