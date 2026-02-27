/**
 * Create test accounts for E2E testing.
 * Run with: npx tsx scripts/create-test-accounts.ts
 */

import { prisma } from '../lib/db'

const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'TestLeoFodi2026!'

async function createTestAccounts() {
  console.log('Creating test accounts for E2E tests...')

  const baseURL = process.env.BETTER_AUTH_URL || 'https://leo-fodi.fodivps2.cloud'

  // 1. Create test-user (approved, role: user)
  try {
    const res = await fetch(`${baseURL}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test-user@leo-fodi.test',
        password: TEST_PASSWORD,
        name: 'Test User',
      }),
    })
    const data = await res.json()
    console.log('test-user signup:', res.status, data.user?.id || data.error || 'ok')
  } catch (e: any) {
    console.log('test-user signup error (may already exist):', e.message)
  }

  // 2. Create test-admin (approved, role: admin)
  try {
    const res = await fetch(`${baseURL}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test-admin@leo-fodi.test',
        password: TEST_PASSWORD,
        name: 'Test Admin',
      }),
    })
    const data = await res.json()
    console.log('test-admin signup:', res.status, data.user?.id || data.error || 'ok')
  } catch (e: any) {
    console.log('test-admin signup error (may already exist):', e.message)
  }

  // 3. Create test-pending (NOT approved)
  try {
    const res = await fetch(`${baseURL}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test-pending@leo-fodi.test',
        password: TEST_PASSWORD,
        name: 'Test Pending',
      }),
    })
    const data = await res.json()
    console.log('test-pending signup:', res.status, data.user?.id || data.error || 'ok')
  } catch (e: any) {
    console.log('test-pending signup error (may already exist):', e.message)
  }

  // 4. Update roles and approval via direct DB (Better Auth doesn't expose this via API easily)
  await prisma.$executeRaw`
    UPDATE "user" SET approved = true, role = 'user'
    WHERE email = 'test-user@leo-fodi.test'
  `
  console.log('test-user: approved=true, role=user')

  await prisma.$executeRaw`
    UPDATE "user" SET approved = true, role = 'admin'
    WHERE email = 'test-admin@leo-fodi.test'
  `
  console.log('test-admin: approved=true, role=admin')

  await prisma.$executeRaw`
    UPDATE "user" SET approved = false, role = 'user'
    WHERE email = 'test-pending@leo-fodi.test'
  `
  console.log('test-pending: approved=false, role=user')

  console.log('\nDone! Test accounts ready for E2E testing.')
  process.exit(0)
}

createTestAccounts().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
