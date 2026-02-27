import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authDir = path.join(__dirname, '.auth')
const userFile = path.join(authDir, 'user.json')
const adminFile = path.join(authDir, 'admin.json')

async function loginAndSave(page: any, email: string, password: string, saveFile: string) {
  // Retry login with backoff for rate limiting
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      await page.waitForTimeout(5_000 * attempt) // Wait 5s, 10s between retries
      await page.reload()
    }

    await page.goto('/login')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: /accedi/i }).click()

    // Check for rate limiting
    const rateLimited = await page.getByText(/too many requests|troppi tentativi/i)
      .isVisible({ timeout: 3_000 })
      .catch(() => false)

    if (rateLimited) {
      console.log(`Rate limited on attempt ${attempt + 1}, waiting...`)
      continue
    }

    // Wait for redirect
    try {
      await page.waitForURL(/\/dashboard/, { timeout: 15_000 })
      await expect(page).not.toHaveURL(/\/login/)
      await page.context().storageState({ path: saveFile })
      return
    } catch {
      // Check if redirected to pending-approval
      if (page.url().includes('pending-approval')) {
        throw new Error(`User ${email} is not approved. Run: sudo docker exec vps-panel-postgres psql -U leo_fodi_user -d leo_fodi_db -c "UPDATE user SET approved=true WHERE email='${email}'"`)
      }
      console.log(`Login attempt ${attempt + 1} failed, retrying...`)
    }
  }
  throw new Error(`Failed to login as ${email} after 3 attempts`)
}

setup('authenticate as user', async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL || 'test-user@leo-fodi.test'
  const password = process.env.E2E_TEST_PASSWORD || 'TestLeoFodi2026!'
  await loginAndSave(page, email, password, userFile)
})

setup('authenticate as admin', async ({ page }) => {
  // Wait to avoid rate limiting from the previous login
  await page.waitForTimeout(3_000)

  const email = process.env.E2E_ADMIN_EMAIL || 'test-admin@leo-fodi.test'
  const password = process.env.E2E_TEST_PASSWORD || 'TestLeoFodi2026!'
  await loginAndSave(page, email, password, adminFile)
})
