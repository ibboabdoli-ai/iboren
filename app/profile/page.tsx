"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient, Session, User } from "@supabase/supabase-js";
import { ArrowLeft, CalendarCheck2, Loader2, LogOut, ShieldCheck, UserRound } from "lucide-react";

type Booking = {
  id: string;
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
  status: string | null;
  created_at: string;
};

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

export default function ProfilePage() {
  const hasLoaded = useRef(false);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState("");

  async function loadBookings(currentUser: User) {
    const supabase = getSupabase();
    if (!supabase) return;
    setBookingsLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("id, service, area, address, size_sqm, frequency, preferred_date, time_window, customer_name, customer_email, customer_phone, notes, status, created_at")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`Kunde inte hämta bokningar: ${error.message}`);
    } else {
      setMessage("");
      setBookings((data ?? []) as Booking[]);
    }
    setBookingsLoading(false);
  }

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    let cancelled = false;

    async function initProfile() {
      const supabase = getSupabase();
      if (!supabase) {
        if (!cancelled) {
          setMessage("Supabase environment variables saknas i Vercel.");
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      setSession(data.session);
      setUser(data.session?.user ?? null);

      if (data.session?.user) {
        await loadBookings(data.session.user);
      }

      if (!cancelled) setLoading(false);
    }

    void initProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  async function signOut() {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-cream text-burgundy"><Loader2 className="h-8 w-8 animate-spin" /></main>;
  }

  if (!session || !user) {
    return (
      <main className="min-h-screen bg-cream py-16 text-ink">
        <section className="luxe-container max-w-2xl rounded-[2rem] bg-porcelain p-8 shadow-luxe md:p-10">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Tillbaka</Link>
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-burgundy text-porcelain"><UserRound size={24} /></div>
          <h1 className="display text-5xl font-bold text-burgundy">Profil</h1>
          <p className="mt-4 leading-8 text-ink/70">Du behöver logga in för att se din profil och dina framtida bokningar.</p>
          {message && <p className="mt-4 rounded-2xl bg-burgundy/10 p-4 text-sm text-burgundy">{message}</p>}
          <Link href="/login" className="btn-primary mt-7">Logga in</Link>
        </section>
      </main>
    );
  }

  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "Iboren customer";
  const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const provider = user.app_metadata?.provider || "oauth";

  return (
    <main className="min-h-screen bg-cream py-16 text-ink">
      <section className="luxe-container">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Tillbaka</Link>
        <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="rounded-[2.5rem] bg-burgundy p-8 text-porcelain shadow-luxe">
            <div className="mb-8 flex items-center gap-4">
              {avatar ? <img src={avatar} alt="Profilbild" className="h-16 w-16 rounded-full object-cover" /> : <div className="grid h-16 w-16 place-items-center rounded-full bg-gold text-ink"><UserRound size={30} /></div>}
              <div>
                <p className="text-xs font-bold uppercase tracking-[.28em] text-gold">Logged in</p>
                <h1 className="display mt-1 text-4xl font-bold">{fullName}</h1>
              </div>
            </div>
            <div className="space-y-3 text-sm text-porcelain/74">
              <p><strong className="text-gold">Email:</strong> {user.email}</p>
              <p><strong className="text-gold">Provider:</strong> {provider}</p>
              <p><strong className="text-gold">User ID:</strong> {user.id}</p>
            </div>
            <button onClick={signOut} className="mt-8 inline-flex items-center gap-2 rounded-full bg-porcelain px-5 py-3 text-sm font-bold text-burgundy"><LogOut size={17} /> Logga ut</button>
          </aside>
          <div className="grid gap-5">
            <article className="rounded-[2.5rem] bg-porcelain p-8 shadow-soft">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-burgundy text-porcelain"><CalendarCheck2 size={25} /></div>
                  <h2 className="display text-4xl font-bold text-burgundy">Mina bokningar</h2>
                  <p className="mt-3 leading-8 text-ink/65">Här visas bokningsförfrågningar som sparats på ditt konto.</p>
                </div>
                <Link href="/#booking" className="btn-secondary">Ny bokning</Link>
              </div>

              {message && <p className="mb-5 rounded-2xl bg-burgundy/10 p-4 text-sm text-burgundy">{message}</p>}

              {bookingsLoading ? (
                <div className="grid min-h-32 place-items-center text-burgundy"><Loader2 className="h-7 w-7 animate-spin" /></div>
              ) : bookings.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-burgundy/20 bg-cream p-6 text-ink/65">
                  <p>Du har inga sparade bokningar ännu.</p>
                  <Link href="/#booking" className="mt-4 inline-flex font-bold text-burgundy">Skapa första bokningen →</Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {bookings.map((booking) => (
                    <article key={booking.id} className="rounded-[2rem] border border-burgundy/10 bg-cream p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[.24em] text-burgundy/60">{booking.status || "new"}</p>
                          <h3 className="display mt-1 text-3xl font-bold text-burgundy">{booking.service}</h3>
                          <p className="mt-2 leading-7 text-ink/70">{booking.area}{booking.address ? ` · ${booking.address}` : ""}</p>
                        </div>
                        <span className="rounded-full bg-burgundy px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-porcelain">{booking.preferred_date || "Datum saknas"}</span>
                      </div>
                      <div className="mt-5 grid gap-3 text-sm text-ink/62 md:grid-cols-3">
                        <p><strong>Storlek:</strong> {booking.size_sqm ? `${booking.size_sqm} kvm` : "—"}</p>
                        <p><strong>Frekvens:</strong> {booking.frequency || "—"}</p>
                        <p><strong>Tid:</strong> {booking.time_window || "—"}</p>
                      </div>
                      {booking.notes && <p className="mt-4 rounded-2xl bg-porcelain p-4 text-sm leading-7 text-ink/62">{booking.notes}</p>}
                    </article>
                  ))}
                </div>
              )}
            </article>
            <article className="rounded-[2.5rem] bg-porcelain p-8 shadow-soft">
              <div className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-gold text-ink"><ShieldCheck size={25} /></div>
              <h2 className="display text-4xl font-bold text-burgundy">Profiluppgifter</h2>
              <p className="mt-4 leading-8 text-ink/65">Nästa steg blir att låta kunden spara standardadress, telefonnummer och preferenser.</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
