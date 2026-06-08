"use client";

import { useTheme } from "./ThemeProvider";
import type { ThemeMode } from "./theme-storage";

const options: { label: string; value: ThemeMode }[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" }
];

export default function ThemeSwitch({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">Choose theme</span>
      <select
        aria-label="Choose theme"
        value={theme}
        onChange={(event) => setTheme(event.target.value as ThemeMode)}
        style={{ color: "var(--gold)", WebkitTextFillColor: "var(--gold)" }}
        className="h-10 w-full min-w-[5.75rem] cursor-pointer appearance-none rounded-full border border-gold/30 bg-night/70 px-3 pr-7 text-xs font-bold text-gold outline-none transition hover:border-gold/55 focus-visible:ring-2 focus-visible:ring-gold/60"
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gold">▼</span>
    </label>
  );
}
