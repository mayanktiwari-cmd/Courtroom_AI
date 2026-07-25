/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Navy / Royal Blue Palette
        primary: {
          DEFAULT: '#101820', // Trustworthy dark navy
          light: '#1A2530',
        },
        royal: {
          DEFAULT: '#0047AB', // Royal blue accent
          light: '#005CE6',
        },
        accent: {
          DEFAULT: '#007BFF', // Vibrant interactive blue
          light: '#3395FF',
          muted: '#E6F2FF',
        },
        surface: {
          DEFAULT: '#F4F7F9', // Crisp light gray background
          dark: '#E2E8F0',
        },
        card: {
          DEFAULT: '#FFFFFF', // Clean white components
        },
        border: {
          DEFAULT: '#E2E8F0', // Subtle dividers
          dark: '#CBD5E1',
        },
        text: {
          main: '#333333',    // Text on light backgrounds
          muted: '#666666',   // Secondary text
          light: '#A0AEC0',   // Subtle details
          white: '#FFFFFF',   // Text on dark backgrounds
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '2px',
        sm: '2px',
        md: '2px',
        lg: '2px',
        full: '2px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        none: 'none',
      },
      letterSpacing: {
        tightest: '-0.03em',
        tighter: '-0.02em',
        widest: '0.25em',
      },
      lineHeight: {
        relaxed: '1.7',
        loose: '1.85',
      }
    },
  },
  plugins: [],
}
