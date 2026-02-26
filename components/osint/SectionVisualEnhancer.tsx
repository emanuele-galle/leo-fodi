'use client'

/**
 * SectionVisualEnhancer - Helper component per aggiungere visual layer a sezioni OSINT
 *
 * Genera automaticamente StatBoxes e visualizzazioni per qualsiasi sezione della dashboard
 * basandosi sulla configurazione fornita.
 */

import { StatBox, LinearProgress } from './DataVisualization'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { designTokens } from '@/lib/design-tokens'
import { ReactNode } from 'react'

interface StatConfig {
  value: string | number
  label: string
  icon: ReactNode
  condition?: boolean
}

interface ProgressConfig {
  value: number
  label: string
  condition?: boolean
}

interface SectionVisualEnhancerProps {
  stats: StatConfig[]
  progressBars?: ProgressConfig[]
  color: string
  progressTitle?: string
  children?: ReactNode
}

export function SectionVisualEnhancer({
  stats,
  progressBars,
  color,
  progressTitle,
  children
}: SectionVisualEnhancerProps) {
  const visibleStats = stats.filter(s => s.condition !== false)
  const visibleProgressBars = progressBars?.filter(p => p.condition !== false) || []

  return (
    <div style={{ display: 'grid', gap: designTokens.spacing.xl }}>
      {/* Stats Row */}
      {visibleStats.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: designTokens.spacing.base
        }}>
          {visibleStats.map((stat, i) => (
            <StatBox
              key={i}
              value={stat.value}
              label={stat.label}
              icon={stat.icon}
              color={color}
            />
          ))}
        </div>
      )}

      {/* Progress Bars Card */}
      {visibleProgressBars.length > 0 && (
        <Card style={{
          borderLeft: `4px solid ${color}`,
          boxShadow: designTokens.shadows.md
        }}>
          <CardHeader>
            <CardTitle style={{
              fontSize: designTokens.typography.fontSize.lg,
              fontWeight: designTokens.typography.fontWeight.semibold,
              color: designTokens.colors.neutral[800]
            }}>
              {progressTitle || 'Dettagli'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gap: designTokens.spacing.base }}>
              {visibleProgressBars.map((bar, i) => (
                <LinearProgress
                  key={i}
                  value={bar.value}
                  label={bar.label}
                  color={color}
                  showPercentage={false}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Original Content */}
      {children}
    </div>
  )
}
