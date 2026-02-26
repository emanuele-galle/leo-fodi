import { authClient } from '@/lib/auth-client'

export interface UserProfile {
  id: string
  email: string
  name: string | null
  role: string
  approved: boolean
  createdAt: string
}

export async function signIn(email: string, password: string) {
  const result = await authClient.signIn.email({
    email,
    password,
  })

  if (result.error) {
    throw new Error(result.error.message || 'Errore di autenticazione')
  }

  return result.data
}

export async function signUp(email: string, password: string, fullName: string) {
  const result = await authClient.signUp.email({
    email,
    password,
    name: fullName,
  })

  if (result.error) {
    throw new Error(result.error.message || 'Errore di registrazione')
  }

  return result.data
}

export async function signOut() {
  await authClient.signOut()
}

export function useSession() {
  return authClient.useSession()
}
