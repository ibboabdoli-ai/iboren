"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const svToEn: Record<string, string> = {
  "/": "/en",
  "/priser": "/en/prices",
  "/jobb": "/en/jobs",
  "/om-iboren": "/en/about",
  "/privacy": "/en/privacy",
  "/terms": "/en/terms",
  "/cleaner": "/en/cleaner",
  "/hemstadning": "/en/home-cleaning",
  "/flyttstadning": "/en/move-out-cleaning",
  "/kontorsstadning": "/en/office-cleaning",
  "/fonsterputs": "/en/window-cleaning",
  "/hemstadning-sodertalje": "/en/home-cleaning-sodertalje",
  "/flyttstadning-sodertalje": "/en/move-out-cleaning-sodertalje",
  "/fonsterputs-sodertalje": "/en/window-cleaning-sodertalje",
  "/kontorsstadning-sodertalje": "/en/office-cleaning-sodertalje",
  "/hemstadning-stockholm": "/en/home-cleaning-stockholm",
  "/flyttstadning-stockholm": "/en/move-out-cleaning-stockholm",
  "/fonsterputs-stockholm": "/en/window-cleaning-stockholm",
  "/kontorsstadning-stockholm": "/en/office-cleaning-stockholm"
};

const enToSv = Object.fromEntries(Object.entries(svToEn).map(([sv, en]) => [en, sv]));

function normalize(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export default function LanguageSwitcher() {
  const pathname = normalize(usePathname() || "/");
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const svHref = isEnglish ? enToSv[pathname] || "/" : pathname;
  const enHref = isEnglish ? pathname : svToEn[pathname] || "/en";

  return (
    <nav aria-label="Language" className="fixed right-20 top-5 z-[80] flex overflow-hidden rounded-full border border-gold/30 bg-night/90 text-[11px] font-black uppercase tracking-[.14em] text-porcelain shadow-xl backdrop-blur md:right-8 md:top-5">
      <Link href={svHref} className={`px-3 py-2 transition ${!isEnglish ? "bg-gold text-night" : "text-porcelain/72 hover:text-gold"}`}>SV</Link>
      <Link href={enHref} className={`px-3 py-2 transition ${isEnglish ? "bg-gold text-night" : "text-porcelain/72 hover:text-gold"}`}>EN</Link>
    </nav>
  );
}
