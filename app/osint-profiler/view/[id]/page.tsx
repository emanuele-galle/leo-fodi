'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Redirect to dashboard route (unified viewing experience)
export default function OSINTProfileViewPage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params.id as string

  useEffect(() => {
    if (profileId) {
      router.replace(`/osint-profiler/dashboard/${profileId}`)
    }
  }, [profileId, router])

  return null
}
