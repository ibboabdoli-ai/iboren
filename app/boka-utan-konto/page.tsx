"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type PublicRequestDraft = {
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
  website: string;
};

const initialDraft: PublicRequestDraft = {
  service: "Hemstädning",
  area: "Södertälje",
  address: "",
  size: "",
  frequency: "Engång",
  date: "",
  timeWindow: "Flexibel",
  name: "",
  email: "",
  phone: "",
  notes: "",
  website: ""
};

const serviceOptions = ["Hemstädning", "Flyttstädning", "Storstädning", "Kontorsstädning", "Fönsterputs"];
const frequencyOptions = ["Engång", "Varje vecka", "Varannan vecka", "Varje månad"];
const timeOptions = ["Morgon", "Förmiddag", "Eftermiddag", "Kväll", "Flexibel"];

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
}

export default function PublicBookingRequestPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [draft, setDraft] = useState(initialDraft);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setCheckingSession(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        router.replace("/profile");
        return;
      }
      setCheckingSession(false);
    });
  }, [router]);

  const summary = useMemo(() => [
    `Tjänst: ${draft.service}`,
    `Område: ${draft.area || "Ej ifyllt"}`,
    `Adress: ${draft.address || "Ej ifyllt"}`,
    `Storlek: ${draft.size ? `${draft.size} kvm` : "Ej ifyllt"}`,
    `Frekvens: ${draft.frequency}`,
    `Datum: ${draft.date || "Ej valt"}`,
    `Tid: ${draft.timeWindow}`,
    `Namn: ${draft.name || "Ej ifyllt"}`,
    `E-post: ${draft.email || "Ej ifyllt"}`,
    `Telefon: ${draft.phone || "Ej ifyllt"}`,
    `Önskemål: ${draft.notes || "—"}`
  ].join("\n"), [draft]);

  function setField<K extends keyof PublicRequestDraft>(key: K, value: PublicRequestDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("Skickar din förfrågan...");

    try {
      const response = await fetch("/api/public-booking-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          customerType: draft.service === "Kontorsstädning" ? "Företag" : "Privatperson",
          rutRequested: draft.service !== "Kontorsstädning",
          notes: `${summary}\n\n--- Kundens meddelande ---\n${draft.notes || "-"}`,
          language: "sv"
        })
      });
      const result = await response.json().catch(() => null) as { ok?: boolean; message?: string } | null;
      if (!response.ok || !result?.ok) throw new Error(result?.message || "Kunde inte skicka förfrågan just nu.");
      setStatus("success");
      setMessage(result.message || "Tack! Din förfrågan har skickats. Vi bekräftar alltid tid och pris innan bokningen blir bindande.");
      setDraft(initialDraft);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Kunde inte skicka förfrågan just nu.");
    }
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-cream px-5 py-20 text-ink">
        <div className="luxe-container max-w-3xl rounded-[2rem] border border-burgundy/10 bg-porcelain p-8 shadow-soft">
          <p className="text-sm font-bold uppercase tracking-[.24em] text-burgundy/60">Iboren</p>
          <h1 className="display mt-4 text-4xl font-normal uppercase text-burgundy">Kontrollerar inloggning...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream px-5 py-12 text-ink md:py-20">
      <div className="luxe-container grid gap-8 lg:grid-cols-[.82fr_1.18fr]">
        <section className="rounded-[2rem] border border-burgundy/10 bg-porcelain p-7 shadow-soft md:p-9">
          <p className="text-xs font-black uppercase tracking-[.28em] text-burgundy/60">Bokningsförfrågan</p>
          <h1 className="display mt-4 text-5xl font-normal uppercase leading-[.92] text-burgundy md:text-7xl">Skicka förfrågan utan konto.</h1>
          <p className="mt-6 text-base leading-8 text-ink/70">Fyll i dina uppgifter så återkommer Iboren med tid och pris. Detta är inte en bekräftad bokning.</p>
          <p className="mt-5 rounded-2xl border border-gold/25 bg-gold/10 px-4 py-3 text-sm font-bold text-burgundy">Vi bekräftar alltid tid och pris innan bokningen blir bindande.</p>
          <div className="mt-7 grid gap-3 text-sm text-ink/65">
            <p>Har du redan konto? <Link href="/login" className="font-bold text-burgundy underline">Logga in och använd din profil</Link>.</p>
            <p>Din förfrågan går inte vidare till bokning förrän Iboren har kontrollerat den.</p>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_.82fr]">
          <form onSubmit={submit} className="rounded-[2rem] border border-burgundy/10 bg-porcelain p-5 shadow-soft md:p-7">
            <input value={draft.website} onChange={(event) => setField("website", event.target.value)} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-[.28em] text-burgundy/60">Steg 1 / Request</p>
              <h2 className="display mt-2 text-3xl font-normal uppercase text-burgundy">Dina uppgifter</h2>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-ink/75">Tjänst</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {serviceOptions.map((service) => <button type="button" key={service} onClick={() => setField("service", service)} className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${draft.service === service ? "border-burgundy bg-burgundy text-porcelain" : "border-burgundy/10 bg-cream text-ink/75"}`}>{service}</button>)}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Område / stad" value={draft.area} onChange={(value) => setField("area", value)} placeholder="Södertälje" />
                <Field label="Storlek kvm" value={draft.size} onChange={(value) => setField("size", value.replace(/[^0-9]/g, ""))} placeholder="75" />
              </div>

              <Field label="Adress" value={draft.address} onChange={(value) => setField("address", value)} placeholder="Gatuadress och nummer" />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Önskat datum" type="date" value={draft.date} onChange={(value) => setField("date", value)} />
                <Select label="Tid" value={draft.timeWindow} options={timeOptions} onChange={(value) => setField("timeWindow", value)} />
              </div>

              <Select label="Frekvens" value={draft.frequency} options={frequencyOptions} onChange={(value) => setField("frequency", value)} />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Namn" value={draft.name} onChange={(value) => setField("name", value)} placeholder="För- och efternamn" />
                <Field label="E-post" type="email" value={draft.email} onChange={(value) => setField("email", value)} placeholder="namn@email.se" />
              </div>

              <Field label="Telefon" type="tel" value={draft.phone} onChange={(value) => setField("phone", value)} placeholder="+46 ..." />

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-ink/75">Meddelande</span>
                <textarea value={draft.notes} onChange={(event) => setField("notes", event.target.value)} className="min-h-28 w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4 text-ink outline-none focus:border-burgundy" placeholder="Särskilda önskemål..." />
              </label>

              <button disabled={status === "loading"} className="btn-primary w-full bg-burgundy text-porcelain hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60">{status === "loading" ? "Skickar..." : "Skicka förfrågan"}</button>
              {message && <p className={`rounded-2xl px-4 py-3 text-sm ${status === "success" ? "bg-green-100 text-green-800" : status === "error" ? "bg-red-100 text-red-800" : "bg-burgundy/5 text-ink/70"}`}>{message}</p>}
            </div>
          </form>

          <aside className="rounded-[2rem] border border-burgundy/10 bg-porcelain p-5 shadow-soft md:p-7">
            <p className="text-xs font-black uppercase tracking-[.28em] text-burgundy/60">Sammanfattning</p>
            <h2 className="display mt-2 text-3xl font-normal uppercase text-burgundy">Utkast</h2>
            <pre className="mt-5 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-[1.5rem] border border-burgundy/10 bg-cream p-5 text-sm leading-7 text-ink/70">{summary}</pre>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-ink/75">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4 text-ink outline-none focus:border-burgundy" />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-ink/75">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4 text-ink outline-none focus:border-burgundy">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}
