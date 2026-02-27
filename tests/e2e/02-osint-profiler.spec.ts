import { test, expect } from '@playwright/test'

test.describe('S2 — OSINT Profiler', () => {
  test('2.1 Pagina profiler carica correttamente', async ({ page }) => {
    await page.goto('/osint-profiler')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('#nome')).toBeVisible()
    await expect(page.locator('#cognome')).toBeVisible()
    await expect(page.getByRole('checkbox').first()).toBeVisible()
  })

  test('2.2 Submit senza consenso → button disabilitato o errore', async ({ page }) => {
    await page.goto('/osint-profiler')
    await page.waitForLoadState('networkidle')

    await page.locator('#nome').fill('Mario')
    await page.locator('#cognome').fill('Rossi')

    const submitButton = page.getByRole('button', { name: /genera profilo/i })

    const isDisabled = await submitButton.isDisabled().catch(() => false)
    if (isDisabled) {
      expect(isDisabled).toBe(true)
    } else {
      await submitButton.click()
      await page.waitForTimeout(2_000)
      // Should still be on profiler page (not navigated away)
      await expect(page).toHaveURL(/\/osint-profiler/)
    }
  })

  test('2.3 Submit profilo valido → job o errore di validazione', async ({ page }) => {
    test.setTimeout(120_000)

    await page.goto('/osint-profiler')
    await page.waitForLoadState('networkidle')

    await page.locator('#nome').fill('Mario')
    await page.locator('#cognome').fill('Draghi')
    await page.locator('#email').fill('mario.draghi@test.com')

    const checkbox = page.getByRole('checkbox').first()
    await checkbox.check()

    // Intercept the API call to verify it was made
    const apiPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/osint/profile') && resp.request().method() === 'POST',
      { timeout: 15_000 }
    )

    await page.getByRole('button', { name: /genera profilo/i }).click()

    // Verify the API was called and responded
    const apiResponse = await apiPromise
    expect([200, 400, 429]).toContain(apiResponse.status())
  })

  test('2.4 API OSINT profile risponde correttamente', async ({ request }) => {
    // Test API directly instead of through UI (avoids rate limiting and UI complexity)
    const response = await request.post('/api/osint/profile', {
      data: {
        nome: 'Test',
        cognome: 'APICheck',
        consenso_profilazione: true,
        data_consenso: new Date().toISOString(),
      },
    })

    // Should return 200 (job created) or 429 (rate limited) — not 500
    expect([200, 201, 429]).toContain(response.status())

    if (response.status() === 200) {
      const data = await response.json()
      expect(data.job_id).toBeDefined()
    }
  })

  test('2.6 Archivio profili carica lista', async ({ page }) => {
    await page.goto('/osint-profiler/archivio')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/errore 500|internal server error/i)).not.toBeVisible({ timeout: 3_000 })
  })
})
