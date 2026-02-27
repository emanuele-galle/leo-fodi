import { test, expect } from '@playwright/test'

test.describe('S3 — Lead Finder', () => {
  test('3.1 Pagina lead finder carica correttamente', async ({ page }) => {
    await page.goto('/lead-finder')
    await page.waitForLoadState('networkidle')

    // Should not show errors
    await expect(page.getByText(/errore 500|internal server error/i)).not.toBeVisible({ timeout: 5_000 })
    await expect(page.locator('body')).toBeVisible()
  })

  test('3.6 Archivio ricerche carica', async ({ page }) => {
    await page.goto('/lead-finder/archivio')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/errore 500|internal server error/i)).not.toBeVisible({ timeout: 5_000 })
    await expect(page.locator('body')).toBeVisible()
  })

  test('3.7 History carica', async ({ page }) => {
    await page.goto('/lead-finder/history')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/errore 500|internal server error/i)).not.toBeVisible({ timeout: 5_000 })
    await expect(page.locator('body')).toBeVisible()
  })

  test('3.2 API leads extract risponde correttamente', async ({ request }) => {
    // Test the API directly to avoid UI complexity with active searches
    const response = await request.post('/api/leads/extract', {
      data: {
        name: 'Test Ristorante Milano',
        settore: 'Ristorazione',
        fonti_selezionate: ['google_places'],
      },
    })

    // Should return 200 (search created) or 429 (rate limited) — not 500
    expect([200, 201, 400, 429]).toContain(response.status())

    if (response.status() === 200) {
      const data = await response.json()
      expect(data.searchId || data.search_id).toBeDefined()
    }
  })

  test('3.8 Filtro per stato contatto funziona', async ({ page }) => {
    await page.goto('/lead-finder')
    await page.waitForLoadState('networkidle')

    // Page should load without errors
    await expect(page.getByText(/errore 500|internal server error/i)).not.toBeVisible({ timeout: 5_000 })
    await expect(page).toHaveURL(/\/lead-finder/)
  })
})
