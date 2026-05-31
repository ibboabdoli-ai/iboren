"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const CTA_CLASS = "iboren-public-booking-inline";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
}

function removeInlineCta() {
  document.querySelectorAll(`.${CTA_CLASS}`).forEach((element) => element.remove());
}

function findHeroPriceButton() {
  return Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href="/priser"]')).find((link) => {
    const text = link.textContent?.toLowerCase() || "";
    return text.includes("beräkna") && Boolean(link.closest("#top"));
  }) || null;
}

function insertInlineCta() {
  const priceButton = findHeroPriceButton();
  const buttonGroup = priceButton?.parentElement;
  if (!priceButton || !buttonGroup || buttonGroup.querySelector(`.${CTA_CLASS}`)) return false;

  const link = document.createElement("a");
  link.href = "/boka-utan-konto";
  link.textContent = "Skicka förfrågan";
  link.className = `${CTA_CLASS} inline-flex min-h-14 items-center justify-center rounded-full border border-gold/40 bg-night/82 px-8 py-4 text-center text-sm font-black uppercase tracking-[.16em] text-gold shadow-[0_16px_44px_rgba(0,0,0,.24)] backdrop-blur-xl transition hover:bg-gold hover:text-night`;

  priceButton.insertAdjacentElement("afterend", link);
  return true;
}

export default function PublicBookingRequestLink() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(Boolean(data.session?.user));
      setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session?.user));
      setReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    removeInlineCta();
    if (pathname !== "/" || !ready || loggedIn) return;

    let attempts = 0;
    let intervalId: number | undefined;

    const tryInsert = () => {
      attempts += 1;
      const inserted = insertInlineCta();
      if ((inserted || attempts >= 40) && intervalId !== undefined) window.clearInterval(intervalId);
    };

    tryInsert();
    intervalId = window.setInterval(tryInsert, 125);

    return () => {
      if (intervalId !== undefined) window.clearInterval(intervalId);
      removeInlineCta();
    };
  }, [pathname, ready, loggedIn]);

  return null;
}
