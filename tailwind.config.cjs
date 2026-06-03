/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          light: 'var(--color-primary-light)',
          text: 'var(--color-primary-text)',
        },
        dark: {
          DEFAULT: 'var(--color-dark)',
          60: 'var(--color-dark-60)',
          30: 'var(--color-dark-30)',
        },
        surface: {
          bg: 'var(--color-surface-bg)',
          card: 'var(--color-surface-card)',
          muted: 'var(--color-surface-muted)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          focus: 'var(--color-border-focus)',
        },
        status: {
          success: 'var(--color-success)',
          'success-light': 'var(--color-success-light)',
          warning: 'var(--color-warning)',
          'warning-light': 'var(--color-warning-light)',
          error: 'var(--color-error)',
          'error-light': 'var(--color-error-light)',
        },
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        10: 'var(--space-10)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        modal: 'var(--shadow-modal)',
        hover: 'var(--shadow-hover)',
        none: 'var(--shadow-none)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['var(--text-xs)', { lineHeight: 'var(--text-xs-line)' }],
        sm: ['var(--text-sm)', { lineHeight: 'var(--text-sm-line)' }],
        base: ['var(--text-base)', { lineHeight: 'var(--text-base-line)' }],
        md: ['var(--text-md)', { lineHeight: 'var(--text-md-line)' }],
        lg: ['var(--text-lg)', { lineHeight: 'var(--text-lg-line)' }],
        xl: ['var(--text-xl)', { lineHeight: 'var(--text-xl-line)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--text-2xl-line)' }],
      },
      transitionTimingFunction: {
        fast: 'var(--transition-fast)',
        base: 'var(--transition-base)',
        slow: 'var(--transition-slow)',
      },
      fontWeight: {
        normal: 'var(--font-400)',
        medium: 'var(--font-500)',
        semibold: 'var(--font-600)',
        bold: 'var(--font-700)',
      }
    },
  },
  plugins: [],
}