"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient, User } from "@supabase/supabase-js";
import { ArrowLeft, CheckCircle2, LayoutDashboard, Loader2, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
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
  if (status === "cancelled") return "bg-red-100 text-red-800";
  if (status === "confirmed") return "bg-green-100 text-green-800";
  if (status === "completed") return "bg-ink text-porcelain";
  return "bg-burgundy text-porcelain";
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isAdmin = Boolean(user?.email && adminEmails.includes(user.email.toLowerCase()));

  const filteredBookings = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((booking) => (booking.status || "new") === filter);
  }, [bookings, filter]);

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
      setBookings(result.bookings || []);
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
            </div>
            <button onClick={loadBookings} className="inline-flex items-center justify-center gap-2 rounded-full bg-porcelain px-5 py-3 text-sm font-bold text-burgundy">
              {bookingsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Uppdatera
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] bg-porcelain p-5 shadow-soft md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button key={status} onClick={() => setFilter(status)} className={`rounded-full px-4 py-2 text-sm font-bold ${filter === status ? "bg-burgundy text-porcelain" : "bg-cream text-ink/65"}`}>
                  {status === "all" ? "Alla" : statusLabel(status)}
                </button>
              ))}
            </div>
            <p className="text-sm font-bold text-ink/55">{filteredBookings.length} bokningar</p>
          </div>

          {message && <p className="mt-5 rounded-2xl bg-burgundy/10 p-4 text-sm text-burgundy">{message}</p>}

          <div className="mt-6 grid gap-4">
            {bookingsLoading ? (
              <div className="grid min-h-40 place-items-center text-burgundy"><Loader2 className="h-7 w-7 animate-spin" /></div>
            ) : filteredBookings.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-burgundy/20 bg-cream p-6 text-ink/65">Inga bokningar i detta filter.</div>
            ) : (
              filteredBookings.map((booking) => {
                const currentStatus = booking.status || "new";
                const isUpdating = updatingId === booking.id;

                return (
                  <article key={booking.id} className="rounded-[2rem] border border-burgundy/10 bg-cream p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <p className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[.18em] ${statusPillClass(currentStatus)}`}><ShieldCheck className="h-3.5 w-3.5" /> {statusLabel(currentStatus)}</p>
                        <h2 className="display mt-3 text-3xl font-bold text-burgundy">{booking.service}</h2>
                        <p className="mt-2 leading-7 text-ink/70">{booking.area}{booking.address ? ` · ${booking.address}` : ""}</p>
                      </div>
                      <select value={currentStatus} onChange={(event) => updateStatus(booking.id, event.target.value)} disabled={isUpdating} className="rounded-2xl border border-burgundy/10 bg-porcelain px-4 py-3 text-sm font-bold text-ink outline-none">
                        <option value="new">Ny</option>
                        <option value="confirmed">Bekräftad</option>
                        <option value="completed">Klar</option>
                        <option value="cancelled">Avbokad</option>
                      </select>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button disabled={isUpdating || currentStatus === "confirmed"} onClick={() => updateStatus(booking.id, "confirmed")} className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-800 disabled:opacity-40"><CheckCircle2 className="h-4 w-4" /> Bekräfta</button>
                      <button disabled={isUpdating || currentStatus === "completed"} onClick={() => updateStatus(booking.id, "completed")} className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-porcelain disabled:opacity-40"><CheckCircle2 className="h-4 w-4" /> Klar</button>
                      <button disabled={isUpdating || currentStatus === "cancelled"} onClick={() => updateStatus(booking.id, "cancelled")} className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-800 disabled:opacity-40"><XCircle className="h-4 w-4" /> Avboka</button>
                      {isUpdating && <span className="inline-flex items-center gap-2 rounded-full bg-porcelain px-4 py-2 text-sm font-bold text-burgundy"><Loader2 className="h-4 w-4 animate-spin" /> Uppdaterar</span>}
                    </div>

                    <div className="mt-5 grid gap-3 text-sm text-ink/65 md:grid-cols-2 xl:grid-cols-4">
                      <p><strong>Kund:</strong> {booking.customer_name}</p>
                      <p><strong>E-post:</strong> {booking.customer_email}</p>
                      <p><strong>Telefon:</strong> {booking.customer_phone || "—"}</p>
                      <p><strong>Datum:</strong> {booking.preferred_date || "—"}</p>
                      <p><strong>Storlek:</strong> {booking.size_sqm ? `${booking.size_sqm} kvm` : "—"}</p>
                      <p><strong>Frekvens:</strong> {booking.frequency || "—"}</p>
                      <p><strong>Tid:</strong> {booking.time_window || "—"}</p>
                      <p><strong>Skapad:</strong> {new Date(booking.created_at).toLocaleDateString("sv-SE")}</p>
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
