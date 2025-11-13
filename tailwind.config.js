// @ts-check
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  darkMode: "class",
};
