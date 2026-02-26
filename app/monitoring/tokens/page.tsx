'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Activity,
  Euro,
  Zap,
  TrendingUp,
  Clock,
  Database,
  Loader2,
  RefreshCw,
  Calendar,
} from 'lucide-react'

interface SectionStats {
  section: string
  requests_count: number
  total_tokens: number
  total_cost: number
  avg_execution_time_ms: number
  last_request_at: string
}

export default function AITokenMonitoringPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentMonthStats, setCurrentMonthStats] = useState<SectionStats[]>([])
  const [overallStats, setOverallStats] = useState({
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    avgExecutionTime: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setIsLoading(true)

      // Load current month summary via API route
      const res = await fetch('/api/monitoring/tokens')
      const json = await res.json()
      const monthSummary = json.success ? json.data : null
      if (monthSummary) {
        setCurrentMonthStats(monthSummary.filter((s: any) => s.section !== null) as SectionStats[])

        // Calculate overall stats
        const overall = {
          totalRequests: monthSummary.reduce((sum: number, item: any) => sum + (item.requests_count || 0), 0),
          totalTokens: monthSummary.reduce((sum: number, item: any) => sum + (item.total_tokens || 0), 0),
          totalCost: monthSummary.reduce((sum: number, item: any) => sum + (item.total_cost || 0), 0),
          avgExecutionTime: monthSummary.length > 0
            ? monthSummary.reduce((sum: number, item: any) => sum + (item.avg_execution_time_ms || 0), 0) / monthSummary.length
            : 0,
        }
        setOverallStats(overall)
      }
    } catch (error) {
      console.error('Error loading AI token stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSectionLabel = (section: string) => {
    const labels: Record<string, string> = {
      lead_finder: 'Lead Finder',
      osint_profiling: 'OSINT Profiling',
      financial_planning: 'Financial Planning',
      other: 'Altro',
    }
    return labels[section] || section
  }

  const getSectionColor = (section: string) => {
    const colors: Record<string, string> = {
      lead_finder: 'from-blue-500 to-blue-600',
      osint_profiling: 'from-purple-500 to-purple-600',
      financial_planning: 'from-emerald-500 to-emerald-600',
      other: 'from-gray-500 to-gray-600',
    }
    return colors[section] || 'from-gray-500 to-gray-600'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('it-IT').format(Math.round(num))
  }

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 4,
    }).format(cost)
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50/40 via-gray-50/30 to-zinc-50/20 py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-7xl space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-gray-700 to-zinc-800 bg-clip-text text-transparent flex items-center gap-3 sm:gap-4 drop-shadow-sm">
                <Activity className="h-10 w-10 sm:h-12 sm:w-12 text-slate-700" />
                Monitoraggio Token AI
              </h1>
              <p className="text-base sm:text-lg text-gray-700 mt-2">
                Analisi consumo token e costi per sezione applicativa (Mese Corrente)
              </p>
            </div>
            <Button
              variant="outline"
              onClick={loadStats}
              disabled={isLoading}
              className="shadow-sm hover:shadow-md transition-all"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Aggiorna
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-12 w-12 animate-spin text-slate-600" />
          </div>
        ) : (
          <>
            {/* Overall Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="card-depth hover-lift border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Richieste Totali</p>
                      <p className="text-3xl font-bold text-primary">
                        {formatNumber(overallStats.totalRequests)}
                      </p>
                    </div>
                    <Database className="h-10 w-10 text-primary/40" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-depth hover-lift border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Token Totali</p>
                      <p className="text-3xl font-bold text-primary">
                        {formatNumber(overallStats.totalTokens)}
                      </p>
                    </div>
                    <Zap className="h-10 w-10 text-primary/40" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-depth hover-lift border border-success/20 bg-gradient-to-br from-success/5 to-success/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Costo Totale</p>
                      <p className="text-3xl font-bold text-success">
                        {formatCost(overallStats.totalCost)}
                      </p>
                    </div>
                    <Euro className="h-10 w-10 text-success/40" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-depth hover-lift border border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tempo Medio</p>
                      <p className="text-3xl font-bold text-warning">
                        {formatNumber(overallStats.avgExecutionTime)}
                        <span className="text-lg text-gray-600 ml-1">ms</span>
                      </p>
                    </div>
                    <Clock className="h-10 w-10 text-warning/40" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Section Breakdown Table */}
            <Card className="card-depth border border-slate-600/10">
              <CardHeader className="bg-gradient-to-r from-slate-50/50 to-transparent">
                <CardTitle className="text-xl sm:text-2xl text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  Breakdown per Sezione
                </CardTitle>
                <CardDescription>
                  Dettaglio consumo token e costi suddivisi per area applicativa
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {currentMonthStats.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessuna attività AI registrata per il mese corrente</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sezione</TableHead>
                        <TableHead className="text-right">Richieste</TableHead>
                        <TableHead className="text-right">Token Totali</TableHead>
                        <TableHead className="text-right">Costo Totale</TableHead>
                        <TableHead className="text-right">Tempo Medio (ms)</TableHead>
                        <TableHead>Ultima Richiesta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentMonthStats.map((stat) => (
                        <TableRow key={stat.section}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full bg-gradient-to-r ${getSectionColor(stat.section)}`}
                              />
                              <span className="font-medium">{getSectionLabel(stat.section)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatNumber(stat.requests_count)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary" className="font-mono">
                              {formatNumber(stat.total_tokens)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-emerald-700">
                            {formatCost(stat.total_cost)}
                          </TableCell>
                          <TableCell className="text-right text-orange-600">
                            {formatNumber(stat.avg_execution_time_ms)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {formatDate(stat.last_request_at)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Cost Distribution */}
            <Card className="card-depth border border-slate-600/10">
              <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-transparent">
                <CardTitle className="text-xl sm:text-2xl text-slate-800 flex items-center gap-2">
                  <Euro className="h-6 w-6" />
                  Distribuzione Costi per Sezione
                </CardTitle>
                <CardDescription>Visualizzazione percentuale del consumo di costi AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentMonthStats.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Nessun dato disponibile</div>
                ) : (
                  currentMonthStats.map((stat) => {
                    const percentage = overallStats.totalCost > 0
                      ? (stat.total_cost / overallStats.totalCost) * 100
                      : 0

                    return (
                      <div key={stat.section} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{getSectionLabel(stat.section)}</span>
                          <span className="text-gray-600">
                            {formatCost(stat.total_cost)} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getSectionColor(stat.section)} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>

            {/* Info Panel */}
            <Card className="card-depth border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      <strong>Nota:</strong> I dati mostrati si riferiscono al mese corrente e
                      includono solo le richieste completate con successo.
                    </p>
                    <p>
                      Le sezioni monitorate sono: <strong>Lead Finder</strong> (estrazione lead da
                      fonti esterne), <strong>OSINT Profiling</strong> (profilazione avanzata
                      clienti), e <strong>Financial Planning</strong> (pianificazione finanziaria
                      personalizzata).
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Provider AI: XAI (Grok Beta) | Costi calcolati in tempo reale
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        </div>
      </div>
    </>
  )
}
