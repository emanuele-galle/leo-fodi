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
  Activity,
  AlertCircle,
  UserCheck,
  TrendingUp,
  Database,
  ArrowRight,
  Settings,
  FileText,
} from 'lucide-react'
import { EuroIcon } from '@/components/ui/euro-icon'
import { useAuth } from '@/components/auth/AuthProvider'

interface DashboardStats {
  totalClients: number
  totalProfiles: number
  totalFinancialPlans: number
  totalLeads: number
  pendingUsers: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalProfiles: 0,
    totalFinancialPlans: 0,
    totalLeads: 0,
    pendingUsers: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Redirect non-admin users to user dashboard
    if (!isAdmin) {
      router.push('/dashboard/user')
    } else {
      loadDashboardStats()
    }
  }, [isAdmin, router])

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/dashboard/admin-stats')
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      setStats({
        totalClients: data.totalClients || 0,
        totalProfiles: data.totalProfiles || 0,
        totalFinancialPlans: data.totalFinancialPlans || 0,
        totalLeads: data.totalLeads || 0,
        pendingUsers: data.pendingUsers || 0,
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Quick admin actions
  const adminActions = [
    {
      title: 'Approva Utenti',
      description: 'Gestisci richieste di accesso',
      href: '/dashboard/user-approvals',
      icon: UserCheck,
      color: 'from-[#575757] to-[#717579]',
      badge: stats.pendingUsers > 0 ? stats.pendingUsers : null,
    },
    {
      title: 'Monitoraggio AI',
      description: 'Token e costi API',
      href: '/monitoring/tokens',
      icon: Activity,
      color: 'from-[#F8AC3D] to-[#F8AC3D]',
    },
  ]

  // Main metrics with archives
  const metrics = [
    {
      title: 'Clienti Totali',
      value: stats.totalClients,
      icon: Users,
      color: 'from-[#115A23] to-[#1a7a32]',
      archiveHref: '/osint-profiler/archivio',
      description: 'Profili intelligence',
    },
    {
      title: 'Analisi OSINT',
      value: stats.totalProfiles,
      icon: Database,
      color: 'from-[#91BDE2] to-[#0693e3]',
      archiveHref: '/osint-profiler/archivio',
      description: 'Dati aggregati',
    },
    {
      title: 'Piani Finanziari',
      value: stats.totalFinancialPlans,
      icon: EuroIcon,
      color: 'from-[#B15082] to-[#FF2E5F]',
      archiveHref: '/financial-planner/archivio',
      description: 'Strategie AI',
    },
    {
      title: 'Lead Generati',
      value: stats.totalLeads,
      icon: Search,
      color: 'from-[#A2C054] to-[#8BA048]',
      archiveHref: '/lead-finder/archivio',
      description: 'Prospect qualificati',
    },
  ]

  if (!isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-white via-[#115A23]/5 to-white py-8 px-4">
        <main className="container mx-auto max-w-6xl space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#115A23] via-[#1a7a32] to-[#238238] p-8 md:p-12 shadow-deep">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl"></div>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-natural">
                  <Settings className="h-7 w-7 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">Dashboard Admin</h1>
                  <p className="text-white/80 text-sm font-medium">Gestione e monitoraggio piattaforma</p>
                </div>
              </div>

              <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl">
                Controlla l'intero sistema, approva utenti e monitora performance
              </p>
            </div>
          </div>

          {/* Pending Users Alert */}
          {stats.pendingUsers > 0 && (
            <div className="relative overflow-hidden rounded-2xl bg-[#fcb900]/10 border-2 border-[#fcb900] p-6 shadow-natural">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-[#fcb900] to-[#f5a623] flex items-center justify-center shadow-natural">
                    <div className="absolute inset-0 bg-[#fcb900]/30 rounded-xl animate-ping"></div>
                    <AlertCircle className="relative h-7 w-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-foreground">
                      Nuove Richieste di Accesso
                    </h3>
                    <p className="text-sm text-foreground/80 mt-1 font-medium">
                      {stats.pendingUsers} {stats.pendingUsers === 1 ? 'utente in attesa' : 'utenti in attesa'} di approvazione
                    </p>
                  </div>
                </div>
                <Link href="/dashboard/user-approvals">
                  <Button className="h-12 bg-gradient-to-r from-[#115A23] to-[#1a7a32] text-white hover:shadow-deep hover:-translate-y-1 transition-all duration-200 px-6 rounded-xl font-semibold text-base shadow-natural">
                    <UserCheck className="h-5 w-5 mr-2" strokeWidth={2.5} />
                    Gestisci Ora
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Admin Actions */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Settings className="h-6 w-6 text-[#115A23]" strokeWidth={2.5} />
              Azioni Amministrative
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {adminActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.href} href={action.href}>
                    <div className="group relative overflow-hidden rounded-2xl bg-white border-2 border-border p-6 shadow-natural hover:shadow-deep hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-natural group-hover:scale-110 transition-transform duration-200`}>
                            <Icon className="h-7 w-7 text-white" strokeWidth={2.5} />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground mb-1 text-lg">{action.title}</h3>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                          </div>
                        </div>
                        {action.badge && (
                          <div className="h-8 w-8 rounded-full bg-[#FF2E5F] text-white flex items-center justify-center font-bold text-sm shadow-natural">
                            {action.badge}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center text-sm font-semibold text-[#115A23] mt-4">
                        Accedi
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-2 transition-transform duration-200" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Platform Metrics */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-[#115A23]" strokeWidth={2.5} />
              Metriche Piattaforma
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {metrics.map((metric) => {
                const Icon = metric.icon
                return (
                  <Link key={metric.title} href={metric.archiveHref}>
                    <Card className="relative overflow-hidden border-2 shadow-natural hover:shadow-deep hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
                      <CardHeader className="pb-3">
                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center shadow-natural mb-3`}>
                          <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                        </div>
                        <CardTitle className="text-base font-semibold">{metric.title}</CardTitle>
                        <CardDescription className="text-xs">{metric.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-4xl font-bold text-foreground mb-2">
                          {isLoading ? '...' : metric.value}
                        </p>
                        <div className="flex items-center text-xs font-semibold text-muted-foreground">
                          <FileText className="h-3 w-3 mr-1" strokeWidth={2.5} />
                          Vedi archivio
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

          {/* Info Footer */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#115A23]/10 via-white to-[#115A23]/10 border-2 border-[#115A23]/20 p-6 shadow-natural">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-bold text-foreground text-base">LEO-FODI Admin Panel</p>
                <p className="text-sm text-muted-foreground">
                  Powered by <span className="font-semibold text-[#115A23]">FODI S.r.l.</span> • © {new Date().getFullYear()}
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#115A23]/10 border border-[#115A23]/20">
                <div className="h-2 w-2 rounded-full bg-[#00d084] animate-pulse"></div>
                <span className="text-sm font-semibold text-[#115A23]">Sistema Operativo</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
