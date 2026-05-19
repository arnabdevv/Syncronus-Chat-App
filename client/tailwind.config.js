/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    // Avatar colour classes built dynamically via getColor()
    // Pattern covers bg-*, border-*, text-* for all your colour variants
    {
      pattern:
        /bg-(background|surface|surface-container|surface-bright|electric-violet|deep-indigo|primary)/,
    },
    { pattern: /text-(electric-violet|deep-indigo|primary|on-primary)/ },
    { pattern: /border-(electric-violet|deep-indigo|primary)/ },
    // Add any other dynamically constructed class patterns here
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "#0b1326",
        surface: "#1E293B",
        "surface-container": "#171f33",
        "surface-bright": "#31394d",
        "surface-tint": "#d0bcff",
        primary: "#d0bcff",
        "on-primary": "#3c0091",
        "primary-container": "#a078ff",
        "electric-violet": "#8B5CF6",
        "deep-indigo": "#4F46E5",
      },
      boxShadow: {
        neon: "0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
