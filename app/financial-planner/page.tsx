'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  TrendingUp,
  Target,
  Sparkles,
  Loader2,
  FolderArchive,
  UserSearch,
  ChevronRight,
  AlertTriangle,
  Check,
  ChevronsUpDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OSINTProfile {
  id: string
  target_id: string
  nome: string
  cognome: string
  nome_completo: string
  created_at: string
  citta: string | null
  punteggio: number
  completezza: number
}

export default function FinancialPlannerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false)
  const [clientId, setClientId] = useState('')
  const [profiles, setProfiles] = useState<OSINTProfile[]>([])
  const [open, setOpen] = useState(false)

  // Load user's OSINT profiles on mount
  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    try {
      setIsLoadingProfiles(true)

      const response = await fetch('/api/osint/profiles')

      if (!response.ok) {
        throw new Error('Failed to load profiles')
      }

      const data = await response.json()
      setProfiles(data.profiles || [])
    } catch (error) {
      console.error('Error loading profiles:', error)
    } finally {
      setIsLoadingProfiles(false)
    }
  }

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientId.trim()) {
      alert('Seleziona un profilo OSINT dalla tendina')
      return
    }

    setIsLoading(true)

    try {
      // Call API to generate financial plan
      const response = await fetch('/api/financial-planner/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientId: clientId.trim() }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Errore durante la creazione del piano')
      }

      const result = await response.json()

      // Redirect to view page
      router.push(`/financial-planner/view/${result.planId}`)
    } catch (error) {
      console.error('Financial planning error:', error)
      alert(`Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-white via-[#B15082]/10 to-white py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-6xl space-y-8">
          {/* Hero Header - Rosa Leonardo Premium */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#B15082] via-[#FF2E5F] to-[#B15082] p-8 md:p-12 shadow-deep">
            {/* Decorative Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl"></div>
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-natural">
                    <TrendingUp className="h-9 w-9 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                      Piano Finanziario Premium
                    </h1>
                    <p className="text-white/80 text-sm font-medium">Strategie AI Personalizzate</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => router.push('/financial-planner/archivio')}
                  className="h-12 bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white/30 rounded-xl font-semibold shadow-natural transition-all duration-200"
                >
                  <FolderArchive className="h-5 w-5 mr-2" strokeWidth={2.5} />
                  Archivio Piani
                </Button>
              </div>

              <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl">
                Trasforma profili OSINT in{' '}
                <span className="font-bold border-b-4 border-white/40">strategie finanziarie che chiudono vendite</span>{' '}
                con raccomandazioni AI su misura
              </p>

              {/* Benefits Quick Pills */}
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
                  <Target className="h-4 w-4 text-white" strokeWidth={2.5} />
                  <span className="text-sm font-semibold text-white">6 sezioni strategiche</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
                  <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
                  <span className="text-sm font-semibold text-white">Prodotti personalizzati</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
                  <ChevronRight className="h-4 w-4 text-white" strokeWidth={2.5} />
                  <span className="text-sm font-semibold text-white">Piano step-by-step</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid - Rosa Leonardo Premium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 stagger-children">
            <Card className="card-depth hover-lift border-none bg-gradient-to-br from-[#B15082]/10 via-[#B15082]/5 to-white shadow-natural hover:shadow-deep transition-all duration-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#B15082] to-[#FF2E5F] flex items-center justify-center flex-shrink-0 shadow-natural group-hover:scale-110 transition-all">
                    <Target className="h-7 w-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-[#B15082] mb-1">Trasforma Obiettivi in Risultati</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Il cliente non compra prodotti, compra il <strong>futuro sicuro</strong> che desidera
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-depth hover-lift border-none bg-gradient-to-br from-[#B15082]/10 via-[#B15082]/5 to-white shadow-natural hover:shadow-deep transition-all duration-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#B15082] to-[#FF2E5F] flex items-center justify-center flex-shrink-0 shadow-natural group-hover:scale-110 transition-all">
                    <Sparkles className="h-7 w-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-[#B15082] mb-1">Vendi la Destinazione, Non il Mezzo</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      AI personalizza il <strong>cambiamento di vita</strong> che otterr\u00e0, non le caratteristiche
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-depth hover-lift border-none bg-gradient-to-br from-[#B15082]/10 via-[#B15082]/5 to-white shadow-natural hover:shadow-deep transition-all duration-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#B15082] to-[#FF2E5F] flex items-center justify-center flex-shrink-0 shadow-natural group-hover:scale-110 transition-all">
                    <ChevronRight className="h-7 w-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-[#B15082] mb-1">Piano d&apos;Azione Chiaro</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Ogni step mostra <strong>benefici concreti</strong>, non complessit\u00e0 tecniche
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Form Card - Rosa Leonardo */}
          <Card className="card-depth hover-lift border-2 border-[#B15082]/20 bg-white shadow-deep">
            <CardHeader className="relative overflow-hidden bg-gradient-to-r from-[#B15082]/20 via-[#B15082]/10 to-transparent border-b-2 border-[#B15082]/20">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#B15082] to-[#FF2E5F] flex items-center justify-center shadow-natural">
                  <Sparkles className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <CardTitle className="text-2xl sm:text-3xl text-[#B15082] font-bold">
                    Crea Piano Premium Personalizzato
                  </CardTitle>
                  <CardDescription className="text-base font-medium">
                    Trasforma dati OSINT in strategia di vendita vincente
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreatePlan} className="space-y-6">
                {/* Profile Selector */}
                <div className="space-y-3">
                  <Label htmlFor="profile-selector" className="text-base font-medium text-gray-700">
                    Seleziona Profilo OSINT
                  </Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between text-base h-12 touch-target"
                        disabled={isLoadingProfiles || isLoading}
                      >
                        {isLoadingProfiles ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Caricamento profili...
                          </>
                        ) : clientId ? (
                          <>
                            {profiles.find((p) => p.id === clientId)?.nome_completo || 'Profilo sconosciuto'}
                            {profiles.find((p) => p.id === clientId)?.citta && (
                              <span className="text-gray-500 ml-2">
                                &bull; {profiles.find((p) => p.id === clientId)?.citta}
                              </span>
                            )}
                          </>
                        ) : (
                          'Cerca un profilo per nome...'
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Cerca per nome o cognome..." />
                        <CommandList>
                          <CommandEmpty>
                            {profiles.length === 0 ? (
                              <div className="p-4 text-center text-sm text-gray-500">
                                <p className="font-medium">Nessun profilo OSINT trovato</p>
                                <p className="mt-1">Crea prima un profilo OSINT</p>
                              </div>
                            ) : (
                              'Nessun profilo trovato.'
                            )}
                          </CommandEmpty>
                          <CommandGroup>
                            {profiles.map((profile) => (
                              <CommandItem
                                key={profile.id}
                                value={`${profile.nome_completo} ${profile.citta || ''}`}
                                onSelect={() => {
                                  setClientId(profile.id)
                                  setOpen(false)
                                }}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    clientId === profile.id ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{profile.nome_completo}</span>
                                  {profile.citta && (
                                    <span className="text-xs text-gray-500">{profile.citta}</span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-sm text-gray-500">
                    Seleziona un profilo OSINT esistente per generare il piano finanziario
                  </p>
                </div>

                {/* Submit Button - Rosa Leonardo */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading || !clientId.trim()}
                    className="flex-1 h-14 text-base bg-gradient-to-r from-[#B15082] to-[#FF2E5F] hover:shadow-deep hover:-translate-y-1 transition-all duration-200 text-white shadow-natural font-semibold rounded-xl touch-target"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-6 w-6 mr-2 animate-spin" strokeWidth={2.5} />
                        Creazione strategia premium...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-6 w-6 mr-2" strokeWidth={2.5} />
                        Genera Piano Finanziario Premium
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/osint-profiler/archivio')}
                    className="h-14 border-2 border-[#B15082]/30 text-[#B15082] hover:bg-[#B15082]/10 shadow-natural hover:shadow-deep font-semibold rounded-xl transition-all duration-200 touch-target"
                  >
                    <UserSearch className="h-5 w-5 mr-2" strokeWidth={2.5} />
                    Sfoglia Profili OSINT
                  </Button>
                </div>
              </form>

              {/* Prerequisite Warning Box */}
              <div className="mt-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-xl shadow-soft">
                <h4 className="font-semibold text-lg text-amber-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6" />
                  Prerequisito Obbligatorio
                </h4>
                <p className="text-sm text-amber-900 font-medium mb-3 leading-relaxed">
                  Il Financial Planner richiede che il cliente abbia <strong>gi\u00e0 un profilo OSINT completo</strong>.
                </p>
                <div className="bg-amber-100/50 border border-amber-300 rounded-lg p-4 mb-4">
                  <p className="text-sm text-amber-800 font-medium mb-2">
                    <strong>Perch\u00e9?</strong> Il piano finanziario si basa sui dati raccolti tramite OSINT:
                  </p>
                  <ul className="text-sm text-amber-800 space-y-1.5 ml-4 list-disc">
                    <li>Informazioni personali e professionali</li>
                    <li>Situazione finanziaria e patrimonio stimato</li>
                    <li>Profili social, interessi e stile di vita</li>
                    <li>Contesto familiare e obiettivi di vita</li>
                  </ul>
                </div>
                <Button
                  onClick={() => router.push('/osint-profiler')}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg btn-hover touch-target"
                >
                  <UserSearch className="h-4 w-4 mr-2" />
                  Crea Prima un Profilo OSINT
                </Button>
              </div>

              {/* Info Box */}
              <div className="mt-4 p-5 bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-200 rounded-xl shadow-soft">
                <h4 className="font-semibold text-lg text-sky-900 mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-sky-600"></div>
                  Flusso di Lavoro Completo
                </h4>
                <ol className="text-sm text-sky-800 space-y-2 ml-7 list-decimal">
                  <li><strong>OSINT Profiler</strong>: Raccogli dati del cliente da fonti pubbliche</li>
                  <li><strong>Financial Planner</strong>: Genera piano basato sui dati OSINT</li>
                  <li><strong>Analisi AI</strong>: L&apos;intelligenza artificiale crea obiettivi e raccomandazioni</li>
                  <li><strong>Piano Completo</strong>: Scarica e presenta al cliente</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
