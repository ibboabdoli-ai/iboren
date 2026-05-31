"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient, User } from "@supabase/supabase-js";
import { ArrowLeft, CheckCircle2, Loader2, RefreshCw, Search, XCircle } from "lucide-react";

type PublicRequest = {
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

const statuses = ["all", "new", "reviewed", "rejected", "converted"];
const adminEmails = ["ibbo.abdoli@gmail.com"];

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
}

function statusLabel(status: string | null) {
  if (status === "reviewed") return "Granskad";
  if (status === "rejected") return "Avvisad";
  if (status === "converted") return "Konverterad";
  return "Ny";
}

function statusClass(status: string | null) {
  if (status === "reviewed") return "bg-blue-100 text-blue-800 ring-1 ring-blue-200";
  if (status === "rejected") return "bg-red-100 text-red-800 ring-1 ring-red-200";
  if (status === "converted") return "bg-green-100 text-green-800 ring-1 ring-green-200";
  return "bg-burgundy text-porcelain ring-1 ring-burgundy/20";
}

function searchableText(request: PublicRequest) {
  return [request.external_id, request.converted_booking_id, request.service, request.area, request.address, request.customer_name, request.customer_email, request.customer_phone, request.preferred_date, request.frequency, request.time_window, request.notes, request.admin_notes, statusLabel(request.status)].filter(Boolean).join(" ").toLowerCase();
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return value.slice(0, 10);
}

function formatCreated(value: string) {
  try {
    return new Intl.DateTimeFormat("sv-SE", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function AdminPublicRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<PublicRequest[]>([]);
  const [filter, setFilter] = useState("new");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isAdmin = Boolean(user?.email && adminEmails.includes(user.email.toLowerCase()));

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter((request) => {
      const statusOk = filter === "all" || (request.status || "new") === filter;
      const searchOk = !query || searchableText(request).includes(query);
      return statusOk && searchOk;
    });
  }, [requests, filter, search]);

  const counts = useMemo(() => statuses.map((status) => ({ status, count: status === "all" ? requests.length : requests.filter((request) => (request.status || "new") === status).length })), [requests]);

  async function getToken() {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  async function loadRequests() {
    setRequestsLoading(true);
    setMessage("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Du behöver logga in igen.");
      const response = await fetch("/api/admin/public-requests", { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Kunde inte hämta publika förfrågningar.");
      setRequests(result.requests || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Något gick fel.");
    }
    setRequestsLoading(false);
  }

  async function updateRequest(requestId: string, status: string) {
    setUpdatingId(requestId);
    setMessage("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Du behöver logga in igen.");
      const response = await fetch(`/api/admin/public-requests/${requestId}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Kunde inte uppdatera förfrågan.");
      setRequests((current) => current.map((item) => item.id === requestId ? { ...item, status } : item));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Något gick fel.");
    }
    setUpdatingId(null);
  }

  async function convertRequest(requestId: string) {
    const request = requests.find((item) => item.id === requestId);
    if ((request?.status || "new") === "rejected") {
      setMessage("Avvisade förfrågningar kan inte konverteras. Ändra status först.");
      return;
    }
    if ((request?.status || "new") === "converted" || request?.converted_booking_id) {
      setMessage("Den här förfrågan är redan konverterad.");
      return;
    }

    const confirmed = window.confirm([
      "Skapa en riktig bokning av den här publika förfrågan?",
      "",
      `${request?.customer_name || "Kund"} · ${request?.service || "Tjänst"}`,
      `${request?.preferred_date || "Datum saknas"} · ${request?.area || "Område saknas"}`,
      "",
      "Detta skapar en ny rad i bookings och markerar förfrågan som Konverterad."
    ].join("\n"));

    if (!confirmed) return;

    setUpdatingId(requestId);
    setMessage("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Du behöver logga in igen.");
      const response = await fetch(`/api/admin/public-requests/${requestId}`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Kunde inte skapa bokning.");
      setRequests((current) => current.map((item) => item.id === requestId ? { ...item, status: "converted", converted_booking_id: result.bookingId || item.converted_booking_id } : item));
      setMessage(`Bokning skapad: ${result.bookingId}. Öppna /admin för att hantera bokningen.`);
      setFilter("converted");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Något gick fel.");
    }
    setUpdatingId(null);
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
    if (user && isAdmin) void loadRequests();
  }, [user, isAdmin]);

  if (loading) return <main className="grid min-h-screen place-items-center bg-cream text-burgundy"><Loader2 className="h-8 w-8 animate-spin" /></main>;

  if (!user) {
    return <main className="min-h-screen bg-cream py-16 text-ink"><section className="luxe-container max-w-2xl rounded-[2rem] bg-porcelain p-8 shadow-soft"><Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Tillbaka</Link><h1 className="display text-5xl font-bold text-burgundy">Public requests</h1><p className="mt-4 leading-8 text-ink/70">Du behöver logga in som admin.</p><Link href="/login" className="btn-primary mt-7">Logga in</Link></section></main>;
  }

  if (!isAdmin) {
    return <main className="min-h-screen bg-cream py-16 text-ink"><section className="luxe-container max-w-2xl rounded-[2rem] bg-porcelain p-8 shadow-soft"><Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Tillbaka</Link><h1 className="display text-5xl font-bold text-burgundy">Ingen adminåtkomst</h1><p className="mt-4 leading-8 text-ink/70">Inloggad som {user.email}. Den här sidan är bara för admin.</p></section></main>;
  }

  return (
    <main className="min-h-screen bg-cream py-12 text-ink md:py-16">
      <section className="luxe-container">
        <Link href="/admin" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Tillbaka till admin</Link>
        <div className="rounded-[2.5rem] bg-burgundy p-7 text-porcelain shadow-luxe md:p-9">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.32em] text-gold">Iboren Admin</p>
              <h1 className="display mt-3 text-5xl font-bold leading-[.9] md:text-7xl">Public requests</h1>
              <p className="mt-5 max-w-2xl leading-8 text-porcelain/70">Förfrågningar utan konto. De är inte bekräftade bokningar förrän du manuellt bekräftar dem.</p>
            </div>
            <button onClick={loadRequests} className="inline-flex items-center justify-center gap-2 rounded-full bg-porcelain px-5 py-3 text-sm font-bold text-burgundy">
              {requestsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Uppdatera
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {counts.map(({ status, count }) => (
            <button key={status} onClick={() => setFilter(status)} className={`rounded-[1.4rem] border p-4 text-left transition hover:-translate-y-0.5 ${filter === status ? "border-burgundy bg-burgundy text-porcelain shadow-soft" : "border-burgundy/10 bg-porcelain text-ink shadow-sm"}`}>
              <p className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[.18em] ${filter === status ? "bg-gold text-ink" : statusClass(status)}`}>{status === "all" ? "Alla" : statusLabel(status)}</p>
              <p className="display mt-5 text-4xl font-bold">{count}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-[2rem] bg-porcelain p-5 shadow-soft md:p-7">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-burgundy/55" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-2xl border border-burgundy/10 bg-cream py-3 pl-11 pr-4 text-sm font-semibold text-ink outline-none focus:border-burgundy/40" placeholder="Sök namn, email, telefon, adress, stad, tjänst..." />
          </label>

          {message && <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-burgundy/10 p-4 text-sm font-bold text-burgundy sm:flex-row sm:items-center sm:justify-between"><span>{message}</span>{message.includes("/admin") && <Link href="/admin" className="rounded-full bg-burgundy px-4 py-2 text-center text-xs uppercase tracking-[.16em] text-porcelain">Open admin</Link>}</div>}

          <div className="mt-6 grid gap-4">
            {requestsLoading ? <div className="grid min-h-40 place-items-center text-burgundy"><Loader2 className="h-7 w-7 animate-spin" /></div> : filteredRequests.length === 0 ? <div className="rounded-[2rem] border border-dashed border-burgundy/20 bg-cream p-6 text-ink/65">Inga publika förfrågningar matchar filter/sökning.</div> : filteredRequests.map((request) => {
              const currentStatus = request.status || "new";
              const isUpdating = updatingId === request.id;
              return (
                <article key={request.id} className="rounded-[2rem] border border-burgundy/10 bg-cream p-5 shadow-sm">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[.18em] ${statusClass(currentStatus)}`}>{statusLabel(currentStatus)}</span>
                        <span className="rounded-full bg-porcelain px-3 py-1 text-xs font-bold text-ink/60">{request.language || "sv"}</span>
                        <span className="rounded-full bg-porcelain px-3 py-1 text-xs font-bold text-ink/60">{formatCreated(request.created_at)}</span>
                      </div>
                      <h2 className="display mt-4 text-3xl font-bold text-burgundy">{request.service} · {request.area}</h2>
                      <p className="mt-2 text-sm font-bold text-ink/60">{request.external_id}</p>
                      {request.converted_booking_id && <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-green-100 px-4 py-3 text-sm font-bold text-green-800 sm:flex-row sm:items-center sm:justify-between"><span>Booking ID: {request.converted_booking_id}</span><Link href="/admin" className="rounded-full bg-green-700 px-4 py-2 text-center text-xs uppercase tracking-[.16em] text-white">Open booking dashboard</Link></div>}
                      <div className="mt-4 grid gap-2 text-sm leading-6 text-ink/75 sm:grid-cols-2 lg:grid-cols-3">
                        <p><b>Kund:</b> {request.customer_name}</p>
                        <p><b>E-post:</b> {request.customer_email}</p>
                        <p><b>Telefon:</b> {request.customer_phone || "-"}</p>
                        <p><b>Adress:</b> {request.address || "-"}</p>
                        <p><b>Storlek:</b> {request.size_sqm ?? "-"} kvm</p>
                        <p><b>Datum:</b> {formatDate(request.preferred_date)}</p>
                        <p><b>Tid:</b> {request.time_window || "-"}</p>
                        <p><b>Frekvens:</b> {request.frequency || "-"}</p>
                        <p><b>RUT:</b> {request.rut_requested ? "Ja" : "Nej"}</p>
                      </div>
                      {request.notes && <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl border border-burgundy/10 bg-porcelain p-4 text-xs leading-6 text-ink/70">{request.notes}</pre>}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 xl:min-w-56 xl:grid-cols-1">
                      <button disabled={isUpdating || currentStatus === "reviewed" || currentStatus === "converted"} onClick={() => updateRequest(request.id, "reviewed")} className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-100 px-4 py-3 text-sm font-bold text-blue-800 disabled:cursor-not-allowed disabled:opacity-50"><CheckCircle2 size={16} /> Mark reviewed</button>
                      <button disabled={isUpdating || currentStatus === "rejected" || currentStatus === "converted"} onClick={() => updateRequest(request.id, "rejected")} className="inline-flex items-center justify-center gap-2 rounded-full bg-red-100 px-4 py-3 text-sm font-bold text-red-800 disabled:cursor-not-allowed disabled:opacity-50"><XCircle size={16} /> Reject</button>
                      <button disabled={isUpdating || currentStatus === "converted" || currentStatus === "rejected"} onClick={() => convertRequest(request.id)} className="inline-flex items-center justify-center gap-2 rounded-full bg-green-100 px-4 py-3 text-sm font-bold text-green-800 disabled:cursor-not-allowed disabled:opacity-50"><CheckCircle2 size={16} /> Convert to booking</button>
                      {currentStatus === "rejected" && <p className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-bold leading-5 text-red-800">Avvisad: ändra status innan konvertering.</p>}
                      {currentStatus === "converted" && <p className="rounded-2xl bg-green-50 px-3 py-2 text-xs font-bold leading-5 text-green-800">Redan konverterad. Ingen ny bokning skapas.</p>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
