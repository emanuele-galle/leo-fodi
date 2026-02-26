'use client'

/**
 * SectionHeader - Header riusabile per sezioni dashboard OSINT
 *
 * Features:
 * - Icon container con background colorato
 * - Titolo + sottotitolo
 * - Gradient background
 * - Colored border
 * - Typography scale coerente
 */

import { designTokens } from '@/lib/design-tokens'
import { LucideIcon } from 'lucide-react'

interface SectionHeaderProps {
  icon: LucideIcon
  title: string
  subtitle: string
  color: string
  className?: string
}

export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  color,
  className = ''
}: SectionHeaderProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: designTokens.spacing.md,
        padding: designTokens.spacing.lg,
        background: `linear-gradient(135deg, ${color}08 0%, ${color}02 100%)`,
        borderRadius: designTokens.borderRadius.lg,
        marginBottom: designTokens.spacing.base,
        borderLeft: `4px solid ${color}`,
        transition: `all ${designTokens.animation.duration.base} ${designTokens.animation.easing.easeOut}`
      }}
    >
      {/* Icon container */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48px',
        height: '48px',
        background: `${color}15`,
        borderRadius: designTokens.borderRadius.lg,
        flexShrink: 0,
        position: 'relative'
      }}>
        <Icon
          className="h-6 w-6"
          style={{
            color: color,
            position: 'relative',
            zIndex: 1
          }}
        />
      </div>

      {/* Title and subtitle */}
      <div style={{ flex: 1 }}>
        <h3 style={{
          fontSize: designTokens.typography.fontSize.xl,
          fontWeight: designTokens.typography.fontWeight.bold,
          color: designTokens.colors.neutral[800],
          margin: 0,
          lineHeight: designTokens.typography.lineHeight.tight,
          marginBottom: designTokens.spacing.xs
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: designTokens.typography.fontSize.sm,
          color: designTokens.colors.neutral[600],
          fontWeight: designTokens.typography.fontWeight.normal,
          margin: 0,
          lineHeight: designTokens.typography.lineHeight.snug
        }}>
          {subtitle}
        </p>
      </div>
    </div>
  )
}
