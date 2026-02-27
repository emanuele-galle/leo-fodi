import { test, expect } from '@playwright/test'

test.describe('S1 — Flusso Autenticazione', () => {
  test.use({ storageState: { cookies: [], origins: [] } }) // No auth for this suite

  test('1.1 Pagina login carica correttamente', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('link', { name: /crea un nuovo account|registrati/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /accedi/i })).toBeVisible()
  })

  test('1.2 Login con credenziali errate mostra errore', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Email').fill('nonexistent@example.com')
    await page.getByLabel('Password').fill('wrongpassword123')
    await page.getByRole('button', { name: /accedi/i }).click()

    // Should show error message and stay on /login
    await expect(page.locator('[class*="cf2e2e"], [role="alert"]').first()).toBeVisible({ timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('1.3 Login con credenziali valide → redirect dashboard', async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL || 'test-user@leo-fodi.test'
    const password = process.env.E2E_TEST_PASSWORD || 'TestLeoFodi2026!'

    // Wait to avoid rate limiting from test 1.2 (failed login attempt)
    await page.waitForTimeout(10_000)

    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await page.waitForTimeout(10_000)

      await page.goto('/login')
      await page.getByLabel('Email').fill(email)
      await page.getByLabel('Password').fill(password)
      await page.getByRole('button', { name: /accedi/i }).click()

      const rateLimited = await page.getByText(/too many requests/i)
        .isVisible({ timeout: 3_000 })
        .catch(() => false)

      if (!rateLimited) {
        await page.waitForURL(/\/dashboard/, { timeout: 15_000 })
        await expect(page).not.toHaveURL(/\/login/)
        return
      }
    }
    throw new Error('Rate limited after 3 attempts')
  })

  test('1.4 Pagina register carica correttamente', async ({ page }) => {
    await page.goto('/register')

    await expect(page.getByLabel('Nome Completo')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Conferma Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /crea il tuo account/i })).toBeVisible()
  })

  test('1.5 Registrazione con password mismatch mostra errore', async ({ page }) => {
    await page.goto('/register')

    await page.getByLabel('Nome Completo').fill('Test Mismatch')
    await page.getByLabel('Email').fill('mismatch@test.com')
    await page.getByLabel('Password', { exact: true }).fill('password123')
    await page.getByLabel('Conferma Password').fill('different456')
    await page.getByRole('button', { name: /crea il tuo account/i }).click()

    await expect(page.getByText(/password non corrispondono/i)).toBeVisible()
  })

  test('1.6 Registrazione con password corta mostra errore', async ({ page }) => {
    await page.goto('/register')

    await page.getByLabel('Nome Completo').fill('Test Short')
    await page.getByLabel('Email').fill('short@test.com')
    await page.getByLabel('Password', { exact: true }).fill('123')
    await page.getByLabel('Conferma Password').fill('123')
    await page.getByRole('button', { name: /crea il tuo account/i }).click()

    await expect(page.getByText(/almeno 6 caratteri/i)).toBeVisible()
  })

  test('1.7 Utente loggato redirectato da /login a /dashboard', async ({ page }) => {
    // Login first
    const email = process.env.E2E_USER_EMAIL || 'test-user@leo-fodi.test'
    const password = process.env.E2E_TEST_PASSWORD || 'TestLeoFodi2026!'

    await page.goto('/login')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: /accedi/i }).click()

    // Wait for login to complete (may be rate-limited, retry)
    try {
      await page.waitForURL(/\/dashboard/, { timeout: 15_000 })
    } catch {
      // If rate limited, wait and retry
      await page.waitForTimeout(5_000)
      await page.goto('/login')
      await page.getByLabel('Email').fill(email)
      await page.getByLabel('Password').fill(password)
      await page.getByRole('button', { name: /accedi/i }).click()
      await page.waitForURL(/\/dashboard/, { timeout: 15_000 })
    }

    // Now visit /login again → should redirect
    await page.goto('/login')
    await page.waitForURL(/\/dashboard/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('1.8 Logout → redirect a /login', async ({ page }) => {
    // Clear cookies to simulate logged-out state
    await page.context().clearCookies()

    // Navigate to a protected route without auth
    await page.goto('/dashboard')

    // Should redirect to login since cookies are cleared
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })
})
