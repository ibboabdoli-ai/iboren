"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeMode = "dark" | "light" | "system";

const options: Array<{ mode: ThemeMode; label: string; Icon: typeof Moon }> = [
  { mode: "dark", label: "Dark", Icon: Moon },
  { mode: "light", label: "Light", Icon: Sun },
  { mode: "system", label: "System", Icon: Monitor }
];

function resolvedTheme(mode: ThemeMode) {
  if (mode !== "system") return mode;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode: ThemeMode) {
  const theme = resolvedTheme(mode);
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themeMode = mode;
  document.documentElement.style.colorScheme = theme;
}

export default function ThemeSwitcher() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("iboren-theme");
    const initialMode: ThemeMode = stored === "light" || stored === "system" ? stored : "dark";
    setMode(initialMode);
    applyTheme(initialMode);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => {
      if (window.localStorage.getItem("iboren-theme") === "system") applyTheme("system");
    };
    media.addEventListener("change", syncSystemTheme);
    return () => media.removeEventListener("change", syncSystemTheme);
  }, []);

  function selectTheme(nextMode: ThemeMode) {
    window.localStorage.setItem("iboren-theme", nextMode);
    setMode(nextMode);
    applyTheme(nextMode);
    setOpen(false);
  }

  const ActiveIcon = options.find((option) => option.mode === mode)?.Icon || Moon;

  return (
    <div className="iboren-theme-switcher">
      {open && (
        <div className="iboren-theme-menu" role="menu" aria-label="Theme">
          {options.map(({ mode: optionMode, label, Icon }) => (
            <button
              key={optionMode}
              type="button"
              role="menuitemradio"
              aria-checked={mode === optionMode}
              className={mode === optionMode ? "is-active" : ""}
              onClick={() => selectTheme(optionMode)}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        className="iboren-theme-trigger"
        aria-label="Change color theme"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <ActiveIcon size={17} aria-hidden="true" />
        <span>Theme</span>
      </button>
    </div>
  );
}
