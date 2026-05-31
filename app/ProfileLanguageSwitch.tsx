"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function normalize(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function isManagedPath(pathname: string) {
  return pathname === "/profile" || pathname === "/en/profile" || pathname === "/boka-utan-konto" || pathname === "/en/boka-utan-konto";
}

function cleanLabel(label: string) {
  return label.trim().toUpperCase();
}

function targetForLabel(pathname: string, label: string) {
  const clean = cleanLabel(label);
  const wantsSwedish = clean === "SV" || clean === "SVENSKA";
  const wantsEnglish = clean === "EN" || clean === "ENGLISH";

  if (pathname === "/boka-utan-konto" && wantsEnglish) return "/en/boka-utan-konto";
  if (pathname === "/en/boka-utan-konto" && wantsSwedish) return "/boka-utan-konto";

  if (pathname === "/profile" && wantsEnglish) return "/en/profile";
  if (pathname === "/en/profile" && wantsSwedish) return "/profile";

  return null;
}

function normalizeLanguageLinks(pathname: string) {
  document.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
    const target = targetForLabel(pathname, link.textContent || "");
    if (target) link.href = target;
  });
}

function handleLanguageClick(pathname: string, event: MouseEvent) {
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a");
  if (!link) return;

  const target = targetForLabel(pathname, link.textContent || "");
  if (!target) return;

  event.preventDefault();
  event.stopPropagation();
  window.location.assign(target);
}

export default function ProfileLanguageSwitch() {
  const pathname = normalize(usePathname() || "/");

  useEffect(() => {
    if (!isManagedPath(pathname)) return;

    const clickHandler = (event: MouseEvent) => handleLanguageClick(pathname, event);
    normalizeLanguageLinks(pathname);
    const firstPass = window.setTimeout(() => normalizeLanguageLinks(pathname), 0);
    const secondPass = window.setTimeout(() => normalizeLanguageLinks(pathname), 250);
    const thirdPass = window.setTimeout(() => normalizeLanguageLinks(pathname), 1000);
    const observer = new MutationObserver(() => normalizeLanguageLinks(pathname));
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    document.addEventListener("click", clickHandler, true);

    return () => {
      window.clearTimeout(firstPass);
      window.clearTimeout(secondPass);
      window.clearTimeout(thirdPass);
      observer.disconnect();
      document.removeEventListener("click", clickHandler, true);
    };
  }, [pathname]);

  return null;
}
