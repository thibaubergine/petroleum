/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palette A - Petrole Industriel
        oil: {
          slate:  '#2C3E50',
          steel:  '#34495E',
          blue:   '#4A90A4',
          green:  '#2E7D6B',
          sand:   '#ECE5D8',
          rust:   '#B85450',
          ocre:   '#C17F24',
          'sand-light': '#F5F0E8',
          'sand-dark':  '#D4C7B3',
          'slate-dark': '#1E2D3D',
        },
        flag: {
          red:    '#B85450',
          orange: '#E8943A',
          blue:   '#4A90A4',
          purple: '#7B5EA7',
        }
      }
    }
  },
  plugins: [],
}
