/**
 * UI Enhancements - Micro-interazioni e accessibility utilities
 *
 * Fornisce helper per applicare:
 * - Focus states WCAG 2.1 AA compliant
 * - Tooltip informativi
 * - Badge pulse per priority alta
 * - Stagger animation per liste
 * - Progress bar con gradient
 */

import { designTokens } from './design-tokens'
import { CSSProperties } from 'react'

// ========================================
// 🎯 FOCUS STATES (WCAG 2.1 AA Compliant)
// ========================================

/**
 * Focus ring WCAG-compliant (contrasto 3:1)
 * Da applicare a tutti gli elementi interattivi
 */
export const wcagFocusRing: CSSProperties = {
  outline: `3px solid ${designTokens.colors.primary[500]}`,
  outlineOffset: '2px',
  transition: `outline ${designTokens.animation.duration.fast} ${designTokens.animation.easing.easeOut}`
}

/**
 * Focus visible styles (solo tastiera, non mouse)
 */
export const getFocusVisibleStyles = (color: string = designTokens.colors.primary[500]): CSSProperties => ({
  outline: `3px solid ${color}`,
  outlineOffset: '2px',
  boxShadow: `0 0 0 4px ${color}20`
})

/**
 * Hook per gestire focus-visible su elementi custom
 */
export function useFocusVisible() {
  return {
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      // Apply focus styles only if keyboard was used
      if (e.currentTarget.matches(':focus-visible')) {
        Object.assign(e.currentTarget.style, wcagFocusRing)
      }
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      e.currentTarget.style.outline = 'none'
      e.currentTarget.style.boxShadow = 'none'
    }
  }
}

// ========================================
// 💬 TOOLTIPS
// ========================================

/**
 * Tooltip container styles
 */
export const getTooltipStyles = (position: 'top' | 'bottom' | 'left' | 'right' = 'top'): CSSProperties => {
  const positions = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-8px)' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%) translateY(8px)' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%) translateX(-8px)' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%) translateX(8px)' }
  }

  return {
    position: 'absolute',
    ...positions[position],
    padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
    background: designTokens.colors.neutral[900],
    color: 'white',
    fontSize: designTokens.typography.fontSize.sm,
    borderRadius: designTokens.borderRadius.base,
    whiteSpace: 'nowrap',
    zIndex: designTokens.zIndex.tooltip,
    opacity: 0,
    pointerEvents: 'none',
    transition: `opacity ${designTokens.animation.duration.fast} ${designTokens.animation.easing.easeOut}`
  }
}

/**
 * Show/hide tooltip handlers
 */
export function useTooltip() {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      const tooltip = e.currentTarget.querySelector('[data-tooltip]') as HTMLElement
      if (tooltip) {
        tooltip.style.opacity = '1'
      }
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      const tooltip = e.currentTarget.querySelector('[data-tooltip]') as HTMLElement
      if (tooltip) {
        tooltip.style.opacity = '0'
      }
    }
  }
}

// ========================================
// 🔴 PULSE BADGE (Priority Alta)
// ========================================

/**
 * Badge con pulse animation per elementi ad alta priorità
 */
export const getPulseBadgeStyles = (color: string): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: designTokens.spacing.xs,
  padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
  background: `${color}15`,
  color: color,
  fontSize: designTokens.typography.fontSize.xs,
  fontWeight: designTokens.typography.fontWeight.semibold,
  borderRadius: designTokens.borderRadius.full,
  border: `1px solid ${color}40`,
  position: 'relative'
})

/**
 * Pulse indicator (punto animato)
 */
export const getPulseIndicatorStyles = (color: string): CSSProperties => ({
  width: '8px',
  height: '8px',
  background: color,
  borderRadius: designTokens.borderRadius.full,
  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
})

// ========================================
// 📋 STAGGER ANIMATION (Liste)
// ========================================

/**
 * Genera stagger delay per animazioni di lista
 * @param index - Indice elemento nella lista
 * @param delayIncrement - Incremento delay in ms (default 50ms)
 */
export function getStaggerDelay(index: number, delayIncrement: number = 50): CSSProperties {
  return {
    animationDelay: `${index * delayIncrement}ms`
  }
}

/**
 * Slide-in animation per elementi lista
 */
export const listItemSlideIn: CSSProperties = {
  animation: `slideInUp ${designTokens.animation.duration.slow} ${designTokens.animation.easing.easeOut} both`,
  opacity: 0
}

// ========================================
// 📊 PROGRESS BAR (Gradient)
// ========================================

/**
 * Progress bar container
 */
export const progressBarContainer: CSSProperties = {
  width: '100%',
  height: '8px',
  background: designTokens.colors.neutral[200],
  borderRadius: designTokens.borderRadius.full,
  overflow: 'hidden',
  position: 'relative'
}

/**
 * Progress bar fill con gradient
 */
export const getProgressBarFill = (
  percentage: number,
  color: string = designTokens.colors.primary[500]
): CSSProperties => ({
  height: '100%',
  width: `${percentage}%`,
  background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
  borderRadius: designTokens.borderRadius.full,
  transition: `width ${designTokens.animation.duration.slow} ${designTokens.animation.easing.easeOut}`,
  position: 'relative',
  overflow: 'hidden'
})

/**
 * Shimmer effect su progress bar
 */
export const progressBarShimmer: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
  animation: 'shimmer 2s infinite'
}

// ========================================
// 🎨 GRADIENT BORDERS
// ========================================

/**
 * Gradient border effect (tramite pseudo-element)
 */
export const getGradientBorderStyles = (
  color1: string,
  color2: string,
  borderWidth: number = 2
): CSSProperties => ({
  position: 'relative',
  background: 'white',
  borderRadius: designTokens.borderRadius.lg,
  padding: designTokens.spacing.lg,
  // Note: Requires ::before pseudo-element with gradient background
})

// ========================================
// ⚡ ANIMATIONS (CSS Keyframes)
// ========================================

/**
 * CSS Keyframes da includere nel componente
 */
export const cssKeyframes = `
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

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(0.95);
    }
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes ping {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    75%, 100% {
      transform: scale(1.5);
      opacity: 0;
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

// ========================================
// 🔧 UTILITY COMPONENTS
// ========================================

/**
 * Componente PulseBadge riutilizzabile
 */
export interface PulseBadgeProps {
  label: string
  color: string
  showPulse?: boolean
}

export function PulseBadge({ label, color, showPulse = true }: PulseBadgeProps) {
  return (
    <span style={getPulseBadgeStyles(color)}>
      {showPulse && <span style={getPulseIndicatorStyles(color)} />}
      {label}
    </span>
  )
}

/**
 * Componente ProgressBar riutilizzabile
 */
export interface ProgressBarProps {
  percentage: number
  color?: string
  showShimmer?: boolean
  label?: string
}

export function ProgressBar({ percentage, color, showShimmer = false, label }: ProgressBarProps) {
  return (
    <div>
      {label && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: designTokens.spacing.xs,
          fontSize: designTokens.typography.fontSize.sm,
          color: designTokens.colors.neutral[600]
        }}>
          <span>{label}</span>
          <span style={{ fontWeight: designTokens.typography.fontWeight.semibold }}>{percentage}%</span>
        </div>
      )}
      <div style={progressBarContainer}>
        <div style={getProgressBarFill(percentage, color)}>
          {showShimmer && <div style={progressBarShimmer} />}
        </div>
      </div>
    </div>
  )
}

// ========================================
// 📐 RESPONSIVE UTILITIES
// ========================================

/**
 * Media query helpers
 */
export const mediaQueries = {
  mobile: `@media (max-width: ${designTokens.breakpoints.sm})`,
  tablet: `@media (min-width: ${designTokens.breakpoints.sm}) and (max-width: ${designTokens.breakpoints.lg})`,
  desktop: `@media (min-width: ${designTokens.breakpoints.lg})`
}

/**
 * Responsive grid columns
 */
export const getResponsiveGrid = (
  mobile: number = 1,
  tablet: number = 2,
  desktop: number = 3
): CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${mobile}, 1fr)`,
  gap: designTokens.spacing.base,
  // Note: Requires media queries for tablet/desktop
})
