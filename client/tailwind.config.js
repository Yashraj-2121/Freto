/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        freto: {
          navy: "#0F2138",
          "navy-dark": "#0A1826",
          orange: "#F0740A",
          "orange-light": "#FF8C2E",
        },
      },
    },
  },
  plugins: [],
};
