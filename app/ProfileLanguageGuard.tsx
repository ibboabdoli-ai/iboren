"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ProfileLanguageGuard() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    const isEnglishRoute = pathname === "/en" || pathname.startsWith("/en/");
    if (isEnglishRoute) {
      window.sessionStorage.setItem("iboren-language", "en");
      return;
    }

    if (pathname !== "/profile") return;

    const savedLanguage = window.sessionStorage.getItem("iboren-language");
    const cameFromEnglish = document.referrer.includes("/en");

    if (savedLanguage === "en" || cameFromEnglish) {
      window.location.replace("/en/profile");
    }
  }, [pathname]);

  return null;
}
