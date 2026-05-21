"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createClient, Session, User } from "@supabase/supabase-js";
import { ArrowLeft, CalendarPlus, Loader2, LogOut, Save, UserRound, XCircle } from "lucide-react";

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

const emptyProfile: ProfileForm = { full_name: "", phone: "", default_area: "", default_address: "" };

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
}

function metadataName(currentUser: User) {
  return currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || "";
}

function providerLabel(provider: unknown) {
  const value = String(provider || "oauth").toLowerCase();
  if (value.includes("google")) return "Verified with Google";
  if (value.includes("linkedin")) return "Verified with LinkedIn";
  if (value.includes("azure") || value.includes("microsoft")) return "Verified with Microsoft";
  return "Verified login";
}

function statusLabel(status: string | null) {
  if (status === "cancelled") return "Cancelled";
  if (status === "confirmed") return "Confirmed";
  if (status === "completed") return "Completed";
  return "New";
}

function statusClass(status: string | null) {
  if (status === "cancelled") return "bg-red-100 text-red-800 border-red-200";
  if (status === "confirmed") return "bg-green-100 text-green-800 border-green-200";
  if (status === "completed") return "bg-ink text-porcelain border-ink";
  return "bg-burgundy text-porcelain border-burgundy";
}

export default function EnglishProfilePage() {
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

    if (error) setMessage(`Could not load booking requests: ${error.message}`);
    else {
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
      setProfileMessage(`Could not load profile details: ${error.message}`);
      setProfile({ full_name: metadataName(currentUser), phone: "", default_area: "", default_address: "" });
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
          setMessage("Supabase environment variables are missing in Vercel.");
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);

      if (data.session?.user) await Promise.all([loadBookings(data.session.user), loadProfile(data.session.user)]);
      if (!cancelled) setLoading(false);
    }

    void initProfile();
    return () => { cancelled = true; };
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

    setProfileMessage(error ? `Could not save profile: ${error.message}` : "Profile details saved.");
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
      setMessage("You need to log in again to cancel.");
      setCancelingId(null);
      return;
    }

    const response = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
    const result = await response.json().catch(() => null) as { ok?: boolean; message?: string } | null;

    if (!response.ok || !result?.ok) setMessage(`Could not cancel the request: ${result?.message || "Unknown error"}`);
    else {
      setBookings((current) => current.map((booking) => booking.id === bookingId ? { ...booking, status: "cancelled" } : booking));
      setMessage("The request has been marked as cancelled.");
    }
    setCancelingId(null);
  }

  async function signOut() {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/en";
  }

  if (loading) return <main className="grid min-h-screen place-items-center bg-cream text-burgundy"><Loader2 className="h-8 w-8 animate-spin" /></main>;

  if (!session || !user) {
    return (
      <main className="min-h-screen bg-cream py-16 text-ink">
        <section className="luxe-container max-w-2xl rounded-[2rem] bg-porcelain p-8 shadow-luxe md:p-10">
          <Link href="/en" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Back</Link>
          <img src="/logo.svg" alt="Iboren" className="mb-8 h-auto w-full max-w-[320px] rounded-[1.6rem] shadow-2xl" />
          <h1 className="display text-5xl font-bold text-burgundy">Profile</h1>
          <p className="mt-4 leading-8 text-ink/70">You need to log in to see your profile and your booking requests.</p>
          {message && <p className="mt-4 rounded-2xl bg-burgundy/10 p-4 text-sm text-burgundy">{message}</p>}
          <Link href="/login" className="btn-primary mt-7">Log in</Link>
        </section>
      </main>
    );
  }

  const fullName = profile.full_name || metadataName(user) || "Iboren customer";
  const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const verifiedProvider = providerLabel(user.app_metadata?.provider);

  return (
    <main className="min-h-screen bg-cream py-16 text-ink">
      <section className="luxe-container">
        <Link href="/en" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Back</Link>
        <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="overflow-hidden rounded-[2.5rem] bg-[#06131A] p-8 text-porcelain shadow-luxe">
            <img src="/logo.svg" alt="Iboren" className="mb-8 h-auto w-full rounded-[1.6rem] shadow-2xl" />
            <div className="mb-8 flex items-center gap-4">
              {avatar ? <img src={avatar} alt="Profile image" className="h-16 w-16 rounded-full border border-[#49D8EA]/40 object-cover" /> : <div className="grid h-16 w-16 place-items-center rounded-full bg-[#49D8EA]/15 text-[#49D8EA]"><UserRound size={30} /></div>}
              <div>
                <p className="text-xs font-bold uppercase tracking-[.28em] text-[#49D8EA]">Verified account</p>
                <h1 className="display mt-1 text-4xl font-bold">{fullName}</h1>
              </div>
            </div>
            <div className="space-y-3 break-words rounded-[1.5rem] border border-[#49D8EA]/20 bg-white/5 p-4 text-sm text-porcelain/78">
              <p><strong className="text-[#49D8EA]">Email:</strong> {user.email}</p>
              <p><strong className="text-[#49D8EA]">Status:</strong> {verifiedProvider}</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/5 p-4"><p className="text-3xl font-black text-gold">{activeCount}</p><p className="text-xs uppercase tracking-[.18em] text-porcelain/55">Active</p></div>
              <div className="rounded-2xl bg-white/5 p-4"><p className="text-3xl font-black text-gold">{cancelledCount}</p><p className="text-xs uppercase tracking-[.18em] text-porcelain/55">Cancelled</p></div>
            </div>
            <Link href="/en#booking" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold/35 bg-gold px-5 py-3 text-sm font-bold text-night"><CalendarPlus size={17} /> New booking request</Link>
            <button onClick={signOut} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold/35 px-5 py-3 text-sm font-bold text-gold"><LogOut size={17} /> Log out</button>
          </aside>

          <div className="grid gap-6">
            <section className="rounded-[2.5rem] bg-porcelain p-6 shadow-luxe md:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-xs font-black uppercase tracking-[.28em] text-burgundy/60">Profile details</p><h2 className="display mt-2 text-4xl font-bold text-burgundy">Your details</h2></div>
              </div>
              <form onSubmit={saveProfile} className="grid gap-4 md:grid-cols-2">
                <ProfileField label="Name" value={profile.full_name} onChange={(value) => setProfile((current) => ({ ...current, full_name: value }))} />
                <ProfileField label="Phone" value={profile.phone} onChange={(value) => setProfile((current) => ({ ...current, phone: value }))} />
                <ProfileField label="Default area" value={profile.default_area} onChange={(value) => setProfile((current) => ({ ...current, default_area: value }))} />
                <ProfileField label="Default address" value={profile.default_address} onChange={(value) => setProfile((current) => ({ ...current, default_address: value }))} />
                <div className="md:col-span-2"><button disabled={profileSaving} className="btn-primary">{profileSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Save profile</button></div>
              </form>
              {profileMessage && <p className="mt-4 rounded-2xl bg-burgundy/10 p-4 text-sm text-burgundy">{profileMessage}</p>}
            </section>

            <section className="rounded-[2.5rem] bg-porcelain p-6 shadow-luxe md:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-xs font-black uppercase tracking-[.28em] text-burgundy/60">Booking requests</p><h2 className="display mt-2 text-4xl font-bold text-burgundy">My requests</h2></div>
                <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
                  <button onClick={() => setShowCancelled((value) => !value)} className="rounded-full border border-burgundy/15 px-4 py-2 text-sm font-bold text-burgundy">{showCancelled ? "Hide cancelled" : "Show cancelled"}</button>
                  <Link href="/en#booking" className="rounded-full border border-gold/35 bg-gold px-4 py-2 text-center text-sm font-bold text-night">New booking request</Link>
                </div>
              </div>
              {message && <p className="mb-4 rounded-2xl bg-burgundy/10 p-4 text-sm text-burgundy">{message}</p>}
              {bookingsLoading ? <Loader2 className="h-7 w-7 animate-spin text-burgundy" /> : visibleBookings.length === 0 ? <p className="rounded-2xl bg-cream p-5 text-ink/65">No booking requests yet.</p> : <div className="grid gap-4">{visibleBookings.map((booking) => <article key={booking.id} className="rounded-[1.5rem] border border-burgundy/10 bg-cream p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.2em] text-burgundy/55">{booking.created_at ? new Date(booking.created_at).toLocaleDateString("en-SE") : ""}</p><h3 className="display mt-1 text-3xl font-bold text-burgundy">{booking.service}</h3><p className="mt-1 text-sm text-ink/65">{booking.area} · {booking.size_sqm ? `${booking.size_sqm} sqm` : "Size not set"}</p></div><span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[.14em] ${statusClass(booking.status)}`}>{statusLabel(booking.status)}</span></div><div className="mt-4 grid gap-2 text-sm leading-6 text-ink/68 md:grid-cols-2"><p><strong>Address:</strong> {booking.address || "—"}</p><p><strong>Date:</strong> {booking.preferred_date || "—"}</p><p><strong>Time:</strong> {booking.time_window || "—"}</p><p><strong>Frequency:</strong> {booking.frequency || "—"}</p><p><strong>Phone:</strong> {booking.customer_phone || "—"}</p><p><strong>Email:</strong> {booking.customer_email}</p></div>{booking.notes && <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-white/60 p-4 text-sm leading-6 text-ink/62">{booking.notes}</pre>}{booking.status !== "cancelled" && <button onClick={() => cancelBooking(booking.id)} disabled={cancelingId === booking.id} className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700">{cancelingId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Cancel request</button>}</article>)}</div>}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProfileField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-ink/70">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4 text-ink outline-none" /></label>;
}
