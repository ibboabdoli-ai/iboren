"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Entry = { id: string; booking_id: string; employee_id: string; work_date: string; worked_minutes: number; break_minutes: number; travel_minutes: number; mileage_km: number; status: string; updated_at: string; created_at: string };
type Person = { id: string; email: string; name: string };
type Job = { id: string; service: string; address: string | null };
type Api = { ok?: boolean; message?: string; entries?: Entry[]; employees?: Record<string, Person>; bookings?: Record<string, Job> };

function supabaseClient() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; if (!url || !key) return null; return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }); }
function hours(minutes: number) { return Math.round((Number(minutes || 0) / 60) * 100) / 100; }

export default function PaidReportsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [employees, setEmployees] = useState<Record<string, Person>>({});
  const [bookings, setBookings] = useState<Record<string, Job>>({});
  const paidEntries = useMemo(() => entries.filter((entry) => entry.status === "paid"), [entries]);
  const total = useMemo(() => paidEntries.reduce((sum, entry) => ({ count: sum.count + 1, worked: sum.worked + entry.worked_minutes, breakM: sum.breakM + entry.break_minutes, travel: sum.travel + entry.travel_minutes, mileage: sum.mileage + Number(entry.mileage_km || 0) }), { count: 0, worked: 0, breakM: 0, travel: 0, mileage: 0 }), [paidEntries]);

  async function getToken() { const supabase = supabaseClient(); if (!supabase) return null; const { data } = await supabase.auth.getSession(); return data.session?.access_token || null; }
  async function load() { setLoading(true); setMessage(""); try { const token = await getToken(); if (!token) throw new Error("Du behöver logga in igen."); const res = await fetch("/api/admin/time-entries", { headers: { Authorization: `Bearer ${token}` } }); const data = await res.json().catch(() => null) as Api | null; if (!res.ok || !data?.ok) throw new Error(data?.message || "Could not load paid reports."); setEntries(data.entries || []); setEmployees(data.employees || {}); setBookings(data.bookings || {}); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not load paid reports."); } setLoading(false); }

  return <main className="min-h-screen bg-cream py-12 text-ink"><section className="luxe-container"><Link href="/admin" className="text-sm font-bold text-burgundy">← Tillbaka till admin</Link><div className="mt-6 rounded-[2rem] bg-burgundy p-7 text-porcelain"><p className="text-xs font-bold uppercase tracking-[.25em] text-gold">Iboren Admin</p><h1 className="display mt-3 text-5xl font-bold">Paid reports</h1><p className="mt-4 text-porcelain/70">History of time entries marked as paid.</p></div><div className="mt-6 rounded-[2rem] bg-porcelain p-5 shadow-soft"><button onClick={load} className="rounded-full bg-burgundy px-5 py-3 font-bold text-porcelain">{loading ? "Loading..." : "Load paid reports"}</button>{message && <p className="mt-4 rounded-xl bg-burgundy/10 p-3 font-bold text-burgundy">{message}</p>}<div className="mt-5 grid gap-3 md:grid-cols-5"><p className="rounded-xl bg-cream p-3 font-bold">Entries<br />{total.count}</p><p className="rounded-xl bg-cream p-3 font-bold">Work<br />{hours(total.worked)}h</p><p className="rounded-xl bg-cream p-3 font-bold">Break<br />{total.breakM}m</p><p className="rounded-xl bg-cream p-3 font-bold">Travel<br />{hours(total.travel)}h</p><p className="rounded-xl bg-cream p-3 font-bold">Mileage<br />{total.mileage}km</p></div><div className="mt-5 grid gap-3">{paidEntries.map((entry) => { const employee = employees[entry.employee_id]; const booking = bookings[entry.booking_id]; return <article key={entry.id} className="rounded-xl bg-cream p-4"><h2 className="display text-2xl font-bold text-burgundy">{employee?.name || "Cleaner"}</h2><p className="text-sm font-bold text-ink/55">{employee?.email || "—"}</p><p className="mt-2 text-sm font-bold text-ink/70">{booking?.service || "Booking"}{booking?.address ? ` · ${booking.address}` : ""}</p><p className="mt-3 text-sm font-bold">Work: {hours(entry.worked_minutes)}h · Break: {entry.break_minutes}m · Travel: {entry.travel_minutes}m · Mileage: {entry.mileage_km}km</p><p className="mt-2 text-sm text-ink/55">Work date: {entry.work_date} · Updated: {new Date(entry.updated_at || entry.created_at).toLocaleDateString("sv-SE")}</p></article>; })}{!loading && paidEntries.length === 0 && <p className="rounded-xl bg-cream p-4 font-bold text-ink/55">No paid entries loaded or found.</p>}</div></div></section></main>;
}
