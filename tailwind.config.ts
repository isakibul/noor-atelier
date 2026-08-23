import type { Config } from "tailwindcss";

export default {
  content: ["./src/app/**/*.{js,ts,jsx,tsx}", "./src/components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#251816", wine: "#57182b", blush: "#f2ded8", parchment: "#f8f3ed", line: "#ddcec4" },
      fontFamily: { display: ["var(--font-display)", "serif"], sans: ["var(--font-sans)", "sans-serif"], mono: ["var(--font-mono)", "monospace"] },
      boxShadow: { panel: "0 18px 60px rgba(52, 20, 25, .16)" }
    }
  },
  plugins: []
} satisfies Config;
