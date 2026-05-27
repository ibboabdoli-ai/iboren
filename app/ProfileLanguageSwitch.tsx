"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileLanguageSwitch() {
  const pathname = usePathname();
  const isProfile = pathname === "/profile" || pathname === "/en/profile";
  if (!isProfile) return null;

  const isEnglish = pathname === "/en/profile";

  return (
    <nav className="fixed right-[5.05rem] top-[6.35rem] z-[9999] inline-flex overflow-hidden rounded-full border border-gold/35 bg-night shadow-soft md:right-28 md:top-6" aria-label="Profile language selector">
      <Link href="/profile" className={`px-4 py-3 text-xs font-black tracking-[.14em] ${!isEnglish ? "bg-gold text-night" : "text-gold"}`}>SV</Link>
      <Link href="/en/profile" className={`px-4 py-3 text-xs font-black tracking-[.14em] ${isEnglish ? "bg-gold text-night" : "text-gold"}`}>EN</Link>
    </nav>
  );
}
