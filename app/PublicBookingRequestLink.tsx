"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
}

function removeInlineLink() {
  document.querySelectorAll(".iboren-public-booking-inline").forEach((element) => element.remove());
}

function insertInlineLink() {
  const priceButton = document.querySelector<HTMLAnchorElement>('a[href="/priser"].btn-primary');
  const buttonGroup = priceButton?.parentElement;
  if (!priceButton || !buttonGroup || buttonGroup.querySelector(".iboren-public-booking-inline")) return;

  const link = document.createElement("a");
  link.href = "/boka-utan-konto";
  link.className = "btn-secondary iboren-public-booking-inline";
  link.textContent = "Skicka förfrågan";
  buttonGroup.appendChild(link);
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
    removeInlineLink();
    if (pathname !== "/" || !ready || loggedIn) return;

    insertInlineLink();
    const observer = new MutationObserver(() => insertInlineLink());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      removeInlineLink();
    };
  }, [pathname, ready, loggedIn]);

  return null;
}
