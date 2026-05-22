"use client";

import { useEffect } from "react";

const svToEn: Record<string, string> = {
  "/": "/en",
  "/priser": "/en/prices",
  "/jobb": "/en/jobs",
  "/jobba-hos-oss": "/en/jobs",
  "/om-iboren": "/en/about",
  "/om-oss": "/en/about",
  "/privacy": "/en/privacy",
  "/terms": "/en/terms",
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

function getLanguageState() {
  const pathname = normalize(window.location.pathname || "/");
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/") || pathname.startsWith("/en-");
  return {
    pathname,
    isEnglish,
    svHref: isEnglish ? enToSv[pathname] || "/" : pathname,
    enHref: isEnglish ? pathname : svToEn[pathname] || "/en"
  };
}

function logoHtml(isEnglish: boolean) {
  return `
    <span class="sr-only">${isEnglish ? "Iboren homepage" : "Iboren startsida"}</span>
    <img
      src="/logo.svg"
      alt="Iboren"
      width="180"
      height="60"
      class="iboren-header-logo"
      decoding="async"
    />
  `;
}

function applyBlur(header: HTMLElement) {
  header.style.backdropFilter = "blur(18px)";
  header.style.setProperty("-webkit-backdrop-filter", "blur(18px)");
}

function applyHeaderLogo() {
  const { isEnglish } = getLanguageState();
  const headerLogoLink = document.querySelector<HTMLAnchorElement>('header nav a[href="#top"], header nav a[href="/"], header nav a[href="/en"]');
  if (!headerLogoLink || headerLogoLink.dataset.iborenLogoApplied === "1") return;

  headerLogoLink.dataset.iborenLogoApplied = "1";
  headerLogoLink.classList.add("iboren-header-logo-link");
  headerLogoLink.href = isEnglish ? "/en" : "/";
  headerLogoLink.innerHTML = logoHtml(isEnglish);
}

function stabilizeExistingHeader() {
  const header = document.querySelector<HTMLElement>("header");
  if (!header) return;

  header.dataset.iborenStickyNav = "1";
  header.style.position = "sticky";
  header.style.top = "0";
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

function createFallbackHeader() {
  if (document.querySelector("header") || document.querySelector("#iboren-global-nav")) return;

  const { isEnglish, svHref, enHref } = getLanguageState();
  const navItems = isEnglish
    ? [
        ["Request", "/en#booking"],
        ["Prices", "/en/prices"],
        ["Work with us", "/en/jobs"],
        ["About us", "/en/about"]
      ]
    : [
        ["Boka", "/#booking"],
        ["Priser", "/priser"],
        ["Jobba hos oss", "/jobb"],
        ["Om Iboren", "/om-iboren"]
      ];

  const header = document.createElement("header");
  header.id = "iboren-global-nav";
  header.className = "border-b border-gold/10 bg-night/95 text-porcelain shadow-xl";
  header.style.position = "sticky";
  header.style.top = "0";
  header.style.zIndex = "90";
  applyBlur(header);

  header.innerHTML = `
    <nav class="luxe-container flex min-h-20 items-center justify-between gap-6 py-3">
      <a href="${isEnglish ? "/en" : "/"}" class="iboren-header-logo-link shrink-0">${logoHtml(isEnglish)}</a>
      <div class="hidden items-center gap-6 text-sm font-bold text-porcelain/72 md:flex">
        ${navItems.map(([label, href]) => `<a href="${href}" class="hover:text-gold">${label}</a>`).join("")}
      </div>
      <div class="flex items-center gap-3 text-sm font-black uppercase tracking-[.12em]">
        <a href="${svHref}" class="rounded-full px-3 py-2 ${!isEnglish ? "bg-gold text-night" : "text-porcelain/72 hover:text-gold"}">SV</a>
        <a href="${enHref}" class="rounded-full px-3 py-2 ${isEnglish ? "bg-gold text-night" : "text-porcelain/72 hover:text-gold"}">EN</a>
        <a href="/login" class="hidden rounded-full border border-gold/30 px-4 py-2 text-porcelain/80 hover:text-gold sm:inline-flex">${isEnglish ? "Log in" : "Logga in"}</a>
        <a href="${isEnglish ? "/en#booking" : "/#booking"}" class="rounded-full bg-gold px-4 py-2 text-night">${isEnglish ? "Send request" : "Skicka förfrågan"}</a>
      </div>
    </nav>
  `;

  document.body.insertBefore(header, document.body.firstChild);
}

function applyGlobalNavigationFixes() {
  createFallbackHeader();
  stabilizeExistingHeader();
  normalizeHeaderLanguageLinks();
  applyHeaderLogo();
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
