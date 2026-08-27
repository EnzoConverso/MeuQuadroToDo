/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: '#121215',
        surfaceHover: '#1c1c21',
        border: '#27272a',
        borderLight: '#3f3f46',
        textPrimary: '#f4f4f5',
        textSecondary: '#a1a1aa',
        textMuted: '#71717a',
        accent: '#ffffff',
        accentHover: '#e4e4e7',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
