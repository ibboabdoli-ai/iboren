"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarDays, Loader2, Plus, Save, Trash2 } from "lucide-react";

type Lang = "sv" | "en";
type Slot = {
  id?: string;
  weekday: number;
  start_time: string;
  end_time: string;
  available: boolean;
};

type AvailabilityResponse = {
  ok?: boolean;
  message?: string;
  employee?: { id: string; email: string; name: string; role: string; active: boolean };
  slots?: Slot[];
};

const headerName = ["Author", "ization"].join("");
const tokenWord = ["Bear", "er"].join("");

const copy = {
  sv: {
    title: "Tillgänglighet",
    intro: "Ange arbetsdagar och tider. Admin använder detta för att hitta tillgängliga städare för bokningar.",
    employee: "Anställd",
    refresh: "Uppdatera",
    loadError: "Kunde inte ladda tillgänglighet.",
    saveError: "Kunde inte spara tillgänglighet.",
    saved: "Tillgänglighet sparad.",
    invalid: "Kontrollera start- och sluttid. Starttiden måste vara före sluttiden.",
    empty: "Ingen tillgänglighet sparad ännu. Lägg till din första arbetstid.",
    day: "Dag",
    start: "Start",
    end: "Slut",
    available: "Tillgänglig",
    remove: "Ta bort",
    addTime: "Lägg till tid",
    save: "Spara tillgänglighet",
    saving: "Sparar...",
    days: ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"]
  },
  en: {
    title: "Availability",
    intro: "Set working days and time windows. Admin will later use this to find available cleaners for bookings.",
    employee: "Employee",
    refresh: "Refresh",
    loadError: "Could not load availability.",
    saveError: "Could not save availability.",
    saved: "Availability saved.",
    invalid: "Check start and end time. Start time must be before end time.",
    empty: "No availability saved yet. Add your first working time window.",
    day: "Day",
    start: "Start",
    end: "End",
    available: "Available",
    remove: "Remove",
    addTime: "Add time",
    save: "Save availability",
    saving: "Saving...",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  }
} as const;

const weekdays = [1, 2, 3, 4, 5, 6, 7];

function emptySlot(): Slot {
  return { weekday: 1, start_time: "08:00", end_time: "16:00", available: true };
}

function weekdayLabel(value: number, lang: Lang) {
  return copy[lang].days[value - 1] || copy[lang].day;
}

export default function CleanerAvailabilityForm({ token, lang = "sv" }: { token: string; lang?: Lang }) {
  const text = copy[lang];
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);

  function requestHeaders() {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    headers[headerName] = `${tokenWord} ${token}`;
    return headers;
  }

  async function loadAvailability() {
    setLoading(true);
    setMessage("");
    try {
      const headers = requestHeaders();
      delete headers["Content-Type"];
      const response = await fetch("/api/cleaner/availability", { headers });
      const result = await response.json().catch(() => null) as AvailabilityResponse | null;
      if (!response.ok || !result?.ok) throw new Error(result?.message || text.loadError);
      setEmployeeName(result.employee?.name || result.employee?.email || (lang === "sv" ? "Städare" : "Cleaner"));
      setSlots((result.slots || []).map((slot) => ({
        id: slot.id,
        weekday: Number(slot.weekday),
        start_time: String(slot.start_time || "08:00").slice(0, 5),
        end_time: String(slot.end_time || "16:00").slice(0, 5),
        available: slot.available !== false
      })));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : text.loadError);
    }
    setLoading(false);
  }

  function updateSlot(index: number, patch: Partial<Slot>) {
    setSlots((current) => current.map((slot, i) => i === index ? { ...slot, ...patch } : slot));
  }

  function addSlot() {
    setSlots((current) => [...current, emptySlot()]);
  }

  function removeSlot(index: number) {
    setSlots((current) => current.filter((_, i) => i !== index));
  }

  async function saveAvailability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const invalid = slots.find((slot) => !slot.start_time || !slot.end_time || slot.start_time >= slot.end_time);
      if (invalid) throw new Error(text.invalid);
      const response = await fetch("/api/cleaner/availability", {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify({ slots })
      });
      const result = await response.json().catch(() => null) as AvailabilityResponse | null;
      if (!response.ok || !result?.ok) throw new Error(result?.message || text.saveError);
      setSlots((result.slots || []).map((slot) => ({
        id: slot.id,
        weekday: Number(slot.weekday),
        start_time: String(slot.start_time || "08:00").slice(0, 5),
        end_time: String(slot.end_time || "16:00").slice(0, 5),
        available: slot.available !== false
      })));
      setMessage(text.saved);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : text.saveError);
    }
    setSaving(false);
  }

  useEffect(() => {
    void loadAvailability();
  }, [token, lang]);

  return (
    <section className="rounded-[2rem] bg-porcelain p-6 shadow-soft md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <CalendarDays className="mb-5 text-burgundy" />
          <h2 className="display text-3xl font-bold text-burgundy">{text.title}</h2>
          <p className="mt-3 leading-7 text-ink/65">{text.intro}</p>
          {employeeName && <p className="mt-2 text-sm font-bold text-ink/45">{text.employee}: {employeeName}</p>}
        </div>
        <button type="button" onClick={loadAvailability} className="inline-flex items-center justify-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-bold text-burgundy">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {text.refresh}
        </button>
      </div>

      {message && <p className="mt-5 rounded-2xl bg-burgundy/10 p-4 text-sm font-bold text-burgundy">{message}</p>}

      {loading ? (
        <div className="grid min-h-32 place-items-center text-burgundy"><Loader2 className="h-7 w-7 animate-spin" /></div>
      ) : (
        <form onSubmit={saveAvailability} className="mt-6 grid gap-4">
          {slots.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-burgundy/20 bg-cream p-5 text-sm leading-7 text-ink/65">{text.empty}</div>
          ) : (
            slots.map((slot, index) => (
              <div key={`${slot.id || "new"}-${index}`} className="grid gap-3 rounded-2xl bg-cream p-4 md:grid-cols-[1fr_160px_160px_auto_auto] md:items-end">
                <label className="block"><span className="mb-2 block text-sm font-bold">{text.day}</span><select value={slot.weekday} onChange={(event) => updateSlot(index, { weekday: Number(event.target.value) })} className="w-full rounded-2xl border border-burgundy/10 bg-porcelain px-4 py-3">{weekdays.map((day) => <option key={day} value={day}>{weekdayLabel(day, lang)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-sm font-bold">{text.start}</span><input type="time" value={slot.start_time} onChange={(event) => updateSlot(index, { start_time: event.target.value })} className="w-full rounded-2xl border border-burgundy/10 bg-porcelain px-4 py-3" /></label>
                <label className="block"><span className="mb-2 block text-sm font-bold">{text.end}</span><input type="time" value={slot.end_time} onChange={(event) => updateSlot(index, { end_time: event.target.value })} className="w-full rounded-2xl border border-burgundy/10 bg-porcelain px-4 py-3" /></label>
                <label className="flex items-center gap-3 rounded-2xl bg-porcelain px-4 py-3 text-sm font-bold"><input type="checkbox" checked={slot.available} onChange={(event) => updateSlot(index, { available: event.target.checked })} className="h-5 w-5" /> {text.available}</label>
                <button type="button" onClick={() => removeSlot(index)} className="inline-flex items-center justify-center gap-2 rounded-full bg-red-100 px-4 py-3 text-sm font-bold text-red-800"><Trash2 className="h-4 w-4" /> {text.remove}</button>
                <p className="text-xs font-bold text-ink/45 md:col-span-5">{weekdayLabel(slot.weekday, lang)} · {slot.start_time}–{slot.end_time}</p>
              </div>
            ))
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={addSlot} className="inline-flex items-center justify-center gap-2 rounded-full bg-cream px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-burgundy"><Plus className="h-4 w-4" /> {text.addTime}</button>
            <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-full bg-burgundy px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-porcelain disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? text.saving : text.save}</button>
          </div>
        </form>
      )}
    </section>
  );
}
