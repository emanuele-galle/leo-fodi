'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface TrendDataPoint {
  month_start: string
  clients_count: number
  profiles_count: number
  plans_count: number
  leads_count: number
}

interface TrendChartProps {
  data: TrendDataPoint[]
  title?: string
  description?: string
}

export function TrendChart({ data, title = 'Trend Mensile', description }: TrendChartProps) {
  // Calcola valori massimi per scaling
  const maxValues = useMemo(() => {
    if (!data.length) return { clients: 1, profiles: 1, plans: 1, leads: 1 }

    return {
      clients: Math.max(...data.map((d) => d.clients_count), 1),
      profiles: Math.max(...data.map((d) => d.profiles_count), 1),
      plans: Math.max(...data.map((d) => d.plans_count), 1),
      leads: Math.max(...data.map((d) => d.leads_count), 1),
    }
  }, [data])

  // Calcola trend (confronto primo vs ultimo mese)
  const trend = useMemo(() => {
    if (data.length < 2) return { direction: 'neutral', percentage: 0 }

    const latest = data[0]
    const previous = data[1]

    const latestTotal =
      latest.clients_count + latest.profiles_count + latest.plans_count + latest.leads_count
    const previousTotal =
      previous.clients_count + previous.profiles_count + previous.plans_count + previous.leads_count

    if (previousTotal === 0) return { direction: 'up', percentage: 100 }

    const diff = latestTotal - previousTotal
    const percentage = Math.abs((diff / previousTotal) * 100).toFixed(1)

    return {
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
      percentage: parseFloat(percentage),
    }
  }, [data])

  // Formatta mese
  const formatMonth = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' })
  }

  if (!data.length) {
    return (
      <Card className="border-2 shadow-natural">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nessun dato disponibile</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 shadow-natural">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription className="text-xs">{description}</CardDescription>}
          </div>
          {trend.direction !== 'neutral' && (
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                trend.direction === 'up'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="h-4 w-4" strokeWidth={2.5} />
              ) : (
                <TrendingDown className="h-4 w-4" strokeWidth={2.5} />
              )}
              {trend.percentage}%
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart Area */}
        <div className="relative h-48 flex items-end gap-2">
          {data
            .slice()
            .reverse()
            .map((point, index) => {
              const totalHeight =
                ((point.clients_count +
                  point.profiles_count +
                  point.plans_count +
                  point.leads_count) /
                  (maxValues.clients + maxValues.profiles + maxValues.plans + maxValues.leads)) *
                100

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  {/* Stacked Bar */}
                  <div className="w-full flex flex-col-reverse items-stretch gap-0.5">
                    {/* Leads */}
                    {point.leads_count > 0 && (
                      <div
                        className="w-full bg-gradient-to-t from-[#A2C054] to-[#8BA048] rounded-t transition-all duration-300 hover:opacity-80"
                        style={{
                          height: `${(point.leads_count / maxValues.leads) * 100}px`,
                          minHeight: point.leads_count > 0 ? '4px' : '0',
                        }}
                        title={`Lead: ${point.leads_count}`}
                      />
                    )}
                    {/* Plans */}
                    {point.plans_count > 0 && (
                      <div
                        className="w-full bg-gradient-to-t from-[#B15082] to-[#FF2E5F] transition-all duration-300 hover:opacity-80"
                        style={{
                          height: `${(point.plans_count / maxValues.plans) * 100}px`,
                          minHeight: point.plans_count > 0 ? '4px' : '0',
                        }}
                        title={`Piani: ${point.plans_count}`}
                      />
                    )}
                    {/* Profiles */}
                    {point.profiles_count > 0 && (
                      <div
                        className="w-full bg-gradient-to-t from-[#91BDE2] to-[#0693e3] transition-all duration-300 hover:opacity-80"
                        style={{
                          height: `${(point.profiles_count / maxValues.profiles) * 100}px`,
                          minHeight: point.profiles_count > 0 ? '4px' : '0',
                        }}
                        title={`Profili: ${point.profiles_count}`}
                      />
                    )}
                    {/* Clients */}
                    {point.clients_count > 0 && (
                      <div
                        className="w-full bg-gradient-to-t from-[#115A23] to-[#1a7a32] rounded-b transition-all duration-300 hover:opacity-80"
                        style={{
                          height: `${(point.clients_count / maxValues.clients) * 100}px`,
                          minHeight: point.clients_count > 0 ? '4px' : '0',
                        }}
                        title={`Clienti: ${point.clients_count}`}
                      />
                    )}
                  </div>
                  {/* Label */}
                  <p className="text-xs font-semibold text-muted-foreground">
                    {formatMonth(point.month_start)}
                  </p>
                </div>
              )
            })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-gradient-to-br from-[#115A23] to-[#1a7a32] shadow-sm" />
            <span className="text-xs font-medium text-foreground">Clienti</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-gradient-to-br from-[#91BDE2] to-[#0693e3] shadow-sm" />
            <span className="text-xs font-medium text-foreground">Profili</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-gradient-to-br from-[#B15082] to-[#FF2E5F] shadow-sm" />
            <span className="text-xs font-medium text-foreground">Piani</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-gradient-to-br from-[#A2C054] to-[#8BA048] shadow-sm" />
            <span className="text-xs font-medium text-foreground">Lead</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
