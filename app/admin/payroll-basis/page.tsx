"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Summary = {
  employee_id: string;
  employee_name: string;
  employee_email: string;
  approved_entries: number;
  worked_minutes: number;
  break_minutes: number;
  travel_minutes: number;
  mileage_km: number;
};

type ApiResponse = { ok?: boolean; message?: string; summaries?: Summary[] };

function supabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
}

function monthStart() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function nextMonth(start: string) {
  const date = new Date(`${start}T12:00:00`);
  date.setMonth(date.getMonth() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}

function hours(minutes: number) {
  return Math.round((Number(minutes || 0) / 60) * 100) / 100;
}

export default function PayrollBasisPage() {
  const defaultStart = monthStart();
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(nextMonth(defaultStart));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [summaries, setSummaries] = useState<Summary[]>([]);

  const total = useMemo(() => summaries.reduce((sum, item) => ({
    entries: sum.entries + item.approved_entries,
    worked: sum.worked + item.worked_minutes,
    breakM: sum.breakM + item.break_minutes,
    travel: sum.travel + item.travel_minutes,
    mileage: sum.mileage + item.mileage_km
  }), { entries: 0, worked: 0, breakM: 0, travel: 0, mileage: 0 }), [summaries]);

  async function getToken() {
    const supabase = supabaseClient();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }

  async function load() {
    setLoading(true);
    setMessage("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Du behöver logga in igen.");
      const response = await fetch(`/api/admin/payroll-basis?start=${start}&end=${end}`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json().catch(() => null) as ApiResponse | null;
      if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not load payroll basis.");
      setSummaries(result.summaries || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load payroll basis.");
    }
    setLoading(false);
  }

  return <main className="min-h-screen bg-cream py-12 text-ink"><section className="luxe-container"><Link href="/admin" className="text-sm font-bold text-burgundy">← Tillbaka till admin</Link><div className="mt-6 rounded-[2rem] bg-burgundy p-7 text-porcelain"><p className="text-xs font-bold uppercase tracking-[.25em] text-gold">Iboren Admin</p><h1 className="display mt-3 text-5xl font-bold">Payroll basis</h1><p className="mt-4 text-porcelain/70">Monthly summary of approved cleaner hours.</p></div><div className="mt-6 rounded-[2rem] bg-porcelain p-5 shadow-soft"><div className="grid gap-3 md:grid-cols-3"><label><span className="block text-xs font-black uppercase tracking-[.12em] text-ink/45">Start</span><input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full rounded-xl bg-cream px-3 py-2 font-bold" /></label><label><span className="block text-xs font-black uppercase tracking-[.12em] text-ink/45">End</span><input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 w-full rounded-xl bg-cream px-3 py-2 font-bold" /></label><button onClick={load} className="rounded-full bg-burgundy px-5 py-3 font-bold text-porcelain md:self-end">{loading ? "Loading..." : "Load"}</button></div>{message && <p className="mt-4 rounded-xl bg-burgundy/10 p-3 font-bold text-burgundy">{message}</p>}<div className="mt-5 grid gap-3 md:grid-cols-5"><p className="rounded-xl bg-cream p-3 font-bold">Entries<br />{total.entries}</p><p className="rounded-xl bg-cream p-3 font-bold">Work<br />{hours(total.worked)}h</p><p className="rounded-xl bg-cream p-3 font-bold">Break<br />{total.breakM}m</p><p className="rounded-xl bg-cream p-3 font-bold">Travel<br />{hours(total.travel)}h</p><p className="rounded-xl bg-cream p-3 font-bold">Mileage<br />{total.mileage}km</p></div><div className="mt-5 grid gap-3">{summaries.map((item) => <article key={item.employee_id} className="rounded-xl bg-cream p-4"><h2 className="display text-2xl font-bold text-burgundy">{item.employee_name}</h2><p className="text-sm font-bold text-ink/55">{item.employee_email}</p><p className="mt-3 text-sm font-bold">Entries: {item.approved_entries} · Work: {hours(item.worked_minutes)}h · Break: {item.break_minutes}m · Travel: {item.travel_minutes}m · Mileage: {item.mileage_km}km</p></article>)}{!loading && summaries.length === 0 && <p className="rounded-xl bg-cream p-4 font-bold text-ink/55">No approved time entries in this period.</p>}</div></div></section></main>;
}
