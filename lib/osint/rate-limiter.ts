/**
 * Simple In-Memory Rate Limiter
 * Tracks requests per IP/identifier
 * Note: For production, use Redis-based solution for distributed systems
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
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
  check(
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
