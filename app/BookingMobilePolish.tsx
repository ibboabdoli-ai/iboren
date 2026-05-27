"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const css = `
.iboren-header-actions {
  display: flex;
  align-items: center;
  gap: .5rem;
}

.iboren-inline-language-switch {
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  border: 1px solid rgba(212, 165, 116, .35);
  border-radius: 999px;
  background: rgba(255, 253, 248, .06);
}

.iboren-inline-language-switch a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.05rem;
  height: 2.45rem;
  padding: 0 .55rem;
  color: #D4A574;
  font-size: .68rem;
  font-weight: 900;
  letter-spacing: .1em;
  text-decoration: none;
}

.iboren-inline-language-switch a.is-active {
  background: #D4A574;
  color: #020504;
}

@media (min-width: 768px) {
  .iboren-header-actions {
    display: none !important;
  }
}

@media (max-width: 374px) {
  .iboren-header-actions {
    gap: .4rem;
  }

  .iboren-inline-language-switch a {
    min-width: 1.9rem;
    height: 2.35rem;
    padding: 0 .45rem;
    font-size: .64rem;
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

function targetPaths(pathname: string) {
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const svPath = isEnglish ? enToSv[pathname] || "/" : pathname || "/";
  const enPath = isEnglish ? pathname || "/en" : svToEn[pathname] || "/en";
  return { isEnglish, svPath, enPath };
}

function addInlineLanguageSwitch(pathname: string) {
  document.querySelector(".iboren-global-language-switch")?.remove();
  document.querySelector(".home-mobile-language-link")?.remove();

  const nav = document.querySelector<HTMLElement>("header nav");
  const menuButton = nav?.querySelector<HTMLButtonElement>("button");
  if (!nav || !menuButton) return;

  let actions = nav.querySelector<HTMLDivElement>(".iboren-header-actions");
  if (!actions) {
    actions = document.createElement("div");
    actions.className = "iboren-header-actions";
    nav.insertBefore(actions, menuButton);
    actions.appendChild(menuButton);
  }

  let switcher = actions.querySelector<HTMLDivElement>(".iboren-inline-language-switch");
  if (!switcher) {
    switcher = document.createElement("div");
    switcher.className = "iboren-inline-language-switch";
    actions.insertBefore(switcher, menuButton);
  }

  const { isEnglish, svPath, enPath } = targetPaths(pathname);
  const currentHash = window.location.hash || "";
  const svHref = currentHash && svPath === "/" ? `${svPath}${currentHash}` : svPath;
  const enHref = currentHash && enPath === "/en" ? `${enPath}${currentHash}` : enPath;

  switcher.innerHTML = `
    <a href="${svHref}" class="${!isEnglish ? "is-active" : ""}" aria-label="Svenska">SV</a>
    <a href="${enHref}" class="${isEnglish ? "is-active" : ""}" aria-label="English">EN</a>
  `;
}

export default function BookingMobilePolish() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    if (!document.getElementById("iboren-booking-mobile-polish")) {
      const style = document.createElement("style");
      style.id = "iboren-booking-mobile-polish";
      style.textContent = css;
      document.head.appendChild(style);
    }

    addInlineLanguageSwitch(pathname);
  }, [pathname]);

  return null;
}
