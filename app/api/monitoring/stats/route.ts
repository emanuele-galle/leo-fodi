/**
 * API Monitoring & Statistics Endpoint
 * Provides cache stats, cost tracking, and budget monitoring
 */

import { NextResponse } from 'next/server'
import { apiCache } from '@/lib/cache/api-cache'
import { costTracker } from '@/lib/monitoring/cost-tracker'
import { getServerUser } from '@/lib/auth/server'

export async function GET(request: Request) {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    // Get cache statistics
    const cacheStats = apiCache.getStats()
    const cacheSavings = apiCache.getCostSavings()

    // Get cost tracking
    const sessionStats = costTracker.getSessionStats()
    const todayCost = await costTracker.getTodayCost()
    const monthCost = await costTracker.getCurrentMonthCost()

    // Check budget limit (default $200/month)
    const monthlyLimit = 200
    const budgetStatus = await costTracker.checkBudgetLimit(monthlyLimit)

    const stats = {
      cache: {
        size: cacheStats.size,
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        hitRate: cacheStats.hitRate,
        totalRequests: cacheStats.hits + cacheStats.misses,
        savings: {
          requestsSaved: cacheSavings.requestsSaved,
          costSaved: cacheSavings.costSaved,
        },
        topEntries: cacheStats.entries,
      },
      costs: {
        session: sessionStats,
        today: {
          totalRequests: todayCost.total_requests,
          cachedRequests: todayCost.cached_requests,
          billableRequests: todayCost.billable_requests,
          totalCost: todayCost.total_cost,
          costSaved: todayCost.cost_saved_by_cache,
        },
        month: {
          totalRequests: monthCost.total_requests,
          cachedRequests: monthCost.cached_requests,
          billableRequests: monthCost.billable_requests,
          totalCost: monthCost.total_cost,
          costSaved: monthCost.cost_saved_by_cache,
        },
        budget: {
          limit: budgetStatus.limit,
          used: budgetStatus.currentCost,
          remaining: budgetStatus.limit - budgetStatus.currentCost,
          percentUsed: budgetStatus.percentUsed,
          exceeded: budgetStatus.exceeded,
        },
      },
      timestamp: new Date().toISOString(),
    }

    // Return specific section if requested
    if (type === 'cache') {
      return NextResponse.json({ cache: stats.cache })
    }
    if (type === 'costs') {
      return NextResponse.json({ costs: stats.costs })
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('[MonitoringAPI] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get monitoring stats' },
      { status: 500 }
    )
  }
}

/**
 * Clear cache endpoint (POST)
 */
export async function POST(request: Request) {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, prefix } = body

    if (action === 'clear_cache') {
      if (prefix) {
        const count = apiCache.invalidatePrefix(prefix)
        return NextResponse.json({
          success: true,
          message: `Cleared ${count} cache entries with prefix ${prefix}`,
        })
      } else {
        apiCache.clear()
        return NextResponse.json({
          success: true,
          message: 'Cleared all cache entries',
        })
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[MonitoringAPI] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
