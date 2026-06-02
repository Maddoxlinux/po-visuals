import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#050B14",
        accent: "#00E5FF",
        "accent-dim": "rgba(0,229,255,0.12)",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        mono: ["var(--font-space-mono)", "monospace"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.3em",
        ultra: "0.5em",
      },
    },
  },
  plugins: [],
};

export default config;
