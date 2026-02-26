/**
 * Rate Limiter with Redis sliding window and in-memory fallback
 * Tracks requests per IP/identifier
 */

import type Redis from 'ioredis'
import { getRedisClient } from '../redis'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const SLIDING_WINDOW_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
redis.call('zremrangebyscore', key, 0, now - window)
local count = redis.call('zcard', key)
if count < limit then
  redis.call('zadd', key, now, now .. math.random())
  redis.call('expire', key, math.ceil(window / 1000))
  return 1
end
return 0
`

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout
  private redis: Redis | null = null

  constructor() {
    this.redis = getRedisClient()

    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Check if request is allowed
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @param maxRequests - Maximum requests allowed in window
   * @param windowMs - Time window in milliseconds
   * @returns { allowed: boolean, remaining: number, resetAt: number }
   */
  async check(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    // Try Redis sliding window first
    if (this.redis) {
      try {
        const now = Date.now()
        const key = `ratelimit:${identifier}`
        const result = await this.redis.eval(
          SLIDING_WINDOW_SCRIPT,
          1,
          key,
          now,
          windowMs,
          maxRequests
        ) as number

        const allowed = result === 1

        // Get current count for remaining calculation
        const count = await this.redis.zcard(key)

        return {
          allowed,
          remaining: Math.max(0, maxRequests - count),
          resetAt: now + windowMs,
        }
      } catch (err: any) {
        console.error('[RateLimiter] Redis error, falling back to in-memory:', err.message)
        // Fallback to in-memory below
      }
    }

    // In-memory fallback
    return this.checkInMemory(identifier, maxRequests, windowMs)
  }

  /**
   * In-memory rate limit check (original logic)
   */
  private checkInMemory(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now()
    const entry = this.store.get(identifier)

    // No entry or expired entry
    if (!entry || entry.resetAt < now) {
      const resetAt = now + windowMs
      this.store.set(identifier, {
        count: 1,
        resetAt,
      })

      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetAt,
      }
    }

    // Increment count
    entry.count++
    this.store.set(identifier, entry)

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
      }
    }

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetAt: entry.resetAt,
    }
  }

  /**
   * Reset rate limit for an identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier)

    if (this.redis) {
      this.redis.del(`ratelimit:${identifier}`).catch((err) => {
        console.error('[RateLimiter] Redis reset error:', err.message)
      })
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < now) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Stop cleanup interval (for testing/shutdown)
   */
  destroy(): void {
    clearInterval(this.cleanupInterval)
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter()

// Rate limit configurations
export const RATE_LIMITS = {
  // OSINT Profiling: 5 requests per hour per IP
  OSINT_PROFILING: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // Job status polling: 100 requests per minute per IP
  JOB_STATUS: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  // Profile listing: 20 requests per minute per IP
  PROFILE_LIST: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  },
}

/**
 * Get client identifier from request
 * Uses IP address or forwarded headers
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  // Fallback to connection info (if available)
  return 'unknown'
}
