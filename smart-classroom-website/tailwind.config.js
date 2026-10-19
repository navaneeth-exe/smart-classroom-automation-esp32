/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#faf9f5',
          surface: 'rgba(255, 255, 255, 0.85)',
          border: 'rgba(229, 231, 235, 0.8)',
          ink: '#1c1917',
          muted: '#78716c',
          terracotta: '#ea580c',
          ocean: '#0284c7',
          amber: '#d97706',
          indigo: '#4f46e5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0, 0, 0, 0.04)',
        glass: '0 12px 35px rgba(28, 25, 23, 0.05)',
        glow: '0 0 25px rgba(217, 119, 6, 0.25)',
      }
    },
  },
  plugins: [],
}
