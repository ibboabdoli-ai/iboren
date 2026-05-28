"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const buttonId = "iboren-home-mobile-language-button";

export default function HomeMobileLanguageButton() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    if (pathname !== "/" && pathname !== "/en") return;

    const nav = document.querySelector<HTMLElement>("header nav");
    if (!nav || document.getElementById(buttonId)) return;

    const isEnglish = pathname === "/en";
    nav.style.position = nav.style.position || "relative";

    const link = document.createElement("a");
    link.id = buttonId;
    link.href = isEnglish ? "/" : "/en";
    link.setAttribute("aria-label", isEnglish ? "Byt till svenska" : "Switch to English");
    link.textContent = isEnglish ? "SV" : "EN";
    link.className = "absolute right-16 top-1/2 z-[70] -translate-y-1/2 rounded-full border border-gold/25 bg-night/80 px-3 py-2 text-xs font-black uppercase tracking-[.14em] text-porcelain/80 shadow-xl backdrop-blur md:hidden";

    nav.appendChild(link);

    return () => {
      link.remove();
    };
  }, [pathname]);

  return null;
}
