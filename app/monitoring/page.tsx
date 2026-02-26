'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Activity,
  TrendingUp,
  DollarSign,
  Database,
  Zap,
  AlertTriangle,
  RefreshCw,
  Trash2,
  CheckCircle2,
} from 'lucide-react'

interface MonitoringStats {
  cache: {
    size: number
    hits: number
    misses: number
    hitRate: number
    totalRequests: number
    savings: {
      requestsSaved: number
      costSaved: number
    }
  }
  costs: {
    today: {
      totalRequests: number
      cachedRequests: number
      billableRequests: number
      totalCost: number
      costSaved: number
    }
    month: {
      totalRequests: number
      cachedRequests: number
      billableRequests: number
      totalCost: number
      costSaved: number
    }
    budget: {
      limit: number
      used: number
      remaining: number
      percentUsed: number
      exceeded: boolean
    }
  }
}

export default function MonitoringPage() {
  const router = useRouter()
  const [stats, setStats] = useState<MonitoringStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/monitoring/stats')
      if (response.status === 401 || response.status === 403) {
        router.replace('/dashboard')
        return
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()

    if (autoRefresh) {
      const interval = setInterval(fetchStats, 5000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const clearCache = async () => {
    if (!confirm('Vuoi cancellare tutta la cache?')) return

    try {
      await fetch('/api/monitoring/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_cache' }),
      })
      fetchStats()
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  if (loading || !stats) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-white via-[#F8AC3D]/10 to-white flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#F8AC3D] to-[#e89f30] flex items-center justify-center mx-auto animate-pulse">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <p className="text-lg text-gray-600 font-medium">
              {loading ? 'Caricamento statistiche...' : 'Errore caricamento dati'}
            </p>
          </div>
        </div>
      </>
    )
  }

  const budgetPercentColor =
    stats.costs.budget.percentUsed < 50
      ? 'from-emerald-500 to-green-500'
      : stats.costs.budget.percentUsed < 80
        ? 'from-amber-500 to-yellow-500'
        : 'from-red-500 to-rose-500'

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-white via-[#F8AC3D]/10 to-white py-8 px-4">
        <div className="container mx-auto max-w-6xl space-y-8">
          {/* Hero Header - Arancione Leonardo */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#F8AC3D] via-[#e89f30] to-[#F8AC3D] p-8 md:p-12 shadow-deep">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-natural">
                    <Activity className="h-9 w-9 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                      Monitoraggio API
                    </h1>
                    <p className="text-white/80 text-sm font-medium">Dashboard costi e performance</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    variant="outline"
                    className={`h-12 backdrop-blur-sm border-2 rounded-xl font-semibold shadow-natural transition-all duration-200 ${
                      autoRefresh
                        ? 'bg-white/20 border-white/40 text-white hover:bg-white/30'
                        : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <RefreshCw className={`h-5 w-5 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} strokeWidth={2.5} />
                    {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                  </Button>
                  <Button
                    onClick={fetchStats}
                    className="h-12 bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white/30 rounded-xl font-semibold shadow-natural transition-all duration-200"
                  >
                    <RefreshCw className="h-5 w-5 mr-2" strokeWidth={2.5} />
                    Aggiorna
                  </Button>
                </div>
              </div>

              <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl">
                Monitora costi API in tempo reale con{' '}
                <span className="font-bold border-b-4 border-white/40">cache intelligente che taglia il 50% delle spese</span>
              </p>
            </div>
          </div>

          {/* Budget Alert */}
          {stats.costs.budget.percentUsed > 80 && (
            <Card className="border-2 border-red-500 bg-gradient-to-r from-red-50 to-rose-50 shadow-deep">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-natural">
                    <AlertTriangle className="h-7 w-7 text-white animate-pulse" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-red-900">Budget Alert!</h3>
                    <p className="text-red-700 font-medium">
                      Hai utilizzato il {stats.costs.budget.percentUsed.toFixed(1)}% del budget mensile
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Budget Overview - 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Budget Mensile */}
            <Card className="card-premium border-2 border-[#F8AC3D]/20 shadow-natural hover:shadow-deep transition-all duration-200">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#F8AC3D] to-[#e89f30] flex items-center justify-center shadow-natural mb-3">
                  <DollarSign className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <CardTitle className="text-lg">Budget Mensile</CardTitle>
                <CardDescription>Utilizzo corrente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-3xl font-bold text-[#F8AC3D]">
                      ${stats.costs.budget.used.toFixed(2)}
                    </span>
                    <span className="text-gray-500 mb-1">/ ${stats.costs.budget.limit}</span>
                  </div>
                  <Progress value={stats.costs.budget.percentUsed} className="h-2 mb-2" />
                  <p className="text-sm text-gray-600 font-medium">
                    {stats.costs.budget.percentUsed.toFixed(1)}% utilizzato
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-emerald-600 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Rimanenti: ${stats.costs.budget.remaining.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Risparmio Cache */}
            <Card className="card-premium border-2 border-emerald-500/20 shadow-natural hover:shadow-deep transition-all duration-200">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-natural mb-3">
                  <Database className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <CardTitle className="text-lg">Risparmio Cache</CardTitle>
                <CardDescription>Questo mese</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    ${stats.costs.month.costSaved.toFixed(2)}
                  </div>
                  <p className="text-gray-600">risparmiati questo mese</p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-700 font-medium">
                    <span className="font-bold text-emerald-600">{stats.costs.month.cachedRequests}</span> richieste dalla cache
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Cache Hit Rate */}
            <Card className="card-premium border-2 border-blue-500/20 shadow-natural hover:shadow-deep transition-all duration-200">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center shadow-natural mb-3">
                  <Zap className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <CardTitle className="text-lg">Cache Hit Rate</CardTitle>
                <CardDescription>Efficienza cache</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {stats.cache.hitRate.toFixed(1)}%
                  </div>
                  <p className="text-gray-600">efficienza cache</p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-700 font-medium">
                    <span className="font-bold text-blue-600">{stats.cache.hits}</span> hits /{' '}
                    <span className="font-bold text-orange-600">{stats.cache.misses}</span> misses
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today vs Month Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-premium border-2 border-[#F8AC3D]/20 shadow-deep">
              <CardHeader className="relative overflow-hidden bg-gradient-to-r from-[#F8AC3D]/20 via-[#F8AC3D]/10 to-transparent border-b-2 border-[#F8AC3D]/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#F8AC3D] to-[#e89f30] flex items-center justify-center shadow-natural">
                      <TrendingUp className="h-6 w-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-[#F8AC3D]">Oggi</CardTitle>
                      <CardDescription>Statistiche giornaliere</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-[#F8AC3D] text-white text-base px-3 py-1">
                    ${stats.costs.today.totalCost.toFixed(4)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Richieste Totali</span>
                  <span className="font-bold text-lg">{stats.costs.today.totalRequests}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Da Cache</span>
                  <span className="font-bold text-lg text-emerald-600">{stats.costs.today.cachedRequests}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Fatturabili</span>
                  <span className="font-bold text-lg text-[#F8AC3D]">{stats.costs.today.billableRequests}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-700 font-semibold">Risparmio</span>
                  <span className="font-bold text-xl text-emerald-600">${stats.costs.today.costSaved.toFixed(4)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium border-2 border-purple-500/20 shadow-deep">
              <CardHeader className="relative overflow-hidden bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-transparent border-b-2 border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-natural">
                      <TrendingUp className="h-6 w-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-purple-600">Questo Mese</CardTitle>
                      <CardDescription>Statistiche mensili</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-purple-600 text-white text-base px-3 py-1">
                    ${stats.costs.month.totalCost.toFixed(2)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Richieste Totali</span>
                  <span className="font-bold text-lg">{stats.costs.month.totalRequests}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Da Cache</span>
                  <span className="font-bold text-lg text-emerald-600">{stats.costs.month.cachedRequests}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Fatturabili</span>
                  <span className="font-bold text-lg text-purple-600">{stats.costs.month.billableRequests}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-700 font-semibold">Risparmio</span>
                  <span className="font-bold text-xl text-emerald-600">${stats.costs.month.costSaved.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cache Management */}
          <Card className="card-premium border-2 border-red-500/20 shadow-deep">
            <CardHeader className="relative overflow-hidden bg-gradient-to-r from-red-500/20 via-red-500/10 to-transparent border-b-2 border-red-500/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-natural">
                    <Database className="h-6 w-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-red-600">Gestione Cache</CardTitle>
                    <CardDescription>{stats.cache.size} entries in cache</CardDescription>
                  </div>
                </div>
                <Button
                  onClick={clearCache}
                  variant="destructive"
                  className="h-12 bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-deep hover:-translate-y-1 transition-all duration-200 px-6 rounded-xl font-semibold shadow-natural"
                >
                  <Trash2 className="h-5 w-5 mr-2" strokeWidth={2.5} />
                  Svuota Cache
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-5 card-premium bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{stats.cache.size}</div>
                  <div className="text-sm text-gray-600 font-medium">Entries Totali</div>
                </div>
                <div className="text-center p-5 card-premium bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
                  <div className="text-3xl font-bold text-emerald-600 mb-1">{stats.cache.hits}</div>
                  <div className="text-sm text-gray-600 font-medium">Cache Hits</div>
                </div>
                <div className="text-center p-5 card-premium bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                  <div className="text-3xl font-bold text-orange-600 mb-1">{stats.cache.misses}</div>
                  <div className="text-sm text-gray-600 font-medium">Cache Misses</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
