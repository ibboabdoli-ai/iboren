"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, Loader2, RefreshCw, XCircle } from "lucide-react";

type Entry = { id: string; booking_id: string; employee_id: string; work_date: string; worked_minutes: number; break_minutes: number; travel_minutes: number; mileage_km: number; status: string; cleaner_note: string | null; admin_note: string | null; created_at: string };
type Person = { id: string; email: string; name: string; phone: string | null };
type Job = { id: string; service: string; area: string; address: string | null; preferred_date: string | null; customer_name: string };
type Api = { ok?: boolean; message?: string; needsMigration?: boolean; entries?: Entry[]; employees?: Record<string, Person>; bookings?: Record<string, Job>; entry?: Entry };

function h(min: number) { return Math.round((Number(min || 0) / 60) * 100) / 100; }
function cls(s: string) { if (s === "approved") return "bg-green-100 text-green-800"; if (s === "rejected") return "bg-red-100 text-red-800"; return "bg-gold text-ink"; }

export default function AdminTimeEntriesPanel({ getToken }: { getToken: () => Promise<string | null> }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [employees, setEmployees] = useState<Record<string, Person>>({});
  const [bookings, setBookings] = useState<Record<string, Job>>({});

  async function auth(content = false) {
    const token = await getToken();
    if (!token) throw new Error("Du behöver logga in igen.");
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (content) headers["Content-Type"] = "application/json";
    return headers;
  }

  async function load() {
    setOpen(true); setLoading(true); setMessage("");
    try {
      const res = await fetch("/api/admin/time-entries", { headers: await auth() });
      const data = await res.json().catch(() => null) as Api | null;
      if (!res.ok || !data?.ok) throw new Error(data?.message || "Could not load time reports.");
      setEntries(data.entries || []); setEmployees(data.employees || {}); setBookings(data.bookings || {});
      if (data.needsMigration) setMessage("Run Step 25A SQL in Supabase first.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Could not load time reports."); }
    setLoading(false);
  }

  async function update(entry: Entry, status: "approved" | "rejected") {
    setBusy(entry.id); setMessage("");
    try {
      const res = await fetch("/api/admin/time-entries", { method: "PATCH", headers: await auth(true), body: JSON.stringify({ id: entry.id, status, worked_minutes: entry.worked_minutes, break_minutes: entry.break_minutes, travel_minutes: entry.travel_minutes, mileage_km: entry.mileage_km, admin_note: entry.admin_note || "" }) });
      const data = await res.json().catch(() => null) as Api | null;
      if (!res.ok || !data?.ok || !data.entry) throw new Error(data?.message || "Could not update time report.");
      setEntries((list) => list.map((item) => item.id === entry.id ? data.entry as Entry : item));
      setMessage(`Time report ${status}.`);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Could not update time report."); }
    setBusy("");
  }

  return <section className="mt-6 rounded-[2rem] bg-porcelain p-5 shadow-soft md:p-7">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.22em] text-burgundy"><Clock3 className="h-4 w-4" /> Time reports</p><h2 className="display mt-2 text-3xl font-bold text-burgundy">Admin time approval</h2><p className="mt-2 text-sm text-ink/60">Approve or reject cleaner submitted hours.</p></div><button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-full bg-burgundy px-5 py-3 text-sm font-bold text-porcelain">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}{open ? "Refresh" : "Show"}</button></div>
    {message && <p className="mt-4 rounded-2xl bg-burgundy/10 p-4 text-sm font-bold text-burgundy">{message}</p>}
    {open && !loading && entries.length === 0 && <p className="mt-5 rounded-2xl bg-cream p-4 text-sm font-bold text-ink/55">No time reports yet.</p>}
    {open && entries.length > 0 && <div className="mt-5 grid gap-3">{entries.map((entry) => { const employee = employees[entry.employee_id]; const booking = bookings[entry.booking_id]; const active = busy === entry.id; return <article key={entry.id} className="rounded-[1.5rem] bg-cream p-4 ring-1 ring-burgundy/10"><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[.14em] ${cls(entry.status)}`}>{entry.status}</span><h3 className="display mt-3 text-2xl font-bold text-burgundy">{employee?.name || "Cleaner"}</h3><p className="mt-1 text-sm font-bold text-ink/55">{employee?.email || "—"}</p><p className="mt-3 text-sm text-ink/70"><strong>{booking?.service || "Booking"}</strong>{booking?.address ? ` · ${booking.address}` : ""}</p></div><div className="grid gap-2 text-xs font-black uppercase tracking-[.12em] sm:grid-cols-2"><span className="rounded-full bg-porcelain px-3 py-2 text-ink/65">{entry.work_date}</span><span className="rounded-full bg-porcelain px-3 py-2 text-ink/65">{h(entry.worked_minutes)}h</span><span className="rounded-full bg-porcelain px-3 py-2 text-ink/65">Break {entry.break_minutes}m</span><span className="rounded-full bg-porcelain px-3 py-2 text-ink/65">Travel {entry.travel_minutes}m · {entry.mileage_km}km</span></div></div><div className="mt-4 flex flex-wrap gap-2"><button disabled={active || entry.status === "approved"} onClick={() => update(entry, "approved")} className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-green-800 disabled:opacity-50">{active ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Approve</button><button disabled={active || entry.status === "rejected"} onClick={() => update(entry, "rejected")} className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-red-800 disabled:opacity-50">{active ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}Reject</button></div></article>; })}</div>}
  </section>;
}
