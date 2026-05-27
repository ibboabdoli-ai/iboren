"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const svToEn: Record<string, string> = {
  "/": "/en",
  "/priser": "/en/prices",
  "/jobb": "/en/jobs",
  "/om-iboren": "/en/about",
  "/privacy": "/en/privacy",
  "/terms": "/en/terms",
  "/profile": "/en/profile",
  "/cleaner": "/en/cleaner",
  "/hemstadning": "/en/home-cleaning",
  "/flyttstadning": "/en/move-out-cleaning",
  "/kontorsstadning": "/en/office-cleaning",
  "/fonsterputs": "/en/window-cleaning",
  "/tjanster/hemstadning": "/en/home-cleaning",
  "/tjanster/flyttstadning": "/en/move-out-cleaning",
  "/tjanster/kontorsstadning": "/en/office-cleaning",
  "/tjanster/fonsterputs": "/en/window-cleaning",
  "/hemstadning-sodertalje": "/en/home-cleaning-sodertalje",
  "/flyttstadning-sodertalje": "/en/move-out-cleaning-sodertalje",
  "/fonsterputs-sodertalje": "/en/window-cleaning-sodertalje",
  "/kontorsstadning-sodertalje": "/en/office-cleaning-sodertalje",
  "/hemstadning-stockholm": "/en/home-cleaning-stockholm",
  "/flyttstadning-stockholm": "/en/move-out-cleaning-stockholm",
  "/fonsterputs-stockholm": "/en/window-cleaning-stockholm",
  "/kontorsstadning-stockholm": "/en/office-cleaning-stockholm"
};

const enToSv: Record<string, string> = {
  "/en": "/",
  "/en/prices": "/priser",
  "/en/jobs": "/jobb",
  "/en/about": "/om-iboren",
  "/en/privacy": "/privacy",
  "/en/terms": "/terms",
  "/en/profile": "/profile",
  "/en/cleaner": "/cleaner",
  "/en/home-cleaning": "/tjanster/hemstadning",
  "/en/move-out-cleaning": "/tjanster/flyttstadning",
  "/en/office-cleaning": "/tjanster/kontorsstadning",
  "/en/window-cleaning": "/tjanster/fonsterputs",
  "/en/home-cleaning-sodertalje": "/hemstadning-sodertalje",
  "/en/move-out-cleaning-sodertalje": "/flyttstadning-sodertalje",
  "/en/window-cleaning-sodertalje": "/fonsterputs-sodertalje",
  "/en/office-cleaning-sodertalje": "/kontorsstadning-sodertalje",
  "/en/home-cleaning-stockholm": "/hemstadning-stockholm",
  "/en/move-out-cleaning-stockholm": "/flyttstadning-stockholm",
  "/en/window-cleaning-stockholm": "/fonsterputs-stockholm",
  "/en/office-cleaning-stockholm": "/kontorsstadning-stockholm"
};
const mobileHomeStyleId = "iboren-home-language-switcher-style";

function normalize(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function ensureMobileHomeLanguageStyle() {
  if (document.getElementById(mobileHomeStyleId)) return;

  const style = document.createElement("style");
  style.id = mobileHomeStyleId;
  style.textContent = `
    @media (max-width: 767px) {
      nav[aria-label="Language"].iboren-home-language-switcher {
        display: flex !important;
        position: fixed !important;
        top: calc(env(safe-area-inset-top, 0px) + 1.35rem) !important;
        right: calc(env(safe-area-inset-right, 0px) + 4.75rem) !important;
        z-index: 140 !important;
        transform: translateZ(0) !important;
        will-change: transform !important;
      }

      body:has(nav[aria-label="Language"].iboren-home-language-switcher) header {
        position: fixed !important;
        top: env(safe-area-inset-top, 0px) !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 130 !important;
      }

      body:has(nav[aria-label="Language"].iboren-home-language-switcher) main {
        padding-top: calc(5rem + env(safe-area-inset-top, 0px)) !important;
      }

      body:has(nav[aria-label="Language"].iboren-home-language-switcher) #top {
        min-height: calc(100vh - 5rem) !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default function LanguageSwitcher() {
  const pathname = normalize(usePathname() || "/");
  const [hash, setHash] = useState("");
  const isHomePath = pathname === "/" || pathname === "/en";
  const preservedHash = hash === "#services" || hash === "#booking" ? hash : "";

  useEffect(() => {
    if (isHomePath) ensureMobileHomeLanguageStyle();
  }, [isHomePath]);

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash || "");
    updateHash();
    window.addEventListener("hashchange", updateHash);
    window.addEventListener("popstate", updateHash);
    return () => {
      window.removeEventListener("hashchange", updateHash);
      window.removeEventListener("popstate", updateHash);
    };
  }, []);

  if (pathname === "/profile" || pathname === "/en/profile") return null;

  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const svHref = isEnglish ? (pathname === "/en" ? `/${preservedHash}` : enToSv[pathname] || "/") : pathname;
  const enHref = isEnglish ? pathname : (pathname === "/" ? `/en${preservedHash}` : svToEn[pathname] || "/en");

  return (
    <nav aria-label="Language" className={`${isHomePath ? "iboren-home-language-switcher" : ""} fixed right-20 top-5 z-[140] flex overflow-hidden rounded-full border border-gold/30 bg-night/90 text-[11px] font-black uppercase tracking-[.14em] text-porcelain shadow-xl backdrop-blur md:right-8 md:top-5`}>
      <Link href={svHref} className={`px-3 py-2 transition ${!isEnglish ? "bg-gold text-night" : "text-porcelain/72 hover:text-gold"}`}>SV</Link>
      <Link href={enHref} className={`px-3 py-2 transition ${isEnglish ? "bg-gold text-night" : "text-porcelain/72 hover:text-gold"}`}>EN</Link>
    </nav>
  );
}
