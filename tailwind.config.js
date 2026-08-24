/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bengkel: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          primary: '#2563eb',
          accent: '#059669',
          warning: '#d97706',
          danger: '#dc2626',
        }
      }
    },
  },
  plugins: [],
}
