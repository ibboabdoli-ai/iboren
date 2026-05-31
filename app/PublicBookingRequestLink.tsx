"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
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

  if (pathname !== "/" || !ready || loggedIn) return null;

  return (
    <div className="fixed inset-x-3 bottom-4 z-40 mx-auto max-w-md md:bottom-6">
      <Link
        href="/boka-utan-konto"
        className="block rounded-[1.4rem] border border-gold/30 bg-night/95 px-5 py-4 text-center shadow-[0_18px_60px_rgba(0,0,0,.28)] backdrop-blur-xl"
      >
        <span className="block text-sm font-black uppercase tracking-[.18em] text-gold">Skicka förfrågan utan konto</span>
        <span className="mt-1 block text-xs font-semibold text-porcelain/70">Vi bekräftar alltid tid och pris innan bokningen blir bindande.</span>
      </Link>
    </div>
  );
}
