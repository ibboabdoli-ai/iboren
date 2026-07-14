"use client";

import { useEffect } from "react";

const svToEn: Record<string, string> = {
  "/": "/en",
  "/priser": "/en/prices",
  "/jobb": "/en/jobs",
  "/jobba-hos-oss": "/en/jobs",
  "/om-iboren": "/en/about",
  "/om-oss": "/en/about",
  "/kontakt": "/en/contact",
  "/blogg": "/en/blog",
  "/blogg/vad-kostar-hemstadning": "/en/blog/home-cleaning-prices",
  "/blogg/rut-avdrag-stadning": "/en/blog/rut-deduction-cleaning",
  "/blogg/checklista-infor-flytt": "/en/blog/move-out-checklist",
  "/privacy": "/en/privacy",
  "/terms": "/en/terms",
  "/login": "/en/login",
  "/boka-utan-konto": "/en/boka-utan-konto",
  "/profile": "/en/profile",
  "/cleaner": "/en/cleaner",
  "/hemstadning": "/en/home-cleaning",
  "/flyttstadning": "/en/move-out-cleaning",
  "/kontorsstadning": "/en/office-cleaning",
  "/fonsterputs": "/en/window-cleaning",
  "/tjanster": "/en/services",
  "/tjanster/storstadning": "/en/deep-cleaning",
  "/tjanster/byggstadning": "/en/construction-cleaning",
  "/tjanster/visningsstadning": "/en/viewing-cleaning",
  "/hemstadning-sodertalje": "/en/home-cleaning-sodertalje",
  "/flyttstadning-sodertalje": "/en/move-out-cleaning-sodertalje",
  "/fonsterputs-sodertalje": "/en/window-cleaning-sodertalje",
  "/kontorsstadning-sodertalje": "/en/office-cleaning-sodertalje",
  "/hemstadning-stockholm": "/en/home-cleaning-stockholm",
  "/flyttstadning-stockholm": "/en/move-out-cleaning-stockholm",
  "/fonsterputs-stockholm": "/en/window-cleaning-stockholm",
  "/kontorsstadning-stockholm": "/en/office-cleaning-stockholm",
  "/stadning-sodertalje": "/en/cleaning-sodertalje",
  "/stadning-stockholm": "/en/cleaning-stockholm"
};

const tjansterToEn: Record<string, string> = {
  hemstadning: "/en/home-cleaning",
  flyttstadning: "/en/move-out-cleaning",
  kontorsstadning: "/en/office-cleaning",
  fonsterputs: "/en/window-cleaning",
  storstadning: "/en/deep-cleaning",
  byggstadning: "/en/construction-cleaning",
  visningsstadning: "/en/viewing-cleaning"
};

const enToSv: Record<string, string> = {
  ...Object.fromEntries(Object.entries(svToEn).map(([sv, en]) => [en, sv])),
  ...Object.fromEntries(Object.entries(tjansterToEn).map(([slug, en]) => [en, `/tjanster/${slug}`]))
};
const safeTop = "env(safe-area-inset-top, 0px)";
const safeRight = "env(safe-area-inset-right, 0px)";
const styleId = "iboren-safe-nav-style";

function normalize(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function getEnglishHref(pathname: string) {
  if (pathname.startsWith("/tjanster/")) {
    const slug = pathname.split("/").filter(Boolean).at(-1) || "";
    return tjansterToEn[slug] || "/en";
  }
  return svToEn[pathname] || "/en";
}

function getLanguageState() {
  const pathname = normalize(window.location.pathname || "/");
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/") || pathname.startsWith("/en-");
  return {
    pathname,
    isEnglish,
    svHref: isEnglish ? enToSv[pathname] || "/" : pathname,
    enHref: isEnglish ? pathname : getEnglishHref(pathname)
  };
}

function getNavItems(isEnglish: boolean) {
  return isEnglish
    ? [
        ["Services", "/en#services"],
        ["Prices", "/en/prices"],
        ["Request", "/en#booking"],
        ["Work with us", "/en/jobs"],
        ["About", "/en/about"],
        ["Contact", "mailto:hej@iboren.se"]
      ]
    : [
        ["Tjänster", "/#services"],
        ["Priser", "/priser"],
        ["Boka", "/#booking"],
        ["Jobba hos oss", "/jobb"],
        ["Om oss", "/om-iboren"],
        ["Kontakt", "mailto:hej@iboren.se"]
      ];
}

function logoHtml(isEnglish: boolean) {
  return `
    <span class="sr-only">${isEnglish ? "Iboren homepage" : "Iboren startsida"}</span>
    <img
      src="/ibbologo.svg"
      alt="Iboren"
      width="180"
      height="60"
      class="iboren-header-logo"
      decoding="async"
    />
  `;
}

function ensureSafeNavStyles() {
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    body:has(#iboren-global-nav) nav[aria-label="Language"] {
      display: none !important;
    }

    header[data-iboren-sticky-nav="1"],
    #iboren-global-nav {
      top: ${safeTop} !important;
      transform: translateZ(0);
    }

    nav[aria-label="Language"] {
      top: calc(${safeTop} + 1.25rem) !important;
      right: calc(${safeRight} + 5rem) !important;
    }

    #iboren-global-menu[hidden] {
      display: none !important;
    }

    #iboren-global-nav .iboren-menu-button {
      display: none;
    }

    @media (max-width: 767px) {
      html {
        scroll-padding-top: calc(5rem + ${safeTop});
      }

      header[data-iboren-sticky-nav="1"] nav,
      #iboren-global-nav nav {
        min-height: 4.5rem !important;
        height: auto !important;
        gap: .5rem !important;
        padding-top: .55rem !important;
        padding-bottom: .55rem !important;
      }

      header[data-iboren-sticky-nav="1"] .iboren-header-logo-link,
      #iboren-global-nav .iboren-header-logo-link {
        width: clamp(7.9rem, 36vw, 9.8rem) !important;
        height: clamp(2.65rem, 12vw, 3.2rem) !important;
        flex: 0 0 auto !important;
      }

      header[data-iboren-sticky-nav="1"] .iboren-header-logo,
      #iboren-global-nav .iboren-header-logo {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
      }

      #iboren-global-nav .iboren-fallback-actions {
        margin-left: auto !important;
        flex: 0 0 auto !important;
        gap: .25rem !important;
        max-width: calc(100vw - 10rem) !important;
      }

      #iboren-global-nav .iboren-fallback-actions a {
        padding: .58rem .68rem !important;
        font-size: .72rem !important;
        letter-spacing: .08em !important;
        white-space: nowrap !important;
      }

      #iboren-global-nav .iboren-fallback-cta {
        display: none !important;
      }

      #iboren-global-nav .iboren-menu-button {
        display: inline-grid !important;
        width: 2.9rem !important;
        height: 2.9rem !important;
        min-width: 2.9rem !important;
        place-items: center !important;
        border-radius: 999px !important;
        border: 1px solid rgba(212, 165, 116, .35) !important;
        color: var(--gold) !important;
        background: rgba(255, 253, 248, .06) !important;
      }

      #iboren-global-nav .iboren-menu-line,
      #iboren-global-nav .iboren-menu-line::before,
      #iboren-global-nav .iboren-menu-line::after {
        display: block;
        width: 1.05rem;
        height: 2px;
        border-radius: 999px;
        background: currentColor;
        content: "";
      }

      #iboren-global-nav .iboren-menu-line {
        position: relative;
      }

      #iboren-global-nav .iboren-menu-line::before {
        position: absolute;
        top: -.38rem;
        left: 0;
      }

      #iboren-global-nav .iboren-menu-line::after {
        position: absolute;
        top: .38rem;
        left: 0;
      }

      #iboren-global-menu {
        border-top: 1px solid rgba(212, 165, 116, .12);
        background: rgba(2, 5, 4, .98);
        padding: .75rem 1rem max(1rem, env(safe-area-inset-bottom));
      }

      #iboren-global-menu .iboren-mobile-menu-inner {
        width: min(100%, 25rem);
        margin-inline: auto;
        display: grid;
        gap: .45rem;
      }

      #iboren-global-menu a {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 3rem;
        border-radius: 1rem;
        padding: .85rem 1rem;
        color: var(--porcelain);
        font-weight: 800;
        background: rgba(255, 253, 248, .045);
      }

      #iboren-global-menu .iboren-mobile-menu-cta {
        margin-top: .35rem;
        justify-content: center;
        background: var(--gold);
        color: var(--night);
      }

      nav[aria-label="Language"] {
        display: none !important;
      }

      #top {
        padding-top: calc(6.2rem + ${safeTop}) !important;
      }
    }

    @media (max-width: 380px) {
      header[data-iboren-sticky-nav="1"] .iboren-header-logo-link,
      #iboren-global-nav .iboren-header-logo-link {
        width: 7.3rem !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function applyBlur(header: HTMLElement) {
  header.style.backdropFilter = "blur(18px)";
  header.style.setProperty("-webkit-backdrop-filter", "blur(18px)");
}

function stabilizeExistingHeader() {
  const header = document.querySelector<HTMLElement>("header");
  if (!header) return;

  header.dataset.iborenStickyNav = "1";
  header.style.position = "sticky";
  header.style.setProperty("top", safeTop, "important");
  header.style.zIndex = "90";
  header.style.width = "100%";
  applyBlur(header);
}

function normalizeHeaderLanguageLinks() {
  const header = document.querySelector("header");
  if (!header) return;

  const { svHref, enHref } = getLanguageState();
  const links = Array.from(header.querySelectorAll<HTMLAnchorElement>("a"));

  links.forEach((link) => {
    const label = (link.textContent || "").trim().toUpperCase();
    if (label === "SV" || label === "SVENSKA") link.href = svHref;
    if (label === "EN" || label === "ENGLISH") link.href = enHref;
  });
}

function closeGlobalMenu() {
  const menu = document.getElementById("iboren-global-menu");
  const button = document.querySelector<HTMLButtonElement>("#iboren-global-nav .iboren-menu-button");
  if (!menu || !button) return;
  menu.hidden = true;
  button.setAttribute("aria-expanded", "false");
}

function bindGlobalMenu() {
  const header = document.getElementById("iboren-global-nav");
  const button = document.querySelector<HTMLButtonElement>("#iboren-global-nav .iboren-menu-button");
  const menu = document.getElementById("iboren-global-menu");
  if (!header || !button || !menu || button.dataset.bound === "1") return;

  button.dataset.bound = "1";
  button.addEventListener("click", () => {
    const willOpen = menu.hidden;
    menu.hidden = !willOpen;
    button.setAttribute("aria-expanded", String(willOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeGlobalMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeGlobalMenu();
  });
}

function createFallbackHeader() {
  if (document.querySelector("header") || document.querySelector("#iboren-global-nav")) return;

  const { isEnglish, svHref, enHref } = getLanguageState();
  const navItems = getNavItems(isEnglish);
  const requestHref = isEnglish ? "/en#booking" : "/#booking";
  const loginHref = isEnglish ? "/en/login" : "/login";

  const header = document.createElement("header");
  header.id = "iboren-global-nav";
  header.dataset.iborenStickyNav = "1";
  header.className = "border-b border-gold/10 bg-night/95 text-porcelain shadow-xl";
  header.style.position = "sticky";
  header.style.setProperty("top", safeTop, "important");
  header.style.zIndex = "90";
  applyBlur(header);

  header.innerHTML = `
    <nav class="luxe-container flex min-h-20 items-center justify-between gap-6 py-3">
      <a href="${isEnglish ? "/en" : "/"}" class="iboren-header-logo-link shrink-0">${logoHtml(isEnglish)}</a>
      <div class="hidden items-center gap-6 text-sm font-bold text-porcelain/72 md:flex">
        ${navItems.map(([label, href]) => `<a href="${href}" class="hover:text-gold">${label}</a>`).join("")}
      </div>
      <div class="iboren-fallback-actions flex items-center gap-3 text-sm font-black uppercase tracking-[.12em]">
        <a href="${svHref}" class="rounded-full px-3 py-2 ${!isEnglish ? "bg-gold text-night" : "text-porcelain/72 hover:text-gold"}">SV</a>
        <a href="${enHref}" class="rounded-full px-3 py-2 ${isEnglish ? "bg-gold text-night" : "text-porcelain/72 hover:text-gold"}">EN</a>
        <a href="${loginHref}" class="hidden rounded-full border border-gold/30 px-4 py-2 text-porcelain/80 hover:text-gold sm:inline-flex">${isEnglish ? "Log in" : "Logga in"}</a>
        <a href="${requestHref}" class="iboren-fallback-cta hidden rounded-full bg-gold px-4 py-2 text-night sm:inline-flex">${isEnglish ? "Send request" : "Skicka förfrågan"}</a>
        <button type="button" class="iboren-menu-button" aria-label="${isEnglish ? "Open menu" : "Öppna meny"}" aria-controls="iboren-global-menu" aria-expanded="false"><span class="iboren-menu-line"></span></button>
      </div>
    </nav>
    <div id="iboren-global-menu" hidden>
      <div class="iboren-mobile-menu-inner">
        ${navItems.map(([label, href]) => `<a href="${href}">${label}<span>→</span></a>`).join("")}
        <a href="${loginHref}">${isEnglish ? "Log in" : "Logga in"}<span>→</span></a>
        <a href="${requestHref}" class="iboren-mobile-menu-cta">${isEnglish ? "Send request" : "Skicka förfrågan"}</a>
      </div>
    </div>
  `;

  document.body.insertBefore(header, document.body.firstChild);
}

function applyGlobalNavigationFixes() {
  ensureSafeNavStyles();
  createFallbackHeader();
  stabilizeExistingHeader();
  normalizeHeaderLanguageLinks();
  bindGlobalMenu();
}

export default function HeaderLogo() {
  useEffect(() => {
    applyGlobalNavigationFixes();
    const observer = new MutationObserver(applyGlobalNavigationFixes);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
