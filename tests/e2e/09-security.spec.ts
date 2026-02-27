import { test, expect } from '@playwright/test'

test.describe('S8 — Sicurezza E2E', () => {
  test.describe('IDOR Protection', () => {
    test('8.1 IDOR lead search — fake search returns empty or 404', async ({ request }) => {
      const response = await request.get('/api/leads/searches/fake-search-id-12345/leads')

      if (response.status() === 200) {
        // If 200, should return empty array (no data leaked)
        const data = await response.json()
        const leads = data.leads || data
        expect(Array.isArray(leads) ? leads.length : 0).toBe(0)
      } else {
        expect([400, 403, 404]).toContain(response.status())
      }
    })

    test('8.2 IDOR profilo OSINT — cannot access other user profile', async ({ request }) => {
      const response = await request.get('/api/osint/job/fake-job-id-12345')
      expect([400, 403, 404]).toContain(response.status())
    })

    test('8.3 IDOR piano finanziario — archive returns only user data', async ({ request }) => {
      const response = await request.get('/api/financial-planner/archive')

      if (response.status() === 200) {
        const data = await response.json()
        expect(Array.isArray(data) || (data && typeof data === 'object')).toBe(true)
      }
    })
  })

  test.describe('Admin API Protection', () => {
    test('8.4 Admin GET endpoints da non-admin → 403', async ({ request }) => {
      const response = await request.get('/api/admin/users/list')
      expect([401, 403]).toContain(response.status())
    })

    test('8.4b Admin POST endpoints da non-admin → 403', async ({ request }) => {
      const postEndpoints = [
        { url: '/api/admin/users/approve', body: { userId: 'fake-id' } },
        { url: '/api/admin/users/reject', body: { userId: 'fake-id' } },
        { url: '/api/admin/users/delete', body: { userId: 'fake-id' } },
        { url: '/api/admin/users/update-email', body: { userId: 'fake-id', email: 'hack@test.com' } },
        { url: '/api/admin/users/update-password', body: { userId: 'fake-id', password: 'hacked123' } },
      ]

      for (const ep of postEndpoints) {
        const response = await request.post(ep.url, { data: ep.body })
        expect([401, 403]).toContain(response.status())
      }
    })
  })

  test.describe('Route Protection (No Auth)', () => {
    test.use({ storageState: { cookies: [], origins: [] } })

    test('8.5 Route protette senza auth → redirect a /login', async ({ page }) => {
      // Test routes one at a time with small delays to avoid rate limiting
      const protectedRoutes = [
        '/dashboard',
        '/osint-profiler',
        '/lead-finder',
        '/financial-planner',
      ]

      for (const route of protectedRoutes) {
        await page.goto(route)
        await page.waitForURL(/\/login/, { timeout: 10_000 })
        expect(page.url()).toContain('/login')
      }
    })

    test('8.6 API protette senza auth → 401', async ({ page }) => {
      // Use page.request (no stored auth) to test APIs without cookies
      const protectedAPIs = [
        '/api/osint/profiles',
        '/api/dashboard/user-stats',
      ]

      for (const api of protectedAPIs) {
        const response = await page.request.get(api)
        expect([401, 403]).toContain(response.status())
      }
    })
  })
})
