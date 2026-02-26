'use client'

/**
 * InteractivePriorityBadge - Badge interattivo che spiega le priorità
 *
 * Trasforma "Alta/Media/Bassa" in strategia actionable
 */

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { interpretPriority } from '@/lib/osint/data-interpreters'
import { Info, Clock, Target } from 'lucide-react'

interface InteractivePriorityBadgeProps {
  priority: string
  context?: string
  showDetails?: boolean
}

export function InteractivePriorityBadge({
  priority,
  context = "generico",
  showDetails = false
}: InteractivePriorityBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails)
  const interpretation = interpretPriority(priority, context)

  const handleClick = () => {
    if (!showDetails) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <div>
      {/* Badge cliccabile */}
      <Badge
        style={{
          background: interpretation.color,
          color: 'white',
          cursor: showDetails ? 'default' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.5rem 0.875rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          transition: 'all 0.2s'
        }}
        onClick={handleClick}
      >
        <span>{interpretation.icon}</span>
        <span>{priority === 'alta' ? 'URGENTE' : priority === 'media' ? 'IMPORTANTE' : 'PROGRAMMABILE'}</span>
        {!showDetails && (
          <Info className="h-3.5 w-3.5" style={{ opacity: 0.8 }} />
        )}
      </Badge>

      {/* Dettagli espansi */}
      {isExpanded && (
        <div style={{
          marginTop: '0.75rem',
          padding: '1rem',
          background: `${interpretation.color}10`,
          border: `2px solid ${interpretation.color}`,
          borderRadius: '12px',
          animation: 'slideIn 0.2s ease-out'
        }}>
          {/* Timing */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <Clock className="h-4 w-4" style={{ color: interpretation.color }} />
            <div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.125rem' }}>
                Timeline:
              </p>
              <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                {interpretation.description}
              </p>
            </div>
          </div>

          {/* Impatto */}
          {interpretation.insurance_relevance && (
            <div style={{
              padding: '0.75rem',
              background: 'white',
              borderRadius: '8px',
              marginBottom: '0.75rem'
            }}>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#64748b' }}>
                {interpretation.insurance_relevance}
              </p>
            </div>
          )}

          {/* Azione consigliata */}
          {interpretation.action_suggestion && (
            <div style={{
              padding: '0.75rem',
              background: 'white',
              borderRadius: '8px',
              borderLeft: `4px solid ${interpretation.color}`
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                <Target className="h-4 w-4" style={{ color: interpretation.color, marginTop: '0.125rem', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: interpretation.color, marginBottom: '0.25rem' }}>
                    AZIONE CONSIGLIATA:
                  </p>
                  <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#64748b' }}>
                    {interpretation.action_suggestion}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
