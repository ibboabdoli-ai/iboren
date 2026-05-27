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

function normalizeProfileHeaderLanguageLinks() {
  const header = document.querySelector("header");
  if (!header) return;

  header.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
    const label = (link.textContent || "").trim().toUpperCase();
    if (label === "SV" || label === "SVENSKA") link.href = "/profile";
    if (label === "EN" || label === "ENGLISH") link.href = "/en/profile";
  });
}

export default function ProfileLanguageSwitch() {
  const pathname = normalize(usePathname() || "/");

  useEffect(() => {
    if (!isProfilePath(pathname)) return;

    normalizeProfileHeaderLanguageLinks();
    const firstPass = window.setTimeout(normalizeProfileHeaderLanguageLinks, 0);
    const secondPass = window.setTimeout(normalizeProfileHeaderLanguageLinks, 250);
    const observer = new MutationObserver(normalizeProfileHeaderLanguageLinks);
    observer.observe(document.documentElement, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(firstPass);
      window.clearTimeout(secondPass);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
