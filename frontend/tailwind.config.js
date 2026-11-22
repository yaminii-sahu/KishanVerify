/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F4F7F2',
          100: '#E8EFE5',
          200: '#D2DFCC',
          300: '#AFC5A5',
          400: '#8AA97D',
          500: '#698E59',
          600: '#4E6E3D', // Primary button / accent green
          700: '#3D5730',
          800: '#2C4022',
          900: '#1D2E16',
          950: '#13200E',
        },
        sidebar: {
          DEFAULT: '#233E25', // Dark green sidebar from mockups
          hover: '#2D4E30',
          active: '#39603D',
        },
        warm: {
          bg: '#FAF8F2',
          surface: '#FFFFFF',
          card: '#F6F4ED',
          border: '#E8E4DA',
          muted: '#7B8476',
        },
        kisan: {
          green: '#4E6E3D',
          darkgreen: '#233E25',
          lightgreen: '#EAF2E8',
          cream: '#FAF8F2',
          red: '#C53030',
          lightred: '#FDECEB',
          amber: '#B45309',
          lightamber: '#FEF3E2',
          blue: '#1D4ED8',
          lightblue: '#EFF6FF',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(44, 62, 45, 0.06)',
      }
    },
  },
  plugins: [],
}
