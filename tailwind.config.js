/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#00f5ff',
          magenta: '#ff00ff',
          purple: '#8b00ff',
          green: '#00ff88',
          yellow: '#ffff00',
          red: '#ff0055',
          blue: '#0080ff',
          pink: '#ff007f',
        },
        dark: {
          950: '#020207',
          900: '#050510',
          800: '#0a0a1a',
          700: '#0d0d22',
          600: '#12122c',
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'spin-reverse': 'spin-reverse 6s linear infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'matrix': 'matrix 20s linear infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 5s ease infinite',
        'ring-spin-1': 'spin 12s linear infinite',
        'ring-spin-2': 'spin 8s linear infinite reverse',
        'ring-spin-3': 'spin 15s linear infinite',
        'particle-burst': 'particle-burst 0.6s ease-out forwards',
      },
      keyframes: {
        'spin-reverse': { '0%': { transform: 'rotate(360deg)' }, '100%': { transform: 'rotate(0deg)' } },
        'pulse-neon': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.4)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px #00f5ff, 0 0 20px #00f5ff40' },
          '50%': { boxShadow: '0 0 20px #00f5ff, 0 0 40px #00f5ff60, 0 0 60px #00f5ff30' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'particle-burst': {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
