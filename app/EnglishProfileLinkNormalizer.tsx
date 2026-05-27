"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function normalizeEnglishProfileLinks() {
  if (!window.location.pathname.startsWith("/en")) return;

  document.querySelectorAll<HTMLAnchorElement>('a[href="/profile"]').forEach((link) => {
    link.href = "/en/profile";
  });
}

export default function EnglishProfileLinkNormalizer() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname?.startsWith("/en")) return;

    normalizeEnglishProfileLinks();
    const firstPass = window.setTimeout(normalizeEnglishProfileLinks, 0);
    const secondPass = window.setTimeout(normalizeEnglishProfileLinks, 250);
    const observer = new MutationObserver(normalizeEnglishProfileLinks);
    observer.observe(document.documentElement, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(firstPass);
      window.clearTimeout(secondPass);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
