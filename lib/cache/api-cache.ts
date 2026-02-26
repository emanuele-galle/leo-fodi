/**
 * API Cache System
 * In-memory cache with TTL for API responses
 * Reduces costs by caching expensive API calls
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
  hits: number // Track cache hits for analytics
}

class ApiCache {
  private cache: Map<string, CacheEntry<any>>
  private stats: {
    hits: number
    misses: number
    saves: number
    evictions: number
  }

  constructor() {
    this.cache = new Map()
    this.stats = {
      hits: 0,
      misses: 0,
      saves: 0,
      evictions: 0,
    }

    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  /**
   * Generate cache key from query parameters
   */
  private generateKey(prefix: string, params: Record<string, any>): string {
    const sorted = Object.keys(params)
      .sort()
      .map((key) => `${key}:${JSON.stringify(params[key])}`)
      .join('|')
    return `${prefix}:${sorted}`
  }

  /**
   * Get cached data if exists and not expired
   */
  get<T>(prefix: string, params: Record<string, any>): T | null {
    const key = this.generateKey(prefix, params)
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      return null
    }

    const now = Date.now()
    const age = now - entry.timestamp

    // Check if expired
    if (age > entry.ttl) {
      this.cache.delete(key)
      this.stats.evictions++
      this.stats.misses++
      return null
    }

    // Update hit counter
    entry.hits++
    this.stats.hits++

    console.log(`[Cache] HIT for ${prefix} (age: ${Math.round(age / 1000)}s, hits: ${entry.hits})`)
    return entry.data as T
  }

  /**
   * Set cached data with TTL
   */
  set<T>(prefix: string, params: Record<string, any>, data: T, ttl: number): void {
    const key = this.generateKey(prefix, params)

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
    })

    this.stats.saves++
    console.log(`[Cache] SAVE for ${prefix} (TTL: ${Math.round(ttl / 1000)}s, size: ${this.cache.size})`)
  }

  /**
   * Check if data exists in cache and is not expired
   */
  has(prefix: string, params: Record<string, any>): boolean {
    const key = this.generateKey(prefix, params)
    const entry = this.cache.get(key)

    if (!entry) return false

    const age = Date.now() - entry.timestamp
    return age <= entry.ttl
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(prefix: string, params: Record<string, any>): void {
    const key = this.generateKey(prefix, params)
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.evictions++
      console.log(`[Cache] INVALIDATED ${prefix}`)
    }
  }

  /**
   * Invalidate all cache entries with specific prefix
   */
  invalidatePrefix(prefix: string): number {
    let count = 0
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix + ':')) {
        this.cache.delete(key)
        count++
      }
    }
    this.stats.evictions += count
    console.log(`[Cache] INVALIDATED ${count} entries with prefix ${prefix}`)
    return count
  }

  /**
   * Clear all cache
   */
  clear(): void {
    const size = this.cache.size
    this.cache.clear()
    this.stats.evictions += size
    console.log(`[Cache] CLEARED all ${size} entries`)
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp
      if (age > entry.ttl) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      this.stats.evictions += cleaned
      console.log(`[Cache] CLEANUP removed ${cleaned} expired entries`)
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    hits: number
    misses: number
    saves: number
    evictions: number
    hitRate: number
    entries: Array<{
      key: string
      age: number
      hits: number
      ttl: number
    }>
  } {
    const now = Date.now()
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      hits: entry.hits,
      ttl: entry.ttl,
    }))

    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0

    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      saves: this.stats.saves,
      evictions: this.stats.evictions,
      hitRate: Math.round(hitRate * 100) / 100,
      entries: entries.sort((a, b) => b.hits - a.hits).slice(0, 10), // Top 10
    }
  }

  /**
   * Calculate estimated cost savings
   */
  getCostSavings(costPerRequest: number = 0.017): {
    requestsSaved: number
    costSaved: number
    totalRequests: number
  } {
    const totalRequests = this.stats.hits + this.stats.misses
    const costSaved = this.stats.hits * costPerRequest

    return {
      requestsSaved: this.stats.hits,
      costSaved: Math.round(costSaved * 100) / 100,
      totalRequests,
    }
  }
}

// Singleton instance
export const apiCache = new ApiCache()

// Cache TTL presets (in milliseconds)
export const CacheTTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes - for frequently changing data
  MEDIUM: 30 * 60 * 1000, // 30 minutes - for semi-static data
  LONG: 2 * 60 * 60 * 1000, // 2 hours - for mostly static data
  DAY: 24 * 60 * 60 * 1000, // 24 hours - for rarely changing data
  WEEK: 7 * 24 * 60 * 60 * 1000, // 7 days - for very stable data
} as const
