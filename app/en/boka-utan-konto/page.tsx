"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type Draft = {
  service: string;
  area: string;
  address: string;
  size: string;
  date: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
};

const initial: Draft = {
  service: "Home cleaning",
  area: "Södertälje",
  address: "",
  size: "",
  date: "",
  name: "",
  email: "",
  phone: "",
  notes: ""
};

const services = ["Home cleaning", "Move-out cleaning", "Office cleaning", "Window cleaning"];

export default function EnglishPublicBookingRequestPage() {
  const [draft, setDraft] = useState<Draft>(initial);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function setField<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("Sending your request...");

    const summary = [
      `Service: ${draft.service}`,
      `Area: ${draft.area}`,
      `Address: ${draft.address}`,
      `Size: ${draft.size} sqm`,
      `Date: ${draft.date}`,
      `Name: ${draft.name}`,
      `Email: ${draft.email}`,
      `Phone: ${draft.phone}`,
      `Message: ${draft.notes || "-"}`
    ].join("\n");

    try {
      const response = await fetch("/api/public-booking-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: draft.service,
          area: draft.area,
          address: draft.address,
          size: draft.size,
          frequency: "One-time",
          date: draft.date,
          timeWindow: "Flexible",
          name: draft.name,
          email: draft.email,
          phone: draft.phone,
          notes: summary,
          customerType: draft.service === "Office cleaning" ? "Company" : "Private customer",
          rutRequested: draft.service !== "Office cleaning",
          language: "en"
        })
      });

      const result = await response.json().catch(() => null) as { ok?: boolean; message?: string } | null;
      if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not send the request right now.");
      setStatus("success");
      setMessage("Thank you. Your request has been sent. We always confirm time and price before the booking becomes binding.");
      setDraft(initial);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not send the request right now.");
    }
  }

  return (
    <main className="min-h-screen bg-cream px-5 py-12 text-ink md:py-20">
      <div className="luxe-container grid gap-8 lg:grid-cols-[.82fr_1.18fr]">
        <section className="rounded-[2rem] border border-burgundy/10 bg-porcelain p-7 shadow-soft md:p-9">
          <p className="text-xs font-black uppercase tracking-[.28em] text-burgundy/60">Booking request</p>
          <h1 className="display mt-4 text-5xl font-normal uppercase leading-[.92] text-burgundy md:text-7xl">Send a request without an account.</h1>
          <p className="mt-6 text-base leading-8 text-ink/70">Fill in your details and Iboren will get back to you with time and price. This is not a confirmed booking.</p>
          <p className="mt-5 rounded-2xl border border-gold/25 bg-gold/10 px-4 py-3 text-sm font-bold text-burgundy">We always confirm time and price before the booking becomes binding.</p>
          <p className="mt-7 text-sm text-ink/65"><Link href="/boka-utan-konto" className="font-bold text-burgundy underline">Svenska versionen</Link></p>
        </section>

        <form onSubmit={submit} className="rounded-[2rem] border border-burgundy/10 bg-porcelain p-5 shadow-soft md:p-7">
          <div className="mb-6"><p className="text-xs font-black uppercase tracking-[.28em] text-burgundy/60">Step 1 / Request</p><h2 className="display mt-2 text-3xl font-normal uppercase text-burgundy">Your details</h2></div>
          <div className="grid gap-4">
            <label className="block"><span className="mb-2 block text-sm font-bold text-ink/75">Service</span><select value={draft.service} onChange={(event) => setField("service", event.target.value)} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4 text-ink outline-none focus:border-burgundy">{services.map((service) => <option key={service} value={service}>{service}</option>)}</select></label>
            <Field label="Area / city" value={draft.area} onChange={(value) => setField("area", value)} placeholder="Södertälje" />
            <Field label="Address" value={draft.address} onChange={(value) => setField("address", value)} placeholder="Street address and number" />
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Size sqm" value={draft.size} onChange={(value) => setField("size", value.replace(/[^0-9]/g, ""))} placeholder="75" /><Field label="Preferred date" type="date" value={draft.date} onChange={(value) => setField("date", value)} /></div>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Name" value={draft.name} onChange={(value) => setField("name", value)} placeholder="First and last name" /><Field label="Email" type="email" value={draft.email} onChange={(value) => setField("email", value)} placeholder="name@email.se" /></div>
            <Field label="Phone" type="tel" value={draft.phone} onChange={(value) => setField("phone", value)} placeholder="+46 ..." />
            <label className="block"><span className="mb-2 block text-sm font-bold text-ink/75">Message</span><textarea value={draft.notes} onChange={(event) => setField("notes", event.target.value)} className="min-h-28 w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4 text-ink outline-none focus:border-burgundy" placeholder="Special requests..." /></label>
            <button disabled={status === "loading"} className="btn-primary w-full bg-burgundy text-porcelain hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60">{status === "loading" ? "Sending..." : "Send request"}</button>
            {message && <p className={`rounded-2xl px-4 py-3 text-sm ${status === "success" ? "bg-green-100 text-green-800" : status === "error" ? "bg-red-100 text-red-800" : "bg-burgundy/5 text-ink/70"}`}>{message}</p>}
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-ink/75">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4 text-ink outline-none focus:border-burgundy" /></label>;
}
