/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: "#f3faf5",
          100: "#e3f5e7",
          200: "#c3e7cb",
          300: "#98d3a6",
          400: "#69b777",
          500: "#3e944e",
          600: "#2f773d",
          700: "#265f33",
          800: "#1f4b2a",
          900: "#183c23"
        }
      }
    }
  },
  plugins: []
};

