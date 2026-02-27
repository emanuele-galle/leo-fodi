import { describe, it, expect } from 'vitest'

// Integration tests require a running server - skip if not available
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

describe('Health Check API', () => {
  it('should return 200 with status ok', async () => {
    const res = await fetch(`${BASE_URL}/api/health`)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.status).toBe('ok')
    expect(data.db).toBe(true)
    expect(data).toHaveProperty('timestamp')
  })

  it('should include redis status', async () => {
    const res = await fetch(`${BASE_URL}/api/health`)
    const data = await res.json()
    expect(data).toHaveProperty('redis')
    expect(typeof data.redis).toBe('boolean')
  })
})
