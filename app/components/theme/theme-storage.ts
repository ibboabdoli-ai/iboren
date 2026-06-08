export type ThemeMode = "light" | "dark" | "system";
export type EffectiveTheme = Exclude<ThemeMode, "system">;

export const THEME_STORAGE_KEY = "iboren-theme";

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

export function resolveTheme(mode: ThemeMode, prefersDark: boolean): EffectiveTheme {
  return mode === "system" ? (prefersDark ? "dark" : "light") : mode;
}

export function readStoredTheme(): ThemeMode {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(storedTheme) ? storedTheme : "system";
  } catch {
    return "system";
  }
}

export function storeTheme(theme: ThemeMode) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Theme selection still applies for the current page when storage is unavailable.
  }
}
