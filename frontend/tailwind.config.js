/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        vault: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c2d3fe',
          300: '#93b2fd',
          400: '#6089fa',
          500: '#3b62f5',
          600: '#2543eb',
          700: '#1d32d8',
          800: '#1e2bae',
          900: '#1e2b89',
          950: '#161a53',
        },
        surface: {
          DEFAULT: '#ffffff',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          dark: '#0f1117',
          'dark-50': '#161b27',
          'dark-100': '#1e2535',
          'dark-200': '#252d3d',
        },
      },
      boxShadow: {
        'vault': '0 4px 24px rgba(59, 98, 245, 0.15)',
        'vault-lg': '0 8px 40px rgba(59, 98, 245, 0.2)',
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08)',
        'card-dark': '0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
