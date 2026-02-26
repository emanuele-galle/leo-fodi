import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'https://leo-fodi.fodivps2.cloud',
  plugins: [
    adminClient(),
  ],
})

export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient
