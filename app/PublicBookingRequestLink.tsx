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

function findPriceButton() {
  const directMatch = document.querySelector<HTMLAnchorElement>('a[href="/priser"]');
  if (directMatch?.textContent?.toLowerCase().includes("beräkna")) return directMatch;

  return Array.from(document.querySelectorAll<HTMLAnchorElement>("a")).find((link) => {
    const text = link.textContent?.toLowerCase() || "";
    return link.getAttribute("href") === "/priser" && text.includes("beräkna");
  }) || null;
}

function insertInlineCta() {
  const priceButton = findPriceButton();
  const buttonGroup = priceButton?.parentElement;
  if (!priceButton || !buttonGroup || buttonGroup.querySelector(`.${CTA_CLASS}`)) return false;

  const link = document.createElement("a");
  link.href = "/boka-utan-konto";
  link.textContent = "Skicka förfrågan";
  link.className = `${CTA_CLASS} inline-flex min-h-14 items-center justify-center rounded-full border border-gold/40 bg-night/82 px-8 py-4 text-center text-sm font-black uppercase tracking-[.18em] text-gold shadow-[0_16px_46px_rgba(0,0,0,.26)] backdrop-blur-xl transition hover:bg-gold hover:text-night`;

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
    const tryInsert = () => {
      attempts += 1;
      if (insertInlineCta() || attempts >= 40) window.clearInterval(intervalId);
    };

    tryInsert();
    const intervalId = window.setInterval(tryInsert, 125);
    const observer = new MutationObserver(() => insertInlineCta());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearInterval(intervalId);
      observer.disconnect();
      removeInlineCta();
    };
  }, [pathname, ready, loggedIn]);

  return null;
}
