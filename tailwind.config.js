import lineClamp from '@tailwindcss/line-clamp'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#071A2F',
          // Logo-based primary (red)
          gold: '#C5161D',
          goldBright: '#E0444A',
          goldPale: '#FCE8EA',
          goldText: '#A11318',
          sky: '#F4F7FF',
          blue: '#C5161D',
          ink: '#0B1220',
        },
      },
    },
  },
  plugins: [lineClamp],
}

