'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Clock, Zap, TrendingUp } from 'lucide-react'

interface TimelineChartProps {
  tempoElaborazione: number // in milliseconds
  agentUsed: number
  dataCreazione: string
}

export function TimelineChart({
  tempoElaborazione,
  agentUsed,
  dataCreazione,
}: TimelineChartProps) {
  const tempoSecondi = (tempoElaborazione / 1000).toFixed(1)
  const tempoPerAgent = ((tempoElaborazione / 1000) / agentUsed).toFixed(1)

  // Simulated data for agent processing times
  const agentData = [
    { name: 'Identity', time: parseFloat((Math.random() * 3 + 1).toFixed(1)), color: '#3b82f6' },
    { name: 'Digital', time: parseFloat((Math.random() * 4 + 2).toFixed(1)), color: '#8b5cf6' },
    { name: 'Career', time: parseFloat((Math.random() * 3 + 1.5).toFixed(1)), color: '#10b981' },
    { name: 'Lifestyle', time: parseFloat((Math.random() * 2 + 1).toFixed(1)), color: '#f59e0b' },
    { name: 'Wealth', time: parseFloat((Math.random() * 3 + 1).toFixed(1)), color: '#ec4899' },
    { name: 'Social', time: parseFloat((Math.random() * 2.5 + 1).toFixed(1)), color: '#06b6d4' },
    { name: 'Content', time: parseFloat((Math.random() * 2 + 1).toFixed(1)), color: '#84cc16' },
  ]

  const getSpeedLevel = (seconds: number) => {
    if (seconds <= 10) return { label: 'Velocissimo', icon: '⚡', color: 'text-green-600' }
    if (seconds <= 20) return { label: 'Veloce', icon: '🚀', color: 'text-blue-600' }
    if (seconds <= 40) return { label: 'Normale', icon: '⏱️', color: 'text-yellow-600' }
    return { label: 'Lento', icon: '🐢', color: 'text-red-600' }
  }

  const speedLevel = getSpeedLevel(parseFloat(tempoSecondi))

  return (
    <Card className="card-premium border-2 border-orange-200 shadow-soft overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-6">
        <h3 className="text-xl font-bold text-white drop-shadow-md flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Performance Timeline
        </h3>
        <p className="text-white/90 text-sm mt-1">
          Analisi tempi di elaborazione per agent
        </p>
      </div>

      <CardContent className="pt-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 rounded-xl border-2 border-orange-200"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-orange-200 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">Tempo Totale</p>
                <p className="text-2xl font-bold text-orange-600">{tempoSecondi}s</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 rounded-xl border-2 border-amber-200"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-amber-200 flex items-center justify-center">
                <Zap className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">Media per Agent</p>
                <p className="text-2xl font-bold text-amber-600">{tempoPerAgent}s</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 p-4 rounded-xl border-2 border-yellow-200"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-yellow-200 flex items-center justify-center text-2xl">
                {speedLevel.icon}
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">Velocità</p>
                <p className={`text-lg font-bold ${speedLevel.color}`}>
                  {speedLevel.label}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bar Chart */}
        <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tempi per Agent AI
            </h4>
            <Badge variant="secondary" className="text-xs">
              {agentUsed} agent attivi
            </Badge>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                label={{ value: 'Secondi', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Bar dataKey="time" radius={[8, 8, 0, 0]} animationBegin={0} animationDuration={1000}>
                {agentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Creation Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-50 p-4 rounded-lg border-l-4 border-orange-500"
        >
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Profilo creato:</span>{' '}
            {new Date(dataCreazione).toLocaleString('it-IT', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </motion.div>
      </CardContent>
    </Card>
  )
}
