import type { Config } from "tailwindcss";

export default {
  content: ["./src/app/**/*.{js,ts,jsx,tsx}", "./src/components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#251816", wine: "#57182b", blush: "#f2ded8", parchment: "#f8f3ed", line: "#ddcec4" },
      fontFamily: { display: ["var(--font-poppins)", "sans-serif"], sans: ["var(--font-poppins)", "sans-serif"], mono: ["var(--font-poppins)", "sans-serif"] },
      boxShadow: { panel: "0 18px 60px rgba(52, 20, 25, .16)" }
    }
  },
  plugins: []
} satisfies Config;
