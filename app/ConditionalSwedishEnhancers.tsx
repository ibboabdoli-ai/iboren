"use client";

import { usePathname } from "next/navigation";
import BookingRutEnhancer from "./BookingRutEnhancer";
import SeoInternalLinks from "./SeoInternalLinks";

function isEnglishRoute(pathname: string | null) {
  return pathname === "/en" || pathname?.startsWith("/en/") || pathname?.startsWith("/en-");
}

export default function ConditionalSwedishEnhancers() {
  const pathname = usePathname();
  if (isEnglishRoute(pathname)) return null;

  return (
    <>
      <BookingRutEnhancer />
      <SeoInternalLinks />
    </>
  );
}
