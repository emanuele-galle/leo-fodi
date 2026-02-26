/**
 * API Cost Tracker
 *
 * Monitors API usage and costs across all external services
 * Provides alerts when approaching budget limits
 *
 * Uses Prisma for database operations
 */

import { prisma } from '@/lib/db'

export interface ApiUsageLog {
  provider: string
  endpoint: string
  cost: number
  tokensUsed?: number
  success: boolean
  errorMessage?: string
  metadata?: Record<string, any>
}

export interface DailyCosts {
  date: string
  totalCost: number
  providers: Record<string, number>
}

export interface ProviderCosts {
  provider: string
  totalCost: number
  requestCount: number
  averageCost: number
}

export class ApiCostTracker {
  private static instance: ApiCostTracker
  private monthlyBudget: number

  private constructor() {
    this.monthlyBudget = Number(process.env.MONTHLY_API_BUDGET) || 200
  }

  static getInstance(): ApiCostTracker {
    if (!ApiCostTracker.instance) {
      ApiCostTracker.instance = new ApiCostTracker()
    }
    return ApiCostTracker.instance
  }

  /**
   * Track an API usage event
   */
  async trackUsage(log: ApiUsageLog): Promise<void> {
    try {
      await prisma.apiUsageLog.create({
        data: {
          provider: log.provider,
          endpoint: log.endpoint,
          cost: log.cost,
          tokensUsed: log.tokensUsed || null,
          success: log.success,
          errorMessage: log.errorMessage || null,
          metadata: log.metadata || null,
        },
      })

      // Check budget alert
      await this.checkBudgetAlert()
    } catch (error) {
      console.error('[API Cost Tracker] Error tracking usage:', error)
    }
  }

  /**
   * Get monthly total costs
   */
  async getMonthlyTotal(): Promise<number> {
    try {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const result = await prisma.apiUsageLog.aggregate({
        _sum: { cost: true },
        where: {
          createdAt: { gte: startOfMonth },
        },
      })

      return result._sum.cost || 0
    } catch (error) {
      console.error('[API Cost Tracker] Error getting monthly total:', error)
      return 0
    }
  }

  /**
   * Get daily costs breakdown
   */
  async getDailyCosts(days: number = 30): Promise<DailyCosts[]> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      startDate.setHours(0, 0, 0, 0)

      const logs = await prisma.apiUsageLog.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          provider: true,
          cost: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      })

      // Group by date
      const costsByDate: Record<string, { total: number; providers: Record<string, number> }> = {}

      logs.forEach((log) => {
        const date = log.createdAt.toISOString().split('T')[0]

        if (!costsByDate[date]) {
          costsByDate[date] = { total: 0, providers: {} }
        }

        costsByDate[date].total += log.cost || 0

        if (!costsByDate[date].providers[log.provider]) {
          costsByDate[date].providers[log.provider] = 0
        }
        costsByDate[date].providers[log.provider] += log.cost || 0
      })

      return Object.entries(costsByDate).map(([date, data]) => ({
        date,
        totalCost: data.total,
        providers: data.providers
      }))
    } catch (error) {
      console.error('[API Cost Tracker] Error getting daily costs:', error)
      return []
    }
  }

  /**
   * Get costs breakdown by provider
   */
  async getProviderCosts(startDate?: Date, endDate?: Date): Promise<ProviderCosts[]> {
    try {
      const where: any = {}
      if (startDate) where.createdAt = { ...where.createdAt, gte: startDate }
      if (endDate) where.createdAt = { ...where.createdAt, lte: endDate }

      const logs = await prisma.apiUsageLog.findMany({
        where,
        select: {
          provider: true,
          cost: true,
        },
      })

      // Group by provider
      const providerData: Record<string, { total: number; count: number }> = {}

      logs.forEach((log) => {
        if (!providerData[log.provider]) {
          providerData[log.provider] = { total: 0, count: 0 }
        }
        providerData[log.provider].total += log.cost || 0
        providerData[log.provider].count += 1
      })

      return Object.entries(providerData).map(([provider, data]) => ({
        provider,
        totalCost: data.total,
        requestCount: data.count,
        averageCost: data.count > 0 ? data.total / data.count : 0
      }))
    } catch (error) {
      console.error('[API Cost Tracker] Error getting provider costs:', error)
      return []
    }
  }

  /**
   * Check if monthly spending is approaching budget limit
   */
  async checkBudgetAlert(): Promise<{
    isApproaching: boolean
    isExceeded: boolean
    percentage: number
    current: number
    budget: number
  }> {
    const currentSpending = await this.getMonthlyTotal()
    const percentage = (currentSpending / this.monthlyBudget) * 100

    const alert = {
      isApproaching: percentage >= 80,
      isExceeded: percentage >= 100,
      percentage,
      current: currentSpending,
      budget: this.monthlyBudget
    }

    if (alert.isExceeded) {
      console.warn(`[API Cost Tracker] Budget EXCEEDED: $${currentSpending.toFixed(2)} / $${this.monthlyBudget}`)
    } else if (alert.isApproaching) {
      console.warn(`[API Cost Tracker] Budget at ${percentage.toFixed(1)}%: $${currentSpending.toFixed(2)} / $${this.monthlyBudget}`)
    }

    return alert
  }

  /**
   * Get budget status
   */
  async getBudgetStatus(): Promise<{
    current: number
    budget: number
    remaining: number
    percentage: number
  }> {
    const current = await this.getMonthlyTotal()
    const remaining = Math.max(0, this.monthlyBudget - current)
    const percentage = (current / this.monthlyBudget) * 100

    return {
      current,
      budget: this.monthlyBudget,
      remaining,
      percentage
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(days: number = 30): Promise<{
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    totalCost: number
    averageCost: number
    topProviders: ProviderCosts[]
  }> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const logs = await prisma.apiUsageLog.findMany({
        where: {
          createdAt: { gte: startDate },
        },
      })

      const totalRequests = logs.length
      const successfulRequests = logs.filter(log => log.success).length
      const failedRequests = totalRequests - successfulRequests
      const totalCost = logs.reduce((sum, log) => sum + (log.cost || 0), 0)
      const averageCost = totalRequests > 0 ? totalCost / totalRequests : 0

      const topProviders = await this.getProviderCosts(startDate)

      return {
        totalRequests,
        successfulRequests,
        failedRequests,
        totalCost,
        averageCost,
        topProviders: topProviders.sort((a, b) => b.totalCost - a.totalCost).slice(0, 5)
      }
    } catch (error) {
      console.error('[API Cost Tracker] Error getting usage stats:', error)
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalCost: 0,
        averageCost: 0,
        topProviders: []
      }
    }
  }
}

// Export singleton instance
export const apiCostTracker = ApiCostTracker.getInstance()
