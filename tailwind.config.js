/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Явно задаем темный цвет текста для всех форм
  darkMode: false,
  variants: {
    extend: {},
  },
}