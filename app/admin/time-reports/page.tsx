"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft } from "lucide-react";
import AdminTimeEntriesPanel from "../AdminTimeEntriesPanel";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
}

export default function AdminTimeReportsPage() {
  async function getToken() {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  return <main className="min-h-screen bg-cream py-12 text-ink md:py-16"><section className="luxe-container"><Link href="/admin" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Tillbaka till admin</Link><div className="rounded-[2.5rem] bg-burgundy p-7 text-porcelain shadow-luxe md:p-9"><p className="text-xs font-bold uppercase tracking-[.32em] text-gold">Iboren Admin</p><h1 className="display mt-3 text-5xl font-bold leading-[.9] md:text-7xl">Time reports</h1><p className="mt-5 max-w-2xl leading-8 text-porcelain/70">Review submitted cleaner hours.</p></div><AdminTimeEntriesPanel getToken={getToken} /></section></main>;
}
