"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileLanguageSwitch() {
  const pathname = usePathname();
  const isProfile = pathname === "/profile" || pathname === "/en/profile";
  if (!isProfile) return null;

  const isEnglish = pathname === "/en/profile";

  return (
    <nav className="fixed right-[4.85rem] top-[1.05rem] z-[9999] inline-flex items-center gap-2 md:right-28 md:top-6" aria-label="Profile language selector">
      <Link href="/profile" className={`inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-xs font-black tracking-[.14em] ${!isEnglish ? "bg-gold text-night" : "text-porcelain"}`}>SV</Link>
      <Link href="/en/profile" className={`inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-xs font-black tracking-[.14em] ${isEnglish ? "bg-gold text-night" : "text-porcelain"}`}>EN</Link>
    </nav>
  );
}
