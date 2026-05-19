"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, Loader2, Send } from "lucide-react";

const experienceOptions = ["Ingen erfarenhet", "Mindre än 1 år", "1–3 år", "Mer än 3 år"];
const availabilityOptions = ["Vardagar dagtid", "Kvällar", "Helger", "Flexibelt", "Deltid", "Heltid"];

type Status = "idle" | "loading" | "success" | "error";

export default function JobbPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/job-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Kunde inte skicka ansökan.");
      setStatus("success");
      setMessage(result.message || "Tack! Din ansökan är skickad.");
      event.currentTarget.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Kunde inte skicka ansökan just nu.");
    }
  }

  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <div>
            <Link href="/" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Tillbaka</Link>
            <p className="eyebrow">Karriär</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">Jobba med Iboren</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/75 md:text-xl">Skicka en intresseanmälan om du vill arbeta med hemstädning, flyttstädning, kontorsstädning eller fönsterputs.</p>
            <div className="mt-8 rounded-2xl border border-burgundy/10 bg-porcelain p-5 text-sm leading-7 text-ink/75">
              <p className="flex gap-3"><BriefcaseBusiness className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> Berätta om din erfarenhet, vilka tider du kan arbeta och i vilka områden du kan ta uppdrag.</p>
            </div>
          </div>

          <form onSubmit={submit} className="rounded-[2rem] border border-burgundy/10 bg-porcelain p-6 shadow-luxe md:p-8">
            <div className="mb-7"><p className="text-xs font-black uppercase tracking-[.28em] text-burgundy">Ansökan</p><h2 className="display mt-2 text-4xl font-bold text-burgundy">Intresseanmälan</h2></div>
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Namn" name="name" required />
                <Field label="E-post" name="email" type="email" required />
                <Field label="Telefon" name="phone" required />
                <Field label="Stad / område" name="area" placeholder="Södertälje, Stockholm..." required />
              </div>
              <label className="block"><span className="mb-2 block text-sm font-bold">Erfarenhet</span><select name="experience" className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4">{experienceOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="block"><span className="mb-2 block text-sm font-bold">När kan du arbeta?</span><select name="availability" className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4">{availabilityOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
              <Field label="Språk" name="languages" placeholder="Svenska, engelska, persiska..." />
              <label className="block"><span className="mb-2 block text-sm font-bold">Kort presentation</span><textarea name="message" className="min-h-36 w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4" placeholder="Erfarenhet, tidigare jobb, referenser och tider du kan arbeta..." /></label>
              <Field label="CV eller profillänk" name="resume" placeholder="LinkedIn, Google Drive eller skriv att CV skickas via e-post" />
              <button disabled={status === "loading"} className="inline-flex items-center justify-center rounded-full bg-burgundy px-5 py-4 text-sm font-black uppercase tracking-[.12em] text-porcelain disabled:opacity-70">{status === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Skicka ansökan</button>
              {message && <p className={`rounded-2xl p-4 text-sm font-bold ${status === "success" ? "bg-burgundy/10 text-burgundy" : "bg-red-100 text-red-800"}`}>{message}</p>}
            </div>
          </form>
        </div>
      </section>

      <section className="bg-porcelain py-16"><div className="luxe-container grid gap-5 md:grid-cols-3">{["Flexibla tider", "Tydliga uppdrag", "Södertälje & Stockholm"].map((item) => <article key={item} className="rounded-[2rem] bg-cream p-6 shadow-soft"><CheckCircle2 className="mb-5 text-burgundy" /><h3 className="display text-3xl font-bold text-burgundy">{item}</h3><p className="mt-3 leading-7 text-ink/75">Iboren samlar information för att matcha rätt person med rätt typ av uppdrag.</p></article>)}</div></section>
    </main>
  );
}

function Field({ label, name, type = "text", required = false, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><input name={name} type={type} required={required} placeholder={placeholder} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4" /></label>;
}
