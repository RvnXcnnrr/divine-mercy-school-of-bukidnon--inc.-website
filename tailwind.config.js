import lineClamp from '@tailwindcss/line-clamp'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          navy: '#071A2F',
          red: '#B91C1C',
          rose: '#FB7185',
          gold: '#B91C1C',
          goldBright: '#EF4444',
          goldPale: '#FCE8EA',
          goldText: '#B91C1C',
          sky: '#F8FAFC',
          blue: '#B91C1C',
          ink: '#0B1220',
          neutral: '#F8FAFC',
        },
      },
    },
  },
  plugins: [lineClamp],
}
