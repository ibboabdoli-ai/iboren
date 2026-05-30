"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const linkMap: Record<string, string> = {
  "/jobb": "/jobba-hos-oss",
  "/om-iboren": "/om-oss",
  "/hemstadning": "/tjanster/hemstadning",
  "/flyttstadning": "/tjanster/flyttstadning",
  "/kontorsstadning": "/tjanster/kontorsstadning",
  "/fonsterputs": "/tjanster/fonsterputs"
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
}

function isEnglishPath() {
  return window.location.pathname === "/en" || window.location.pathname.startsWith("/en/");
}

function replaceAnchorText(anchor: HTMLAnchorElement, text: string) {
  const icon = anchor.querySelector("svg");
  anchor.textContent = "";
  if (icon) {
    anchor.appendChild(icon);
    anchor.appendChild(document.createTextNode(" "));
  }
  anchor.appendChild(document.createTextNode(text));
}

function normalizeLoggedInLinks() {
  const english = isEnglishPath();
  const profileHref = english ? "/en/profile" : "/profile";
  const profileText = english ? "My profile" : "Min profil";

  document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href") || "";
    const label = (anchor.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    const pointsToLogin = href === "/login" || href === "/en/login" || href.endsWith("/login");
    const saysLogin = label === "logga in" || label === "log in";

    if (!pointsToLogin && !saysLogin) return;

    anchor.setAttribute("href", profileHref);
    replaceAnchorText(anchor, profileText);
  });
}

function normalizeLinks() {
  document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href");
    if (!href) return;
    const replacement = linkMap[href];
    if (replacement) anchor.setAttribute("href", replacement);
  });
}

export default function InternalLinkNormalizer() {
  useEffect(() => {
    const supabase = getSupabase();

    async function normalizeAll() {
      normalizeLinks();
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) normalizeLoggedInLinks();
    }

    normalizeAll();
    const firstPass = window.setTimeout(normalizeAll, 250);
    const secondPass = window.setTimeout(normalizeAll, 1000);
    const observer = new MutationObserver(normalizeAll);
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] });
    const listener = supabase?.auth.onAuthStateChange((_event, session) => {
      if (session?.user) normalizeLoggedInLinks();
    });

    return () => {
      window.clearTimeout(firstPass);
      window.clearTimeout(secondPass);
      observer.disconnect();
      listener?.data.subscription.unsubscribe();
    };
  }, []);

  return null;
}
