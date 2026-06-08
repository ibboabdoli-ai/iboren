"use client";

import type { User } from "@supabase/supabase-js";
import { Menu, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ThemeSwitch from "../theme/ThemeSwitch";

type Props = {
  user: User | null;
};

export default function HomeHeader({ user }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/10 bg-night/80 backdrop-blur-2xl">
      <nav className="luxe-container flex h-20 items-center justify-between">
        <a href="#top" className="group flex items-center" onClick={() => setMenuOpen(false)} aria-label="Iboren startsida">
          <span className="sr-only">Iboren</span>
          <span className="flex flex-col leading-none">
            <span className="display block text-4xl font-semibold tracking-wide text-porcelain md:text-5xl">Iboren</span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.36em] text-gold/75 md:text-[11px]">Pris direkt & enkel bokning</span>
          </span>
        </a>
        <div className="hidden items-center gap-2 text-sm font-semibold text-porcelain/68 md:flex">
          <a href="#services" className="rounded-full px-3 py-2 transition hover:bg-gold/10 hover:text-gold">Tjänster</a>
          <Link href="/priser" className="rounded-full px-3 py-2 transition hover:bg-gold/10 hover:text-gold">Priser</Link>
          <Link href="/boka-utan-konto" className="rounded-full px-3 py-2 transition hover:bg-gold/10 hover:text-gold">Boka</Link>
          <Link href="/jobb" className="rounded-full px-3 py-2 transition hover:bg-gold/10 hover:text-gold">Jobba hos oss</Link>
          <Link href="/om-iboren" className="rounded-full px-3 py-2 transition hover:bg-gold/10 hover:text-gold">Om oss</Link>
          <Link href="/en" className="rounded-full px-3 py-2 transition hover:bg-gold/10 hover:text-gold">EN</Link>
          <Link href={user ? "/profile" : "/login"} className="inline-flex items-center gap-2 rounded-full px-3 py-2 transition hover:bg-gold/10 hover:text-gold"><UserRound size={17} /> {user ? "Min profil" : "Logga in"}</Link>
          <ThemeSwitch className="w-[5.75rem] shrink-0" />
          <Link href="/priser#pris-kalkylator" className="rounded-full border border-gold/40 bg-gold px-5 py-3 text-night">Få pris direkt</Link>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="grid h-11 w-11 place-items-center rounded-full border border-gold/25 bg-porcelain/5 text-gold md:hidden">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
      </nav>
      {menuOpen && <div className="border-t border-gold/10 bg-night/95 px-4 pb-6 md:hidden"><div className="mx-auto grid max-w-sm gap-2 pt-2 text-porcelain"><a href="#services" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Tjänster</a><Link href="/priser" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Priser</Link><Link href="/boka-utan-konto" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Boka</Link><Link href="/jobb" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Jobba hos oss</Link><Link href="/om-iboren" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Om oss</Link><Link href="/en" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">English</Link><Link href={user ? "/profile" : "/login"} className="rounded-2xl px-4 py-3 font-semibold">{user ? "Min profil" : "Logga in"}</Link><ThemeSwitch className="mx-4 my-2" /><Link href="/priser#pris-kalkylator" onClick={() => setMenuOpen(false)} className="mt-2 rounded-full bg-gold px-5 py-4 text-center text-sm font-bold text-night">Få pris direkt</Link></div></div>}
    </header>
  );
}
