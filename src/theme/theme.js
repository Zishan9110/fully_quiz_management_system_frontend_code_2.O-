/**
 * CENTRALIZED THEME SYSTEM
 * ========================
 * Change colors here to update the ENTIRE application.
 * Used by: Tailwind config, CSS Variables, component styles.
 *
 * Usage in components:
 *   import theme from '@/theme/theme';
 *   <div style={{ background: theme.colors.primary[600] }}>
 *
 * CSS Variables are injected via ThemeProvider context.
 */

const theme = {
  colors: {
    primary: {
      50:  '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      DEFAULT: '#6366f1'
    },
    secondary: {
      50:  '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      DEFAULT: '#0ea5e9'
    },
    success: {
      50:  '#f0fdf4',
      100: '#dcfce7',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      DEFAULT: '#22c55e'
    },
    danger: {
      50:  '#fff1f2',
      100: '#ffe4e6',
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48',
      DEFAULT: '#f43f5e'
    },
    warning: {
      50:  '#fffbeb',
      100: '#fef3c7',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      DEFAULT: '#f59e0b'
    },
    background: {
      light: '#f8fafc',
      dark:  '#0f172a',
      DEFAULT: '#f8fafc'
    },
    card: {
      light: '#ffffff',
      dark:  '#1e293b',
      DEFAULT: '#ffffff'
    },
    sidebar: {
      light: '#1e293b',
      dark:  '#0f172a',
      DEFAULT: '#1e293b'
    },
    text: {
      primary:   { light: '#1e293b', dark: '#f1f5f9' },
      secondary: { light: '#64748b', dark: '#94a3b8' },
      muted:     { light: '#94a3b8', dark: '#64748b' }
    }
  },
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
  },
  borderRadius: {
    sm:      '6px',
    DEFAULT: '8px',
    lg:      '12px',
    xl:      '16px',
    '2xl':   '24px',
    full:    '9999px'
  },
  spacing: {
    sidebar: '260px',
    header:  '64px'
  },
  shadows: {
    sm:  '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    md:  '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
    lg:  '0 10px 30px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06)',
    xl:  '0 20px 50px rgba(0,0,0,0.15)'
  },
  transitions: {
    fast:   '0.15s ease',
    normal: '0.25s ease',
    slow:   '0.4s ease'
  }
};

/**
 * Generate CSS variables from theme.
 * Called once by ThemeProvider to inject into :root.
 */
export const generateCSSVariables = (isDark = false) => ({
  '--color-primary':         theme.colors.primary.DEFAULT,
  '--color-primary-50':      theme.colors.primary[50],
  '--color-primary-100':     theme.colors.primary[100],
  '--color-primary-500':     theme.colors.primary[500],
  '--color-primary-600':     theme.colors.primary[600],
  '--color-primary-700':     theme.colors.primary[700],
  '--color-secondary':       theme.colors.secondary.DEFAULT,
  '--color-secondary-500':   theme.colors.secondary[500],
  '--color-success':         theme.colors.success.DEFAULT,
  '--color-danger':          theme.colors.danger.DEFAULT,
  '--color-warning':         theme.colors.warning.DEFAULT,
  '--color-bg':              isDark ? theme.colors.background.dark  : theme.colors.background.light,
  '--color-card':            isDark ? theme.colors.card.dark        : theme.colors.card.light,
  '--color-sidebar':         isDark ? theme.colors.sidebar.dark     : theme.colors.sidebar.light,
  '--color-text-primary':    isDark ? theme.colors.text.primary.dark    : theme.colors.text.primary.light,
  '--color-text-secondary':  isDark ? theme.colors.text.secondary.dark  : theme.colors.text.secondary.light,
  '--color-text-muted':      isDark ? theme.colors.text.muted.dark      : theme.colors.text.muted.light,
  '--border-radius':         theme.borderRadius.DEFAULT,
  '--border-radius-lg':      theme.borderRadius.lg,
  '--border-radius-xl':      theme.borderRadius.xl,
  '--shadow-sm':             theme.shadows.sm,
  '--shadow-md':             theme.shadows.md,
  '--shadow-lg':             theme.shadows.lg,
  '--transition-fast':       theme.transitions.fast,
  '--transition-normal':     theme.transitions.normal,
  '--sidebar-width':         theme.spacing.sidebar,
  '--header-height':         theme.spacing.header
});

export default theme;
