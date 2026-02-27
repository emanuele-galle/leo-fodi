import { test, expect } from '@playwright/test'

test.describe('S4 — Financial Planner', () => {
  test('4.1 Pagina planner carica correttamente', async ({ page }) => {
    await page.goto('/financial-planner')

    await page.waitForLoadState('networkidle')

    // Should have combobox/select for profile selection
    const profileSelector = page.getByRole('combobox')
      .or(page.locator('button:has-text("Seleziona"), button:has-text("profilo")'))
      .first()

    await expect(profileSelector).toBeVisible({ timeout: 10_000 })
  })

  test('4.2 Carica profili disponibili nel dropdown', async ({ page }) => {
    await page.goto('/financial-planner')
    await page.waitForLoadState('networkidle')

    // Click the combobox/select to open dropdown
    const profileSelector = page.getByRole('combobox')
      .or(page.locator('button:has-text("Seleziona"), button:has-text("profilo")'))
      .first()

    if (await profileSelector.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await profileSelector.click()
      await page.waitForTimeout(1_000)

      // Should show options or empty state in dropdown
      const hasOptions = await page.locator('[role="option"], [cmdk-item]').first()
        .isVisible({ timeout: 5_000 })
        .catch(() => false)

      const hasEmptyMsg = await page.getByText(/nessun profilo|no profile|vuoto/i)
        .isVisible({ timeout: 3_000 })
        .catch(() => false)

      expect(hasOptions || hasEmptyMsg).toBe(true)
    }
  })

  test('4.3 Genera piano finanziario', async ({ page }) => {
    test.setTimeout(120_000) // AI generation takes time

    await page.goto('/financial-planner')
    await page.waitForLoadState('networkidle')

    // Open profile selector
    const profileSelector = page.getByRole('combobox')
      .or(page.locator('button:has-text("Seleziona"), button:has-text("profilo")'))
      .first()

    if (await profileSelector.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await profileSelector.click()
      await page.waitForTimeout(1_000)

      // Select first profile if available
      const firstOption = page.locator('[role="option"], [cmdk-item]').first()
      if (await firstOption.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await firstOption.click()
        await page.waitForTimeout(500)

        // Click generate button
        const generateButton = page.getByRole('button', { name: /genera|crea|avvia/i })
        if (await generateButton.isEnabled({ timeout: 3_000 }).catch(() => false)) {
          await generateButton.click()

          // Should show loading then result
          await expect(
            page.getByText(/generazione|elaborazione|in corso/i)
              .or(page.locator('[role="progressbar"]'))
              .or(page.getByText(/piano finanziario|obiettivi|raccomandazioni/i))
          ).toBeVisible({ timeout: 60_000 })
        }
      }
    }
  })

  test('4.4 Archivio piani carica', async ({ page }) => {
    await page.goto('/financial-planner/archivio')

    await page.waitForLoadState('networkidle')

    const hasPlans = await page.locator('table, [class*="card"], [class*="grid"]').first()
      .isVisible({ timeout: 10_000 })
      .catch(() => false)

    const hasEmptyState = await page.getByText(/nessun|vuoto|empty|no pian/i)
      .isVisible({ timeout: 3_000 })
      .catch(() => false)

    expect(hasPlans || hasEmptyState).toBe(true)
  })
})
