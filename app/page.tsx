'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { user, isAdmin, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated → redirect to login
        router.push('/login')
      } else if (isAdmin) {
        // Admin → redirect to admin dashboard
        router.push('/dashboard')
      } else {
        // Regular user → redirect to user dashboard
        router.push('/dashboard/user')
      }
    }
  }, [user, isAdmin, isLoading, router])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#115A23]/5 to-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center">
          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#115A23] via-[#1a7a32] to-[#238238] flex items-center justify-center shadow-natural">
            <svg
              viewBox="0 0 24 24"
              className="h-10 w-10 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-[#115A23]">LEO-FODI</h1>
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-[#115A23]" />
          <p className="text-sm text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    </div>
  )
}
