"use client";

import { createContext, useContext, useState, useCallback, useLayoutEffect } from "react";

const CATEGORY_THEMES = {
  drinks: {
    bg: "6 16 13",
    bgLight: "14 32 26",
    bgLighter: "22 48 40",
    accent: "77 182 172",
    accentLight: "128 203 196",
    accentDark: "38 100 90",
    cream: "230 247 244",
    creamMuted: "168 196 192",
    creamDark: "85 130 120",
  },
  soups: {
    bg: "26 14 8",
    bgLight: "42 26 16",
    bgLighter: "62 38 22",
    accent: "212 118 78",
    accentLight: "240 160 112",
    accentDark: "139 65 19",
    cream: "254 240 224",
    creamMuted: "212 180 152",
    creamDark: "139 100 70",
  },
  food: {
    bg: "13 18 8",
    bgLight: "26 34 16",
    bgLighter: "40 52 22",
    accent: "124 179 66",
    accentLight: "160 212 104",
    accentDark: "70 100 30",
    cream: "240 247 230",
    creamMuted: "180 196 168",
    creamDark: "100 120 85",
  },
  "bakery-snacks": {
    bg: "13 9 6",
    bgLight: "26 17 11",
    bgLighter: "38 26 18",
    accent: "212 165 116",
    accentLight: "244 228 188",
    accentDark: "139 69 19",
    cream: "254 247 230",
    creamMuted: "212 196 168",
    creamDark: "139 115 85",
  },
  desserts: {
    bg: "18 6 14",
    bgLight: "34 14 26",
    bgLighter: "52 22 40",
    accent: "192 96 144",
    accentLight: "224 144 176",
    accentDark: "120 50 80",
    cream: "254 240 244",
    creamMuted: "212 164 184",
    creamDark: "139 85 110",
  },
} as const;

export type ThemeKey = keyof typeof CATEGORY_THEMES;

interface ThemeContextValue {
  activeTheme: ThemeKey;
  setTheme: (key: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: (typeof CATEGORY_THEMES)[ThemeKey]) {
  const root = document.documentElement;
  root.style.setProperty("--theme-bg", theme.bg);
  root.style.setProperty("--theme-bg-light", theme.bgLight);
  root.style.setProperty("--theme-bg-lighter", theme.bgLighter);
  root.style.setProperty("--theme-accent", theme.accent);
  root.style.setProperty("--theme-accent-light", theme.accentLight);
  root.style.setProperty("--theme-accent-dark", theme.accentDark);
  root.style.setProperty("--theme-cream", theme.cream);
  root.style.setProperty("--theme-cream-muted", theme.creamMuted);
  root.style.setProperty("--theme-cream-dark", theme.creamDark);
}

const DEFAULT_THEME: ThemeKey = "drinks";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeTheme, setActiveTheme] = useState<ThemeKey>(DEFAULT_THEME);

  useLayoutEffect(() => {
    applyTheme(CATEGORY_THEMES[activeTheme]);
  }, [activeTheme]);

  const setTheme = useCallback((key: ThemeKey) => {
    if (CATEGORY_THEMES[key]) {
      setActiveTheme(key);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ activeTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export { CATEGORY_THEMES };
