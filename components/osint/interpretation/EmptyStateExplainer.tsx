'use client'

/**
 * EmptyStateExplainer - Spiega PERCHÉ un dato non è disponibile e COME ottenerlo
 *
 * Trasforma "Non disponibile" in informazione actionable
 */

import { getEmptyStateExplanation } from '@/lib/osint/data-interpreters'
import { AlertCircle, Lightbulb, TrendingUp } from 'lucide-react'

interface EmptyStateExplainerProps {
  field: string
  context?: string
  compact?: boolean
}

export function EmptyStateExplainer({ field, context, compact = false }: EmptyStateExplainerProps) {
  const explanation = getEmptyStateExplanation(field, context)

  const urgencyColors = {
    low: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
    medium: { bg: '#fef3c7', border: '#f59e0b', text: '#78350f' },
    high: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' }
  }

  const colors = urgencyColors[explanation.urgency]

  if (compact) {
    return (
      <div style={{
        padding: '0.75rem',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        fontSize: '0.875rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
          <AlertCircle className="h-4 w-4" style={{ color: colors.border, marginTop: '0.125rem', flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: '600', color: colors.text, marginBottom: '0.25rem' }}>
              {explanation.title}
            </p>
            <p style={{ color: colors.text, opacity: 0.9 }}>
              {explanation.reason}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      padding: '1.25rem',
      background: colors.bg,
      border: `2px solid ${colors.border}`,
      borderRadius: '12px',
      marginTop: '1rem'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{
          padding: '0.5rem',
          background: 'white',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AlertCircle className="h-6 w-6" style={{ color: colors.border }} />
        </div>
        <h4 style={{ fontWeight: '700', color: colors.text, fontSize: '1.125rem', margin: 0 }}>
          {explanation.title}
        </h4>
      </div>

      {/* Motivo */}
      <div style={{
        padding: '0.875rem',
        background: 'white',
        borderRadius: '8px',
        marginBottom: '0.75rem'
      }}>
        <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: colors.text }}>
          🤔 Perché non è disponibile:
        </p>
        <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#64748b' }}>
          {explanation.reason}
        </p>
      </div>

      {/* Impatto */}
      <div style={{
        padding: '0.875rem',
        background: 'white',
        borderRadius: '8px',
        marginBottom: '0.75rem',
        borderLeft: `4px solid ${colors.border}`
      }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
          <TrendingUp className="h-4 w-4" style={{ color: colors.border, marginTop: '0.25rem', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: colors.text }}>
              Perché è importante:
            </p>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#64748b' }}>
              {explanation.impact}
            </p>
          </div>
        </div>
      </div>

      {/* Come migliorare */}
      <div style={{
        padding: '0.875rem',
        background: '#f0fdf4',
        borderRadius: '8px',
        border: '1px dashed #6ee7b7'
      }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
          <Lightbulb className="h-4 w-4" style={{ color: '#10b981', marginTop: '0.25rem', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#065f46' }}>
              💡 Come ottenere questo dato:
            </p>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#065f46' }}>
              {explanation.howToImprove}
            </p>
          </div>
        </div>
      </div>

      {/* Urgency badge */}
      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
          Urgenza:
        </span>
        <span style={{
          padding: '0.25rem 0.75rem',
          background: colors.border,
          color: 'white',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600'
        }}>
          {explanation.urgency === 'high' && '🔴 Alta'}
          {explanation.urgency === 'medium' && '🟡 Media'}
          {explanation.urgency === 'low' && '🟢 Bassa'}
        </span>
      </div>
    </div>
  )
}
