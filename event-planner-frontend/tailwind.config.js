/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Arial', 'Helvetica', 'sans-serif'],
      },
      colors: {
        // Brand — azul original del proyecto (#2563eb)
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Sidebar oscuro (slate-900 derivado)
        sidebar: {
          bg:     '#1A2332',
          hover:  'rgba(255,255,255,0.10)',
          active: 'rgba(255,255,255,0.20)',
          border: 'rgba(255,255,255,0.10)',
        },
        // Semantic — éxito, advertencia, error, info
        success:  '#10b981', // emerald-500
        warning:  '#f59e0b', // amber-500
        danger:   '#ef4444', // rose-500
        info:     '#0ea5e9', // sky-500
        // Estado de eventos
        event: {
          draft:     '#94a3b8', // slate-400
          published: '#2563eb', // brand-600
          cancelled: '#ef4444', // rose-500
          finished:  '#10b981', // emerald-500
        },
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
        modal: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
        sidebar: '2px 0 10px rgba(0,0,0,0.15)',
      },
      keyframes: {
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'spin-slow':  'spin-slow 1s linear infinite',
        'fade-in':    'fade-in 0.2s ease-out',
        'slide-up':   'slide-up 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
