'use client'

import { createContext, useContext } from 'react'
import { authClient } from '@/lib/auth-client'

interface UserProfile {
  id: string
  email: string
  name: string | null
  role: string
  approved: boolean
}

interface AuthContextType {
  user: UserProfile | null
  isLoading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAdmin: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession()

  const user: UserProfile | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: (session.user as { role?: string; approved?: boolean }).role || 'user',
        approved: (session.user as { role?: string; approved?: boolean }).approved || false,
      }
    : null

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, isLoading: isPending, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
