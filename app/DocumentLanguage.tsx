"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function DocumentLanguage() {
  const pathname = usePathname();

  useEffect(() => {
    const language = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "sv";
    document.documentElement.lang = language;
    document.documentElement.dir = "ltr";
  }, [pathname]);

  return null;
}
