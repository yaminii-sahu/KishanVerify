/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Noto Sans Devanagari', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Design Reference Sampled Tokens (Image A & Image B)
        forest: {
          DEFAULT: '#4A6538', // Dark olive green for sidebar, headers, splash
          dark: '#3D552E',
          hover: '#425B32',
        },
        olive: {
          DEFAULT: '#5B7A47', // Primary green for buttons and active states
          hover: '#4F6C3D',
          dark: '#425B32',
        },
        tint: {
          DEFAULT: '#E4EBD6', // Light sage tint for pills, icon boxes, hero
          light: '#EDF2E3',
        },
        cream: {
          DEFAULT: '#F7F5EC', // Warm app background
          surface: '#FDFCF8', // Card surface
        },
        charcoal: {
          DEFAULT: '#1F2A1B', // Deep green-charcoal headings
        },
        muted: {
          DEFAULT: '#6B7565', // Muted grey-green subtitles
        },
        status: {
          eligible: {
            bg: '#EBF2DE',
            text: '#335C24',
          },
          review: {
            bg: '#FDF0E2',
            text: '#8C531E',
          },
          discrepancy: {
            bg: '#FCEAE4',
            text: '#B83227',
          },
        },

        // Backward compatibility mappings
        sage: {
          50: '#F4F7F2',
          100: '#E8EFE5',
          200: '#D2DFCC',
          300: '#AFC5A5',
          400: '#8AA97D',
          500: '#5B7A47',
          600: '#4A6538',
          700: '#3D552E',
          800: '#2C4022',
          900: '#1F2A1B',
          950: '#13200E',
        },
        sidebar: {
          DEFAULT: '#4A6538',
          hover: '#425B32',
          active: '#3D552E',
        },
        warm: {
          bg: '#F7F5EC',
          surface: '#FDFCF8',
          card: '#FDFCF8',
          border: '#E8E5DA',
          muted: '#6B7565',
        },
        kisan: {
          green: '#5B7A47',
          darkgreen: '#4A6538',
          lightgreen: '#EBF2DE',
          cream: '#F7F5EC',
          tint: '#E4EBD6',
          red: '#B83227',
          lightred: '#FCEAE4',
          amber: '#8C531E',
          lightamber: '#FDF0E2',
        }
      },
      borderRadius: {
        'xl': '0.75rem',  // 12px for inputs & buttons
        '2xl': '1rem',    // 16px for cards
        '3xl': '1.25rem', // 20px
        '4xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(35, 45, 25, 0.04)',
        'card': '0 4px 16px rgba(35, 45, 25, 0.05)',
        'dropdown': '0 10px 25px -5px rgba(35, 45, 25, 0.1)',
      }
    },
  },
  plugins: [],
}
