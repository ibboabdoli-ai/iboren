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
    <div className="bg-night px-5 pb-10 pt-0 text-center text-porcelain md:hidden">
      <div className="mx-auto max-w-sm">
        <Link
          href="/boka-utan-konto"
          className="flex min-h-14 items-center justify-center rounded-full border border-gold/35 bg-porcelain/8 px-6 py-4 text-center text-sm font-black uppercase tracking-[.16em] text-gold shadow-[0_16px_44px_rgba(0,0,0,.24)] backdrop-blur-xl"
        >
          Skicka förfrågan utan konto
        </Link>
        <p className="mt-3 text-xs font-semibold leading-5 text-porcelain/58">
          Vi bekräftar alltid tid och pris innan bokningen blir bindande.
        </p>
      </div>
    </div>
  );
}
