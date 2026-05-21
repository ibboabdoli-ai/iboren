"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
}

function hasAuthHash() {
  const hash = window.location.hash || "";
  return hash.includes("access_token=") || hash.includes("refresh_token=") || hash.includes("error_description=");
}

function cleanUrlHash() {
  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, document.title, cleanUrl);
}

export default function AuthHashCleaner() {
  useEffect(() => {
    if (!hasAuthHash()) return;

    let cancelled = false;

    async function persistSessionAndCleanUrl() {
      const supabase = getSupabase();

      try {
        if (supabase) await supabase.auth.getSession();
      } finally {
        window.setTimeout(() => {
          if (!cancelled && hasAuthHash()) cleanUrlHash();
        }, 250);
      }
    }

    void persistSessionAndCleanUrl();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
