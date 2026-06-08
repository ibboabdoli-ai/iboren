"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, Loader2, Send, Upload } from "lucide-react";

const experienceOptions = ["No experience", "Less than 1 year", "1–3 years", "More than 3 years"];
const availabilityOptions = ["Weekdays daytime", "Evenings", "Weekends", "Flexible", "Part-time", "Full-time", "Day and night"];
const yesNoOptions = ["Yes", "No"];

type Status = "idle" | "loading" | "success" | "error";

function normalizeJobMessage(message: string) {
  if (message.includes("Kunde inte skicka ansökan")) return "Could not send the application.";
  if (message.includes("Tack! Din ansökan är skickad")) return "Thank you. Your application has been sent.";
  return message;
}

export default function EnglishJobsPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("language", "en");

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/job-applications", {
        method: "POST",
        body: formData
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Could not send the application.");
      setStatus("success");
      setMessage(normalizeJobMessage(result.message || "Thank you. Your application has been sent."));
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? normalizeJobMessage(error.message) : "Could not send the application right now.");
    }
  }

  return (
    <main className="service-page-dark min-h-screen bg-cream text-ink">
      <section className="service-hero relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <div>
            <Link href="/en" className="service-back-link mb-10 inline-flex text-sm font-bold text-burgundy">← Back</Link>
            <p className="service-eyebrow eyebrow">Career</p>
            <h1 className="service-title display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">Work as a cleaner with Iboren</h1>
            <p className="service-lead mt-7 max-w-2xl text-lg leading-8 text-ink/75 md:text-xl">We are looking for careful and reliable people who want to work with home cleaning, move-out cleaning and office cleaning in Södertälje and Stockholm.</p>
            <div className="service-panel iboren-card-glass iboren-card-glass-hover mt-8 rounded-2xl p-5 text-sm leading-7">
              <p className="iboren-text-muted-dark flex gap-3"><BriefcaseBusiness className="iboren-gold-accent mt-1 h-5 w-5 shrink-0" /> Tell us about your experience, when you can work and in which areas you can take assignments. You can attach a CV as PDF, DOC, DOCX or TXT.</p>
            </div>
          </div>

          <form onSubmit={submit} className="service-panel rounded-[2rem] border border-burgundy/10 bg-porcelain p-6 shadow-luxe md:p-8">
            <div className="mb-7"><p className="text-xs font-black uppercase tracking-[.28em] text-burgundy">Application</p><h2 className="display mt-2 text-4xl font-bold text-burgundy">Interest application</h2></div>
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" name="name" required />
                <Field label="Email" name="email" type="email" required />
                <Field label="Phone" name="phone" required />
                <Field label="City / area" name="area" placeholder="Södertälje, Stockholm..." required />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Experience" name="experience" options={experienceOptions} />
                <Select label="When can you work?" name="availability" options={availabilityOptions} />
                <Select label="Driving licence" name="drivingLicense" options={yesNoOptions} />
                <Select label="Access to car" name="hasCar" options={yesNoOptions} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Can work in Södertälje?" name="canWorkSodertalje" options={yesNoOptions} />
                <Select label="Can work in Stockholm?" name="canWorkStockholm" options={yesNoOptions} />
              </div>

              <Field label="Languages" name="languages" placeholder="Swedish, English, Persian..." />
              <Field label="Available days" name="availableDays" placeholder="Monday–Friday, weekends..." />
              <Field label="Available times" name="availableTimes" placeholder="08:00–16:00, evenings..." />

              <label className="block"><span className="mb-2 block text-sm font-bold">Short presentation</span><textarea name="message" className="min-h-36 w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4" placeholder="Experience, previous jobs, references and times you can work..." /></label>
              <Field label="CV or profile link" name="resume" placeholder="LinkedIn, Google Drive or another profile link" />
              <label className="block rounded-2xl border border-dashed border-burgundy/25 bg-cream p-4">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold"><Upload className="h-4 w-4 text-burgundy" /> Upload CV</span>
                <input name="cv" type="file" accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" className="w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-burgundy file:px-4 file:py-2 file:text-sm file:font-bold file:text-porcelain" />
                <span className="mt-2 block text-xs leading-5 text-ink/60">Max 5 MB. PDF, DOC, DOCX or TXT.</span>
              </label>
              <button disabled={status === "loading"} className="inline-flex items-center justify-center rounded-full bg-burgundy px-5 py-4 text-sm font-black uppercase tracking-[.12em] text-porcelain disabled:opacity-70">{status === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Send application</button>
              {message && <p className={`rounded-2xl p-4 text-sm font-bold ${status === "success" ? "bg-burgundy/10 text-burgundy" : "bg-red-100 text-red-800"}`}>{message}</p>}
            </div>
          </form>
        </div>
      </section>

      <section className="bg-porcelain py-16"><div className="luxe-container grid gap-5 md:grid-cols-3">{["Flexible hours", "Clear assignments", "Södertälje & Stockholm"].map((item) => <article key={item} className="service-card iboren-card-glass iboren-card-glass-hover rounded-[2rem] p-6 shadow-soft"><CheckCircle2 className="iboren-gold-accent mb-5" /><h3 className="display text-3xl font-bold">{item}</h3><p className="iboren-text-muted-dark mt-3 leading-7">Iboren collects information to match the right person with the right type of assignment.</p></article>)}</div></section>
    </main>
  );
}

function Field({ label, name, type = "text", required = false, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><input name={name} type={type} required={required} placeholder={placeholder} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4" /></label>;
}

function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><select name={name} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4">{options.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>;
}
