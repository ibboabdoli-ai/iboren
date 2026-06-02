"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createClient, Session, User } from "@supabase/supabase-js";
import { ArrowLeft, CalendarCheck2, Loader2, LogOut, Save, ShieldCheck, UserRound, XCircle } from "lucide-react";

type Booking = {
  id: string;
  booking_number: string | null;
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

type RecurringMeta = {
  current: number | null;
  total: number | null;
  originalStartDate: string | null;
  frequency: string | null;
};

type BookingGroup = {
  key: string;
  bookings: Booking[];
  representative: Booking;
  recurring: RecurringMeta | null;
  cleanNotes: string | null;
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

function providerLabel(provider: unknown) {
  const value = String(provider || "oauth").toLowerCase();
  if (value.includes("google")) return "Verifierad med Google";
  if (value.includes("linkedin")) return "Verifierad med LinkedIn";
  if (value.includes("azure") || value.includes("microsoft")) return "Verifierad med Microsoft";
  return "Verifierad inloggning";
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

function bookingReference(booking: Pick<Booking, "id" | "booking_number">) {
  if (booking.booking_number) return booking.booking_number;
  return booking.id ? booking.id.slice(0, 8) : "—";
}

function parseRecurringMeta(booking: Booking): RecurringMeta | null {
  const notes = booking.notes || "";
  const visitMatch = notes.match(/Visit:\s*(\d+)\s*of\s*(\d+)/i);
  const originalMatch = notes.match(/Original start date:\s*([^\n]+)/i);
  const frequencyMatch = notes.match(/Frequency:\s*([^\n]+)/i);
  if (!visitMatch && !originalMatch) return null;
  return {
    current: visitMatch ? Number(visitMatch[1]) : null,
    total: visitMatch ? Number(visitMatch[2]) : null,
    originalStartDate: originalMatch?.[1]?.trim() || null,
    frequency: frequencyMatch?.[1]?.trim() || booking.frequency || null
  };
}

function cleanBookingNotes(notes: string | null) {
  if (!notes) return null;
  return notes
    .split(/\n---\s*Recurring visit\s*---/i)[0]
    .split(/\n---\s*Kundtyp & RUT\s*---/i)[0]
    .trim() || null;
}

function dateValue(value: string | null) {
  return value || "9999-12-31";
}

function sortByDate(a: Booking, b: Booking) {
  return dateValue(a.preferred_date).localeCompare(dateValue(b.preferred_date));
}

function recurringGroupKey(booking: Booking) {
  const recurring = parseRecurringMeta(booking);
  if (!recurring) return booking.id;
  return [
    "recurring",
    recurring.originalStartDate || booking.created_at.slice(0, 10),
    recurring.frequency || booking.frequency || "",
    booking.service,
    booking.area,
    booking.address || "",
    booking.size_sqm || ""
  ].join("|");
}

function groupBookings(bookings: Booking[]): BookingGroup[] {
  const map = new Map<string, BookingGroup>();

  for (const booking of bookings) {
    const recurring = parseRecurringMeta(booking);
    const key = recurringGroupKey(booking);
    const existing = map.get(key);
    if (existing) {
      existing.bookings.push(booking);
      existing.bookings.sort(sortByDate);
      const currentMeta = parseRecurringMeta(existing.representative);
      const nextMeta = parseRecurringMeta(booking);
      if ((nextMeta?.current || 0) < (currentMeta?.current || 9999)) existing.representative = booking;
    } else {
      map.set(key, {
        key,
        bookings: [booking],
        representative: booking,
        recurring,
        cleanNotes: cleanBookingNotes(booking.notes)
      });
    }
  }

  return [...map.values()].sort((a, b) => dateValue(a.bookings[0]?.preferred_date || null).localeCompare(dateValue(b.bookings[0]?.preferred_date || null)));
}

function groupStats(bookings: Booking[]) {
  const completed = bookings.filter((booking) => booking.status === "completed").length;
  const cancelled = bookings.filter((booking) => booking.status === "cancelled").length;
  const confirmed = bookings.filter((booking) => booking.status === "confirmed").length;
  const open = bookings.length - completed - cancelled;
  return { completed, cancelled, confirmed, open };
}

function nextOpenVisit(bookings: Booking[]) {
  return bookings.find((booking) => booking.status !== "completed" && booking.status !== "cancelled") || bookings[bookings.length - 1];
}

function groupStatus(bookings: Booking[]) {
  const stats = groupStats(bookings);
  if (bookings.length > 0 && stats.completed === bookings.length) return "completed";
  if (stats.confirmed > 0) return "confirmed";
  if (stats.open > 0) return "new";
  return "cancelled";
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
  const bookingGroups = useMemo(() => groupBookings(visibleBookings), [visibleBookings]);
  const cancelledCount = useMemo(() => bookings.filter((booking) => booking.status === "cancelled").length, [bookings]);
  const activeCount = bookings.length - cancelledCount;

  async function loadBookings(currentUser: User) {
    const supabase = getSupabase();
    if (!supabase) return;
    setBookingsLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("id, booking_number, service, area, address, size_sqm, frequency, preferred_date, time_window, customer_name, customer_email, customer_phone, notes, status, created_at")
      .eq("user_id", currentUser.id)
      .order("preferred_date", { ascending: true });

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
          setMessage("Supabase environment variables saknas i Vercel.");
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

    setProfileMessage(error ? `Kunde inte spara profilen: ${error.message}` : "Profiluppgifter sparade.");
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

    const response = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
    const result = await response.json().catch(() => null) as { ok?: boolean; message?: string } | null;

    if (!response.ok || !result?.ok) setMessage(`Kunde inte avboka bokningen: ${result?.message || "Okänt fel"}`);
    else {
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

  if (loading) return <main className="grid min-h-screen place-items-center bg-cream text-burgundy"><Loader2 className="h-8 w-8 animate-spin" /></main>;

  if (!session || !user) {
    return (
      <main className="min-h-screen bg-cream py-16 text-ink">
        <section className="luxe-container max-w-2xl rounded-[2rem] bg-porcelain p-8 shadow-luxe md:p-10">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Tillbaka</Link>
          <img src="/logo.svg" alt="Iboren" className="mb-8 h-auto w-full max-w-[320px] rounded-[1.6rem] shadow-2xl" />
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
  const verifiedProvider = providerLabel(user.app_metadata?.provider);

  return (
    <main className="min-h-screen bg-cream py-16 text-ink">
      <section className="luxe-container">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Tillbaka</Link>
        <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="overflow-hidden rounded-[2.5rem] bg-[#06131A] p-8 text-porcelain shadow-luxe">
            <img src="/logo.svg" alt="Iboren" className="mb-8 h-auto w-full rounded-[1.6rem] shadow-2xl" />
            <div className="mb-8 flex items-center gap-4">
              {avatar ? <img src={avatar} alt="Profilbild" className="h-16 w-16 rounded-full border border-[#49D8EA]/40 object-cover" /> : <div className="grid h-16 w-16 place-items-center rounded-full bg-[#49D8EA]/15 text-[#49D8EA]"><UserRound size={30} /></div>}
              <div>
                <p className="text-xs font-bold uppercase tracking-[.28em] text-[#49D8EA]">Verified account</p>
                <h1 className="display mt-1 text-4xl font-bold">{fullName}</h1>
              </div>
            </div>
            <div className="space-y-3 break-words rounded-[1.5rem] border border-[#49D8EA]/20 bg-white/5 p-4 text-sm text-porcelain/78">
              <p><strong className="text-[#49D8EA]">Email:</strong> {user.email}</p>
              <p><strong className="text-[#49D8EA]">Status:</strong> {verifiedProvider}</p>
            </div>
            <button onClick={signOut} className="mt-8 inline-flex items-center gap-2 rounded-full bg-porcelain px-5 py-3 text-sm font-bold text-[#06131A]"><LogOut size={17} /> Logga ut</button>
          </aside>

          <div className="grid gap-5">
            <article className="rounded-[2.5rem] bg-porcelain p-8 shadow-soft">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-burgundy text-porcelain"><CalendarCheck2 size={25} /></div>
                  <h2 className="display text-4xl font-bold text-burgundy">Mina bokningar</h2>
                  <p className="mt-3 leading-8 text-ink/65">Här visas dina bokningar grupperade per återkommande serie. Öppna serien för att se varje besök.</p>
                  <p className="mt-2 text-sm font-bold text-ink/45">Aktiva besök: {activeCount} · Avbokade: {cancelledCount}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  {cancelledCount > 0 && <button type="button" onClick={() => setShowCancelled((current) => !current)} className="rounded-full border border-burgundy/15 bg-cream px-5 py-3 text-sm font-bold text-burgundy">{showCancelled ? "Dölj avbokade" : "Visa avbokade"}</button>}
                  <Link href="/#booking" className="btn-secondary">Ny bokning</Link>
                </div>
              </div>

              {message && <p className="mb-5 rounded-2xl bg-burgundy/10 p-4 text-sm text-burgundy">{message}</p>}

              {bookingsLoading ? (
                <div className="grid min-h-32 place-items-center text-burgundy"><Loader2 className="h-7 w-7 animate-spin" /></div>
              ) : bookings.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-burgundy/20 bg-cream p-6 text-ink/65"><p>Du har inga sparade bokningar ännu.</p><Link href="/#booking" className="mt-4 inline-flex font-bold text-burgundy">Skapa första bokningen →</Link></div>
              ) : visibleBookings.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-burgundy/20 bg-cream p-6 text-ink/65"><p>Du har inga aktiva bokningar just nu.</p>{cancelledCount > 0 && <button type="button" onClick={() => setShowCancelled(true)} className="mt-4 font-bold text-burgundy">Visa avbokade bokningar →</button>}</div>
              ) : (
                <div className="grid gap-4">
                  {bookingGroups.map((group) => {
                    const representative = group.representative;
                    const stats = groupStats(group.bookings);
                    const nextVisit = nextOpenVisit(group.bookings) || representative;
                    const currentStatus = groupStatus(group.bookings);
                    const isRecurring = Boolean(group.recurring && group.bookings.length > 1);
                    const isCancelled = currentStatus === "cancelled";

                    return (
                      <article key={group.key} className={`rounded-[2rem] border p-5 ${isCancelled ? "border-red-200 bg-red-50/60 opacity-75" : "border-burgundy/10 bg-cream"}`}>
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap gap-2">
                              <p className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[.18em] ${statusClass(currentStatus)}`}>{statusLabel(currentStatus)}</p>
                              <p className="inline-flex rounded-full bg-porcelain px-3 py-1 text-xs font-black uppercase tracking-[.14em] text-burgundy ring-1 ring-burgundy/10">Bokningsnummer: {bookingReference(representative)}</p>
                              {isRecurring && <p className="inline-flex rounded-full bg-gold px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-ink">Serie · {group.bookings.length} besök</p>}
                            </div>
                            <h3 className="display mt-3 break-words text-3xl font-bold text-burgundy">{representative.service}</h3>
                            <p className="mt-2 break-words leading-7 text-ink/70">{representative.area}{representative.address ? ` · ${representative.address}` : ""}</p>
                          </div>
                          <span className="w-fit rounded-full bg-burgundy px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-porcelain">Nästa: {nextVisit?.preferred_date || representative.preferred_date || "Datum saknas"}</span>
                        </div>

                        {isRecurring && <div className="mt-5 grid gap-3 rounded-[1.5rem] bg-porcelain p-4 text-sm font-bold text-ink/65 sm:grid-cols-3">
                          <p>Besök totalt<br /><span className="text-xl text-burgundy">{group.bookings.length}</span></p>
                          <p>Klara<br /><span className="text-xl text-burgundy">{stats.completed}</span></p>
                          <p>Kommande/öppna<br /><span className="text-xl text-burgundy">{stats.open}</span></p>
                        </div>}

                        <div className="mt-5 grid gap-3 text-sm text-ink/62 md:grid-cols-3">
                          <p><strong>Storlek:</strong> {representative.size_sqm ? `${representative.size_sqm} kvm` : "—"}</p>
                          <p><strong>Frekvens:</strong> {representative.frequency || group.recurring?.frequency || "—"}</p>
                          <p><strong>Tid:</strong> {representative.time_window || "—"}</p>
                        </div>
                        {group.cleanNotes && <pre className="mt-4 whitespace-pre-wrap break-words rounded-2xl bg-porcelain p-4 font-sans text-sm leading-7 text-ink/68">{group.cleanNotes}</pre>}

                        {isRecurring ? <div className="mt-4 rounded-2xl bg-porcelain p-4">
                          <p className="mb-3 text-xs font-black uppercase tracking-[.18em] text-ink/45">Besök i serien</p>
                          <div className="grid gap-2">
                            {group.bookings.map((booking, index) => {
                              const meta = parseRecurringMeta(booking);
                              const visitNumber = meta?.current || index + 1;
                              const cannotCancel = booking.status === "cancelled" || booking.status === "completed";
                              return <div key={booking.id} className="flex flex-col gap-2 rounded-xl bg-cream p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                                <p className="font-bold text-ink">{booking.preferred_date || "Datum saknas"} <span className="text-ink/45">· besök {visitNumber}/{meta?.total || group.bookings.length} · {bookingReference(booking)}</span></p>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[.12em] ${statusClass(booking.status)}`}>{statusLabel(booking.status)}</span>
                                  {!cannotCancel && <button onClick={() => cancelBooking(booking.id)} disabled={cancelingId === booking.id} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-700 disabled:opacity-60">{cancelingId === booking.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />} Avboka</button>}
                                </div>
                              </div>;
                            })}
                          </div>
                        </div> : !isCancelled && <button onClick={() => cancelBooking(representative.id)} disabled={cancelingId === representative.id} className="mt-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60">{cancelingId === representative.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Avboka</button>}
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
                <div className="grid gap-4 md:grid-cols-2"><ProfileField label="Standardområde" value={profile.default_area} onChange={(value) => setProfile((current) => ({ ...current, default_area: value }))} placeholder="Södertälje, Stockholm..." /><ProfileField label="Standardadress" value={profile.default_address} onChange={(value) => setProfile((current) => ({ ...current, default_address: value }))} placeholder="Gatuadress" /></div>
                <button disabled={profileSaving} className="btn-primary w-full md:w-fit">{profileSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Spara profil</button>
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
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-3 text-ink outline-none transition focus:border-burgundy/40" placeholder={placeholder} />
    </label>
  );
}
