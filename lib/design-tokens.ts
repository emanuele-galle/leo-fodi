/**
 * Design Tokens - Sistema di Design Centralizzato
 *
 * Definisce tutti i valori visivi riutilizzabili per garantire
 * consistenza, professionalità e manutenibilità del design
 */

export const designTokens = {
  // ========================================
  // 🎨 PALETTE COLORI
  // ========================================
  colors: {
    // Colori Primari (Brand Identity)
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',  // Main primary
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },

    // Colori Secondari (Accenti)
    secondary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',  // Main secondary
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },

    // Grigi Neutri (Testi e Backgrounds)
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
    },

    // Colori Semantici
    success: {
      light: '#d1fae5',
      main: '#10b981',
      dark: '#059669',
      text: '#065f46',
    },
    warning: {
      light: '#fef3c7',
      main: '#f59e0b',
      dark: '#d97706',
      text: '#78350f',
    },
    error: {
      light: '#fee2e2',
      main: '#ef4444',
      dark: '#dc2626',
      text: '#991b1b',
    },
    info: {
      light: '#dbeafe',
      main: '#3b82f6',
      dark: '#2563eb',
      text: '#1e40af',
    },

    // Colori Specializzati per Dashboard OSINT
    osint: {
      identity: '#8b5cf6',      // Viola - Identità
      digital: '#3b82f6',       // Blu - Digitale
      authority: '#f59e0b',     // Arancio - Autorità
      family: '#ec4899',        // Rosa - Famiglia
      education: '#06b6d4',     // Ciano - Educazione
      career: '#8b5cf6',        // Viola - Carriera
      workmodel: '#6366f1',     // Indaco - Lavoro
      vision: '#14b8a6',        // Teal - Visione
      lifestyle: '#f43f5e',     // Rose - Lifestyle
      wealth: '#eab308',        // Giallo - Ricchezza
      needs: '#ef4444',         // Rosso - Bisogni
      engagement: '#f97316',    // Arancio - Engagement
      recommendations: '#10b981' // Verde - Prodotti
    },

    // Gradienti
    gradients: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      info: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      soft: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
    },
  },

  // ========================================
  // 📏 SPACING (Scala Coerente)
  // ========================================
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    base: '1rem',     // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
  },

  // ========================================
  // 🌑 SHADOWS (Profondità Visuale)
  // ========================================
  shadows: {
    // Ombre Sottili
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',

    // Ombre Standard
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',

    // Ombre Profonde
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

    // Ombre Speciali
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    colored: {
      primary: '0 10px 25px -5px rgba(14, 165, 233, 0.3)',
      secondary: '0 10px 25px -5px rgba(139, 92, 246, 0.3)',
      success: '0 10px 25px -5px rgba(16, 185, 129, 0.3)',
      warning: '0 10px 25px -5px rgba(245, 158, 11, 0.3)',
      error: '0 10px 25px -5px rgba(239, 68, 68, 0.3)',
    },
  },

  // ========================================
  // 🔲 BORDER RADIUS
  // ========================================
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    base: '0.5rem',   // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    full: '9999px',   // Completamente rotondo
  },

  // ========================================
  // ✍️ TYPOGRAPHY
  // ========================================
  typography: {
    // Font Families
    fontFamily: {
      sans: 'var(--font-geist-sans), system-ui, -apple-system, sans-serif',
      mono: 'var(--font-geist-mono), Menlo, Monaco, monospace',
    },

    // Font Sizes
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
    },

    // Font Weights
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },

    // Line Heights
    lineHeight: {
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },

  // ========================================
  // ⚡ TRANSITIONS & ANIMATIONS
  // ========================================
  animation: {
    // Durations
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },

    // Easing Functions
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },

    // Keyframes Comuni
    keyframes: {
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      slideInUp: {
        from: { transform: 'translateY(10px)', opacity: 0 },
        to: { transform: 'translateY(0)', opacity: 1 },
      },
      slideInDown: {
        from: { transform: 'translateY(-10px)', opacity: 0 },
        to: { transform: 'translateY(0)', opacity: 1 },
      },
      scaleIn: {
        from: { transform: 'scale(0.95)', opacity: 0 },
        to: { transform: 'scale(1)', opacity: 1 },
      },
      shimmer: {
        '0%': { backgroundPosition: '-1000px 0' },
        '100%': { backgroundPosition: '1000px 0' },
      },
    },
  },

  // ========================================
  // 📱 BREAKPOINTS (Responsive)
  // ========================================
  breakpoints: {
    xs: '375px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // ========================================
  // 🎯 Z-INDEX (Layering)
  // ========================================
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
  },
}

// ========================================
// 🛠️ UTILITY FUNCTIONS
// ========================================

/**
 * Genera uno stile completo per una card con shadow e hover
 */
export function getCardStyle(color: string, intensity: 'light' | 'medium' | 'strong' = 'medium') {
  const backgrounds = {
    light: `${color}08`,
    medium: `${color}15`,
    strong: `${color}25`,
  }

  return {
    padding: designTokens.spacing.lg,
    background: backgrounds[intensity],
    border: `2px solid ${color}40`,
    borderRadius: designTokens.borderRadius.lg,
    boxShadow: designTokens.shadows.sm,
    transition: `all ${designTokens.animation.duration.base} ${designTokens.animation.easing.easeInOut}`,
    cursor: 'pointer',

    // Hover effect
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: designTokens.shadows.xl,
      borderColor: color,
    }
  }
}

/**
 * Genera badge style con colore personalizzato
 */
export function getBadgeStyle(color: string, variant: 'solid' | 'outline' | 'soft' = 'solid') {
  const styles = {
    solid: {
      background: color,
      color: 'white',
      border: 'none',
    },
    outline: {
      background: 'transparent',
      color: color,
      border: `2px solid ${color}`,
    },
    soft: {
      background: `${color}15`,
      color: color,
      border: `1px solid ${color}40`,
    }
  }

  return {
    ...styles[variant],
    padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
    borderRadius: designTokens.borderRadius.full,
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.semibold,
    display: 'inline-flex',
    alignItems: 'center',
    gap: designTokens.spacing.xs,
    transition: `all ${designTokens.animation.duration.fast} ${designTokens.animation.easing.easeOut}`,
  }
}

/**
 * Genera stile per header di sezione
 */
export function getSectionHeaderStyle(color: string) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: designTokens.spacing.md,
    padding: designTokens.spacing.lg,
    background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
    borderRadius: designTokens.borderRadius.lg,
    marginBottom: designTokens.spacing.lg,
    borderLeft: `4px solid ${color}`,
  }
}

/**
 * Genera loading skeleton style
 */
export function getSkeletonStyle() {
  return {
    background: `linear-gradient(90deg, ${designTokens.colors.neutral[200]} 25%, ${designTokens.colors.neutral[100]} 50%, ${designTokens.colors.neutral[200]} 75%)`,
    backgroundSize: '1000px 100%',
    animation: `shimmer ${designTokens.animation.duration.slower} infinite`,
    borderRadius: designTokens.borderRadius.base,
  }
}

export type DesignTokens = typeof designTokens
