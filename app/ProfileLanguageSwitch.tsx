"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function normalize(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function isProfilePath(pathname: string) {
  return pathname === "/profile" || pathname === "/en/profile";
}

function targetForLabel(label: string) {
  if (label === "SV" || label === "SVENSKA") return "/profile";
  if (label === "EN" || label === "ENGLISH") return "/en/profile";
  return null;
}

function normalizeProfileHeaderLanguageLinks() {
  const header = document.querySelector("header");
  if (!header) return;

  header.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
    const target = targetForLabel((link.textContent || "").trim().toUpperCase());
    if (target) link.href = target;
  });
}

function handleProfileLanguageClick(event: MouseEvent) {
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a");
  if (!link || !document.querySelector("header")?.contains(link)) return;

  const target = targetForLabel((link.textContent || "").trim().toUpperCase());
  if (!target) return;

  event.preventDefault();
  event.stopPropagation();
  window.location.assign(target);
}

export default function ProfileLanguageSwitch() {
  const pathname = normalize(usePathname() || "/");

  useEffect(() => {
    if (!isProfilePath(pathname)) return;

    normalizeProfileHeaderLanguageLinks();
    const firstPass = window.setTimeout(normalizeProfileHeaderLanguageLinks, 0);
    const secondPass = window.setTimeout(normalizeProfileHeaderLanguageLinks, 250);
    const observer = new MutationObserver(normalizeProfileHeaderLanguageLinks);
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    document.addEventListener("click", handleProfileLanguageClick, true);

    return () => {
      window.clearTimeout(firstPass);
      window.clearTimeout(secondPass);
      observer.disconnect();
      document.removeEventListener("click", handleProfileLanguageClick, true);
    };
  }, [pathname]);

  return null;
}
