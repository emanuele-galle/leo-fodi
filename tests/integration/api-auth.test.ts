import { describe, it, expect } from 'vitest'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

describe('API Authentication', () => {
  it('GET /api/admin/users/list without auth should return 401', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users/list`)
    expect(res.status).toBe(401)
  })

  it('POST /api/osint/profile without auth should still process (userId is optional) or rate limit', async () => {
    const res = await fetch(`${BASE_URL}/api/osint/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Test',
        cognome: 'User',
        consenso_profilazione: true,
        data_consenso: '2026-02-27',
      }),
    })
    // OSINT profile endpoint allows unauthenticated access (userId is optional)
    // It may return 200 (job created), 429 (rate limited), or 400 (validation error)
    expect([200, 400, 429]).toContain(res.status)
  })

  it('POST /api/leads/extract without auth should return 401', async () => {
    const res = await fetch(`${BASE_URL}/api/leads/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        fonti_selezionate: ['google_places'],
      }),
    })
    expect(res.status).toBe(401)
  })

  it('GET /api/leads/extract without auth should return 401', async () => {
    const res = await fetch(`${BASE_URL}/api/leads/extract?searchId=fake-id`)
    expect(res.status).toBe(401)
  })

  it('GET /api/financial-planner/archive without auth should return 401', async () => {
    const res = await fetch(`${BASE_URL}/api/financial-planner/archive`)
    expect(res.status).toBe(401)
  })

  it('GET /api/lead-finder/archive without auth should return 401', async () => {
    const res = await fetch(`${BASE_URL}/api/lead-finder/archive`)
    expect(res.status).toBe(401)
  })

  it('GET /api/osint/profiles without auth should return 401', async () => {
    const res = await fetch(`${BASE_URL}/api/osint/profiles`)
    expect(res.status).toBe(401)
  })

  it('GET /api/dashboard/admin-stats without auth should return 401', async () => {
    const res = await fetch(`${BASE_URL}/api/dashboard/admin-stats`)
    expect(res.status).toBe(401)
  })
})
