'use client'

/**
 * Cinematic Components - Dashboard Intelligence Components
 *
 * Componenti visual avanzati per dashboard stile "hacker movie"
 */

import { ReactNode } from 'react'
import { cinematicTokens, getDataCardStyle, getStatBoxStyle } from '@/lib/cinematic-design-tokens'

// ========================================
// 🎬 HERO DATA CARD (Main identity card)
// ========================================

interface HeroDataCardProps {
  title: string
  subtitle?: string
  metadata?: { label: string; value: string }[]
  accentColor?: string
  icon?: ReactNode
  children?: ReactNode
}

export function HeroDataCard({
  title,
  subtitle,
  metadata,
  accentColor = cinematicTokens.colors.neon.cyan,
  icon,
  children
}: HeroDataCardProps) {
  return (
    <div style={{
      ...getDataCardStyle(accentColor),
      padding: cinematicTokens.spacing.xl,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Gradient overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '200px',
        background: `linear-gradient(135deg, ${accentColor}15 0%, transparent 100%)`,
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: cinematicTokens.spacing.md,
          marginBottom: cinematicTokens.spacing.lg
        }}>
          {icon && (
            <div style={{
              width: '64px',
              height: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${accentColor}20`,
              borderRadius: cinematicTokens.borderRadius.md,
              border: `2px solid ${accentColor}50`,
              boxShadow: `0 0 20px ${accentColor}30`,
              color: accentColor,
              flexShrink: 0
            }}>
              {icon}
            </div>
          )}

          <div style={{ flex: 1 }}>
            <h2 style={{
              fontFamily: cinematicTokens.typography.fontFamily.display,
              fontSize: cinematicTokens.typography.fontSize['3xl'],
              fontWeight: cinematicTokens.typography.fontWeight.bold,
              color: cinematicTokens.colors.text.primary,
              marginBottom: cinematicTokens.spacing.xs,
              letterSpacing: cinematicTokens.typography.letterSpacing.tight,
              textShadow: `0 0 20px ${accentColor}40`
            }}>
              {title}
            </h2>

            {subtitle && (
              <p style={{
                fontFamily: cinematicTokens.typography.fontFamily.sans,
                fontSize: cinematicTokens.typography.fontSize.base,
                color: cinematicTokens.colors.text.tertiary,
                letterSpacing: cinematicTokens.typography.letterSpacing.wide,
                textTransform: 'uppercase' as const
              }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Metadata grid */}
        {metadata && metadata.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: cinematicTokens.spacing.md,
            marginBottom: cinematicTokens.spacing.lg
          }}>
            {metadata.map((item, i) => (
              <div key={i} style={{
                padding: cinematicTokens.spacing.base,
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: cinematicTokens.borderRadius.base,
                border: `1px solid ${accentColor}20`
              }}>
                <div style={{
                  fontSize: cinematicTokens.typography.fontSize.xs,
                  color: cinematicTokens.colors.text.tertiary,
                  textTransform: 'uppercase' as const,
                  letterSpacing: cinematicTokens.typography.letterSpacing.wider,
                  marginBottom: cinematicTokens.spacing.xs,
                  fontWeight: cinematicTokens.typography.fontWeight.semibold
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontFamily: cinematicTokens.typography.fontFamily.mono,
                  fontSize: cinematicTokens.typography.fontSize.lg,
                  color: accentColor,
                  fontWeight: cinematicTokens.typography.fontWeight.semibold
                }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Children content */}
        {children}
      </div>
    </div>
  )
}

// ========================================
// 📊 CINEMATIC STAT BOX
// ========================================

interface CinematicStatBoxProps {
  value: string | number
  label: string
  icon?: ReactNode
  accentColor?: string
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  size?: 'sm' | 'md' | 'lg'
}

export function CinematicStatBox({
  value,
  label,
  icon,
  accentColor = cinematicTokens.colors.neon.cyan,
  unit,
  trend,
  trendValue,
  size = 'md'
}: CinematicStatBoxProps) {
  const sizes = {
    sm: { padding: cinematicTokens.spacing.base, fontSize: cinematicTokens.typography.fontSize.xl },
    md: { padding: cinematicTokens.spacing.lg, fontSize: cinematicTokens.typography.fontSize['3xl'] },
    lg: { padding: cinematicTokens.spacing.xl, fontSize: cinematicTokens.typography.fontSize['4xl'] }
  }

  const trendIcons = { up: '↗', down: '↘', neutral: '→' }
  const trendColors = {
    up: cinematicTokens.colors.status.success,
    down: cinematicTokens.colors.status.error,
    neutral: cinematicTokens.colors.text.tertiary
  }

  return (
    <div style={{
      ...getStatBoxStyle(accentColor),
      padding: sizes[size].padding,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background effect */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '200%',
        height: '200%',
        background: `radial-gradient(circle, ${accentColor}08 0%, transparent 70%)`,
        pointerEvents: 'none',
        animation: 'pulse 4s ease-in-out infinite'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon */}
        {icon && (
          <div style={{
            width: size === 'lg' ? '56px' : size === 'md' ? '48px' : '40px',
            height: size === 'lg' ? '56px' : size === 'md' ? '48px' : '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${accentColor}15`,
            borderRadius: cinematicTokens.borderRadius.base,
            color: accentColor,
            marginBottom: cinematicTokens.spacing.md,
            border: `1px solid ${accentColor}30`
          }}>
            {icon}
          </div>
        )}

        {/* Value */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: cinematicTokens.spacing.xs,
          marginBottom: cinematicTokens.spacing.sm
        }}>
          <span style={{
            fontFamily: cinematicTokens.typography.fontFamily.mono,
            fontSize: sizes[size].fontSize,
            fontWeight: cinematicTokens.typography.fontWeight.bold,
            color: accentColor,
            lineHeight: cinematicTokens.typography.lineHeight.tight,
            textShadow: `0 0 20px ${accentColor}50`
          }}>
            {value}
          </span>
          {unit && (
            <span style={{
              fontSize: cinematicTokens.typography.fontSize.sm,
              color: cinematicTokens.colors.text.tertiary,
              fontFamily: cinematicTokens.typography.fontFamily.mono
            }}>
              {unit}
            </span>
          )}
        </div>

        {/* Label */}
        <div style={{
          fontSize: cinematicTokens.typography.fontSize.sm,
          color: cinematicTokens.colors.text.secondary,
          textTransform: 'uppercase' as const,
          letterSpacing: cinematicTokens.typography.letterSpacing.wide,
          fontWeight: cinematicTokens.typography.fontWeight.medium
        }}>
          {label}
        </div>

        {/* Trend indicator */}
        {trend && trendValue && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: cinematicTokens.spacing.xs,
            marginTop: cinematicTokens.spacing.sm,
            fontSize: cinematicTokens.typography.fontSize.xs,
            color: trendColors[trend],
            fontWeight: cinematicTokens.typography.fontWeight.semibold
          }}>
            <span>{trendIcons[trend]}</span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ========================================
// 🏷️ NEON BADGE
// ========================================

interface NeonBadgeProps {
  children: ReactNode
  color?: string
  variant?: 'solid' | 'outline' | 'glow'
  size?: 'sm' | 'md' | 'lg'
}

export function NeonBadge({
  children,
  color = cinematicTokens.colors.neon.cyan,
  variant = 'solid',
  size = 'md'
}: NeonBadgeProps) {
  const sizes = {
    sm: { padding: `${cinematicTokens.spacing.xs} ${cinematicTokens.spacing.sm}`, fontSize: cinematicTokens.typography.fontSize.xs },
    md: { padding: `${cinematicTokens.spacing.sm} ${cinematicTokens.spacing.base}`, fontSize: cinematicTokens.typography.fontSize.sm },
    lg: { padding: `${cinematicTokens.spacing.base} ${cinematicTokens.spacing.md}`, fontSize: cinematicTokens.typography.fontSize.base }
  }

  const variants = {
    solid: {
      background: `${color}20`,
      border: `1px solid ${color}40`,
      color: color
    },
    outline: {
      background: 'transparent',
      border: `1px solid ${color}`,
      color: color
    },
    glow: {
      background: `${color}30`,
      border: `1px solid ${color}`,
      color: color,
      boxShadow: `0 0 10px ${color}50`
    }
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      ...sizes[size],
      ...variants[variant],
      borderRadius: cinematicTokens.borderRadius.base,
      fontWeight: cinematicTokens.typography.fontWeight.semibold,
      textTransform: 'uppercase' as const,
      letterSpacing: cinematicTokens.typography.letterSpacing.wide,
      whiteSpace: 'nowrap' as const
    }}>
      {children}
    </span>
  )
}

// ========================================
// 📏 PROGRESS BAR WITH GLOW
// ========================================

interface GlowProgressBarProps {
  value: number // 0-100
  label?: string
  color?: string
  height?: number
  showValue?: boolean
  animated?: boolean
}

export function GlowProgressBar({
  value,
  label,
  color = cinematicTokens.colors.neon.cyan,
  height = 8,
  showValue = true,
  animated = true
}: GlowProgressBarProps) {
  return (
    <div style={{ width: '100%' }}>
      {/* Label row */}
      {(label || showValue) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: cinematicTokens.spacing.sm
        }}>
          {label && (
            <span style={{
              fontSize: cinematicTokens.typography.fontSize.sm,
              color: cinematicTokens.colors.text.secondary,
              fontWeight: cinematicTokens.typography.fontWeight.medium,
              textTransform: 'uppercase' as const,
              letterSpacing: cinematicTokens.typography.letterSpacing.wide
            }}>
              {label}
            </span>
          )}
          {showValue && (
            <span style={{
              fontFamily: cinematicTokens.typography.fontFamily.mono,
              fontSize: cinematicTokens.typography.fontSize.sm,
              color: color,
              fontWeight: cinematicTokens.typography.fontWeight.bold
            }}>
              {value}%
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div style={{
        width: '100%',
        height: `${height}px`,
        background: 'rgba(184, 197, 214, 0.08)',
        borderRadius: cinematicTokens.borderRadius.full,
        overflow: 'hidden',
        position: 'relative',
        border: `1px solid ${color}20`
      }}>
        <div style={{
          width: `${value}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`,
          borderRadius: cinematicTokens.borderRadius.full,
          boxShadow: `0 0 10px ${color}80`,
          transition: animated ? `width ${cinematicTokens.animation.duration.slow} ${cinematicTokens.animation.easing.easeOut}` : 'none',
          position: 'relative'
        }}>
          {/* Shimmer effect */}
          {animated && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
              animation: 'shimmer 2s infinite'
            }} />
          )}
        </div>
      </div>
    </div>
  )
}

// ========================================
// 🎯 DATA GRID (For displaying key-value pairs)
// ========================================

interface DataGridProps {
  data: { label: string; value: string | ReactNode; accent?: boolean }[]
  columns?: 1 | 2 | 3 | 4
  accentColor?: string
}

export function DataGrid({
  data,
  columns = 2,
  accentColor = cinematicTokens.colors.neon.cyan
}: DataGridProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: cinematicTokens.spacing.md
    }}>
      {data.map((item, i) => (
        <div key={i} style={{
          padding: cinematicTokens.spacing.base,
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: cinematicTokens.borderRadius.base,
          border: `1px solid ${item.accent ? accentColor : 'rgba(184, 197, 214, 0.1)'}30`,
          borderLeft: item.accent ? `3px solid ${accentColor}` : `1px solid rgba(184, 197, 214, 0.1)`
        }}>
          <div style={{
            fontSize: cinematicTokens.typography.fontSize.xs,
            color: cinematicTokens.colors.text.tertiary,
            textTransform: 'uppercase' as const,
            letterSpacing: cinematicTokens.typography.letterSpacing.wider,
            marginBottom: cinematicTokens.spacing.xs,
            fontWeight: cinematicTokens.typography.fontWeight.semibold
          }}>
            {item.label}
          </div>
          <div style={{
            fontSize: cinematicTokens.typography.fontSize.base,
            color: item.accent ? accentColor : cinematicTokens.colors.text.primary,
            fontWeight: cinematicTokens.typography.fontWeight.medium,
            fontFamily: item.accent ? cinematicTokens.typography.fontFamily.mono : cinematicTokens.typography.fontFamily.sans
          }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}

// ========================================
// ⚡ CSS ANIMATIONS (Global keyframes)
// ========================================

export const cinematicAnimations = `
  @keyframes pulse {
    0%, 100% {
      opacity: 0.8;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(200%);
    }
  }

  @keyframes glow {
    0%, 100% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.2);
    }
  }

  @keyframes slideInUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`
