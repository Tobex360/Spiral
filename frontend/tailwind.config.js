/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ED1C24',
        secondary: '#2D2926',
      },
      fontFamily: {
        audiowide: ['"Audiowide"', 'cursive'],
        rubik: ['"Rubik Glitch"', 'cursive'],
        tomorrow: ['"Tomorrow"', 'cursive'],
        wallpoet: ['"Wallpoet"', 'cursive'],
      }
    },
  },
  plugins: [],
}
