"use client";

import { usePathname } from "next/navigation";

export default function HomeMobileLanguageButton() {
  const pathname = usePathname() || "/";
  if (pathname !== "/") return null;

  return (
    <a
      href="/en"
      aria-label="Switch to English"
      className="fixed right-[4.6rem] top-[calc(env(safe-area-inset-top,0px)+1.15rem)] z-[60] rounded-full border border-gold/25 bg-night/70 px-3 py-2 text-xs font-black uppercase tracking-[.14em] text-porcelain/80 shadow-xl backdrop-blur md:hidden"
    >
      EN
    </a>
  );
}
