import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

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

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: (session.user as any).role || 'user',
    approved: (session.user as any).approved || false,
    createdAt: session.user.createdAt?.toString() || '',
  }
}

export async function isServerAdmin() {
  const profile = await getServerUserProfile()
  return profile?.role === 'admin'
}
