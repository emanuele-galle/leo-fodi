import { auth, type Session } from '@/lib/auth'
import { headers } from 'next/headers'

export type { Session }

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session
}

export async function getServerUser() {
  const session = await getServerSession()
  return session?.user ?? null
}

export async function getServerUserProfile() {
  const session = await getServerSession()
  if (!session?.user) return null

  const user = session.user as Session['user']
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role || 'user',
    approved: user.approved || false,
    createdAt: user.createdAt?.toString() || '',
  }
}

export async function isServerAdmin() {
  const profile = await getServerUserProfile()
  return profile?.role === 'admin'
}
