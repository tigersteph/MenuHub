/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#f7651d",
        "background-light": "#f8f6f5",
        "background-dark": "#23160f",
        "content-light": "#1f1f1f",
        "content-dark": "#e0e0e0",
        "subtle-light": "#6b7280",
        "subtle-dark": "#9ca3af",
        "surface-light": "#ffffff",
        "surface-dark": "#372c26",
        "success": "#16a34a",
        "success-content": "#ffffff"
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "full": "9999px"
      },
      spacing: {
        'xs': '0.5rem',
        'sm': '0.75rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem'
      }
    },
  },
  plugins: [],
}

