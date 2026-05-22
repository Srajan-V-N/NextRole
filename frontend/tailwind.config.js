/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#00D5B9',
          hover: '#00BFA5',
          light: '#E6F4F1',
          dark: '#00A896',
        },
        light: {
          bg: '#F7FFFD',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          border: '#E6F4F1',
          'border-strong': '#C8E8E2',
          text: '#0B1F1A',
          muted: '#5C7C75',
          subtle: '#F2FFFC',
        },
        dark: {
          bg: '#00110F',
          surface: '#0C1614',
          card: '#0C1614',
          border: '#182926',
          'border-strong': '#243D39',
          text: '#E7FFFC',
          muted: '#5C8A80',
          subtle: '#070E0D',
        },
        success: '#00D756',
        warning: '#FFC822',
        error: '#D62828',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      fontSize: {
        'hero': ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'title': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 10px 30px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.06), 0 20px 50px rgba(0,0,0,0.08)',
        'card-active': '0 0 0 2px rgba(0,213,185,0.40)',
        'focus': '0 0 0 3px rgba(0, 213, 185, 0.25)',
        'dropdown': '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.05)',
        'glow': '0 0 20px rgba(0,213,185,0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.8s linear infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'count-up': 'fadeIn 0.6s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-sm': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      maxWidth: {
        '8xl': '1400px',
        '9xl': '1600px',
      },
    },
  },
  plugins: [],
}
