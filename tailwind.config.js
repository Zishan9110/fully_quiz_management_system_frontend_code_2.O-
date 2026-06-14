import themeConfig from './src/theme/theme.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:   themeConfig.colors.primary,
        secondary: themeConfig.colors.secondary,
        success:   themeConfig.colors.success,
        danger:    themeConfig.colors.danger,
        warning:   themeConfig.colors.warning,
        background: themeConfig.colors.background,
        card:      themeConfig.colors.card,
        sidebar:   themeConfig.colors.sidebar,
        text:      themeConfig.colors.text
      },
      fontFamily: { sans: themeConfig.fontFamily.sans },
      borderRadius: { DEFAULT: themeConfig.borderRadius.DEFAULT, lg: themeConfig.borderRadius.lg },
      animation: {
        'fade-in':   'fadeIn 0.3s ease-in-out',
        'slide-in':  'slideIn 0.3s ease-out',
        'slide-up':  'slideUp 0.4s ease-out',
        'pulse-soft':'pulseSoft 2s ease-in-out infinite'
      },
      keyframes: {
        fadeIn:     { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn:    { from: { transform: 'translateX(-20px)', opacity: 0 }, to: { transform: 'translateX(0)', opacity: 1 } },
        slideUp:    { from: { transform: 'translateY(20px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        pulseSoft:  { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.7 } }
      }
    }
  },
  plugins: []
};
