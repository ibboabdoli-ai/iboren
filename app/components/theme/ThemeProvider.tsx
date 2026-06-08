"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { readStoredTheme, resolveTheme, storeTheme, type EffectiveTheme, type ThemeMode } from "./theme-storage";

type ThemeContextValue = {
  theme: ThemeMode;
  effectiveTheme: EffectiveTheme;
  setTheme: (theme: ThemeMode) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>("dark");

  const applyTheme = useCallback((mode: ThemeMode, prefersDark: boolean) => {
    const effective = resolveTheme(mode, prefersDark);
    document.documentElement.dataset.theme = effective;
    setEffectiveTheme(effective);
  }, []);

  useEffect(() => {
    setThemeState(readStoredTheme());
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    applyTheme(theme, media.matches);

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      if (theme === "system") applyTheme("system", event.matches);
    };

    media.addEventListener("change", handleSystemThemeChange);
    return () => media.removeEventListener("change", handleSystemThemeChange);
  }, [applyTheme, theme]);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    storeTheme(nextTheme);
    setThemeState(nextTheme);
  }, []);

  const value = useMemo(() => ({ theme, effectiveTheme, setTheme }), [effectiveTheme, setTheme, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
