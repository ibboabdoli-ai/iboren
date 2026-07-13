"use client";

import type { User } from "@supabase/supabase-js";
import { Menu, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { trackSiteEvent } from "../../lib/analytics";

type Props = {
  user: User | null;
};

export default function HomeHeader({ user }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const desktopLinkClass = "rounded-full px-3 py-2 transition hover:bg-gold/10 hover:text-gold";
  const mobileLinkClass = "rounded-2xl px-4 py-3 font-semibold transition hover:bg-gold/10 hover:text-gold";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/10 bg-night/80 backdrop-blur-2xl">
      <nav className="luxe-container flex h-20 items-center justify-between">
        <a href="/" className="iboren-header-logo-link group flex items-center" onClick={() => setMenuOpen(false)} aria-label="Iboren startsida">
          <span className="sr-only">Iboren</span>
          <img src="/ibbologo.svg" alt="Iboren" width={180} height={60} className="iboren-header-logo" decoding="async" />
        </a>

        <div className="hidden items-center gap-2 text-sm font-semibold text-porcelain/68 xl:flex">
          <a href="#services" className={desktopLinkClass}>Tjänster</a>
          <Link href="/priser" className={desktopLinkClass}>Priser</Link>
          <Link href="/boka-utan-konto" onClick={() => trackSiteEvent("booking_cta_click")} className={desktopLinkClass}>Boka</Link>
          <Link href="/jobb" className={desktopLinkClass}>Jobba hos oss</Link>
          <Link href="/om-iboren" className={desktopLinkClass}>Om oss</Link>
          <Link href="/en" className={desktopLinkClass}>EN</Link>
          <Link href={user ? "/profile" : "/login"} className={`inline-flex items-center gap-2 ${desktopLinkClass}`}>
            <UserRound size={17} /> {user ? "Min profil" : "Logga in"}
          </Link>
          <Link href="/priser#pris-kalkylator" onClick={() => trackSiteEvent("quote_cta_click")} className="rounded-full border border-gold/40 bg-gold px-5 py-3 text-night transition hover:bg-porcelain">
            Få pris direkt
          </Link>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Stäng meny" : "Öppna meny"}
          aria-expanded={menuOpen}
          aria-controls="home-mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          className="grid h-11 w-11 place-items-center rounded-full border border-gold/25 bg-porcelain/5 text-gold transition hover:bg-gold/10 xl:hidden"
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </nav>

      {menuOpen && (
        <div id="home-mobile-menu" className="max-h-[calc(100svh-5rem)] overflow-y-auto border-t border-gold/10 bg-night/95 px-4 pb-6 xl:hidden">
          <div className="mx-auto grid max-w-sm gap-2 pt-2 text-porcelain">
            <a href="#services" onClick={() => setMenuOpen(false)} className={mobileLinkClass}>Tjänster</a>
            <Link href="/priser" onClick={() => setMenuOpen(false)} className={mobileLinkClass}>Priser</Link>
            <Link href="/boka-utan-konto" onClick={() => { setMenuOpen(false); trackSiteEvent("booking_cta_click"); }} className={mobileLinkClass}>Boka</Link>
            <Link href="/jobb" onClick={() => setMenuOpen(false)} className={mobileLinkClass}>Jobba hos oss</Link>
            <Link href="/om-iboren" onClick={() => setMenuOpen(false)} className={mobileLinkClass}>Om oss</Link>
            <Link href="/en" onClick={() => setMenuOpen(false)} className={mobileLinkClass}>English</Link>
            <Link href={user ? "/profile" : "/login"} onClick={() => setMenuOpen(false)} className={mobileLinkClass}>
              {user ? "Min profil" : "Logga in"}
            </Link>
            <Link href="/priser#pris-kalkylator" onClick={() => { setMenuOpen(false); trackSiteEvent("quote_cta_click"); }} className="mt-2 rounded-full bg-gold px-5 py-4 text-center text-sm font-bold text-night transition hover:bg-porcelain">
              Få pris direkt
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
