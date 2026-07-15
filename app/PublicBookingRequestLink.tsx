"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const CTA_CLASS = "iboren-public-booking-inline";

type PublicCtaConfig = {
  pagePath: string;
  priceHref: string;
  priceText: string;
  publicHref: string;
  publicText: string;
};

const CTA_CONFIGS: PublicCtaConfig[] = [
  {
    pagePath: "/",
    priceHref: "/priser",
    priceText: "beräkna",
    publicHref: "/boka-utan-konto",
    publicText: "Skicka förfrågan"
  },
  {
    pagePath: "/en",
    priceHref: "/en/prices",
    priceText: "price",
    publicHref: "/en/boka-utan-konto",
    publicText: "Send request"
  }
];

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
}

function removeInlineCta() {
  document.querySelectorAll(`.${CTA_CLASS}`).forEach((element) => element.remove());
}

function getConfig(pathname: string | null) {
  return CTA_CONFIGS.find((config) => config.pagePath === pathname) || null;
}

function findHeroPriceButton(config: PublicCtaConfig) {
  return Array.from(document.querySelectorAll<HTMLAnchorElement>(`a[href="${config.priceHref}"]`)).find((link) => {
    const text = link.textContent?.toLowerCase() || "";
    return text.includes(config.priceText) && Boolean(link.closest("#top"));
  }) || null;
}

function insertInlineCta(config: PublicCtaConfig) {
  const priceButton = findHeroPriceButton(config);
  const buttonGroup = priceButton?.parentElement;
  if (!priceButton || !buttonGroup || buttonGroup.querySelector(`.${CTA_CLASS}`)) return false;

  const link = document.createElement("a");
  link.href = config.publicHref;
  link.textContent = config.publicText;
  link.className = `${CTA_CLASS} inline-flex min-h-14 items-center justify-center rounded-full border border-gold/40 bg-night/82 px-8 py-4 text-center text-sm font-black uppercase tracking-[.16em] text-gold shadow-[0_16px_44px_rgba(0,0,0,.24)] backdrop-blur-xl transition hover:bg-gold hover:text-night`;

  priceButton.insertAdjacentElement("afterend", link);
  return true;
}

export default function PublicBookingRequestLink() {
  const pathname = usePathname();
  const [readyPath, setReadyPath] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const config = getConfig(pathname);
    if (!config) {
      setLoggedIn(false);
      setReadyPath(pathname);
      return;
    }

    setReadyPath(null);
    const supabase = getSupabase();
    if (!supabase) {
      setLoggedIn(false);
      setReadyPath(pathname);
      return;
    }

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setLoggedIn(Boolean(data.session?.user));
      setReadyPath(pathname);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setLoggedIn(Boolean(session?.user));
      setReadyPath(pathname);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [pathname]);

  useEffect(() => {
    removeInlineCta();
    const config = getConfig(pathname);
    if (!config || readyPath !== pathname || loggedIn) return;

    let attempts = 0;
    let intervalId: number | undefined;

    const tryInsert = () => {
      attempts += 1;
      const inserted = insertInlineCta(config);
      if ((inserted || attempts >= 40) && intervalId !== undefined) window.clearInterval(intervalId);
    };

    tryInsert();
    intervalId = window.setInterval(tryInsert, 125);

    return () => {
      if (intervalId !== undefined) window.clearInterval(intervalId);
      removeInlineCta();
    };
  }, [pathname, readyPath, loggedIn]);

  return null;
}
