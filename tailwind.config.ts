import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dce6ff',
          200: '#b9ccff',
          300: '#84a9ff',
          400: '#4d7dff',
          500: '#1a56ff',
          600: '#0034f5',
          700: '#0029d4',
          800: '#0022ab',
          900: '#0F172A',
          950: '#080d1a',
          DEFAULT: '#0F172A',
        },
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#F59E0B',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT: '#F59E0B',
        },
        success: '#10B981',
        danger:  '#EF4444',
        navy:    '#0F172A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':     'fadeIn 0.3s ease-in-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'slide-down':  'slideDown 0.3s ease-out',
        'pulse-soft':  'pulseSoft 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'count-up':    'countUp 1s ease-out',
        'shimmer':     'shimmer 2s infinite',
        'bounce-soft': 'bounceSoft 1s infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.7' } },
        shimmer:   { '0%': { backgroundPosition: '-200px 0' }, '100%': { backgroundPosition: 'calc(200px + 100%) 0' } },
        bounceSoft:{ '0%,100%': { transform: 'translateY(-5%)' }, '50%': { transform: 'none' } },
      },
      boxShadow: {
        'card':       '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        'brand':      '0 4px 14px 0 rgba(15,23,42,0.39)',
        'accent':     '0 4px 14px 0 rgba(245,158,11,0.39)',
        'glow':       '0 0 20px rgba(245,158,11,0.3)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0F172A 0%, #1e3a5f 100%)',
        'gradient-accent':'linear-gradient(135deg, #F59E0B 0%, #f97316 100%)',
        'gradient-card':  'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'shimmer-bg':     'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      },
    },
  },
  plugins: [],
};

export default config;
