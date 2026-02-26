/**
 * LEO-FODI Design System Tokens
 *
 * Sistema unificato di design tokens basato sui 3 principi UI:
 * 1. Shadows & Depth - Double shadows professionali
 * 2. Responsive Design - Mobile-first breakpoints
 * 3. Color System - Palette organizzata con semantic colors
 */

// ============================================================================
// COLORS - Palette Unificata
// ============================================================================

export const colors = {
  // Primary Brand (Verde LEO-FODI)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',   // Main brand color
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    DEFAULT: '#16a34a',
  },

  // Secondary (Teal - per accenti)
  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    DEFAULT: '#14b8a6',
  },

  // Neutrals (Grigi)
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Semantic Colors
  success: {
    light: '#d1fae5',
    DEFAULT: '#10b981',
    dark: '#059669',
  },

  warning: {
    light: '#fef3c7',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
  },

  error: {
    light: '#fee2e2',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
  },

  info: {
    light: '#dbeafe',
    DEFAULT: '#3b82f6',
    dark: '#2563eb',
  },

  // Backgrounds
  background: {
    primary: '#ffffff',
    secondary: '#fafafa',
    tertiary: '#f5f5f5',
  },
}

// ============================================================================
// SHADOWS - Sistema Double Shadow Professionale
// ============================================================================

export const shadows = {
  // Card shadows (uso principale)
  card: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15), 0 8px 10px rgba(0, 0, 0, 0.05)',
  },

  // Button shadows (brand color)
  button: {
    default: '0 2px 4px rgba(22, 163, 74, 0.2), 0 1px 2px rgba(22, 163, 74, 0.1)',
    hover: '0 4px 8px rgba(22, 163, 74, 0.25), 0 2px 4px rgba(22, 163, 74, 0.15)',
    active: '0 1px 2px rgba(22, 163, 74, 0.3), 0 0px 1px rgba(22, 163, 74, 0.2)',
  },

  // Input shadows
  input: {
    default: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
    focus: '0 0 0 3px rgba(22, 163, 74, 0.1), 0 1px 2px rgba(0, 0, 0, 0.05)',
  },

  // Dropdown/Modal shadows
  elevated: {
    sm: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
    md: '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)',
    lg: '0 16px 48px rgba(0, 0, 0, 0.16), 0 8px 16px rgba(0, 0, 0, 0.08)',
  },
}

// ============================================================================
// TYPOGRAPHY - Scala Tipografica Coerente
// ============================================================================

export const typography = {
  // Font families
  fontFamily: {
    sans: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },

  // Font sizes with line heights
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px / 16px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px / 20px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px / 24px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px / 28px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px / 28px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px / 32px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px / 36px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px / 40px
    '5xl': ['3rem', { lineHeight: '1' }],         // 48px
  },

  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Letter spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
}

// ============================================================================
// SPACING - Sistema 8pt Grid
// ============================================================================

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
}

// ============================================================================
// BORDER RADIUS - Arrotondamenti Consistenti
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
}

// ============================================================================
// BREAKPOINTS - Mobile-First Responsive
// ============================================================================

export const breakpoints = {
  sm: '640px',   // Mobile large
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop small
  xl: '1280px',  // Desktop large
  '2xl': '1536px', // Desktop XL
}

// ============================================================================
// TRANSITIONS - Animazioni Fluide
// ============================================================================

export const transitions = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  timing: {
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeIn: 'cubic-bezier(0.7, 0, 0.84, 0)',
    easeInOut: 'cubic-bezier(0.87, 0, 0.13, 1)',
  },
}

// ============================================================================
// Z-INDEX - Layering System
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
}

// ============================================================================
// COMPONENT VARIANTS - Pre-built Combinations
// ============================================================================

export const componentVariants = {
  // Card variants
  card: {
    default: {
      background: colors.background.primary,
      shadow: shadows.card.md,
      borderRadius: borderRadius.xl,
      padding: spacing[6],
    },
    elevated: {
      background: colors.background.primary,
      shadow: shadows.card.lg,
      borderRadius: borderRadius.xl,
      padding: spacing[6],
    },
    flat: {
      background: colors.background.secondary,
      shadow: shadows.card.xs,
      borderRadius: borderRadius.lg,
      padding: spacing[4],
    },
  },

  // Button variants
  button: {
    primary: {
      background: colors.primary.DEFAULT,
      color: '#ffffff',
      shadow: shadows.button.default,
      hoverShadow: shadows.button.hover,
      activeShadow: shadows.button.active,
    },
    secondary: {
      background: colors.neutral[100],
      color: colors.neutral[900],
      shadow: shadows.card.sm,
      hoverShadow: shadows.card.md,
    },
    ghost: {
      background: 'transparent',
      color: colors.primary.DEFAULT,
      shadow: 'none',
      hoverBackground: colors.primary[50],
    },
  },
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get color by path (e.g., 'primary.600')
 */
export function getColor(path: string): string {
  const parts = path.split('.')
  let value: any = colors

  for (const part of parts) {
    value = value[part]
    if (!value) return colors.primary.DEFAULT
  }

  return value
}

/**
 * Get shadow by type and size (e.g., 'card', 'md')
 */
export function getShadow(type: keyof typeof shadows, size: string): string {
  const shadowGroup = shadows[type] as Record<string, string>
  return shadowGroup[size] || shadowGroup.default || shadows.card.md
}

/**
 * Build transition string
 */
export function buildTransition(
  properties: string[],
  duration: keyof typeof transitions.duration = 'normal',
  timing: keyof typeof transitions.timing = 'easeOut'
): string {
  const durationValue = transitions.duration[duration]
  const timingValue = transitions.timing[timing]

  return properties.map(prop => `${prop} ${durationValue} ${timingValue}`).join(', ')
}

export default {
  colors,
  shadows,
  typography,
  spacing,
  borderRadius,
  breakpoints,
  transitions,
  zIndex,
  componentVariants,
  getColor,
  getShadow,
  buildTransition,
}
