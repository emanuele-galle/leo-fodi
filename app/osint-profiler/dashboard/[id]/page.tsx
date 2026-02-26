'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { OSINTProfileDisplayV4 } from '@/components/profiling/OSINTProfileDisplayV4'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function OSINTProfileDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params.id as string

  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (profileId) {
      loadProfile()
    }
  }, [profileId])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch(`/api/osint/profile?id=${profileId}`)
      if (!res.ok) {
        setError('Profilo non trovato o accesso negato')
        return
      }

      const data = await res.json()
      if (!data) {
        setError('Profilo non trovato')
        return
      }

      setProfile({
        ...data.profileData,
        metadata: {
          created_at: data.createdAt,
          profile_id: data.id,
          target_id: data.targetId,
          punteggio_complessivo: data.punteggioComplessivo,
          completezza_profilo: data.completezzaProfilo,
        },
      })
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Errore durante il caricamento del profilo')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/osint-profiler/archivio')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna all'Archivio
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-lg text-gray-600">Caricamento profilo...</span>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-20">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => router.push('/osint-profiler/archivio')}
            >
              Torna all'Archivio
            </Button>
          </div>
        )}

        {profile && !isLoading && !error && (
          <OSINTProfileDisplayV4 profile={profile} />
        )}
      </main>
    </div>
  )
}
