/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#1C1B18',
          light: '#282723',
          muted: '#3B3934',
        },
        surface: {
          DEFAULT: '#FAF9F6',
          card: '#FFFFFF',
          muted: '#F3EFEA',
          border: '#E6E1D8',
          hover: '#EDE7DC',
        },
        mustard: {
          DEFAULT: '#D9A441',
          hover: '#C59132',
          light: '#FBF4E7',
          border: '#ECD7A3',
        },
        sage: {
          DEFAULT: '#2E6B4F',
          light: '#EAF3EE',
          border: '#C1DFCF',
        },
        bordeaux: {
          DEFAULT: '#A8324A',
          light: '#FDF0F2',
          border: '#F2C8D1',
        },
        cloudsky: {
          DEFAULT: '#1E2D3D',
          light: '#283C50',
          border: '#334D66',
          accent: '#72A7D4',
          hover: '#24374A',
          soft: '#EAF2F8',
          text: '#E3EEF8',
          muted: '#8EAEC9',
        },
        sidebar: '#1E2D3D',
      },

      fontFamily: {
        serif: ['"Libre Baskerville"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}

