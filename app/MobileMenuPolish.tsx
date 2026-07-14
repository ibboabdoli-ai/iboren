"use client";

import { useEffect } from "react";
import ProfileLanguageSwitch from "./ProfileLanguageSwitch";

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

function currentPath() {
  return window.location.pathname.endsWith("/") && window.location.pathname !== "/" ? window.location.pathname.slice(0, -1) : window.location.pathname;
}

function isEnglishPath() {
  return currentPath() === "/en" || currentPath().startsWith("/en/");
}

function languageTarget() {
  const pathname = currentPath();

  if (pathname.startsWith("/tjanster/")) {
    const slug = pathname.split("/").filter(Boolean).at(-1) || "";
    return tjansterToEn[slug] || "/en";
  }

  return isEnglishPath() ? enToSv[pathname] || "/" : svToEn[pathname] || "/en";
}

function createMenuLink(label: string, href: string, onClick: () => void) {
  const link = document.createElement("a");
  link.href = href;
  link.textContent = label;
  link.className = "rounded-2xl px-4 py-2.5 font-semibold";
  link.addEventListener("click", onClick);
  return link;
}

function styleMenuLink(element: HTMLElement) {
  element.style.paddingTop = "0.65rem";
  element.style.paddingBottom = "0.65rem";
  element.style.fontSize = "1.05rem";
  element.style.lineHeight = "1.25";
  element.style.letterSpacing = "0.01em";
}

function styleCta(element: HTMLElement) {
  element.style.marginTop = "0.5rem";
  element.style.paddingTop = "1rem";
  element.style.paddingBottom = "1rem";
  element.style.fontSize = "0.95rem";
}

function closeMenu() {
  const toggleButton = document.querySelector<HTMLButtonElement>('header button[aria-expanded="true"]');
  if (toggleButton) toggleButton.click();
}

function polishMenu() {
  const overlay = document.querySelector<HTMLElement>("header .border-t.bg-night\\/95");
  const list = overlay?.querySelector<HTMLElement>(".mx-auto.grid.max-w-sm");
  if (!overlay || !list || list.dataset.iborenPolished === "true") return;

  const english = isEnglishPath();
  const oldItems = Array.from(list.querySelectorAll<HTMLAnchorElement>("a"));
  if (!oldItems.length) return;

  const cta = oldItems.find((item) => item.className.includes("bg-gold"));
  const profile = oldItems.find((item) => item.getAttribute("href") === "/profile" || item.getAttribute("href") === "/login");
  const switchTarget = languageTarget();

  list.innerHTML = "";
  list.style.gap = "0.35rem";
  list.style.paddingTop = "0.75rem";

  const items = english
    ? [
        { label: "Book cleaning", href: "#booking" },
        { label: "Prices", href: "/en/prices" },
        { label: "Services", href: "/en/home-cleaning" },
        { label: "About us", href: "/en/about" },
        { label: "Work with us", href: "/en/jobs" },
        { label: profile?.textContent?.trim() || "My profile", href: profile?.getAttribute("href") || "/login" },
        { label: "Svenska", href: switchTarget }
      ]
    : [
        { label: "Boka städning", href: "#booking" },
        { label: "Priser", href: "/priser" },
        { label: "Tjänster", href: "#services" },
        { label: "Om oss", href: "/om-iboren" },
        { label: "Jobba hos oss", href: "/jobb" },
        { label: profile?.textContent?.trim() || "Min profil", href: profile?.getAttribute("href") || "/login" },
        { label: "English", href: switchTarget }
      ];

  items.forEach((item) => {
    const link = createMenuLink(item.label, item.href, closeMenu);
    styleMenuLink(link);
    list.appendChild(link);
  });

  const ctaLink = cta || createMenuLink(english ? "Book cleaning" : "Boka städning", "#booking", closeMenu);
  ctaLink.textContent = english ? "Book cleaning" : "Boka städning";
  ctaLink.setAttribute("href", "#booking");
  ctaLink.className = "mt-2 rounded-full bg-gold px-5 py-4 text-center text-sm font-bold text-night";
  styleCta(ctaLink);
  list.appendChild(ctaLink);
  list.dataset.iborenPolished = "true";
}

export default function MobileMenuPolish() {
  useEffect(() => {
    polishMenu();
    const observer = new MutationObserver(polishMenu);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return <ProfileLanguageSwitch />;
}
