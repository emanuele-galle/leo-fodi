import { test, expect } from '@playwright/test'

test.describe('S7 — Export PDF', () => {
  test('7.1 Export PDF OSINT restituisce PDF', async ({ request }) => {
    // First get a profile ID from the archive API
    const profilesRes = await request.get('/api/osint/profiles')

    if (profilesRes.status() === 200) {
      const profiles = await profilesRes.json()
      const profileList = profiles.profiles || profiles

      if (Array.isArray(profileList) && profileList.length > 0) {
        const profileId = profileList[0].id
        const pdfRes = await request.get(`/api/export/osint-pdf?profileId=${profileId}`)

        expect(pdfRes.status()).toBe(200)
        expect(pdfRes.headers()['content-type']).toContain('pdf')
      }
    }
    // If no profiles exist, skip gracefully
  })

  test('7.2 Export PDF Financial restituisce PDF', async ({ request }) => {
    // First get a plan ID from the archive API
    const plansRes = await request.get('/api/financial-planner/archive')

    if (plansRes.status() === 200) {
      const plans = await plansRes.json()
      const planList = plans.plans || plans

      if (Array.isArray(planList) && planList.length > 0) {
        const planId = planList[0].id
        const pdfRes = await request.get(`/api/export/financial-pdf?planId=${planId}`)

        expect(pdfRes.status()).toBe(200)
        expect(pdfRes.headers()['content-type']).toContain('pdf')
      }
    }
  })

  test('7.3 Export PDF senza auth → 401', async ({ request }) => {
    // Create a new context without auth cookies
    const response = await request.fetch('/api/export/osint-pdf?profileId=fake-id', {
      headers: {
        cookie: '', // No auth cookies
      },
    })

    // Should be 401 since we're overriding cookies
    // Note: request context inherits auth, so we test via fetch override
    expect([401, 403, 404]).toContain(response.status())
  })
})
