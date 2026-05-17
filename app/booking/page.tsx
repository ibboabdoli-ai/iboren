"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient, User } from "@supabase/supabase-js";
import { ArrowLeft, CheckCircle2, Loader2, Save, Send } from "lucide-react";

type BookingDraft = {
  service: string;
  area: string;
  address: string;
  size: string;
  frequency: string;
  date: string;
  timeWindow: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
};

const initialDraft: BookingDraft = {
  service: "Hemstädning",
  area: "",
  address: "",
  size: "",
  frequency: "Engång",
  date: "",
  timeWindow: "Flexibel",
  name: "",
  email: "",
  phone: "",
  notes: ""
};

const serviceOptions = ["Hemstädning", "Flyttstädning", "Kontorsstädning", "Fönsterputs"];
const frequencyOptions = ["Engång", "Varje vecka", "Varannan vecka", "Varje månad"];
const timeOptions = ["Morgon", "Förmiddag", "Eftermiddag", "Kväll", "Flexibel"];

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

export default function BookingPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [draft, setDraft] = useState<BookingDraft>(initialDraft);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    let cancelled = false;

    async function loadDefaults() {
      const supabase = getSupabase();
      if (!supabase) {
        setMessage("Supabase saknas. Kontrollera environment variables i Vercel.");
        setStatus("error");
        setLoading(false);
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      if (cancelled) return;

      const currentUser = authData.user;
      setUser(currentUser ?? null);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      const fullName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || "";
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, default_area, default_address")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (cancelled) return;

      setDraft((current) => ({
        ...current,
        name: profile?.full_name || fullName,
        email: currentUser.email || "",
        phone: profile?.phone || "",
        area: profile?.default_area || "",
        address: profile?.default_address || ""
      }));

      setLoading(false);
    }

    void loadDefaults();

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => [
    `Tjänst: ${draft.service || "—"}`,
    `Område: ${draft.area || "—"}`,
    `Adress: ${draft.address || "—"}`,
    `Storlek: ${draft.size ? `${draft.size} kvm` : "—"}`,
    `Frekvens: ${draft.frequency}`,
    `Datum: ${draft.date || "—"}`,
    `Tid: ${draft.timeWindow}`,
    `Namn: ${draft.name || "—"}`,
    `E-post: ${draft.email || "—"}`,
    `Telefon: ${draft.phone || "—"}`,
    `Önskemål: ${draft.notes || "—"}`
  ].join("\n"), [draft]);

  const setField = <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  async function saveBookingToDatabase() {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase saknas.");

    const { data } = await supabase.auth.getUser();
    const currentUser = data.user;

    const { error } = await supabase.from("bookings").insert({
      user_id: currentUser?.id ?? null,
      service: draft.service,
      area: draft.area,
      address: draft.address || null,
      size_sqm: Number.parseInt(draft.size, 10),
      frequency: draft.frequency,
      preferred_date: draft.date,
      time_window: draft.timeWindow,
      customer_name: draft.name,
      customer_email: draft.email,
      customer_phone: draft.phone || null,
      notes: draft.notes || null,
      status: "new"
    });

    if (error) throw new Error(error.message);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.name || !draft.email || !draft.area || !draft.size || !draft.date) {
      setStatus("error");
      setMessage("Fyll i namn, e-post, område, storlek och datum innan du skickar.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setStatus("idle");

    try {
      await saveBookingToDatabase();
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft)
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Kunde inte skicka bokningen.");
      setStatus("success");
      setMessage(user ? "Bokningen är sparad på din profil och skickad till Iboren." : "Bokningsförfrågan skickad.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Något gick fel.");
    }

    setSubmitting(false);
  }

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-cream text-burgundy"><Loader2 className="h-8 w-8 animate-spin" /></main>;
  }

  return (
    <main className="min-h-screen bg-cream py-12 text-ink md:py-16">
      <section className="luxe-container">
        <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Tillbaka till profil</Link>

        <div className="grid gap-6 lg:grid-cols-[1.08fr_.92fr]">
          <form onSubmit={submit} className="rounded-[2.5rem] bg-porcelain p-7 shadow-soft md:p-9">
            <p className="eyebrow">Iboren Booking</p>
            <h1 className="display mt-4 text-5xl font-bold leading-[.9] text-burgundy md:text-7xl">Ny bokning</h1>
            <p className="mt-5 leading-8 text-ink/65">Uppgifter från din profil fylls i automatiskt. Kontrollera och komplettera innan du skickar.</p>

            {user ? (
              <p className="mt-5 inline-flex rounded-full bg-burgundy/10 px-4 py-2 text-sm font-bold text-burgundy">Inloggad som {user.email}</p>
            ) : (
              <div className="mt-5 rounded-2xl bg-gold/20 p-4 text-sm leading-6 text-ink/70">Du är inte inloggad. Bokningen skickas, men sparas inte på en profil. <Link href="/login" className="font-bold text-burgundy">Logga in här</Link>.</div>
            )}

            <div className="mt-8 grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-ink/70">Tjänst</label>
                <div className="grid grid-cols-2 gap-2">
                  {serviceOptions.map((service) => (
                    <button type="button" key={service} onClick={() => setField("service", service)} className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${draft.service === service ? "border-burgundy bg-burgundy text-porcelain" : "border-burgundy/10 bg-cream text-ink/70"}`}>{service}</button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Namn" value={draft.name} onChange={(value) => setField("name", value)} />
                <Field label="E-post" value={draft.email} onChange={(value) => setField("email", value)} type="email" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Telefon" value={draft.phone} onChange={(value) => setField("phone", value)} />
                <Field label="Storlek kvm" value={draft.size} onChange={(value) => setField("size", value.replace(/[^0-9]/g, ""))} placeholder="75" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Område" value={draft.area} onChange={(value) => setField("area", value)} placeholder="Södertälje" />
                <Field label="Adress" value={draft.address} onChange={(value) => setField("address", value)} placeholder="Gatuadress" />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Datum" value={draft.date} onChange={(value) => setField("date", value)} type="date" />
                <Select label="Frekvens" value={draft.frequency} options={frequencyOptions} onChange={(value) => setField("frequency", value)} />
                <Select label="Tid" value={draft.timeWindow} options={timeOptions} onChange={(value) => setField("timeWindow", value)} />
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-ink/70">Önskemål</span>
                <textarea value={draft.notes} onChange={(event) => setField("notes", event.target.value)} className="min-h-28 w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-3 text-ink outline-none focus:border-burgundy/40" placeholder="Särskilda instruktioner, portkod, nyckel, husdjur..." />
              </label>

              <button disabled={submitting} className="btn-primary w-full md:w-fit">
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                Skicka bokningsförfrågan
              </button>

              {message && <p className={`rounded-2xl p-4 text-sm ${status === "success" ? "bg-green-100 text-green-800" : "bg-burgundy/10 text-burgundy"}`}>{message}</p>}
            </div>
          </form>

          <aside className="rounded-[2.5rem] bg-burgundy p-7 text-porcelain shadow-luxe md:p-9">
            <div className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-gold text-ink"><CheckCircle2 size={25} /></div>
            <h2 className="display text-4xl font-bold">Sammanfattning</h2>
            <p className="mt-4 leading-8 text-porcelain/70">Den här informationen sparas i din profilhistorik och skickas till Iboren.</p>
            <pre className="mt-7 max-h-[480px] overflow-auto whitespace-pre-wrap rounded-[1.5rem] bg-porcelain/10 p-5 text-sm leading-7 text-porcelain/80">{summary}</pre>
            <Link href="/profile" className="mt-6 inline-flex items-center gap-2 rounded-full bg-porcelain px-5 py-3 text-sm font-bold text-burgundy"><Save size={17} /> Visa profil</Link>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-ink/70">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-3 text-ink outline-none focus:border-burgundy/40" placeholder={placeholder} />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-ink/70">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-3 text-ink outline-none focus:border-burgundy/40">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}
