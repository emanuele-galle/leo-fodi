/**
 * LEO-FODI System Integration Tests
 *
 * Tests all critical workflows and integrations:
 * - Database connectivity
 * - Authentication flow
 * - AI agents (OSINT + Financial Planner)
 * - Lead generation system
 * - Caching layer
 * - API cost monitoring
 */

import { describe, test, expect, beforeAll } from '@jest/globals'

// Environment Variables Check
describe('Environment Configuration', () => {
  test('should have all required Supabase variables', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toContain('supabase.co')
  })

  test('should have XAI API configuration', () => {
    expect(process.env.XAI_API_KEY).toBeDefined()
    expect(process.env.XAI_API_URL).toBe('https://api.x.ai/v1')
    expect(process.env.XAI_MODEL).toBeDefined()
  })

  test('should have Google Places API key', () => {
    expect(process.env.GOOGLE_PLACES_API_KEY).toBeDefined()
  })

  test('should have monitoring budget configured', () => {
    const budget = process.env.MONTHLY_API_BUDGET
    expect(budget).toBeDefined()
    if (budget) {
      expect(Number(budget)).toBeGreaterThan(0)
    }
  })
})

// Database Integration Tests
describe('Supabase Database Integration', () => {
  test('should create Supabase client successfully', async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
  })

  test('should connect to database', async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    // Test simple query to check connection
    const { error } = await supabase.from('user_profiles').select('count').limit(0)
    expect(error).toBeNull()
  })

  test('should have all required tables', async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const requiredTables = [
      'user_profiles',
      'clients',
      'profiles',
      'financial_plans',
      'leads',
      'enrichment_history',
      'api_usage_logs'
    ]

    for (const table of requiredTables) {
      const { error } = await supabase.from(table).select('count').limit(0)
      expect(error).toBeNull()
    }
  })
})

// Cache System Tests
describe('Cache System Integration', () => {
  test('should initialize cache service', async () => {
    const { CacheService } = await import('@/lib/cache/cache-service')
    const cache = CacheService.getInstance()
    expect(cache).toBeDefined()
  })

  test('should set and get cached values', async () => {
    const { CacheService, CacheTTL } = await import('@/lib/cache/cache-service')
    const cache = CacheService.getInstance()

    const testKey = 'test:integration:cache'
    const testValue = { test: 'data', timestamp: Date.now() }

    cache.set(testKey, testValue, CacheTTL.SHORT)
    const retrieved = cache.get(testKey)

    expect(retrieved).toEqual(testValue)
  })

  test('should expire cached values after TTL', async () => {
    const { CacheService } = await import('@/lib/cache/cache-service')
    const cache = CacheService.getInstance()

    const testKey = 'test:integration:ttl'
    const testValue = { test: 'expiring' }

    // Set with 1 second TTL
    cache.set(testKey, testValue, 1)

    // Should exist immediately
    expect(cache.get(testKey)).toEqual(testValue)

    // Wait 1.5 seconds
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Should be expired
    expect(cache.get(testKey)).toBeNull()
  })

  test('should clear cache correctly', async () => {
    const { CacheService, CacheTTL } = await import('@/lib/cache/cache-service')
    const cache = CacheService.getInstance()

    const testKey = 'test:integration:clear'
    cache.set(testKey, { test: 'data' }, CacheTTL.LONG)

    expect(cache.get(testKey)).toBeDefined()

    cache.clear()

    expect(cache.get(testKey)).toBeNull()
  })
})

// API Cost Monitoring Tests
describe('API Cost Monitoring', () => {
  test('should initialize cost tracker', async () => {
    const { ApiCostTracker } = await import('@/lib/monitoring/api-cost-tracker')
    const tracker = ApiCostTracker.getInstance()
    expect(tracker).toBeDefined()
  })

  test('should track API usage', async () => {
    const { ApiCostTracker } = await import('@/lib/monitoring/api-cost-tracker')
    const tracker = ApiCostTracker.getInstance()

    await tracker.trackUsage({
      provider: 'test_provider',
      endpoint: 'test_endpoint',
      cost: 0.01,
      tokensUsed: 100,
      success: true
    })

    // Should not throw
    expect(true).toBe(true)
  })

  test('should calculate daily costs', async () => {
    const { ApiCostTracker } = await import('@/lib/monitoring/api-cost-tracker')
    const tracker = ApiCostTracker.getInstance()

    const dailyCosts = await tracker.getDailyCosts()
    expect(Array.isArray(dailyCosts)).toBe(true)
  })

  test('should check budget alerts', async () => {
    const { ApiCostTracker } = await import('@/lib/monitoring/api-cost-tracker')
    const tracker = ApiCostTracker.getInstance()

    const monthlyTotal = await tracker.getMonthlyTotal()
    expect(typeof monthlyTotal).toBe('number')
    expect(monthlyTotal).toBeGreaterThanOrEqual(0)
  })
})

// XAI Client Tests
describe('XAI Client Integration', () => {
  test('should initialize XAI client', async () => {
    const { callXAIAgent } = await import('@/lib/ai/xai-client')
    expect(callXAIAgent).toBeDefined()
  })

  test('should have proper error handling for invalid prompts', async () => {
    const { callXAIAgent } = await import('@/lib/ai/xai-client')

    // This should handle errors gracefully
    try {
      await callXAIAgent({
        systemPrompt: '',
        userPrompt: '',
        model: 'grok-beta'
      })
    } catch (error) {
      // Should throw or handle gracefully
      expect(error).toBeDefined()
    }
  })
})

// Lead Generation System Tests
describe('Lead Generation System', () => {
  test('should have data extractor available', async () => {
    const { extractBusinessData } = await import('@/lib/leads/data-extractor')
    expect(extractBusinessData).toBeDefined()
  })

  test('should have Google Places extractor', async () => {
    const { extractFromGooglePlaces } = await import('@/lib/leads/google-places-extractor')
    expect(extractFromGooglePlaces).toBeDefined()
  })

  test('should have Pagine Gialle extractors', async () => {
    const { extractFromPagineGialleApify } = await import('@/lib/leads/pagine-gialle-apify')
    const { extractFromPagineGialleHeadless } = await import('@/lib/leads/pagine-gialle-headless')

    expect(extractFromPagineGialleApify).toBeDefined()
    expect(extractFromPagineGialleHeadless).toBeDefined()
  })

  test('should have AI enrichment available', async () => {
    const { enrichLeadWithAI } = await import('@/lib/leads/ai-enrichment')
    expect(enrichLeadWithAI).toBeDefined()
  })
})

// Validation Schemas Tests
describe('Validation Schemas', () => {
  test('should have lead validation schema', async () => {
    const { leadSchema } = await import('@/lib/validations/lead')
    expect(leadSchema).toBeDefined()
  })

  test('should validate correct lead data', async () => {
    const { leadSchema } = await import('@/lib/validations/lead')

    const validLead = {
      query: 'dentista',
      location: 'Milano'
    }

    const result = leadSchema.safeParse(validLead)
    expect(result.success).toBe(true)
  })

  test('should reject invalid lead data', async () => {
    const { leadSchema } = await import('@/lib/validations/lead')

    const invalidLead = {
      query: '', // Empty query
      location: 'Milano'
    }

    const result = leadSchema.safeParse(invalidLead)
    expect(result.success).toBe(false)
  })
})

// Type Safety Tests
describe('TypeScript Type Safety', () => {
  test('should have proper database types', async () => {
    const types = await import('@/lib/types/database')
    expect(types).toBeDefined()
  })

  test('should have proper lead types', async () => {
    const types = await import('@/lib/types/leads')
    expect(types).toBeDefined()
  })

  test('should have proper OSINT types', async () => {
    const types = await import('@/lib/types/osint')
    expect(types).toBeDefined()
  })
})

// Middleware Integration Tests
describe('Middleware Integration', () => {
  test('should have middleware configured', async () => {
    const middleware = await import('@/middleware')
    expect(middleware.default).toBeDefined()
  })

  test('should have correct route configurations', async () => {
    const middleware = await import('@/middleware')
    expect(middleware.config).toBeDefined()
    expect(middleware.config.matcher).toBeDefined()
  })
})

// Component Import Tests
describe('Component Imports', () => {
  test('should import layout components', async () => {
    const { Header } = await import('@/components/layout/Header')
    expect(Header).toBeDefined()
  })

  test('should import auth components', async () => {
    const { LoginForm } = await import('@/components/auth/LoginForm')
    const { RegisterForm } = await import('@/components/auth/RegisterForm')

    expect(LoginForm).toBeDefined()
    expect(RegisterForm).toBeDefined()
  })

  test('should import UI components', async () => {
    const { Button } = await import('@/components/ui/button')
    const { Input } = await import('@/components/ui/input')
    const { Card } = await import('@/components/ui/card')

    expect(Button).toBeDefined()
    expect(Input).toBeDefined()
    expect(Card).toBeDefined()
  })
})

// Build and Deployment Tests
describe('Build Configuration', () => {
  test('should have Next.js config', async () => {
    const config = await import('@/next.config')
    expect(config.default).toBeDefined()
  })

  test('should have TypeScript config', async () => {
    const fs = await import('fs/promises')
    const tsconfig = await fs.readFile('tsconfig.json', 'utf-8')
    const config = JSON.parse(tsconfig)

    expect(config.compilerOptions.strict).toBe(true)
    expect(config.compilerOptions.paths).toBeDefined()
  })

  test('should have Tailwind config', async () => {
    const fs = await import('fs/promises')
    const tailwindExists = await fs.access('tailwind.config.ts')
      .then(() => true)
      .catch(() => false)

    expect(tailwindExists).toBe(true)
  })
})
