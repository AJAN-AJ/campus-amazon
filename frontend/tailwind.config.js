/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amazon: {
          light: '#febd69',
          DEFAULT: '#ff9900',
          dark: '#131921',
          background: '#eaeded',
        }
      }
    },
  },
  plugins: [],
}