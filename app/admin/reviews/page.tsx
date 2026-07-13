"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Loader2, RefreshCw, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

type Review = { id: string; customer_name: string | null; language: "sv" | "en"; rating: number; comment: string | null; status: "submitted" | "approved" | "rejected"; booking: { service: string; area: string } | null };

function getSupabase() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; return url && key ? createClient(url, key) : null; }

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [message, setMessage] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  async function token() { const supabase = getSupabase(); const { data } = await supabase?.auth.getSession() || { data: { session: null } }; return data.session?.access_token || null; }
  async function load() {
    setLoading(true); setMessage("");
    try {
      const accessToken = await token();
      if (!accessToken) { setAuthRequired(true); return; }
      const response = await fetch("/api/admin/reviews", { headers: { Authorization: `Bearer ${accessToken}` } });
      const result = await response.json();
      if (response.status === 401) { setAuthRequired(true); return; }
      if (!response.ok || !result.ok) throw new Error(result.message || "Kunde inte hämta omdömen.");
      setReviews(result.reviews || []);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Något gick fel."); }
    finally { setLoading(false); }
  }
  async function moderate(id: string, status: "approved" | "rejected") {
    setUpdating(id); setMessage("");
    try {
      const accessToken = await token();
      if (!accessToken) { setAuthRequired(true); return; }
      const response = await fetch("/api/admin/reviews", { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Kunde inte uppdatera omdömet.");
      setReviews((current) => current.map((review) => review.id === id ? { ...review, status } : review));
    } catch (error) { setMessage(error instanceof Error ? error.message : "Något gick fel."); }
    finally { setUpdating(null); }
  }
  useEffect(() => { void load(); }, []);
  const submitted = reviews.filter((review) => review.status === "submitted");
  return <main className="min-h-screen bg-cream py-12 text-ink md:py-16"><section className="luxe-container max-w-5xl"><Link href="/admin" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Tillbaka till admin</Link><div className="rounded-[2.5rem] bg-burgundy p-7 text-porcelain shadow-luxe md:p-9"><p className="text-xs font-bold uppercase tracking-[.32em] text-gold">Iboren Admin</p><h1 className="display mt-3 break-words text-4xl font-bold leading-[.9] sm:text-5xl md:text-7xl">Kundomdömen</h1><p className="mt-5 max-w-2xl leading-8 text-porcelain/70">Granska varje inskickat omdöme före publicering.</p>{!authRequired && <button onClick={load} className="mt-6 inline-flex items-center gap-2 rounded-full bg-porcelain px-5 py-3 text-sm font-bold text-burgundy"><RefreshCw size={16} /> Uppdatera</button>}</div>{authRequired ? <div className="mt-8 rounded-[2rem] bg-porcelain p-8 shadow-soft"><h2 className="display text-3xl font-bold text-burgundy">Logga in som admin</h2><p className="mt-3 leading-7 text-ink/65">Preview har en egen inloggningssession. Logga in på den här länken och öppna sedan Kundomdömen igen.</p><Link href="/login" className="btn-primary mt-6">Logga in</Link></div> : <>{message && <p className="mt-6 rounded-2xl bg-red-50 p-4 font-bold text-red-800">{message}</p>}<div className="mt-8 grid gap-4">{loading ? <Loader2 className="mx-auto animate-spin text-burgundy" /> : submitted.length === 0 ? <div className="rounded-[2rem] bg-porcelain p-8 text-ink/65 shadow-soft">Inga nya omdömen att granska.</div> : submitted.map((review) => <article key={review.id} className="rounded-[2rem] bg-porcelain p-7 shadow-soft"><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><p className="text-gold">{"★".repeat(review.rating || 0)}</p><h2 className="mt-3 text-xl font-bold">{review.customer_name || "Kund"} · {review.booking?.service || "Tjänst"}</h2><p className="mt-1 text-sm text-ink/55">{review.booking?.area || ""} · {review.language.toUpperCase()}</p></div><div className="flex gap-2"><button disabled={updating === review.id} onClick={() => moderate(review.id, "approved")} className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-bold text-white"><Check size={16} /> Godkänn</button><button disabled={updating === review.id} onClick={() => moderate(review.id, "rejected")} className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white"><X size={16} /> Avvisa</button></div></div>{review.comment && <p className="mt-5 rounded-2xl bg-cream p-5 leading-7 text-ink/75">{review.comment}</p>}</article>)}</div></>}</section></main>;
}
