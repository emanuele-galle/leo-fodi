'use client'

import { useState, useEffect, useRef } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, UserSearch, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'
import type { CompleteOSINTProfile } from '@/lib/osint/types'
import { OSINTProfileDisplayV4 } from '@/components/profiling/OSINTProfileDisplayV4'

export default function OSINTProfilerPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<CompleteOSINTProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [jobStatus, setJobStatus] = useState<{
    status: string
    progress: number
    current_phase: string | null
  } | null>(null)

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    data_nascita: '',
    citta: '',
    email: '',
    phone: '',
    linkedin_url: '',
    facebook_url: '',
    instagram_url: '',
    website_url: '',
    consenso_profilazione: false,
    note: '',
  })

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  // Poll job status
  const pollJobStatus = async (jobId: string) => {
    try {
      const response = await fetch(`/api/osint/job/${jobId}`)

      if (!response.ok) {
        throw new Error('Errore nel recupero dello stato del job')
      }

      const data = await response.json()
      const job = data.job

      setJobStatus({
        status: job.status,
        progress: job.progress,
        current_phase: job.current_phase,
      })

      // If completed or failed, stop polling
      if (job.status === 'completed') {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
        setProfile(job.result)
        setIsLoading(false)
        setJobStatus(null)
      } else if (job.status === 'failed') {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
        setError(job.error || 'Job fallito')
        setIsLoading(false)
        setJobStatus(null)
      }
    } catch (err) {
      console.error('Polling error:', err)
      // Don't stop polling on transient errors
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setProfile(null)
    setJobStatus(null)

    try {
      const response = await fetch('/api/osint/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          data_consenso: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore durante il profiling')
      }

      const data = await response.json()

      // Async mode: start polling
      if (data.job_id) {
        console.log('Job created:', data.job_id)
        setJobStatus({
          status: 'pending',
          progress: 0,
          current_phase: 'Inizializzazione',
        })

        // Start polling every 3 seconds
        pollingIntervalRef.current = setInterval(() => {
          pollJobStatus(data.job_id)
        }, 3000)

        // Poll immediately
        pollJobStatus(data.job_id)
      }
      // Sync mode (legacy)
      else if (data.profile) {
        setProfile(data.profile)
        setIsLoading(false)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-white via-[#91BDE2]/10 to-white py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-6xl space-y-8">
          {/* Hero Header - Leonardo Style with Azzurro */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#91BDE2] via-[#0693e3] to-[#0c7cc5] p-8 md:p-12 shadow-deep">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-natural">
                <UserSearch className="h-9 w-9 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Profilazione OSINT Intelligente
                </h1>
                <p className="text-white/80 text-sm font-medium">Sistema Multi-Agent AI</p>
              </div>
            </div>

            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl">
              Trasforma una ricerca manuale di ore in un{' '}
              <span className="font-bold border-b-4 border-white/40">profilo completo in 30 secondi</span>{' '}
              con 7 agenti AI specializzati
            </p>

            {/* Benefits Quick Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
                <CheckCircle2 className="h-4 w-4 text-white" strokeWidth={2.5} />
                <span className="text-sm font-semibold text-white">10+ fonti aggregate</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
                <CheckCircle2 className="h-4 w-4 text-white" strokeWidth={2.5} />
                <span className="text-sm font-semibold text-white">Analisi comportamentale</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
                <CheckCircle2 className="h-4 w-4 text-white" strokeWidth={2.5} />
                <span className="text-sm font-semibold text-white">GDPR compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form - Leonardo Styled */}
        {!profile && (
          <Card className="relative overflow-hidden rounded-2xl bg-white border-2 border-[#91BDE2]/30 shadow-natural">
            {/* Form Header */}
            <CardHeader className="relative bg-gradient-to-r from-[#91BDE2]/20 via-[#91BDE2]/10 to-transparent border-b-2 border-[#91BDE2]/20">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#91BDE2] to-[#0693e3] flex items-center justify-center shadow-natural">
                  <Sparkles className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">Genera Profilo Intelligence</CardTitle>
                  <CardDescription className="text-sm font-medium">
                    Compila i dati per analisi comportamentale completa (consenso GDPR obbligatorio)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dati Base */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome" className="text-base font-medium text-gray-700">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                      disabled={isLoading}
                      className="touch-target"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cognome" className="text-base font-medium text-gray-700">Cognome *</Label>
                    <Input
                      id="cognome"
                      value={formData.cognome}
                      onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                      required
                      disabled={isLoading}
                      className="touch-target"
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_nascita" className="text-base font-medium text-gray-700">Data Nascita</Label>
                    <Input
                      id="data_nascita"
                      type="date"
                      value={formData.data_nascita}
                      onChange={(e) => setFormData({ ...formData, data_nascita: e.target.value })}
                      disabled={isLoading}
                      className="touch-target"
                    />
                  </div>
                  <div>
                    <Label htmlFor="citta" className="text-base font-medium text-gray-700">Città</Label>
                    <Input
                      id="citta"
                      value={formData.citta}
                      onChange={(e) => setFormData({ ...formData, citta: e.target.value })}
                      disabled={isLoading}
                      className="touch-target"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-base font-medium text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="esempio@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isLoading}
                      className="touch-target"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-base font-medium text-gray-700">Telefono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+39 335 1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={isLoading}
                      className="touch-target"
                    />
                  </div>
                </div>

                {/* Social Media URLs - Leonardo Extended Palette */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#B15082] to-[#FF2E5F] flex items-center justify-center shadow-natural">
                      <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Profili Social Media</h3>
                      <p className="text-sm text-muted-foreground">URL opzionali per analisi social completa</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="linkedin" className="text-sm font-medium text-gray-600">LinkedIn URL</Label>
                      <Input
                        id="linkedin"
                        type="url"
                        placeholder="https://linkedin.com/in/..."
                        value={formData.linkedin_url}
                        onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                        disabled={isLoading}
                        className="touch-target"
                      />
                    </div>
                    <div>
                      <Label htmlFor="facebook" className="text-sm font-medium text-gray-600">Facebook URL</Label>
                      <Input
                        id="facebook"
                        type="url"
                        placeholder="https://facebook.com/..."
                        value={formData.facebook_url}
                        onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                        disabled={isLoading}
                        className="touch-target"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagram" className="text-sm font-medium text-gray-600">Instagram URL</Label>
                      <Input
                        id="instagram"
                        type="url"
                        placeholder="https://instagram.com/..."
                        value={formData.instagram_url}
                        onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                        disabled={isLoading}
                        className="touch-target"
                      />
                    </div>
                  </div>
                </div>

                {/* Website Aziendale / Personale */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#0693e3] to-[#0c7cc5] flex items-center justify-center shadow-natural">
                      <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Sito Web Aziendale/Personale</h3>
                      <p className="text-sm text-muted-foreground">URL per analisi approfondita contenuti (company, prodotti, servizi)</p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="website" className="text-sm font-medium text-gray-600">Website URL</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      disabled={isLoading}
                      className="touch-target"
                    />
                  </div>
                </div>

                {/* Note */}
                <div>
                  <Label htmlFor="note" className="text-base font-medium text-gray-700">Note</Label>
                  <Input
                    id="note"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    disabled={isLoading}
                    className="touch-target"
                  />
                </div>

                {/* Consenso */}
                <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl shadow-soft">
                  <Checkbox
                    id="consenso"
                    checked={formData.consenso_profilazione}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, consenso_profilazione: checked as boolean })
                    }
                    disabled={isLoading}
                    className="mt-1 touch-target"
                  />
                  <label
                    htmlFor="consenso"
                    className="text-sm font-medium leading-relaxed text-amber-900 cursor-pointer flex-1"
                  >
                    Confermo che il soggetto ha fornito consenso esplicito firmato per la profilazione OSINT *
                  </label>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 shadow-soft fade-in-up">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-800">Errore</h4>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {/* Job Progress */}
                {jobStatus && (
                  <div className="p-6 bg-gradient-to-br from-sky-50 via-violet-50/50 to-purple-50 border-2 border-sky-300 rounded-xl space-y-4 shadow-accent fade-in-up">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-6 w-6 text-sky-600 animate-spin flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-sky-900">Profiling in Corso</h4>
                          <p className="text-sm text-sky-700">{jobStatus.current_phase}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-white shadow-sm px-3 py-1">
                        {jobStatus.progress}%
                      </Badge>
                    </div>
                    <Progress value={jobStatus.progress} className="h-2" />
                    <p className="text-xs text-sky-600 flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      Il processo richiede circa 3-5 minuti. La pagina si aggiornerà automaticamente.
                    </p>
                  </div>
                )}

                {/* Submit - Leonardo Azzurro Style */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-base bg-gradient-to-r from-[#91BDE2] to-[#0693e3] hover:shadow-deep hover:-translate-y-1 transition-all duration-200 text-white shadow-natural font-semibold rounded-xl"
                  disabled={isLoading || !formData.consenso_profilazione}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-6 w-6 mr-2 animate-spin" strokeWidth={2.5} />
                      {jobStatus ? `Analisi in corso... ${jobStatus.progress}%` : 'Inizializzazione agenti AI...'}
                    </>
                  ) : (
                    <>
                      <UserSearch className="h-6 w-6 mr-2" strokeWidth={2.5} />
                      Genera Profilo Completo (30 sec)
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Results - New Professional UI */}
        {profile && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-emerald-900">Profiling Completato</h2>
              </div>
              <Button
                variant="outline"
                onClick={() => setProfile(null)}
                className="btn-hover shadow-soft hover:shadow-md touch-target"
              >
                Nuova Ricerca
              </Button>
            </div>

            {/* Professional Profile Display */}
            <OSINTProfileDisplayV4 profile={profile} />
          </div>
        )}
        </div>
      </div>
    </>
  )
}
