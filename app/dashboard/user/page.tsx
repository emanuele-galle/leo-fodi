'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  Search,
  Database,
  ArrowRight,
  Sparkles,
  Clock,
  Target,
  BarChart3,
  Award,
  Activity,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { EuroIcon } from '@/components/ui/euro-icon'
import { useAuth } from '@/components/auth/AuthProvider'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { InsightsPanel } from '@/components/dashboard/InsightsPanel'

interface UserStatsData {
  totals: {
    clients: number
    profiles: number
    plans: number
    leads: number
  }
  currentMonth: {
    clients: number
    profiles: number
    plans: number
    leads: number
  }
  currentWeek: {
    clients: number
    profiles: number
    plans: number
    leads: number
  }
  monthlyTrend: Array<{
    month_start: string
    clients_count: number
    profiles_count: number
    plans_count: number
    leads_count: number
  }>
  recentActivity: Array<{
    id: string
    activity_type: string
    entity_type: string | null
    entity_id: string | null
    metadata: any
    created_at: string
  }>
  recent: {
    clients: Array<{ id: string; nome: string; cognome: string; created_at: string }>
    profiles: Array<{
      id: string
      created_at: string
      clients: { id: string; nome: string; cognome: string } | null
    }>
    plans: Array<{
      id: string
      created_at: string
      profiles: {
        id: string
        clients: { id: string; nome: string; cognome: string } | null
      } | null
    }>
    leads: Array<{ id: string; business_name: string; created_at: string }>
  }
}

export default function UserDashboardPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState<UserStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Redirect admin to admin dashboard
    if (isAdmin) {
      router.push('/dashboard')
    } else {
      loadUserStats()
    }
  }, [isAdmin, router])

  const loadUserStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/dashboard/user-stats')

      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error loading user stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Quick actions for users
  const quickActions = [
    {
      title: 'Profila Cliente',
      description: 'Analisi OSINT completa con AI',
      href: '/osint-profiler',
      icon: Target,
      color: 'from-[#91BDE2] to-[#0693e3]',
    },
    {
      title: 'Genera Lead',
      description: 'Trova prospect qualificati',
      href: '/lead-finder',
      icon: Search,
      color: 'from-[#A2C054] to-[#8BA048]',
    },
    {
      title: 'Piano Finanziario',
      description: 'Strategia AI personalizzata',
      href: '/financial-planner',
      icon: Sparkles,
      color: 'from-[#B15082] to-[#FF2E5F]',
    },
  ]

  // User metrics
  const metrics = [
    {
      title: 'Clienti Totali',
      value: stats?.totals.clients || 0,
      monthValue: stats?.currentMonth.clients || 0,
      icon: Users,
      color: 'from-[#115A23] to-[#1a7a32]',
      href: '/osint-profiler/archivio',
      label: 'Questo mese',
    },
    {
      title: 'Profili OSINT',
      value: stats?.totals.profiles || 0,
      monthValue: stats?.currentMonth.profiles || 0,
      icon: Database,
      color: 'from-[#91BDE2] to-[#0693e3]',
      href: '/osint-profiler/archivio',
      label: 'Questo mese',
    },
    {
      title: 'Piani Finanziari',
      value: stats?.totals.plans || 0,
      monthValue: stats?.currentMonth.plans || 0,
      icon: EuroIcon,
      color: 'from-[#B15082] to-[#FF2E5F]',
      href: '/financial-planner/archivio',
      label: 'Questo mese',
    },
    {
      title: 'Lead Generati',
      value: stats?.totals.leads || 0,
      monthValue: stats?.currentMonth.leads || 0,
      icon: Search,
      color: 'from-[#A2C054] to-[#8BA048]',
      href: '/lead-finder/archivio',
      label: 'Questo mese',
    },
  ]

  // Format activity type
  const formatActivityType = (type: string) => {
    const types: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
      profile_created: {
        label: 'Profilo OSINT',
        icon: Database,
        color: 'text-[#91BDE2]',
        bgColor: 'bg-[#91BDE2]/10',
      },
      plan_created: {
        label: 'Piano Finanziario',
        icon: EuroIcon,
        color: 'text-[#B15082]',
        bgColor: 'bg-[#B15082]/10',
      },
      lead_generated: {
        label: 'Lead',
        icon: Search,
        color: 'text-[#A2C054]',
        bgColor: 'bg-[#A2C054]/10',
      },
      client_added: {
        label: 'Cliente',
        icon: Users,
        color: 'text-[#115A23]',
        bgColor: 'bg-[#115A23]/10',
      },
    }
    return types[type] || { label: type, icon: Activity, color: 'text-gray-500', bgColor: 'bg-gray-100' }
  }

  if (isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-white via-[#115A23]/5 to-white">
        <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
          {/* Hero Section - Personalized */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#115A23] via-[#1a7a32] to-[#238238] p-8 md:p-12 shadow-deep">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl"></div>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-natural">
                  <BarChart3 className="h-7 w-7 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">La Tua Dashboard</h1>
                  <p className="text-white/80 text-sm font-medium">
                    Panoramica completa della tua attività
                  </p>
                </div>
              </div>

              <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl">
                Monitora le tue{' '}
                <span className="font-bold border-b-4 border-white/40">performance in tempo reale</span>{' '}
                e prendi decisioni basate sui dati
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-natural">
                  <p className="text-white/70 text-xs uppercase tracking-wide font-semibold mb-1">
                    Clienti
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {isLoading ? '...' : stats?.totals.clients || 0}
                  </p>
                  <p className="text-white/60 text-xs mt-1">
                    +{stats?.currentMonth.clients || 0} questo mese
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-natural">
                  <p className="text-white/70 text-xs uppercase tracking-wide font-semibold mb-1">
                    Profili
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {isLoading ? '...' : stats?.totals.profiles || 0}
                  </p>
                  <p className="text-white/60 text-xs mt-1">
                    +{stats?.currentMonth.profiles || 0} questo mese
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-natural">
                  <p className="text-white/70 text-xs uppercase tracking-wide font-semibold mb-1">
                    Piani
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {isLoading ? '...' : stats?.totals.plans || 0}
                  </p>
                  <p className="text-white/60 text-xs mt-1">
                    +{stats?.currentMonth.plans || 0} questo mese
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-natural">
                  <p className="text-white/70 text-xs uppercase tracking-wide font-semibold mb-1">Lead</p>
                  <p className="text-3xl font-bold text-white">
                    {isLoading ? '...' : stats?.totals.leads || 0}
                  </p>
                  <p className="text-white/60 text-xs mt-1">
                    +{stats?.currentMonth.leads || 0} questo mese
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-[#115A23]" strokeWidth={2.5} />
              Azioni Rapide
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.href} href={action.href}>
                    <div className="group relative overflow-hidden rounded-2xl bg-white border-2 border-border p-6 shadow-natural hover:shadow-deep hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                      <div
                        className={`h-14 w-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-natural group-hover:scale-110 transition-transform duration-200`}
                      >
                        <Icon className="h-7 w-7 text-white" strokeWidth={2.5} />
                      </div>
                      <h3 className="font-bold text-foreground mb-2 text-lg">{action.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {action.description}
                      </p>
                      <div className="flex items-center text-sm font-semibold text-[#115A23]">
                        Inizia
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-2 transition-transform duration-200" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Metrics & Charts (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Performance Metrics */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Activity className="h-6 w-6 text-[#115A23]" strokeWidth={2.5} />
                  Le Mie Performance
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {metrics.map((metric) => {
                    const Icon = metric.icon
                    return (
                      <Link key={metric.title} href={metric.href}>
                        <Card className="relative overflow-hidden border-2 shadow-natural hover:shadow-deep hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
                          <CardHeader className="pb-3">
                            <div
                              className={`h-12 w-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center shadow-natural mb-3`}
                            >
                              <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                            </div>
                            <CardTitle className="text-base font-semibold">{metric.title}</CardTitle>
                            <CardDescription className="text-xs">{metric.label}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-baseline gap-2">
                              <p className="text-4xl font-bold text-foreground">
                                {isLoading ? '...' : metric.value}
                              </p>
                              <span className="text-sm font-semibold text-[#115A23]">
                                +{metric.monthValue}
                              </span>
                            </div>
                          </CardContent>
                          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="h-5 w-5 text-[#115A23]" strokeWidth={2.5} />
                          </div>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Trend Chart */}
              {stats?.monthlyTrend && stats.monthlyTrend.length > 0 && (
                <TrendChart
                  data={stats.monthlyTrend}
                  title="Trend Ultimi 6 Mesi"
                  description="Visualizza la tua crescita nel tempo"
                />
              )}

              {/* Goal Tracker */}
              <Card className="border-2 shadow-natural">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#115A23] to-[#1a7a32] flex items-center justify-center shadow-natural">
                      <Award className="h-5 w-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Obiettivi del Mese</CardTitle>
                      <CardDescription className="text-xs">
                        Progressi verso i target mensili
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Clienti Goal */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground">
                        Clienti Profilati
                      </span>
                      <span className="text-sm font-bold text-[#115A23]">
                        {stats?.totals.clients || 0}/20
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#115A23] to-[#1a7a32] rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(((stats?.totals.clients || 0) / 20) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Piani Goal */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground">
                        Piani Finanziari
                      </span>
                      <span className="text-sm font-bold text-[#B15082]">
                        {stats?.totals.plans || 0}/15
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#B15082] to-[#FF2E5F] rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(((stats?.totals.plans || 0) / 15) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Lead Goal */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground">
                        Lead Qualificati
                      </span>
                      <span className="text-sm font-bold text-[#A2C054]">
                        {stats?.totals.leads || 0}/50
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#A2C054] to-[#8BA048] rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(((stats?.totals.leads || 0) / 50) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Insights & Activity (1/3) */}
            <div className="space-y-6">
              {/* AI Insights */}
              {stats && <InsightsPanel stats={stats} />}

              {/* Recent Activity */}
              <Card className="border-2 shadow-natural">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#0693e3] to-[#0c7cc5] flex items-center justify-center shadow-natural">
                      <Clock className="h-5 w-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Attività Recente</CardTitle>
                      <CardDescription className="text-xs">Ultimi eventi</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground">Caricamento...</p>
                  ) : !stats?.recentActivity || stats.recentActivity.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nessuna attività recente</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.recentActivity.slice(0, 5).map((activity) => {
                        const config = formatActivityType(activity.activity_type)
                        const Icon = config.icon
                        return (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div
                              className={`h-8 w-8 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}
                            >
                              <Icon className={`h-4 w-4 ${config.color}`} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {config.label}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(activity.created_at).toLocaleString('it-IT', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="border-2 shadow-natural">
                <CardHeader>
                  <CardTitle className="text-lg">Accesso Rapido</CardTitle>
                  <CardDescription className="text-xs">Collegamenti agli archivi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/osint-profiler/archivio">
                    <Button
                      variant="outline"
                      className="w-full justify-between hover:bg-[#91BDE2]/10 hover:border-[#91BDE2]/40 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-[#91BDE2]" strokeWidth={2.5} />
                        Archivio OSINT
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/financial-planner/archivio">
                    <Button
                      variant="outline"
                      className="w-full justify-between hover:bg-[#B15082]/10 hover:border-[#B15082]/40 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <EuroIcon className="h-4 w-4 text-[#B15082]" />
                        Archivio Piani
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/lead-finder/archivio">
                    <Button
                      variant="outline"
                      className="w-full justify-between hover:bg-[#A2C054]/10 hover:border-[#A2C054]/40 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-[#A2C054]" strokeWidth={2.5} />
                        Archivio Lead
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Info Footer */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#115A23]/10 via-white to-[#115A23]/10 border-2 border-[#115A23]/20 p-6 shadow-natural">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-bold text-foreground text-base">LEO-FODI User Dashboard</p>
                <p className="text-sm text-muted-foreground">
                  Powered by <span className="font-semibold text-[#115A23]">FODI S.r.l.</span> •
                  © {new Date().getFullYear()}
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#115A23]/10 border border-[#115A23]/20">
                <div className="h-2 w-2 rounded-full bg-[#00d084] animate-pulse"></div>
                <span className="text-sm font-semibold text-[#115A23]">Sistema Attivo</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
