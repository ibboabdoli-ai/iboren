"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createClient, Session, User } from "@supabase/supabase-js";
import { ArrowLeft, CalendarCheck2, Loader2, LogOut, Save, ShieldCheck, UserRound, XCircle } from "lucide-react";

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

type ProfileForm = {
  full_name: string;
  phone: string;
  default_area: string;
  default_address: string;
};

const emptyProfile: ProfileForm = {
  full_name: "",
  phone: "",
  default_area: "",
  default_address: ""
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
}

function metadataName(currentUser: User) {
  return currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || "";
}

function statusLabel(status: string | null) {
  if (status === "cancelled") return "Avbokad";
  if (status === "confirmed") return "Bekräftad";
  if (status === "completed") return "Klar";
  return "Ny";
}

function statusClass(status: string | null) {
  if (status === "cancelled") return "bg-red-100 text-red-800 border-red-200";
  if (status === "confirmed") return "bg-green-100 text-green-800 border-green-200";
  if (status === "completed") return "bg-ink text-porcelain border-ink";
  return "bg-burgundy text-porcelain border-burgundy";
}

export default function ProfilePage() {
  const hasLoaded = useRef(false);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [message, setMessage] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [showCancelled, setShowCancelled] = useState(false);

  const visibleBookings = useMemo(() => showCancelled ? bookings : bookings.filter((booking) => booking.status !== "cancelled"), [bookings, showCancelled]);
  const cancelledCount = useMemo(() => bookings.filter((booking) => booking.status === "cancelled").length, [bookings]);
  const activeCount = bookings.length - cancelledCount;

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

  async function loadProfile(currentUser: User) {
    const supabase = getSupabase();
    if (!supabase) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, phone, default_area, default_address")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (error) {
      setProfileMessage(`Kunde inte hämta profiluppgifter: ${error.message}`);
      setProfile({
        full_name: metadataName(currentUser),
        phone: "",
        default_area: "",
        default_address: ""
      });
      return;
    }

    setProfile({
      full_name: data?.full_name || metadataName(currentUser),
      phone: data?.phone || "",
      default_area: data?.default_area || "",
      default_address: data?.default_address || ""
    });
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
        await Promise.all([loadBookings(data.session.user), loadProfile(data.session.user)]);
      }

      if (!cancelled) setLoading(false);
    }

    void initProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    setProfileSaving(true);
    setProfileMessage("");

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: profile.full_name.trim() || metadataName(user),
      email: user.email,
      phone: profile.phone.trim() || null,
      default_area: profile.default_area.trim() || null,
      default_address: profile.default_address.trim() || null,
      updated_at: new Date().toISOString()
    });

    if (error) {
      setProfileMessage(`Kunde inte spara profilen: ${error.message}`);
    } else {
      setProfileMessage("Profiluppgifter sparade.");
    }

    setProfileSaving(false);
  }

  async function cancelBooking(bookingId: string) {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    setCancelingId(bookingId);
    setMessage("");

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      setMessage("Du behöver logga in igen för att avboka.");
      setCancelingId(null);
      return;
    }

    const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json().catch(() => null) as { ok?: boolean; message?: string } | null;

    if (!response.ok || !result?.ok) {
      setMessage(`Kunde inte avboka bokningen: ${result?.message || "Okänt fel"}`);
    } else {
      setBookings((current) => current.map((booking) => booking.id === bookingId ? { ...booking, status: "cancelled" } : booking));
      setMessage("Bokningen är markerad som avbokad.");
    }

    setCancelingId(null);
  }

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

  const fullName = profile.full_name || metadataName(user) || "Iboren customer";
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
            <div className="space-y-3 break-words text-sm text-porcelain/74">
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
                  <p className="mt-3 leading-8 text-ink/65">Här visas aktiva bokningsförfrågningar. Avbokade bokningar är dolda som standard.</p>
                  <p className="mt-2 text-sm font-bold text-ink/45">Aktiva: {activeCount} · Avbokade: {cancelledCount}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  {cancelledCount > 0 && (
                    <button type="button" onClick={() => setShowCancelled((current) => !current)} className="rounded-full border border-burgundy/15 bg-cream px-5 py-3 text-sm font-bold text-burgundy">
                      {showCancelled ? "Dölj avbokade" : "Visa avbokade"}
                    </button>
                  )}
                  <Link href="/booking" className="btn-secondary">Ny bokning</Link>
                </div>
              </div>

              {message && <p className="mb-5 rounded-2xl bg-burgundy/10 p-4 text-sm text-burgundy">{message}</p>}

              {bookingsLoading ? (
                <div className="grid min-h-32 place-items-center text-burgundy"><Loader2 className="h-7 w-7 animate-spin" /></div>
              ) : bookings.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-burgundy/20 bg-cream p-6 text-ink/65">
                  <p>Du har inga sparade bokningar ännu.</p>
                  <Link href="/booking" className="mt-4 inline-flex font-bold text-burgundy">Skapa första bokningen →</Link>
                </div>
              ) : visibleBookings.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-burgundy/20 bg-cream p-6 text-ink/65">
                  <p>Du har inga aktiva bokningar just nu.</p>
                  {cancelledCount > 0 && <button type="button" onClick={() => setShowCancelled(true)} className="mt-4 font-bold text-burgundy">Visa avbokade bokningar →</button>}
                </div>
              ) : (
                <div className="grid gap-4">
                  {visibleBookings.map((booking) => {
                    const isCancelled = booking.status === "cancelled";
                    return (
                      <article key={booking.id} className={`rounded-[2rem] border p-5 ${isCancelled ? "border-red-200 bg-red-50/60 opacity-75" : "border-burgundy/10 bg-cream"}`}>
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <p className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[.18em] ${statusClass(booking.status)}`}>{statusLabel(booking.status)}</p>
                            <h3 className="display mt-3 break-words text-3xl font-bold text-burgundy">{booking.service}</h3>
                            <p className="mt-2 break-words leading-7 text-ink/70">{booking.area}{booking.address ? ` · ${booking.address}` : ""}</p>
                          </div>
                          <span className="w-fit rounded-full bg-burgundy px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-porcelain">{booking.preferred_date || "Datum saknas"}</span>
                        </div>
                        <div className="mt-5 grid gap-3 text-sm text-ink/62 md:grid-cols-3">
                          <p><strong>Storlek:</strong> {booking.size_sqm ? `${booking.size_sqm} kvm` : "—"}</p>
                          <p><strong>Frekvens:</strong> {booking.frequency || "—"}</p>
                          <p><strong>Tid:</strong> {booking.time_window || "—"}</p>
                        </div>
                        {booking.notes && <pre className="mt-4 whitespace-pre-wrap break-words rounded-2xl bg-porcelain p-4 font-sans text-sm leading-7 text-ink/68">{booking.notes}</pre>}
                        {!isCancelled && (
                          <button onClick={() => cancelBooking(booking.id)} disabled={cancelingId === booking.id} className="mt-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60">
                            {cancelingId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                            Avboka
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </article>

            <article className="rounded-[2.5rem] bg-porcelain p-8 shadow-soft">
              <div className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-gold text-ink"><ShieldCheck size={25} /></div>
              <h2 className="display text-4xl font-bold text-burgundy">Profiluppgifter</h2>
              <p className="mt-4 leading-8 text-ink/65">Spara standarduppgifter som kan användas i framtida bokningar.</p>

              <form onSubmit={saveProfile} className="mt-7 grid gap-4">
                <ProfileField label="Namn" value={profile.full_name} onChange={(value) => setProfile((current) => ({ ...current, full_name: value }))} placeholder="För- och efternamn" />
                <ProfileField label="Telefon" value={profile.phone} onChange={(value) => setProfile((current) => ({ ...current, phone: value }))} placeholder="+46 ..." />
                <div className="grid gap-4 md:grid-cols-2">
                  <ProfileField label="Standardområde" value={profile.default_area} onChange={(value) => setProfile((current) => ({ ...current, default_area: value }))} placeholder="Södertälje, Stockholm..." />
                  <ProfileField label="Standardadress" value={profile.default_address} onChange={(value) => setProfile((current) => ({ ...current, default_address: value }))} placeholder="Gatuadress" />
                </div>
                <button disabled={profileSaving} className="btn-primary w-full md:w-fit">
                  {profileSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  Spara profil
                </button>
                {profileMessage && <p className="rounded-2xl bg-burgundy/10 p-4 text-sm text-burgundy">{profileMessage}</p>}
              </form>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProfileField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-ink/70">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-3 text-ink outline-none transition focus:border-burgundy/40"
        placeholder={placeholder}
      />
    </label>
  );
}
