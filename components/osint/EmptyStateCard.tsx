'use client'

/**
 * EmptyStateCard - Componente riusabile per stati vuoti nella dashboard OSINT
 *
 * Features:
 * - Pattern animato di background
 * - Icon con pulse animation
 * - Typography gerarchica
 * - CTA button actionable (opzionale)
 * - Messaggio informativo
 * - Fully customizable con design tokens
 */

import { designTokens } from '@/lib/design-tokens'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateCardProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  color?: string
  className?: string
}

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  color = designTokens.colors.neutral[400],
  className = ''
}: EmptyStateCardProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${designTokens.spacing['2xl']} ${designTokens.spacing.xl}`,
        background: `linear-gradient(135deg, ${color}05 0%, ${designTokens.colors.neutral[50]} 100%)`,
        borderRadius: designTokens.borderRadius.lg,
        border: `2px dashed ${color}40`,
        minHeight: '320px',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center'
      }}
    >
      {/* Pattern animato di background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, ${color}08 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, ${color}05 0%, transparent 50%),
                           radial-gradient(circle at 40% 20%, ${color}03 0%, transparent 50%)`,
          animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          zIndex: 0
        }}
      />

      {/* Icon container con pulse animation */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          background: `${color}15`,
          borderRadius: designTokens.borderRadius.full,
          marginBottom: designTokens.spacing.lg,
          position: 'relative',
          zIndex: 1,
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}
      >
        <Icon
          className="h-10 w-10"
          style={{
            color: color,
            strokeWidth: 1.5
          }}
        />

        {/* Ring esterno animato */}
        <div
          style={{
            position: 'absolute',
            inset: '-4px',
            border: `2px solid ${color}30`,
            borderRadius: designTokens.borderRadius.full,
            animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
          }}
        />
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: designTokens.typography.fontSize['2xl'],
          fontWeight: designTokens.typography.fontWeight.bold,
          color: designTokens.colors.neutral[800],
          margin: 0,
          marginBottom: designTokens.spacing.sm,
          lineHeight: designTokens.typography.lineHeight.tight,
          position: 'relative',
          zIndex: 1
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: designTokens.typography.fontSize.base,
          color: designTokens.colors.neutral[600],
          fontWeight: designTokens.typography.fontWeight.normal,
          margin: 0,
          marginBottom: onAction && actionLabel ? designTokens.spacing.lg : 0,
          lineHeight: designTokens.typography.lineHeight.relaxed,
          maxWidth: '480px',
          position: 'relative',
          zIndex: 1
        }}
      >
        {description}
      </p>

      {/* CTA Button (opzionale) */}
      {onAction && actionLabel && (
        <Button
          onClick={onAction}
          style={{
            background: color,
            color: 'white',
            padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
            borderRadius: designTokens.borderRadius.base,
            fontSize: designTokens.typography.fontSize.base,
            fontWeight: designTokens.typography.fontWeight.semibold,
            border: 'none',
            cursor: 'pointer',
            boxShadow: designTokens.shadows.sm,
            transition: `all ${designTokens.animation.duration.base} ${designTokens.animation.easing.easeOut}`,
            position: 'relative',
            zIndex: 1
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = designTokens.shadows.lg
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = designTokens.shadows.sm
          }}
        >
          {actionLabel}
        </Button>
      )}

      {/* CSS animations inline */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes ping {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          75%, 100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
