"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, Loader2, Send, Upload } from "lucide-react";

const experienceOptions = ["Ingen erfarenhet", "Mindre än 1 år", "1–3 år", "Mer än 3 år"];
const availabilityOptions = ["Vardagar dagtid", "Kvällar", "Helger", "Flexibelt", "Deltid", "Heltid", "Dag och natt"];
const yesNoOptions = ["Ja", "Nej"];

type Status = "idle" | "loading" | "success" | "error";

export default function JobbPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/job-applications", {
        method: "POST",
        body: formData
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Kunde inte skicka ansökan.");
      setStatus("success");
      setMessage(result.message || "Tack! Din ansökan är skickad.");
      form?.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Kunde inte skicka ansökan just nu.");
    }
  }

  return (
    <main className="service-page-dark min-h-screen">
      <section className="service-hero relative overflow-hidden py-20 md:py-28">
        <div className="luxe-container relative grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <div>
            <Link href="/" className="service-back-link mb-10 inline-flex text-sm font-bold">← Tillbaka</Link>
            <p className="service-eyebrow text-xs font-black uppercase tracking-[.32em]">Karriär</p>
            <h1 className="service-title display mt-4 text-6xl font-bold leading-[.88] md:text-8xl">Jobba som städare hos Iboren</h1>
            <p className="service-lead mt-7 max-w-2xl text-lg leading-8 md:text-xl">Vi söker noggranna och pålitliga personer som vill arbeta med hemstädning, flyttstädning och kontorsstädning i Södertälje och Stockholm.</p>
            <div className="service-panel iboren-card-glass iboren-card-glass-hover mt-8 rounded-2xl p-5 text-sm leading-7">
              <p className="iboren-text-muted-dark flex gap-3"><BriefcaseBusiness className="iboren-gold-accent mt-1 h-5 w-5 shrink-0" /> Berätta om din erfarenhet, vilka tider du kan arbeta och i vilka områden du kan ta uppdrag. Du kan bifoga CV som PDF, DOC, DOCX eller TXT.</p>
            </div>
          </div>

          <form onSubmit={submit} className="service-panel rounded-[2rem] p-6 shadow-luxe md:p-8">
            <div className="mb-7"><p className="service-eyebrow text-xs font-black uppercase tracking-[.28em]">Ansökan</p><h2 className="display mt-2 text-4xl font-bold">Intresseanmälan</h2></div>
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Namn" name="name" required />
                <Field label="E-post" name="email" type="email" required />
                <Field label="Telefon" name="phone" required />
                <Field label="Stad / område" name="area" placeholder="Södertälje, Stockholm..." required />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Erfarenhet" name="experience" options={experienceOptions} />
                <Select label="När kan du arbeta?" name="availability" options={availabilityOptions} />
                <Select label="Körkort" name="drivingLicense" options={yesNoOptions} />
                <Select label="Tillgång till bil" name="hasCar" options={yesNoOptions} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Kan arbeta i Södertälje?" name="canWorkSodertalje" options={yesNoOptions} />
                <Select label="Kan arbeta i Stockholm?" name="canWorkStockholm" options={yesNoOptions} />
              </div>

              <Field label="Språk" name="languages" placeholder="Svenska, engelska, persiska..." />
              <Field label="Tillgängliga dagar" name="availableDays" placeholder="Måndag–fredag, helger..." />
              <Field label="Tillgängliga tider" name="availableTimes" placeholder="08:00–16:00, kvällar..." />

              <label className="block"><span className="mb-2 block text-sm font-bold text-porcelain/78">Kort presentation</span><textarea name="message" className="min-h-36 w-full rounded-2xl border border-white/10 bg-porcelain px-4 py-4 text-ink outline-none placeholder:text-ink/45 focus:border-gold focus:ring-2 focus:ring-gold/25" placeholder="Erfarenhet, tidigare jobb, referenser och tider du kan arbeta..." /></label>
              <Field label="CV eller profillänk" name="resume" placeholder="LinkedIn, Google Drive eller annan profillänk" />
              <label className="block rounded-2xl border border-dashed border-gold/30 bg-[#181917] p-4">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold text-porcelain/78"><Upload className="h-4 w-4 text-gold" /> Ladda upp CV</span>
                <input name="cv" type="file" accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" className="w-full text-sm text-porcelain/70 file:mr-4 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-2 file:text-sm file:font-bold file:text-ink" />
                <span className="mt-2 block text-xs leading-5 text-porcelain/55">Max 5 MB. PDF, DOC, DOCX eller TXT.</span>
              </label>
              <button disabled={status === "loading"} className="inline-flex items-center justify-center rounded-full bg-gold px-5 py-4 text-sm font-black uppercase tracking-[.12em] text-ink disabled:opacity-70">{status === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Skicka ansökan</button>
              {message && <p className={`rounded-2xl p-4 text-sm font-bold ${status === "success" ? "border border-gold/20 bg-gold/10 text-gold" : "bg-red-100 text-red-800"}`}>{message}</p>}
            </div>
          </form>
        </div>
      </section>

      <section className="py-16"><div className="luxe-container grid gap-5 md:grid-cols-3">{["Flexibla tider", "Tydliga uppdrag", "Södertälje & Stockholm"].map((item) => <article key={item} className="service-card iboren-card-glass iboren-card-glass-hover rounded-[2rem] p-6 shadow-soft"><CheckCircle2 className="iboren-gold-accent mb-5" /><h3 className="display text-3xl font-bold">{item}</h3><p className="iboren-text-muted-dark mt-3 leading-7">Iboren samlar information för att matcha rätt person med rätt typ av uppdrag.</p></article>)}</div></section>
    </main>
  );
}

function Field({ label, name, type = "text", required = false, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-porcelain/78">{label}</span><input name={name} type={type} required={required} placeholder={placeholder} className="w-full rounded-2xl border border-white/10 bg-porcelain px-4 py-4 text-ink outline-none placeholder:text-ink/45 focus:border-gold focus:ring-2 focus:ring-gold/25" /></label>;
}

function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-porcelain/78">{label}</span><select name={name} className="w-full rounded-2xl border border-white/10 bg-porcelain px-4 py-4 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/25">{options.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>;
}
