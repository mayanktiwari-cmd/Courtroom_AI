/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        page: '#fafaf9',
        heading: '#111',
        body: '#374151',
        muted: '#9ca3af',
        rule: '#e5e7eb',
      },
      maxWidth: {
        doc: '720px',
      },
      letterSpacing: {
        label: '0.05em',
      },
    },
  },
  plugins: [],
}
