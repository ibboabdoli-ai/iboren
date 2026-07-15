"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, BarChart3, CalendarDays, CheckCircle2, Loader2, MousePointerClick, RefreshCw } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

type Analytics = { totals: { pageViews: number; quoteClicks: number; bookingClicks: number; bookingStarts: number; bookingSubmissions: number }; pages: { path: string; count: number }[] };

function getSupabase() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; return url && key ? createClient(url, key) : null; }

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  async function load() {
    setLoading(true); setMessage("");
    try {
      const supabase = getSupabase();
      const { data: sessionData } = await supabase?.auth.getSession() || { data: { session: null } };
      const token = sessionData.session?.access_token;
      if (!token) { setAuthRequired(true); return; }
      const response = await fetch("/api/admin/analytics", { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (response.status === 401) { setAuthRequired(true); return; }
      if (!response.ok || !result.ok) throw new Error(result.message || "Kunde inte hämta statistik.");
      setData(result);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Något gick fel."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  const cards = data ? [
    { label: "Sidvisningar", value: data.totals.pageViews, icon: <BarChart3 size={20} /> },
    { label: "Klick på pris", value: data.totals.quoteClicks, icon: <MousePointerClick size={20} /> },
    { label: "Klick på boka", value: data.totals.bookingClicks, icon: <CalendarDays size={20} /> },
    { label: "Påbörjade formulär", value: data.totals.bookingStarts, icon: <CalendarDays size={20} /> },
    { label: "Skickade förfrågningar", value: data.totals.bookingSubmissions, icon: <CheckCircle2 size={20} /> }
  ] : [];
  return <main className="min-h-screen bg-cream py-12 text-ink md:py-16"><section className="luxe-container max-w-5xl"><Link href="/admin" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Tillbaka till admin</Link><div className="rounded-[2.5rem] bg-burgundy p-7 text-porcelain shadow-luxe md:p-9"><p className="text-xs font-bold uppercase tracking-[.32em] text-gold">Iboren Admin</p><h1 className="display mt-3 text-4xl font-bold leading-[.9] sm:text-5xl md:text-7xl">Besöksstatistik</h1><p className="mt-5 max-w-2xl leading-8 text-porcelain/70">Senaste 30 dagarna. Anonyma händelser visas – inte unika besökare eller personuppgifter.</p>{!authRequired && <button onClick={load} className="mt-6 inline-flex items-center gap-2 rounded-full bg-porcelain px-5 py-3 text-sm font-bold text-burgundy"><RefreshCw size={16} /> Uppdatera</button>}</div>{authRequired ? <div className="mt-8 rounded-[2rem] bg-porcelain p-8 shadow-soft"><h2 className="display text-3xl font-bold text-burgundy">Logga in som admin</h2><p className="mt-3 leading-7 text-ink/65">Logga in i denna Preview och öppna sidan igen.</p><Link href="/login" className="btn-primary mt-6">Logga in</Link></div> : <>{message && <p className="mt-6 rounded-2xl bg-red-50 p-4 font-bold text-red-800">{message}</p>}{loading ? <Loader2 className="mx-auto mt-12 animate-spin text-burgundy" /> : data && <><div className="mt-8 grid gap-4 md:grid-cols-3">{cards.map((card) => <article key={card.label} className="rounded-[2rem] bg-porcelain p-7 shadow-soft"><div className="text-burgundy">{card.icon}</div><p className="display mt-5 text-5xl font-bold text-burgundy">{card.value}</p><p className="mt-2 text-sm font-bold text-ink/55">{card.label}</p></article>)}</div><p className="mt-5 text-sm leading-6 text-ink/60">Jämför klick på boka, påbörjade formulär och skickade förfrågningar för att se var flödet tappar fart.</p><div className="mt-6 rounded-[2rem] bg-porcelain p-7 shadow-soft"><h2 className="display text-3xl font-bold text-burgundy">Mest besökta sidor</h2><div className="mt-5 grid gap-3">{data.pages.length ? data.pages.map((page) => <div key={page.path} className="flex items-center justify-between rounded-2xl bg-cream px-5 py-4"><span className="font-bold text-ink/75">{page.path}</span><span className="rounded-full bg-burgundy px-3 py-1 text-sm font-bold text-porcelain">{page.count}</span></div>) : <p className="text-ink/55">Inga händelser ännu.</p>}</div></div></>}</>}</section></main>;
}
