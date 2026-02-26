'use client'

/**
 * DataVisualization - Componenti visuali per dashboard OSINT
 *
 * Include:
 * - CircularProgress: Score circolari animati
 * - RadarChart: Grafici radar per competenze
 * - BarChart: Grafici a barre per comparazioni
 * - PieChart: Grafici a torta per distribuzioni
 * - StatBox: Box numerici evidenziati
 * - ProgressBar: Barre di progresso lineari
 */

import { designTokens } from '@/lib/design-tokens'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

// ========================================
// 📊 CIRCULAR PROGRESS (Score Circolare)
// ========================================

interface CircularProgressProps {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  showPercentage?: boolean
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  color = designTokens.colors.primary[500],
  label,
  showPercentage = true
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: designTokens.spacing.sm }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        {/* Background circle */}
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={designTokens.colors.neutral[200]}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: `stroke-dashoffset ${designTokens.animation.duration.slow} ${designTokens.animation.easing.easeOut}`
            }}
          />
        </svg>

        {/* Center text */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          {showPercentage && (
            <div style={{
              fontSize: designTokens.typography.fontSize['2xl'],
              fontWeight: designTokens.typography.fontWeight.bold,
              color: color
            }}>
              {value}
            </div>
          )}
        </div>
      </div>

      {label && (
        <span style={{
          fontSize: designTokens.typography.fontSize.sm,
          color: designTokens.colors.neutral[600],
          fontWeight: designTokens.typography.fontWeight.medium
        }}>
          {label}
        </span>
      )}
    </div>
  )
}

// ========================================
// 📈 PIE CHART (Grafico a Torta)
// ========================================

interface PieChartData {
  name: string
  value: number
  color?: string
}

interface CustomPieChartProps {
  data: PieChartData[]
  title?: string
  height?: number
}

const COLORS = [
  designTokens.colors.primary[500],
  designTokens.colors.secondary[500],
  designTokens.colors.osint.authority,
  designTokens.colors.osint.vision,
  designTokens.colors.osint.engagement,
  designTokens.colors.osint.lifestyle
]

export function CustomPieChart({ data, title, height = 300 }: CustomPieChartProps) {
  return (
    <div style={{ width: '100%' }}>
      {title && (
        <h4 style={{
          fontSize: designTokens.typography.fontSize.lg,
          fontWeight: designTokens.typography.fontWeight.semibold,
          color: designTokens.colors.neutral[800],
          marginBottom: designTokens.spacing.base,
          textAlign: 'center'
        }}>
          {title}
        </h4>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data as any}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// ========================================
// 📊 BAR CHART (Grafico a Barre)
// ========================================

interface BarChartData {
  name: string
  value: number
}

interface CustomBarChartProps {
  data: BarChartData[]
  title?: string
  color?: string
  height?: number
}

export function CustomBarChart({
  data,
  title,
  color = designTokens.colors.primary[500],
  height = 300
}: CustomBarChartProps) {
  return (
    <div style={{ width: '100%' }}>
      {title && (
        <h4 style={{
          fontSize: designTokens.typography.fontSize.lg,
          fontWeight: designTokens.typography.fontWeight.semibold,
          color: designTokens.colors.neutral[800],
          marginBottom: designTokens.spacing.base
        }}>
          {title}
        </h4>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ========================================
// 🎯 RADAR CHART (Grafico Radar)
// ========================================

interface RadarChartData {
  subject: string
  value: number
  fullMark: number
}

interface CustomRadarChartProps {
  data: RadarChartData[]
  title?: string
  color?: string
  height?: number
}

export function CustomRadarChart({
  data,
  title,
  color = designTokens.colors.primary[500],
  height = 300
}: CustomRadarChartProps) {
  return (
    <div style={{ width: '100%' }}>
      {title && (
        <h4 style={{
          fontSize: designTokens.typography.fontSize.lg,
          fontWeight: designTokens.typography.fontWeight.semibold,
          color: designTokens.colors.neutral[800],
          marginBottom: designTokens.spacing.base,
          textAlign: 'center'
        }}>
          {title}
        </h4>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis />
          <Radar name="Skills" dataKey="value" stroke={color} fill={color} fillOpacity={0.6} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ========================================
// 🔢 STAT BOX (Box Numerico Evidenziato)
// ========================================

interface StatBoxProps {
  value: string | number
  label: string
  icon?: React.ReactNode
  color?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}

export function StatBox({
  value,
  label,
  icon,
  color = designTokens.colors.primary[500],
  trend,
  trendValue
}: StatBoxProps) {
  const trendColors = {
    up: designTokens.colors.success.main,
    down: designTokens.colors.error.main,
    neutral: designTokens.colors.neutral[500]
  }

  return (
    <div style={{
      padding: designTokens.spacing.lg,
      background: `linear-gradient(135deg, ${color}08 0%, white 100%)`,
      borderRadius: designTokens.borderRadius.lg,
      border: `2px solid ${color}20`,
      boxShadow: designTokens.shadows.sm,
      transition: `all ${designTokens.animation.duration.base} ${designTokens.animation.easing.easeOut}`,
      cursor: 'default'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: designTokens.spacing.sm }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: designTokens.typography.fontSize['3xl'],
            fontWeight: designTokens.typography.fontWeight.bold,
            color: color,
            lineHeight: designTokens.typography.lineHeight.tight
          }}>
            {value}
          </div>
          <div style={{
            fontSize: designTokens.typography.fontSize.sm,
            color: designTokens.colors.neutral[600],
            fontWeight: designTokens.typography.fontWeight.medium,
            marginTop: designTokens.spacing.xs
          }}>
            {label}
          </div>
        </div>
        {icon && (
          <div style={{
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${color}15`,
            borderRadius: designTokens.borderRadius.lg,
            color: color
          }}>
            {icon}
          </div>
        )}
      </div>

      {trend && trendValue && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: designTokens.spacing.xs,
          fontSize: designTokens.typography.fontSize.xs,
          color: trendColors[trend],
          fontWeight: designTokens.typography.fontWeight.semibold
        }}>
          <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  )
}

// ========================================
// 📏 LINEAR PROGRESS BAR
// ========================================

interface LinearProgressProps {
  value: number // 0-100
  label?: string
  color?: string
  height?: number
  showPercentage?: boolean
}

export function LinearProgress({
  value,
  label,
  color = designTokens.colors.primary[500],
  height = 8,
  showPercentage = true
}: LinearProgressProps) {
  return (
    <div style={{ width: '100%' }}>
      {(label || showPercentage) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: designTokens.spacing.xs
        }}>
          {label && (
            <span style={{
              fontSize: designTokens.typography.fontSize.sm,
              color: designTokens.colors.neutral[700],
              fontWeight: designTokens.typography.fontWeight.medium
            }}>
              {label}
            </span>
          )}
          {showPercentage && (
            <span style={{
              fontSize: designTokens.typography.fontSize.sm,
              color: color,
              fontWeight: designTokens.typography.fontWeight.semibold
            }}>
              {value}%
            </span>
          )}
        </div>
      )}
      <div style={{
        width: '100%',
        height: `${height}px`,
        background: designTokens.colors.neutral[200],
        borderRadius: designTokens.borderRadius.full,
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${value}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`,
          borderRadius: designTokens.borderRadius.full,
          transition: `width ${designTokens.animation.duration.slow} ${designTokens.animation.easing.easeOut}`
        }} />
      </div>
    </div>
  )
}
