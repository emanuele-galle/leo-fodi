'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Database, Shield, CheckCircle } from 'lucide-react'

interface DataSourcesRadarProps {
  profileData: any
}

export function DataSourcesRadar({ profileData }: DataSourcesRadarProps) {
  // Calculate data completeness for each section
  const calculateCompleteness = (section: any): number => {
    if (!section) return 0

    let filledFields = 0
    let totalFields = 0

    const countFields = (obj: any): void => {
      if (!obj || typeof obj !== 'object') return

      Object.values(obj).forEach((value) => {
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value === 'object' && !Array.isArray(value)) {
            countFields(value)
          } else if (Array.isArray(value) && value.length > 0) {
            filledFields++
            totalFields++
          } else if (typeof value !== 'object') {
            filledFields++
            totalFields++
          }
        } else {
          totalFields++
        }
      })
    }

    countFields(section)
    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0
  }

  const radarData = [
    {
      section: 'Identità',
      completeness: calculateCompleteness(profileData?.target),
      fullMark: 100,
    },
    {
      section: 'Famiglia',
      completeness: calculateCompleteness(profileData?.family),
      fullMark: 100,
    },
    {
      section: 'Carriera',
      completeness: calculateCompleteness(profileData?.career),
      fullMark: 100,
    },
    {
      section: 'Lifestyle',
      completeness: calculateCompleteness(profileData?.lifestyle),
      fullMark: 100,
    },
    {
      section: 'Wealth',
      completeness: calculateCompleteness(profileData?.wealth || profileData?.fascia_economica),
      fullMark: 100,
    },
    {
      section: 'Social',
      completeness: calculateCompleteness(profileData?.social_graph),
      fullMark: 100,
    },
  ]

  const avgCompleteness = Math.round(
    radarData.reduce((sum, item) => sum + item.completeness, 0) / radarData.length
  )

  const dataSources = [
    {
      name: 'Social Media',
      active: !!(profileData?.digital_presence || profileData?.social_graph),
      color: 'bg-blue-500',
    },
    {
      name: 'Professional Networks',
      active: !!profileData?.career,
      color: 'bg-green-500',
    },
    {
      name: 'Public Records',
      active: !!(profileData?.family || profileData?.wealth),
      color: 'bg-purple-500',
    },
    {
      name: 'Content Analysis',
      active: !!profileData?.content_analysis,
      color: 'bg-amber-500',
    },
  ]

  const activeSources = dataSources.filter((s) => s.active).length

  return (
    <Card className="card-premium border-2 border-purple-200 shadow-soft overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-6">
        <h3 className="text-xl font-bold text-white drop-shadow-md flex items-center gap-2">
          <Database className="h-6 w-6" />
          Fonti Dati & Copertura
        </h3>
        <p className="text-white/90 text-sm mt-1">
          Analisi completezza per sezione del profilo
        </p>
      </div>

      <CardContent className="pt-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-xl border-2 border-purple-200"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-purple-200 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">Completezza Media</p>
                <p className="text-2xl font-bold text-purple-600">{avgCompleteness}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-4 rounded-xl border-2 border-indigo-200"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-indigo-200 flex items-center justify-center">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">Fonti Attive</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {activeSources}/{dataSources.length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Radar Chart */}
        <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Copertura Dati per Sezione
          </h4>

          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#cbd5e1" />
              <PolarAngleAxis
                dataKey="section"
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 10 }}
              />
              <Radar
                name="Completezza"
                dataKey="completeness"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
                animationBegin={0}
                animationDuration={1000}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Data Sources Status */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-800 text-sm">Stato Fonti Dati</h4>
          <div className="grid grid-cols-2 gap-3">
            {dataSources.map((source, index) => (
              <motion.div
                key={source.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`p-3 rounded-lg border-2 ${
                  source.active
                    ? 'bg-green-50 border-green-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      source.active ? source.color : 'bg-slate-300'
                    }`}
                  />
                  <span className="text-xs font-medium text-slate-700">
                    {source.name}
                  </span>
                </div>
                <Badge
                  variant={source.active ? 'default' : 'secondary'}
                  className="mt-2 text-xs"
                >
                  {source.active ? '✓ Attiva' : '○ Non disponibile'}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Confidence Score */}
        {profileData?.confidence_score && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Livello di Affidabilità Complessivo
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Basato su qualità e quantità dei dati raccolti
                </p>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {Math.round(profileData.confidence_score)}%
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
