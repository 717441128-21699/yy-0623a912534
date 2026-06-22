/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#e6f5f5',
          100: '#b3e0e0',
          200: '#80cccc',
          300: '#4db8b8',
          400: '#26a8a8',
          500: '#0A6E6E',
          600: '#096363',
          700: '#075252',
          800: '#054141',
          900: '#033030',
        },
        warm: {
          50: '#FAFAF8',
          100: '#F5F5F0',
          200: '#E8E8E0',
          300: '#D4D4C8',
          400: '#B8B8A8',
        },
        amber: {
          500: '#E8A838',
          600: '#D49520',
        },
        coral: {
          500: '#E85D5D',
          600: '#D44444',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      borderRadius: {
        'xl2': '12px',
      },
    },
  },
  plugins: [],
};
