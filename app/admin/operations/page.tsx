"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient, User } from "@supabase/supabase-js";
import { getBookingWorkflow, getWorkflowStats, type AdminWorkflowBooking, type PriorityLabel } from "../adminWorkflow";

const adminEmails = ["ibbo.abdoli@gmail.com"];

type AdminPublicRequest = {
  id: string;
  external_id: string;
  status: string | null;
  language: string | null;
  service: string;
  area: string;
  address: string | null;
  size_sqm: number | null;
  frequency: string | null;
  preferred_date: string | null;
  time_window: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_type: string | null;
  rut_requested: boolean | null;
  notes: string | null;
  admin_notes: string | null;
  converted_booking_id: string | null;
  source: string | null;
  created_at: string;
  updated_at: string | null;
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
}

function priorityClass(priority: PriorityLabel) {
  if (priority === "Urgent" || priority === "Problem") return "bg-red-100 text-red-800 ring-1 ring-red-200";
  if (priority === "Today") return "bg-orange-100 text-orange-800 ring-1 ring-orange-200";
  if (priority === "Missing info") return "bg-gold/20 text-burgundy ring-1 ring-gold/35";
  if (priority === "Waiting") return "bg-blue-100 text-blue-800 ring-1 ring-blue-200";
  if (priority === "Ready") return "bg-green-100 text-green-800 ring-1 ring-green-200";
  return "bg-cream text-ink/65 ring-1 ring-burgundy/10";
}

function publicStatusClass(status: string | null) {
  if (status === "converted") return "bg-green-100 text-green-800 ring-1 ring-green-200";
  if (status === "rejected") return "bg-red-100 text-red-800 ring-1 ring-red-200";
  if (status === "reviewed") return "bg-blue-100 text-blue-800 ring-1 ring-blue-200";
  return "bg-gold text-ink ring-1 ring-gold/40";
}

function publicStatusLabel(status: string | null) {
  if (status === "converted") return "Konverterad";
  if (status === "rejected") return "Avvisad";
  if (status === "reviewed") return "Granskad";
  return "Ny publik";
}

function formatDate(value: string | null) {
  if (!value) return "Datum saknas";
  try {
    return new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium" }).format(new Date(`${value}T12:00:00`));
  } catch {
    return value;
  }
}

function compactAddress(booking: AdminWorkflowBooking) {
  return [booking.area, booking.address].filter(Boolean).join(" · ") || "Adress saknas";
}

function compactPublicAddress(request: AdminPublicRequest) {
  return [request.area, request.address].filter(Boolean).join(" · ") || "Adress saknas";
}

function isToday(value: string | null) {
  if (!value) return false;
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function requiresPublicAction(request: AdminPublicRequest) {
  const status = request.status || "new";
  return status === "new" || status === "reviewed";
}

export default function AdminOperationsPage() {
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [publicRequestsLoading, setPublicRequestsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<AdminWorkflowBooking[]>([]);
  const [publicRequests, setPublicRequests] = useState<AdminPublicRequest[]>([]);
  const [message, setMessage] = useState("");

  const isAdmin = Boolean(user?.email && adminEmails.includes(user.email.toLowerCase()));

  const rows = useMemo(() => bookings.map((booking) => ({ booking, workflow: getBookingWorkflow(booking) })), [bookings]);
  const bookingStats = useMemo(() => getWorkflowStats(bookings), [bookings]);
  const publicActionRows = useMemo(() => publicRequests.filter(requiresPublicAction), [publicRequests]);
  const publicToday = useMemo(() => publicActionRows.filter((request) => isToday(request.preferred_date)).length, [publicActionRows]);
  const stats = useMemo(() => ({
    todayJobs: bookingStats.todayJobs + publicToday,
    newRequests: bookingStats.newRequests + publicRequests.filter((request) => (request.status || "new") === "new").length,
    needAction: bookingStats.needAction + publicActionRows.length,
    unassignedJobs: bookingStats.unassignedJobs,
    timeReportsWaitingApproval: bookingStats.timeReportsWaitingApproval,
    problems: bookingStats.problems
  }), [bookingStats, publicActionRows.length, publicRequests, publicToday]);

  const needActionRows = useMemo(() => rows.filter((row) => row.workflow.needsAction).sort((a, b) => {
    const score = (priority: PriorityLabel) => ({ Urgent: 0, Problem: 1, Today: 2, "Missing info": 3, Ready: 4, Waiting: 5, Normal: 6 }[priority] ?? 6);
    const byPriority = score(a.workflow.priority) - score(b.workflow.priority);
    if (byPriority !== 0) return byPriority;
    return String(a.booking.preferred_date || "9999-12-31").localeCompare(String(b.booking.preferred_date || "9999-12-31"));
  }), [rows]);

  async function getToken() {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  async function loadBookings() {
    setBookingsLoading(true);
    setPublicRequestsLoading(true);
    setMessage("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Du behöver logga in igen.");

      const [bookingsResponse, publicResponse] = await Promise.all([
        fetch("/api/admin/bookings", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/public-requests", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const bookingsResult = await bookingsResponse.json();
      const publicResult = await publicResponse.json();

      if (!bookingsResponse.ok || !bookingsResult.ok) throw new Error(bookingsResult.message || "Kunde inte hämta bokningar.");
      if (!publicResponse.ok || !publicResult.ok) throw new Error(publicResult.message || "Kunde inte hämta publika förfrågningar.");

      setBookings(bookingsResult.bookings || []);
      setPublicRequests(publicResult.requests || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Något gick fel.");
    }
    setBookingsLoading(false);
    setPublicRequestsLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const supabase = getSupabase();
      if (!supabase) {
        setMessage("Supabase environment variables saknas.");
        setLoading(false);
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      setUser(data.user ?? null);
      setLoading(false);
    }
    void init();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (user && isAdmin) void loadBookings();
  }, [user, isAdmin]);

  if (loading) return <main className="grid min-h-screen place-items-center bg-cream text-burgundy">Laddar...</main>;

  if (!user) {
    return <main className="min-h-screen bg-cream py-16 text-ink"><section className="luxe-container max-w-2xl rounded-[2rem] bg-porcelain p-8 shadow-soft"><Link href="/" className="mb-8 inline-flex text-sm font-bold text-burgundy">Tillbaka</Link><h1 className="display text-5xl font-bold text-burgundy">Operations</h1><p className="mt-4 leading-8 text-ink/70">Du behöver logga in som admin.</p><Link href="/login" className="btn-primary mt-7">Logga in</Link></section></main>;
  }

  if (!isAdmin) {
    return <main className="min-h-screen bg-cream py-16 text-ink"><section className="luxe-container max-w-2xl rounded-[2rem] bg-porcelain p-8 shadow-soft"><Link href="/profile" className="mb-8 inline-flex text-sm font-bold text-burgundy">Tillbaka</Link><h1 className="display text-5xl font-bold text-burgundy">Ingen adminåtkomst</h1><p className="mt-4 leading-8 text-ink/70">Inloggad som {user.email}. Den här sidan är bara för admin.</p></section></main>;
  }

  return (
    <main className="min-h-screen bg-cream py-10 text-ink md:py-14">
      <section className="luxe-container">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/admin" className="inline-flex rounded-full bg-porcelain px-4 py-2 text-sm font-bold text-burgundy shadow-sm ring-1 ring-burgundy/10">Tillbaka till admin</Link>
          <button onClick={loadBookings} className="inline-flex rounded-full bg-burgundy px-5 py-3 text-sm font-bold text-porcelain shadow-soft disabled:opacity-60" disabled={bookingsLoading || publicRequestsLoading}>{bookingsLoading || publicRequestsLoading ? "Uppdaterar..." : "Uppdatera"}</button>
        </div>

        <div className="mt-6 rounded-[2.2rem] bg-burgundy p-7 text-porcelain shadow-luxe md:p-9">
          <p className="text-xs font-black uppercase tracking-[.28em] text-gold">Iboren Admin</p>
          <h1 className="display mt-3 text-4xl font-bold leading-[.95] md:text-6xl">Need Action</h1>
          <p className="mt-4 max-w-2xl leading-8 text-porcelain/72">Operativ vy för vad som behöver beslut nu. Publika förfrågningar visas här innan de konverteras till bokning.</p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {[
            ["Today jobs", stats.todayJobs],
            ["New requests", stats.newRequests],
            ["Need action", stats.needAction],
            ["Unassigned jobs", stats.unassignedJobs],
            ["Time reports", stats.timeReportsWaitingApproval],
            ["Problems", stats.problems]
          ].map(([label, count]) => (
            <div key={label} className="rounded-[1.35rem] bg-porcelain p-4 shadow-sm ring-1 ring-burgundy/10">
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-ink/45">{label}</p>
              <p className="display mt-3 text-4xl font-bold text-burgundy">{count}</p>
            </div>
          ))}
        </div>

        {message && <div className="mt-5 rounded-2xl bg-red-100 p-4 text-sm font-bold text-red-800">{message}</div>}

        <div className="mt-6 rounded-[2rem] bg-porcelain p-5 shadow-soft md:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-burgundy/60">Public request queue</p>
              <h2 className="display mt-2 text-3xl font-bold text-burgundy">Publika förfrågningar som kräver beslut</h2>
            </div>
            <Link href="/admin/public-requests" className="w-fit rounded-full bg-burgundy px-4 py-2 text-sm font-black text-porcelain">Öppna public requests</Link>
          </div>

          <div className="mt-5 grid gap-3">
            {publicRequestsLoading ? <div className="rounded-2xl bg-cream p-6 text-ink/60">Laddar publika förfrågningar...</div> : publicActionRows.length === 0 ? <div className="rounded-2xl bg-cream p-6 text-ink/60">Inga publika förfrågningar kräver åtgärd just nu.</div> : publicActionRows.map((request) => (
              <article key={request.id} className="rounded-[1.5rem] border border-gold/35 bg-gold/10 p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black uppercase tracking-[.14em] text-red-800 ring-1 ring-red-200">Need review</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[.14em] ${publicStatusClass(request.status)}`}>{publicStatusLabel(request.status)}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-black text-burgundy md:text-2xl">{request.service} · {formatDate(request.preferred_date)}</h3>
                    <p className="mt-1 break-words text-sm font-bold text-ink/60">{compactPublicAddress(request)}</p>
                    <p className="mt-2 text-sm text-ink/70"><b>Kund:</b> {request.customer_name} · {request.customer_phone || "telefon saknas"}</p>
                    <p className="mt-1 text-xs font-bold text-ink/45">ID: {request.external_id}</p>
                  </div>
                  <div className="rounded-2xl bg-porcelain p-4 md:min-w-72">
                    <p className="text-[10px] font-black uppercase tracking-[.18em] text-ink/45">Next action</p>
                    <p className="mt-2 text-lg font-black text-burgundy">Granska och konvertera</p>
                    <p className="mt-3 text-xs font-bold leading-5 text-ink/55">Detta är en publik förfrågan, inte en bekräftad bokning. Hantera den i Public requests.</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] bg-porcelain p-5 shadow-soft md:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-burgundy/60">Admin decision queue</p>
              <h2 className="display mt-2 text-3xl font-bold text-burgundy">Bokningar som kräver åtgärd</h2>
            </div>
            <p className="text-sm font-bold text-ink/55">{needActionRows.length} av {bookings.length}</p>
          </div>

          <div className="mt-5 grid gap-3">
            {bookingsLoading ? <div className="rounded-2xl bg-cream p-6 text-ink/60">Laddar bokningar...</div> : needActionRows.length === 0 ? <div className="rounded-2xl bg-cream p-6 text-ink/60">Inget kräver åtgärd just nu.</div> : needActionRows.map(({ booking, workflow }) => (
              <article key={booking.id} className="rounded-[1.5rem] border border-burgundy/10 bg-cream p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[.14em] ${priorityClass(workflow.priority)}`}>{workflow.priority}</span>
                      <span className="rounded-full bg-porcelain px-3 py-1 text-xs font-black uppercase tracking-[.14em] text-burgundy ring-1 ring-burgundy/10">{workflow.operationalStatus}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-black text-burgundy md:text-2xl">{booking.service} · {formatDate(booking.preferred_date)}</h3>
                    <p className="mt-1 break-words text-sm font-bold text-ink/60">{compactAddress(booking)}</p>
                    <p className="mt-2 text-sm text-ink/70"><b>Kund:</b> {booking.customer_name} · {booking.customer_phone || "telefon saknas"}</p>
                  </div>
                  <div className="rounded-2xl bg-porcelain p-4 md:min-w-72">
                    <p className="text-[10px] font-black uppercase tracking-[.18em] text-ink/45">Next action</p>
                    <p className="mt-2 text-lg font-black text-burgundy">{workflow.nextAction}</p>
                    {workflow.reasons.length > 0 && <ul className="mt-3 grid gap-1 text-xs font-bold leading-5 text-ink/55">{workflow.reasons.slice(0, 3).map((reason) => <li key={reason}>• {reason}</li>)}</ul>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
