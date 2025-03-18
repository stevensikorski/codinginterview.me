/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      inter: ["Inter", "sans-serif"],
      mono: ["Menlo", "Monaco", "Consolas", "Courier New", "monospace"],
    },
    extend: {
      colors: {
        dark: "#252422",
        "dark-100": "#403D39",
        light: "#FFFCF2",
        primary: "#EB5E28",
      },
    },
  },
  plugins: [],
};
