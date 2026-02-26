/**
 * AI Response Cache
 * Two-layer cache (in-memory + DB) for AI API responses
 * Reduces costs by avoiding duplicate LLM calls for identical prompts
 */

import crypto from 'crypto'
import { prisma } from '@/lib/db'

interface CacheEntry {
  response: string
  expiresAt: Date
}

// In-memory cache for performance (per-process, non-persistent)
const memCache = new Map<string, CacheEntry>()

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex').slice(0, 32)
}

/**
 * Lookup cached AI response (memory first, then DB)
 */
export async function getCachedAI(prompt: string, model: string): Promise<string | null> {
  const key = hashKey(`${model}:${prompt}`)

  // Check memory cache first
  const mem = memCache.get(key)
  if (mem && mem.expiresAt > new Date()) {
    console.log(`[AICache] Memory hit for key ${key.slice(0, 8)}...`)
    return mem.response
  }

  // Check DB cache
  try {
    const cached = await prisma.apiUsageLog.findFirst({
      where: {
        apiName: 'ai_cache',
        endpoint: key,
        createdAt: { gte: new Date(Date.now() - CACHE_TTL_MS) },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (cached?.metadata && typeof cached.metadata === 'object') {
      const response = (cached.metadata as Record<string, string>).response
      if (response) {
        // Warm up memory cache
        memCache.set(key, { response, expiresAt: new Date(Date.now() + CACHE_TTL_MS) })
        console.log(`[AICache] DB hit for key ${key.slice(0, 8)}...`)
        return response
      }
    }
  } catch {
    // Cache miss - non-fatal
  }

  return null
}

/**
 * Store AI response in cache (memory + DB)
 */
export async function setCachedAI(prompt: string, model: string, response: string): Promise<void> {
  const key = hashKey(`${model}:${prompt}`)
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS)

  memCache.set(key, { response, expiresAt })

  // Persist to DB (non-critical, fire-and-forget)
  try {
    await prisma.apiUsageLog.create({
      data: {
        provider: 'cache',
        apiName: 'ai_cache',
        endpoint: key,
        success: true,
        cost: 0,
        metadata: { response: response.slice(0, 10000) }, // max 10KB stored
      },
    })
  } catch {
    // Non-critical: DB cache persist failed, memory cache still works
  }
}

/**
 * Remove expired entries from the in-memory cache
 * Call periodically to prevent unbounded memory growth
 */
export function cleanExpiredMemCache(): void {
  const now = new Date()
  for (const [key, entry] of memCache.entries()) {
    if (entry.expiresAt <= now) memCache.delete(key)
  }
}
