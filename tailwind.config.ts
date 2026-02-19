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
        bg: "#0D0906",
        surface: {
          DEFAULT: "#1A110B",
          light: "#261A12",
          lighter: "#3D2A1A",
        },
        cream: {
          DEFAULT: "#fef7e6",
          muted: "#d4c4a8",
          dark: "#8b7355",
        },
        gold: {
          DEFAULT: "#d4a574",
          light: "#f4e4bc",
          dark: "#8b4513",
        },
        plum: {
          DEFAULT: "#8B5A6B",
          light: "#B4718A",
          dark: "#6B3A4E",
        },
        berry: "#C4688A",
        accent: "#b8941f",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3.5rem, 10vw, 10rem)", { lineHeight: "0.9", letterSpacing: "-0.04em" }],
        "display-lg": ["clamp(2.5rem, 7vw, 7rem)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
        "display-md": ["clamp(2rem, 5vw, 5rem)", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display-sm": ["clamp(1.5rem, 3vw, 3rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      boxShadow: {
        "gold-sm": "0 2px 12px rgba(212, 165, 116, 0.08)",
        "gold-md": "0 4px 24px rgba(212, 165, 116, 0.12), 0 0 0 1px rgba(212, 165, 116, 0.06)",
        "gold-lg": "0 8px 40px rgba(212, 165, 116, 0.16), 0 0 0 1px rgba(212, 165, 116, 0.08)",
        "card": "0 2px 20px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(212, 165, 116, 0.1)",
      },
      animation: {
        "marquee": "marquee 30s linear infinite",
        "marquee-reverse": "marquee-reverse 30s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 4s ease-in-out infinite",
        "gold-pulse": "gold-pulse 3s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
