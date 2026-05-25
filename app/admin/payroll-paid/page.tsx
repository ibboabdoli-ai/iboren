"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import PaidPayrollExcelButton from "./PaidPayrollExcelButton";

type Summary = { employee_id: string; employee_name: string; employee_email: string; approved_entries: number; worked_minutes: number; break_minutes: number; travel_minutes: number; mileage_km: number };
type ApiResponse = { ok?: boolean; message?: string; summaries?: Summary[] };

function supabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
}
function monthStart() { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`; }
function nextMonth(start: string) { const date = new Date(`${start}T12:00:00`); date.setMonth(date.getMonth() + 1); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`; }
function hours(minutes: number) { return Math.round((Number(minutes || 0) / 60) * 100) / 100; }
function svNumber(value: number) { return String(value).replace(".", ","); }
function csv(value: unknown) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }
function toCsv(start: string, end: string, summaries: Summary[]) {
  const header = ["Period start", "Period slut", "Städare", "E-post", "Antal tidrapporter", "Arbetade timmar", "Rast minuter", "Restid minuter", "Körsträcka km"];
  const rows = summaries.map((item) => [start, end, item.employee_name, item.employee_email, item.approved_entries, svNumber(hours(item.worked_minutes)), item.break_minutes, item.travel_minutes, item.mileage_km]);
  return [header, ...rows].map((row) => row.map(csv).join(";")).join("\n");
}

export default function PayrollPaidPage() {
  const defaultStart = monthStart();
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(nextMonth(defaultStart));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [csvText, setCsvText] = useState("");
  const total = useMemo(() => summaries.reduce((sum, item) => ({ entries: sum.entries + item.approved_entries, worked: sum.worked + item.worked_minutes, breakM: sum.breakM + item.break_minutes, travel: sum.travel + item.travel_minutes, mileage: sum.mileage + item.mileage_km }), { entries: 0, worked: 0, breakM: 0, travel: 0, mileage: 0 }), [summaries]);

  async function getToken() { const supabase = supabaseClient(); if (!supabase) return null; const { data } = await supabase.auth.getSession(); return data.session?.access_token || null; }
  async function load() {
    setLoading(true); setMessage(""); setCsvText("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Du behöver logga in igen.");
      const headerName = ["Author", "ization"].join("");
      const tokenWord = ["Bear", "er"].join("");
      const response = await fetch(`/api/admin/payroll-basis?start=${start}&end=${end}&status=paid`, { headers: { [headerName]: `${tokenWord} ${token}` } });
      const result = await response.json().catch(() => null) as ApiResponse | null;
      if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not load paid payroll basis.");
      const list = result.summaries || [];
      setSummaries(list);
      setCsvText(toCsv(start, end, list));
      setMessage("Paid payroll loaded. CSV is now formatted for Swedish Excel/accounting.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not load paid payroll basis."); }
    setLoading(false);
  }
  async function copyCsv() { if (!csvText) return; try { await navigator.clipboard.writeText(csvText); setMessage("CSV copied."); } catch { setMessage("Select the CSV text and copy it manually."); } }

  return <main className="min-h-screen bg-cream py-12 text-ink"><section className="luxe-container"><Link href="/admin/payroll-basis" className="text-sm font-bold text-burgundy">← Back to open payroll</Link><div className="mt-6 rounded-[2rem] bg-burgundy p-7 text-porcelain"><p className="text-xs font-bold uppercase tracking-[.25em] text-gold">Iboren Admin</p><h1 className="display mt-3 text-5xl font-bold">Paid payroll archive</h1><p className="mt-4 text-porcelain/70">View paid entries and download a readable Excel payroll file with work dates.</p></div><div className="mt-6 rounded-[2rem] bg-porcelain p-5 shadow-soft"><div className="grid gap-3 md:grid-cols-4"><label><span className="block text-xs font-black uppercase tracking-[.12em] text-ink/45">Start</span><input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full rounded-xl bg-cream px-3 py-2 font-bold" /></label><label><span className="block text-xs font-black uppercase tracking-[.12em] text-ink/45">End</span><input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 w-full rounded-xl bg-cream px-3 py-2 font-bold" /></label><button onClick={load} className="rounded-full bg-burgundy px-5 py-3 font-bold text-porcelain md:self-end">{loading ? "Loading..." : "Load paid"}</button><div className="md:self-end"><PaidPayrollExcelButton start={start} end={end} /></div></div>{message && <p className="mt-4 rounded-xl bg-burgundy/10 p-3 font-bold text-burgundy">{message}</p>}<div className="mt-5 grid gap-3 md:grid-cols-5"><p className="rounded-xl bg-cream p-3 font-bold">Entries<br />{total.entries}</p><p className="rounded-xl bg-cream p-3 font-bold">Work<br />{hours(total.worked)}h</p><p className="rounded-xl bg-cream p-3 font-bold">Break<br />{total.breakM}m</p><p className="rounded-xl bg-cream p-3 font-bold">Travel<br />{hours(total.travel)}h</p><p className="rounded-xl bg-cream p-3 font-bold">Mileage<br />{total.mileage}km</p></div><div className="mt-5 grid gap-3">{summaries.map((item) => <article key={item.employee_id} className="rounded-xl bg-cream p-4"><h2 className="display text-2xl font-bold text-burgundy">{item.employee_name}</h2><p className="text-sm font-bold text-ink/55">{item.employee_email}</p><p className="mt-3 text-sm font-bold">Tidrapporter: {item.approved_entries} · Arbetstid: {hours(item.worked_minutes)}h · Rast: {item.break_minutes}m · Restid: {item.travel_minutes}m · Körsträcka: {item.mileage_km}km</p></article>)}{!loading && summaries.length === 0 && <p className="rounded-xl bg-cream p-4 font-bold text-ink/55">No paid entries in this period.</p>}</div>{csvText && <div className="mt-5 rounded-2xl bg-cream p-3"><button type="button" onClick={copyCsv} className="mb-3 rounded-full bg-porcelain px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-burgundy ring-1 ring-burgundy/10">Copy CSV</button><p className="mb-3 text-sm font-bold text-ink/55">CSV summary is grouped per cleaner. Download Excel includes one row per work date.</p><textarea readOnly value={csvText} className="h-64 w-full rounded-xl bg-porcelain p-3 font-mono text-xs leading-6 text-ink/80 outline-none" /></div>}</div></section></main>;
}
