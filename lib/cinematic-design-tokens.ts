/**
 * Cinematic Design System - Dashboard Intelligence Style
 *
 * Ispirato a interfacce cinematografiche tipo Iron Man, Minority Report, Mr. Robot
 * Focus su: depth, contrast, micro-animations, data hierarchy
 */

export const cinematicTokens = {
  // 🎨 COLOR PALETTE - Dark theme con neon accents
  colors: {
    // Base colors
    background: {
      primary: '#0a0e27',      // Deep navy blue (main bg)
      secondary: '#131829',    // Slightly lighter (cards)
      tertiary: '#1a1f3a',     // Even lighter (nested cards)
      overlay: 'rgba(10, 14, 39, 0.95)', // Modal/overlay
    },

    // Neon accents
    neon: {
      cyan: '#00f0ff',         // Primary accent
      blue: '#0066ff',         // Info
      purple: '#b24bf3',       // Secondary accent
      pink: '#ff006e',         // Alert/critical
      green: '#00ff88',        // Success/positive
      yellow: '#ffd60a',       // Warning
      orange: '#ff6b35',       // Attention
    },

    // Text hierarchy
    text: {
      primary: '#ffffff',      // Headings
      secondary: '#b8c5d6',    // Body text
      tertiary: '#6b7d94',     // Metadata/labels
      disabled: '#3d4759',     // Disabled state
      inverse: '#0a0e27',      // Text on light bg
    },

    // Semantic colors
    status: {
      success: '#00ff88',
      warning: '#ffd60a',
      error: '#ff006e',
      info: '#00f0ff',
    },

    // Data visualization
    chart: {
      primary: '#00f0ff',
      secondary: '#b24bf3',
      tertiary: '#ff006e',
      quaternary: '#ffd60a',
      quinary: '#00ff88',
      senary: '#ff6b35',
    }
  },

  // 📏 SPACING - Consistent spacing scale
  spacing: {
    xs: '4px',
    sm: '8px',
    base: '16px',
    md: '24px',
    lg: '32px',
    xl: '48px',
    '2xl': '64px',
    '3xl': '96px',
  },

  // 🔤 TYPOGRAPHY - Stratified type system
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      mono: '"Fira Code", "JetBrains Mono", Consolas, monospace',
      display: '"Space Grotesk", Inter, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '2rem',      // 32px
      '4xl': '2.5rem',    // 40px
      '5xl': '3rem',      // 48px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.05em',
      wider: '0.1em',
    }
  },

  // 🎭 SHADOWS & GLOW - Deep shadows + neon glow
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
    md: '0 4px 16px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.5)',
    xl: '0 16px 64px rgba(0, 0, 0, 0.6)',

    // Neon glows
    glow: {
      cyan: '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.2)',
      blue: '0 0 20px rgba(0, 102, 255, 0.5), 0 0 40px rgba(0, 102, 255, 0.2)',
      purple: '0 0 20px rgba(178, 75, 243, 0.5), 0 0 40px rgba(178, 75, 243, 0.2)',
      pink: '0 0 20px rgba(255, 0, 110, 0.5), 0 0 40px rgba(255, 0, 110, 0.2)',
      green: '0 0 20px rgba(0, 255, 136, 0.5), 0 0 40px rgba(0, 255, 136, 0.2)',
    },

    // Inner shadows (inset)
    inset: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
  },

  // 📐 BORDERS & RADIUS
  borders: {
    width: {
      thin: '1px',
      base: '2px',
      thick: '4px',
    },
    color: {
      default: 'rgba(184, 197, 214, 0.1)',  // Subtle
      emphasis: 'rgba(184, 197, 214, 0.2)', // More visible
      accent: 'rgba(0, 240, 255, 0.3)',     // Neon cyan
    }
  },

  borderRadius: {
    none: '0',
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },

  // ⚡ ANIMATIONS - Smooth micro-interactions
  animation: {
    duration: {
      fast: '150ms',
      base: '250ms',
      slow: '400ms',
      slower: '600ms',
    },
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    }
  },

  // 🔢 Z-INDEX - Layering system
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
  },

  // 📱 BREAKPOINTS - Responsive design
  breakpoints: {
    xs: '375px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // 🎯 COMPONENT-SPECIFIC TOKENS
  components: {
    // Data card
    dataCard: {
      background: 'linear-gradient(135deg, #131829 0%, #1a1f3a 100%)',
      border: '1px solid rgba(0, 240, 255, 0.2)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 240, 255, 0.1)',
      hoverShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 240, 255, 0.3)',
    },

    // Stat box
    statBox: {
      background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(0, 240, 255, 0.02) 100%)',
      border: '2px solid rgba(0, 240, 255, 0.3)',
      glow: '0 0 20px rgba(0, 240, 255, 0.2)',
    },

    // Badge
    badge: {
      background: 'rgba(0, 240, 255, 0.15)',
      border: '1px solid rgba(0, 240, 255, 0.4)',
      text: '#00f0ff',
    },

    // Progress bar
    progressBar: {
      background: 'rgba(184, 197, 214, 0.1)',
      fill: 'linear-gradient(90deg, #00f0ff 0%, #0066ff 100%)',
      glow: '0 0 10px rgba(0, 240, 255, 0.5)',
    }
  },

  // 🎬 EFFECTS - Special visual effects
  effects: {
    // Gradient overlays
    gradients: {
      hero: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(178, 75, 243, 0.1) 100%)',
      card: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0) 100%)',
      border: 'linear-gradient(90deg, #00f0ff 0%, #b24bf3 50%, #ff006e 100%)',
    },

    // Backdrop blur
    blur: {
      sm: 'blur(8px)',
      base: 'blur(16px)',
      lg: 'blur(24px)',
    },

    // Scanline effect (optional)
    scanline: {
      background: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15) 0px, transparent 1px, transparent 2px, rgba(0, 0, 0, 0.15) 3px)',
      opacity: 0.03,
    }
  }
}

/**
 * Helper: Get neon glow for any color
 */
export function getNeonGlow(color: string, intensity: number = 0.5): string {
  return `0 0 20px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}, 0 0 40px ${color}${Math.round(intensity * 0.5 * 255).toString(16).padStart(2, '0')}`
}

/**
 * Helper: Get data card styles
 */
export function getDataCardStyle(accentColor?: string) {
  return {
    background: cinematicTokens.components.dataCard.background,
    border: accentColor
      ? `1px solid ${accentColor}40`
      : cinematicTokens.components.dataCard.border,
    borderRadius: cinematicTokens.borderRadius.lg,
    boxShadow: cinematicTokens.components.dataCard.shadow,
    transition: `all ${cinematicTokens.animation.duration.base} ${cinematicTokens.animation.easing.easeOut}`,
    overflow: 'hidden' as const,
  }
}

/**
 * Helper: Get stat box styles
 */
export function getStatBoxStyle(accentColor: string = cinematicTokens.colors.neon.cyan) {
  return {
    background: `linear-gradient(135deg, ${accentColor}14 0%, ${accentColor}05 100%)`,
    border: `2px solid ${accentColor}50`,
    borderRadius: cinematicTokens.borderRadius.md,
    boxShadow: `0 0 20px ${accentColor}30`,
    transition: `all ${cinematicTokens.animation.duration.base} ${cinematicTokens.animation.easing.easeOut}`,
  }
}
