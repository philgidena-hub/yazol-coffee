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
        bg: "#FAFAF8",
        surface: {
          DEFAULT: "#FFFFFF",
          light: "#F5F0EB",
          lighter: "#EDE7E0",
        },
        cream: {
          DEFAULT: "#1A1A1A",
          muted: "#6B6B6B",
          dark: "#999999",
        },
        gold: {
          DEFAULT: "#8B6914",
          light: "#A67C2E",
          dark: "#6B4F0E",
        },
        plum: {
          DEFAULT: "#8B5A6B",
          light: "#B4718A",
          dark: "#6B3A4E",
        },
        berry: "#C4688A",
        accent: "#8B6914",
        brown: {
          DEFAULT: "#3D2B1F",
          light: "#5C4033",
          warm: "#D4A574",
        },
        green: {
          DEFAULT: "#2D5A27",
          light: "#3A7233",
        },
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
        "soft-sm": "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
        "soft-md": "0 4px 12px rgba(0, 0, 0, 0.08)",
        "soft-lg": "0 8px 30px rgba(0, 0, 0, 0.1)",
        "card": "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 8px 30px rgba(0, 0, 0, 0.12)",
        "gold-sm": "0 2px 12px rgba(139, 105, 20, 0.08)",
        "gold-md": "0 4px 24px rgba(139, 105, 20, 0.12)",
        "gold-lg": "0 8px 40px rgba(139, 105, 20, 0.16)",
      },
      animation: {
        "marquee": "marquee 30s linear infinite",
        "marquee-reverse": "marquee-reverse 30s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 4s ease-in-out infinite",
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
