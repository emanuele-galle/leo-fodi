'use client'

/**
 * ConfidenceIndicator - Visualizza quality score con interpretazione completa
 *
 * Trasforma un numero (0-100) in informazioni actionable per l'utente
 */

import { Badge } from '@/components/ui/badge'
import { interpretConfidenceScore } from '@/lib/osint/data-interpreters'
import { Info } from 'lucide-react'

interface ConfidenceIndicatorProps {
  score: number
  sources: string[]
  className?: string
}

export function ConfidenceIndicator({ score, sources, className = '' }: ConfidenceIndicatorProps) {
  const quality = interpretConfidenceScore(score)

  return (
    <div
      className={className}
      style={{
        padding: '1.25rem',
        background: `${quality.color}10`,
        border: `2px solid ${quality.color}`,
        borderRadius: '12px',
        marginTop: '1rem'
      }}
    >
      {/* Header con score e livello */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '2rem' }}>{quality.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <strong style={{ color: quality.color, fontSize: '1.125rem' }}>
              {quality.level}
            </strong>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: quality.color }}>
              {score}/100
            </span>
          </div>
        </div>
      </div>

      {/* Barra visuale */}
      <div style={{
        height: '8px',
        background: '#e2e8f0',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '1rem'
      }}>
        <div style={{
          height: '100%',
          width: `${score}%`,
          background: quality.color,
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Spiegazione significato */}
      <div style={{
        padding: '0.75rem',
        background: 'white',
        borderRadius: '8px',
        marginBottom: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
          <Info className="h-4 w-4" style={{ color: quality.color, marginTop: '0.125rem', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '0.5rem' }}>
              <strong>Cosa significa:</strong> {quality.meaning}
            </p>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#64748b' }}>
              <strong>Affidabilità:</strong> {quality.reliability}
            </p>
          </div>
        </div>
      </div>

      {/* Azione consigliata */}
      <div style={{
        padding: '0.75rem',
        background: 'white',
        borderRadius: '8px',
        marginBottom: '0.75rem',
        borderLeft: `4px solid ${quality.color}`
      }}>
        <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>
          💡 Cosa fare:
        </p>
        <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#64748b' }}>
          {quality.actions}
        </p>
      </div>

      {/* Fonti consultate */}
      {sources && sources.length > 0 && (
        <div style={{
          paddingTop: '0.75rem',
          borderTop: '1px solid #e2e8f0'
        }}>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '600' }}>
            📚 Fonti utilizzate per questa analisi:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {sources.map((source, i) => (
              <Badge key={i} variant="secondary" style={{ fontSize: '0.7rem' }}>
                {source}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
