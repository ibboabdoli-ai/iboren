"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient, User } from "@supabase/supabase-js";
import { ArrowDownUp, ArrowLeft, CheckCircle2, LayoutDashboard, Loader2, RefreshCw, Search, ShieldCheck, XCircle } from "lucide-react";
import AdminCsvExport from "./AdminCsvExport";
import AdminNoteBox from "./AdminNoteBox";

type AdminBooking = {
  id: string;
  user_id: string | null;
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
  notes: string | null;
  admin_notes: string | null;
  status: string | null;
  created_at: string;
};

const statuses = ["all", "new", "confirmed", "completed", "cancelled"];
const adminEmails = ["ibbo.abdoli@gmail.com"];

type SortMode = "newest" | "oldest" | "booking_date" | "customer";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  });
}

function statusLabel(status: string | null) {
  if (status === "cancelled") return "Avbokad";
  if (status === "confirmed") return "Bekräftad";
  if (status === "completed") return "Klar";
  return "Ny";
}

function statusPillClass(status: string | null) {
  if (status === "cancelled") return "bg-red-100 text-red-800 ring-1 ring-red-200";
  if (status === "confirmed") return "bg-green-100 text-green-800 ring-1 ring-green-200";
  if (status === "completed") return "bg-ink text-porcelain ring-1 ring-ink/20";
  return "bg-burgundy text-porcelain ring-1 ring-burgundy/20";
}

function statusCardClass(status: string | null) {
  if (status === "cancelled") return "border-red-200 bg-red-50/70 opacity-80";
  if (status === "confirmed") return "border-green-200 bg-green-50/70";
  if (status === "completed") return "border-ink/15 bg-porcelain";
  return "border-burgundy/20 bg-cream";
}

function statusAccentClass(status: string | null) {
  if (status === "cancelled") return "bg-red-500";
  if (status === "confirmed") return "bg-green-500";
  if (status === "completed") return "bg-ink";
  return "bg-burgundy";
}

function statusCount(bookings: AdminBooking[], status: string) {
  if (status === "all") return bookings.length;
  return bookings.filter((booking) => (booking.status || "new") === status).length;
}

function searchableText(booking: AdminBooking) {
  return [
    booking.service,
    booking.area,
    booking.address,
    booking.customer_name,
    booking.customer_email,
    booking.customer_phone,
    booking.preferred_date,
    booking.frequency,
    booking.time_window,
    booking.notes,
    booking.admin_notes,
    statusLabel(booking.status)
  ].filter(Boolean).join(" ").toLowerCase();
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [rawCount, setRawCount] = useState<number | null>(null);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isAdmin = Boolean(user?.email && adminEmails.includes(user.email.toLowerCase()));

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = bookings.filter((booking) => {
      const statusOk = filter === "all" || (booking.status || "new") === filter;
      const searchOk = !query || searchableText(booking).includes(query);
      return statusOk && searchOk;
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortMode === "booking_date") return String(a.preferred_date || "9999-12-31").localeCompare(String(b.preferred_date || "9999-12-31"));
      if (sortMode === "customer") return a.customer_name.localeCompare(b.customer_name, "sv");
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [bookings, filter, search, sortMode]);

  const quickStats = useMemo(() => statuses.map((status) => ({ status, count: statusCount(bookings, status) })), [bookings]);

  async function getToken() {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  async function loadBookings() {
    setBookingsLoading(true);
    setMessage("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Du behöver logga in igen.");
      const response = await fetch("/api/admin/bookings", { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Kunde inte hämta bokningar.");
      const nextBookings = result.bookings || [];
      setBookings(nextBookings);
      setRawCount(typeof result.rawCount === "number" ? result.rawCount : nextBookings.length);
      setDuplicateCount(typeof result.duplicateCount === "number" ? result.duplicateCount : 0);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Något gick fel.");
    }
    setBookingsLoading(false);
  }

  async function updateStatus(bookingId: string, status: string) {
    setUpdatingId(bookingId);
    setMessage("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Du behöver logga in igen.");
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Kunde inte uppdatera status.");
      setBookings((current) => current.map((booking) => booking.id === bookingId ? { ...booking, status } : booking));
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

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (user && isAdmin) void loadBookings();
  }, [user, isAdmin]);

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-cream text-burgundy"><Loader2 className="h-8 w-8 animate-spin" /></main>;
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-cream py-16 text-ink">
        <section className="luxe-container max-w-2xl rounded-[2rem] bg-porcelain p-8 shadow-soft">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Tillbaka</Link>
          <h1 className="display text-5xl font-bold text-burgundy">Admin</h1>
          <p className="mt-4 leading-8 text-ink/70">Du behöver logga in som admin för att se den här sidan.</p>
          <Link href="/login" className="btn-primary mt-7">Logga in</Link>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-cream py-16 text-ink">
        <section className="luxe-container max-w-2xl rounded-[2rem] bg-porcelain p-8 shadow-soft">
          <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Tillbaka</Link>
          <h1 className="display text-5xl font-bold text-burgundy">Ingen adminåtkomst</h1>
          <p className="mt-4 leading-8 text-ink/70">Inloggad som {user.email}. Den här sidan är bara för admin.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream py-12 text-ink md:py-16">
      <section className="luxe-container">
        <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Tillbaka till profil</Link>
        <div className="rounded-[2.5rem] bg-burgundy p-7 text-porcelain shadow-luxe md:p-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-gold text-ink"><LayoutDashboard size={25} /></div>
              <p className="text-xs font-bold uppercase tracking-[.32em] text-gold">Iboren Admin</p>
              <h1 className="display mt-3 text-5xl font-bold leading-[.9] md:text-7xl">Booking dashboard</h1>
              <p className="mt-5 max-w-2xl leading-8 text-porcelain/70">Hantera inkommande bokningar, följ status och uppdatera orderflödet.</p>
              {rawCount !== null && (
                <div className="mt-5 grid gap-2 text-sm font-bold text-porcelain/75 sm:grid-cols-3">
                  <p className="rounded-2xl border border-gold/15 bg-night/20 px-4 py-3">Visade: {bookings.length}</p>
                  <p className="rounded-2xl border border-gold/15 bg-night/20 px-4 py-3">Databas: {rawCount}</p>
                  <p className="rounded-2xl border border-gold/15 bg-night/20 px-4 py-3">Dolda dubletter: {duplicateCount}</p>
                </div>
              )}
              {duplicateCount > 0 && <p className="mt-3 max-w-2xl text-sm leading-6 text-gold/85">Dubletter döljs automatiskt i adminlistan och exporten. Databasen är inte raderad.</p>}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <AdminCsvExport bookings={filteredBookings} />
              <button onClick={loadBookings} className="inline-flex items-center justify-center gap-2 rounded-full bg-porcelain px-5 py-3 text-sm font-bold text-burgundy">
                {bookingsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Uppdatera
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {quickStats.map(({ status, count }) => (
            <button key={status} onClick={() => setFilter(status)} className={`rounded-[1.4rem] border p-4 text-left transition hover:-translate-y-0.5 ${filter === status ? "border-burgundy bg-burgundy text-porcelain shadow-soft" : "border-burgundy/10 bg-porcelain text-ink shadow-sm"}`}>
              <p className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[.18em] ${filter === status ? "bg-gold text-ink" : statusPillClass(status)}`}>{status === "all" ? "Alla" : statusLabel(status)}</p>
              <p className="display mt-5 text-4xl font-bold">{count}</p>
              <p className={`mt-1 text-xs font-bold uppercase tracking-[.18em] ${filter === status ? "text-porcelain/65" : "text-ink/45"}`}>bokningar</p>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-[2rem] bg-porcelain p-5 shadow-soft md:p-7">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button key={status} onClick={() => setFilter(status)} className={`rounded-full px-4 py-2 text-sm font-bold ${filter === status ? "bg-burgundy text-porcelain" : "bg-cream text-ink/65"}`}>
                    {status === "all" ? "Alla" : statusLabel(status)}
                  </button>
                ))}
              </div>
              <p className="text-sm font-bold text-ink/55">{filteredBookings.length} av {bookings.length} bokningar</p>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-burgundy/55" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-2xl border border-burgundy/10 bg-cream py-3 pl-11 pr-4 text-sm font-semibold text-ink outline-none focus:border-burgundy/40"
                  placeholder="Sök namn, email, telefon, adress, stad, tjänst..."
                />
              </label>
              <label className="relative block">
                <ArrowDownUp className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-burgundy/55" />
                <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} className="w-full rounded-2xl border border-burgundy/10 bg-cream py-3 pl-11 pr-4 text-sm font-bold text-ink outline-none focus:border-burgundy/40">
                  <option value="newest">Sortera: nyast först</option>
                  <option value="oldest">Sortera: äldst först</option>
                  <option value="booking_date">Sortera: bokningsdatum</option>
                  <option value="customer">Sortera: kundnamn</option>
                </select>
              </label>
            </div>
          </div>

          {message && <p className="mt-5 rounded-2xl bg-burgundy/10 p-4 text-sm text-burgundy">{message}</p>}

          <div className="mt-6 grid gap-4">
            {bookingsLoading ? (
              <div className="grid min-h-40 place-items-center text-burgundy"><Loader2 className="h-7 w-7 animate-spin" /></div>
            ) : filteredBookings.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-burgundy/20 bg-cream p-6 text-ink/65">Inga bokningar matchar filter/sökning.</div>
            ) : (
              filteredBookings.map((booking) => {
                const currentStatus = booking.status || "new";
                const isUpdating = updatingId === booking.id;

                return (
                  <article key={booking.id} className={`relative overflow-hidden rounded-[2rem] border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft ${statusCardClass(currentStatus)}`}>
                    <span className={`absolute inset-y-0 left-0 w-1.5 ${statusAccentClass(currentStatus)}`} />
                    <div className="flex flex-col gap-4 pl-1 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <p className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[.18em] ${statusPillClass(currentStatus)}`}><ShieldCheck className="h-3.5 w-3.5" /> {statusLabel(currentStatus)}</p>
                        <h2 className="display mt-3 break-words text-3xl font-bold text-burgundy">{booking.service}</h2>
                        <p className="mt-2 break-words leading-7 text-ink/70">{booking.area}{booking.address ? ` · ${booking.address}` : ""}</p>
                      </div>
                      <select value={currentStatus} onChange={(event) => updateStatus(booking.id, event.target.value)} disabled={isUpdating} className="w-full rounded-2xl border border-burgundy/10 bg-porcelain px-4 py-3 text-sm font-bold text-ink outline-none disabled:opacity-50 sm:w-auto">
                        <option value="new">Ny</option>
                        <option value="confirmed">Bekräftad</option>
                        <option value="completed">Klar</option>
                        <option value="cancelled">Avbokad</option>
                      </select>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2 pl-1">
                      <button disabled={isUpdating || currentStatus === "confirmed"} onClick={() => updateStatus(booking.id, "confirmed")} className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-800 ring-1 ring-green-200 disabled:opacity-40"><CheckCircle2 className="h-4 w-4" /> Bekräfta</button>
                      <button disabled={isUpdating || currentStatus === "completed"} onClick={() => updateStatus(booking.id, "completed")} className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-porcelain ring-1 ring-ink/15 disabled:opacity-40"><CheckCircle2 className="h-4 w-4" /> Klar</button>
                      <button disabled={isUpdating || currentStatus === "cancelled"} onClick={() => updateStatus(booking.id, "cancelled")} className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-800 ring-1 ring-red-200 disabled:opacity-40"><XCircle className="h-4 w-4" /> Avboka</button>
                      {isUpdating && <span className="inline-flex items-center gap-2 rounded-full bg-porcelain px-4 py-2 text-sm font-bold text-burgundy"><Loader2 className="h-4 w-4 animate-spin" /> Uppdaterar</span>}
                    </div>

                    <div className="mt-5 grid gap-3 rounded-[1.5rem] bg-porcelain/70 p-4 text-sm text-ink/68 md:grid-cols-2 xl:grid-cols-4">
                      <p><strong className="text-ink">Kund:</strong> {booking.customer_name}</p>
                      <p className="break-words"><strong className="text-ink">E-post:</strong> {booking.customer_email}</p>
                      <p><strong className="text-ink">Telefon:</strong> {booking.customer_phone || "—"}</p>
                      <p><strong className="text-ink">Datum:</strong> {booking.preferred_date || "—"}</p>
                      <p><strong className="text-ink">Storlek:</strong> {booking.size_sqm ? `${booking.size_sqm} kvm` : "—"}</p>
                      <p><strong className="text-ink">Frekvens:</strong> {booking.frequency || "—"}</p>
                      <p><strong className="text-ink">Tid:</strong> {booking.time_window || "—"}</p>
                      <p><strong className="text-ink">Skapad:</strong> {new Date(booking.created_at).toLocaleDateString("sv-SE")}</p>
                    </div>

                    {booking.notes && <p className="mt-4 rounded-2xl bg-porcelain p-4 text-sm leading-7 text-ink/65"><strong>Kundens önskemål:</strong><br />{booking.notes}</p>}
                    <AdminNoteBox bookingId={booking.id} initialNote={booking.admin_notes || ""} />
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
