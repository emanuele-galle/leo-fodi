'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb, Target, AlertTriangle, TrendingUp } from 'lucide-react'

interface UserStats {
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
}

interface InsightsPanelProps {
  stats: UserStats
}

export function InsightsPanel({ stats }: InsightsPanelProps) {
  // Genera insights basati sui dati
  const insights = generateInsights(stats)

  return (
    <Card className="border-2 shadow-natural">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#fcb900] to-[#f5a623] flex items-center justify-center shadow-natural">
            <Lightbulb className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <CardTitle className="text-lg">Insights AI</CardTitle>
            <CardDescription className="text-xs">Raccomandazioni personalizzate</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border-2 ${
              insight.type === 'success'
                ? 'bg-green-50 border-green-200'
                : insight.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-200'
                  : insight.type === 'info'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-purple-50 border-purple-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  insight.type === 'success'
                    ? 'bg-green-100'
                    : insight.type === 'warning'
                      ? 'bg-yellow-100'
                      : insight.type === 'info'
                        ? 'bg-blue-100'
                        : 'bg-purple-100'
                }`}
              >
                <insight.icon
                  className={`h-4 w-4 ${
                    insight.type === 'success'
                      ? 'text-green-600'
                      : insight.type === 'warning'
                        ? 'text-yellow-600'
                        : insight.type === 'info'
                          ? 'text-blue-600'
                          : 'text-purple-600'
                  }`}
                  strokeWidth={2.5}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground mb-1">{insight.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        ))}

        {insights.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Continua a lavorare per ricevere insights personalizzati
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function generateInsights(stats: UserStats) {
  const insights: Array<{
    type: 'success' | 'warning' | 'info' | 'tip'
    title: string
    description: string
    icon: any
  }> = []

  // Insight 1: Performance settimana corrente
  if (stats.currentWeek.clients > 0 || stats.currentWeek.profiles > 0) {
    insights.push({
      type: 'success',
      title: 'Ottima Settimana!',
      description: `Hai aggiunto ${stats.currentWeek.clients} nuovi clienti e creato ${stats.currentWeek.profiles} profili questa settimana. Continua così!`,
      icon: TrendingUp,
    })
  }

  // Insight 2: Mancanza di piani finanziari
  if (stats.totals.profiles > 0 && stats.totals.plans === 0) {
    insights.push({
      type: 'warning',
      title: 'Nessun Piano Finanziario',
      description:
        'Hai profili OSINT ma non hai ancora creato piani finanziari. Trasforma le tue analisi in strategie concrete!',
      icon: AlertTriangle,
    })
  } else if (stats.totals.profiles > stats.totals.plans * 2) {
    insights.push({
      type: 'info',
      title: 'Opportunità di Conversione',
      description: `Hai ${stats.totals.profiles - stats.totals.plans} profili senza piano finanziario. Considera di completarli per massimizzare il valore.`,
      icon: Target,
    })
  }

  // Insight 3: Lead generation
  if (stats.currentMonth.leads === 0 && stats.totals.leads < 10) {
    insights.push({
      type: 'tip',
      title: 'Espandi la Tua Pipeline',
      description:
        'Genera nuovi lead con il Lead Finder per ampliare il tuo portafoglio clienti e aumentare le opportunità di business.',
      icon: Lightbulb,
    })
  }

  // Insight 4: Alta produttività
  if (
    stats.currentMonth.clients >= 10 ||
    stats.currentMonth.profiles >= 5 ||
    stats.currentMonth.plans >= 5
  ) {
    insights.push({
      type: 'success',
      title: 'Alta Produttività',
      description:
        'Stai mantenendo un ritmo eccellente questo mese! La tua costanza sta costruendo un solido portafoglio.',
      icon: TrendingUp,
    })
  }

  // Insight 5: Primo cliente (per nuovi utenti)
  if (stats.totals.clients === 1 && stats.totals.profiles === 0) {
    insights.push({
      type: 'tip',
      title: 'Primo Cliente Aggiunto!',
      description:
        'Ottimo inizio! Ora crea un profilo OSINT completo per questo cliente per scoprire insight strategici.',
      icon: Target,
    })
  }

  // Insight 6: Bilanciamento attività
  const clientToProfileRatio =
    stats.totals.clients > 0 ? stats.totals.profiles / stats.totals.clients : 0
  if (clientToProfileRatio < 0.5 && stats.totals.clients >= 5) {
    insights.push({
      type: 'info',
      title: 'Completa i Profili',
      description: `Hai ${stats.totals.clients} clienti ma solo ${stats.totals.profiles} profili OSINT. Completa le analisi per una visione più completa.`,
      icon: Target,
    })
  }

  return insights
}
