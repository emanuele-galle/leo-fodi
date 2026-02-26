/**
 * Cache Service with Redis support and in-memory fallback
 *
 * Provides caching for API responses to reduce costs and improve performance
 * TTL-based expiration with automatic cleanup
 */

import type Redis from 'ioredis'
import { getRedisClient } from '../redis'

export enum CacheTTL {
  SHORT = 5 * 60,        // 5 minutes
  MEDIUM = 30 * 60,      // 30 minutes
  LONG = 2 * 60 * 60,    // 2 hours
  DAY = 24 * 60 * 60,    // 24 hours
  WEEK = 7 * 24 * 60 * 60 // 7 days
}

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

export class CacheService {
  private static instance: CacheService
  private cache: Map<string, CacheEntry<any>>
  private cleanupInterval: NodeJS.Timeout | null = null
  private redis: Redis | null = null

  private constructor() {
    this.cache = new Map()
    this.redis = getRedisClient()
    this.startCleanup()
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  /**
   * Set a value in cache with TTL (in seconds)
   */
  set<T>(key: string, value: T, ttl: number = CacheTTL.LONG): void {
    const expiresAt = Date.now() + (ttl * 1000)
    this.cache.set(key, { value, expiresAt })

    if (this.redis) {
      try {
        const serialized = JSON.stringify(value)
        this.redis.set(key, serialized, 'EX', ttl).catch((err) => {
          console.error('[Cache] Redis set error:', err.message)
        })
      } catch (err: any) {
        console.error('[Cache] Redis serialization error:', err.message)
      }
    }
  }

  /**
   * Get a value from cache (returns null if expired or not found)
   */
  async get<T>(key: string): Promise<T | null> {
    if (this.redis) {
      try {
        const data = await this.redis.get(key)
        if (data !== null) {
          return JSON.parse(data) as T
        }
        return null
      } catch (err: any) {
        console.error('[Cache] Redis get error:', err.message)
        // Fallback to in-memory
      }
    }

    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.value as T
  }

  /**
   * Check if a key exists and is not expired
   */
  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== null
  }

  /**
   * Delete a specific key
   */
  delete(key: string): void {
    this.cache.delete(key)

    if (this.redis) {
      this.redis.del(key).catch((err) => {
        console.error('[Cache] Redis del error:', err.message)
      })
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()

    if (this.redis) {
      this.redis.flushdb().catch((err) => {
        console.error('[Cache] Redis flushdb error:', err.message)
      })
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    totalKeys: number
    validKeys: number
    expiredKeys: number
    size: number
  } {
    let validKeys = 0
    let expiredKeys = 0
    const now = Date.now()

    this.cache.forEach((entry) => {
      if (now > entry.expiresAt) {
        expiredKeys++
      } else {
        validKeys++
      }
    })

    return {
      totalKeys: this.cache.size,
      validKeys,
      expiredKeys,
      size: this.cache.size
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        expiredKeys.push(key)
      }
    })

    expiredKeys.forEach(key => this.cache.delete(key))

    if (expiredKeys.length > 0) {
      console.log(`[Cache] Cleaned up ${expiredKeys.length} expired entries`)
    }
  }

  /**
   * Start automatic cleanup (runs every 5 minutes)
   */
  private startCleanup(): void {
    if (this.cleanupInterval) {
      return
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000) // 5 minutes
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  /**
   * Generate cache key from multiple parameters
   */
  static generateKey(...parts: (string | number | boolean | undefined | null)[]): string {
    return parts
      .filter(part => part !== undefined && part !== null)
      .map(part => String(part).toLowerCase().trim())
      .join(':')
  }
}

// Export singleton instance
export const cache = CacheService.getInstance()
