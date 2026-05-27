"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileLanguageSwitch() {
  const pathname = usePathname();
  const isProfile = pathname === "/profile" || pathname === "/en/profile";
  if (!isProfile) return null;

  const isEnglish = pathname === "/en/profile";

  return (
    <nav className="absolute right-4 top-4 z-[70] inline-flex overflow-hidden rounded-full border border-burgundy/15 bg-porcelain shadow-soft" aria-label="Profile language selector">
      <Link href="/profile" className={`px-4 py-2 text-xs font-black tracking-[.12em] ${!isEnglish ? "bg-burgundy text-porcelain" : "text-burgundy"}`}>SV</Link>
      <Link href="/en/profile" className={`px-4 py-2 text-xs font-black tracking-[.12em] ${isEnglish ? "bg-burgundy text-porcelain" : "text-burgundy"}`}>EN</Link>
    </nav>
  );
}
