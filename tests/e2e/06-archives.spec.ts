import { test, expect } from '@playwright/test'

test.describe('S6 — Archivi', () => {
  test('OSINT archivio carica senza errori', async ({ page }) => {
    await page.goto('/osint-profiler/archivio')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/errore 500|internal server error/i)).not.toBeVisible({ timeout: 5_000 })
    await expect(page.locator('body')).toBeVisible()
  })

  test('Lead finder archivio carica senza errori', async ({ page }) => {
    await page.goto('/lead-finder/archivio')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/errore 500|internal server error/i)).not.toBeVisible({ timeout: 5_000 })
    await expect(page.locator('body')).toBeVisible()
  })

  test('Financial planner archivio carica senza errori', async ({ page }) => {
    await page.goto('/financial-planner/archivio')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/errore 500|internal server error/i)).not.toBeVisible({ timeout: 5_000 })
    await expect(page.locator('body')).toBeVisible()
  })

  test('Lead finder history carica senza errori', async ({ page }) => {
    await page.goto('/lead-finder/history')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/errore 500|internal server error/i)).not.toBeVisible({ timeout: 5_000 })
    await expect(page.locator('body')).toBeVisible()
  })
})
