'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface ProfileScoreCardProps {
  punteggio: number
  completezza: number
  agentUsed: number
  totalAgents: number
}

export function ProfileScoreCard({
  punteggio,
  completezza,
  agentUsed,
  totalAgents,
}: ProfileScoreCardProps) {
  const data = [
    { name: 'Punteggio', value: punteggio, color: '#3b82f6' },
    { name: 'Completezza', value: completezza, color: '#10b981' },
    {
      name: 'Agent Coverage',
      value: Math.round((agentUsed / totalAgents) * 100),
      color: '#8b5cf6',
    },
  ]

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { label: 'Eccellente', color: 'text-green-600' }
    if (score >= 60) return { label: 'Buono', color: 'text-blue-600' }
    if (score >= 40) return { label: 'Sufficiente', color: 'text-yellow-600' }
    return { label: 'Da migliorare', color: 'text-red-600' }
  }

  const scoreLevel = getScoreLevel(punteggio)

  return (
    <Card className="card-premium border-2 border-blue-200 shadow-soft overflow-hidden">
      <div className="gradient-cool p-6">
        <h3 className="text-xl font-bold text-white drop-shadow-md">
          📊 Analisi Punteggio Complessivo
        </h3>
        <p className="text-white/90 text-sm mt-1">
          Valutazione completa del profilo OSINT
        </p>
      </div>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Section */}
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Section */}
          <div className="space-y-4">
            {/* Punteggio Principale */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border-2 border-blue-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">
                  Punteggio Complessivo
                </span>
                <span className={`text-xs font-bold ${scoreLevel.color}`}>
                  {scoreLevel.label}
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {punteggio}
                </span>
                <span className="text-lg text-slate-600 mb-1">/100</span>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-blue-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${punteggio}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                />
              </div>
            </motion.div>

            {/* Completezza */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-50 to-green-100/50 p-4 rounded-xl border-2 border-green-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">
                  Completezza Profilo
                </span>
                <span className="text-xs font-bold text-green-600">
                  {completezza >= 80 ? '✓ Completo' : '○ In Progress'}
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {completezza}
                </span>
                <span className="text-lg text-slate-600 mb-1">%</span>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-green-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completezza}%` }}
                  transition={{ delay: 0.6, duration: 1 }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                />
              </div>
            </motion.div>

            {/* Agent Coverage */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-xl border-2 border-purple-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">
                  Agent AI Utilizzati
                </span>
                <span className="text-xs font-bold text-purple-600">
                  {agentUsed}/{totalAgents}
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  {Math.round((agentUsed / totalAgents) * 100)}
                </span>
                <span className="text-lg text-slate-600 mb-1">%</span>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-purple-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(agentUsed / totalAgents) * 100}%` }}
                  transition={{ delay: 0.7, duration: 1 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-violet-600"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
