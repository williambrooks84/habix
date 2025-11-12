/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./pages/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: 'var(--shadcn-primary)',
        'primary-foreground': 'var(--shadcn-primary-foreground)',
        background: 'var(--shadcn-background)',
        foreground: 'var(--shadcn-foreground)',
        border: 'var(--shadcn-border)',
        muted: 'var(--shadcn-muted)',
        'muted-foreground': 'var(--shadcn-muted-foreground)',
        input: 'var(--shadcn-input)',
        ring: 'var(--shadcn-ring)'
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};