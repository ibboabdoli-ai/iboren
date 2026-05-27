"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const css = `
.iboren-global-language-switch {
  position: fixed;
  top: 1.05rem;
  right: 4.75rem;
  z-index: 70;
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  border: 1px solid rgba(212, 165, 116, .35);
  border-radius: 999px;
  background: rgba(2, 5, 4, .72);
  backdrop-filter: blur(14px);
  box-shadow: 0 14px 40px rgba(0, 0, 0, .18);
}

.iboren-global-language-switch a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.35rem;
  height: 2.45rem;
  padding: 0 .7rem;
  color: #D4A574;
  font-size: .72rem;
  font-weight: 900;
  letter-spacing: .12em;
  text-decoration: none;
}

.iboren-global-language-switch a.is-active {
  background: #D4A574;
  color: #020504;
}

@media (min-width: 768px) {
  .iboren-global-language-switch {
    display: none !important;
  }
}

@media (max-width: 374px) {
  .iboren-global-language-switch {
    right: 4.35rem;
  }

  .iboren-global-language-switch a {
    min-width: 2.1rem;
    padding: 0 .55rem;
    font-size: .68rem;
  }
}

@media (max-width: 767px) {
  #booking {
    padding-top: 3.5rem !important;
    padding-bottom: 4rem !important;
  }

  #booking h2.display,
  #booking h3.display {
    max-width: 100% !important;
    font-size: clamp(2rem, 9vw, 2.85rem) !important;
    line-height: .96 !important;
    letter-spacing: -0.035em !important;
    overflow-wrap: anywhere !important;
    word-break: normal !important;
    hyphens: auto !important;
  }

  #booking form,
  #booking aside {
    border-radius: 1.5rem !important;
    padding: 1.15rem !important;
  }

  #booking form > div:first-child {
    align-items: flex-start !important;
    gap: .75rem !important;
  }

  #booking form > div:first-child span,
  #booking aside p[class*="tracking"] {
    letter-spacing: .16em !important;
  }

  #booking form .grid.gap-4 {
    gap: .9rem !important;
  }

  #booking input,
  #booking select,
  #booking textarea {
    min-height: 3.25rem !important;
    border-radius: 1.15rem !important;
    padding: .95rem 1rem !important;
    font-size: 16px !important;
    line-height: 1.35 !important;
  }

  #booking textarea {
    min-height: 7rem !important;
  }

  #booking button.rounded-2xl,
  #booking button.btn-primary,
  #booking .btn-primary {
    border-radius: 1.15rem !important;
    padding-top: .85rem !important;
    padding-bottom: .85rem !important;
  }

  #booking aside h3.display {
    font-size: clamp(1.9rem, 8vw, 2.35rem) !important;
    line-height: 1 !important;
  }

  #booking pre {
    max-height: none !important;
    overflow-x: hidden !important;
    white-space: pre-wrap !important;
    overflow-wrap: break-word !important;
    word-break: normal !important;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
    font-size: .95rem !important;
    line-height: 1.65 !important;
    letter-spacing: 0 !important;
    border-radius: 1.25rem !important;
    padding: 1.1rem !important;
  }
}
`;

const svToEn: Record<string, string> = {
  "/": "/en",
  "/priser": "/en/prices",
  "/jobb": "/en/jobs",
  "/om-iboren": "/en/about",
  "/hemstadning": "/en/home-cleaning",
  "/flyttstadning": "/en/move-out-cleaning",
  "/kontorsstadning": "/en/office-cleaning",
  "/fonsterputs": "/en/window-cleaning",
  "/privacy": "/en/privacy",
  "/terms": "/en/terms"
};

const enToSv: Record<string, string> = Object.fromEntries(Object.entries(svToEn).map(([sv, en]) => [en, sv]));

function withHash(path: string, hash: string) {
  return hash && (path === "/" || path === "/en") ? `${path}${hash}` : path;
}

export default function BookingMobilePolish() {
  const pathname = usePathname() || "/";
  const [hash, setHash] = useState("");
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const swedishHref = withHash(isEnglish ? enToSv[pathname] || "/" : pathname || "/", hash);
  const englishHref = withHash(isEnglish ? pathname || "/en" : svToEn[pathname] || "/en", hash);

  useEffect(() => {
    if (!document.getElementById("iboren-booking-mobile-polish")) {
      const style = document.createElement("style");
      style.id = "iboren-booking-mobile-polish";
      style.textContent = css;
      document.head.appendChild(style);
    }

    const updateHash = () => setHash(window.location.hash || "");
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  return (
    <nav className="iboren-global-language-switch" aria-label="Language selector">
      <Link href={swedishHref} className={!isEnglish ? "is-active" : undefined}>SV</Link>
      <Link href={englishHref} className={isEnglish ? "is-active" : undefined}>EN</Link>
    </nav>
  );
}
