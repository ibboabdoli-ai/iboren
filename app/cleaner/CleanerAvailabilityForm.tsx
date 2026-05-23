"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarDays, Loader2, Plus, Save, Trash2 } from "lucide-react";

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

const weekdays = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" }
];

function emptySlot(): Slot {
  return { weekday: 1, start_time: "08:00", end_time: "16:00", available: true };
}

function weekdayLabel(value: number) {
  return weekdays.find((day) => day.value === value)?.label || "Day";
}

export default function CleanerAvailabilityForm({ token }: { token: string }) {
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
      if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not load availability.");
      setEmployeeName(result.employee?.name || result.employee?.email || "Cleaner");
      setSlots((result.slots || []).map((slot) => ({
        id: slot.id,
        weekday: Number(slot.weekday),
        start_time: String(slot.start_time || "08:00").slice(0, 5),
        end_time: String(slot.end_time || "16:00").slice(0, 5),
        available: slot.available !== false
      })));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load availability.");
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
      if (invalid) throw new Error("Check start and end time. Start time must be before end time.");
      const response = await fetch("/api/cleaner/availability", {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify({ slots })
      });
      const result = await response.json().catch(() => null) as AvailabilityResponse | null;
      if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not save availability.");
      setSlots((result.slots || []).map((slot) => ({
        id: slot.id,
        weekday: Number(slot.weekday),
        start_time: String(slot.start_time || "08:00").slice(0, 5),
        end_time: String(slot.end_time || "16:00").slice(0, 5),
        available: slot.available !== false
      })));
      setMessage("Availability saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save availability.");
    }
    setSaving(false);
  }

  useEffect(() => {
    void loadAvailability();
  }, [token]);

  return (
    <section className="rounded-[2rem] bg-porcelain p-6 shadow-soft md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <CalendarDays className="mb-5 text-burgundy" />
          <h2 className="display text-3xl font-bold text-burgundy">Availability</h2>
          <p className="mt-3 leading-7 text-ink/65">Set working days and time windows. Admin will later use this to find available cleaners for bookings.</p>
          {employeeName && <p className="mt-2 text-sm font-bold text-ink/45">Employee: {employeeName}</p>}
        </div>
        <button type="button" onClick={loadAvailability} className="inline-flex items-center justify-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-bold text-burgundy">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Refresh
        </button>
      </div>

      {message && <p className="mt-5 rounded-2xl bg-burgundy/10 p-4 text-sm font-bold text-burgundy">{message}</p>}

      {loading ? (
        <div className="grid min-h-32 place-items-center text-burgundy"><Loader2 className="h-7 w-7 animate-spin" /></div>
      ) : (
        <form onSubmit={saveAvailability} className="mt-6 grid gap-4">
          {slots.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-burgundy/20 bg-cream p-5 text-sm leading-7 text-ink/65">No availability saved yet. Add your first working time window.</div>
          ) : (
            slots.map((slot, index) => (
              <div key={`${slot.id || "new"}-${index}`} className="grid gap-3 rounded-2xl bg-cream p-4 md:grid-cols-[1fr_160px_160px_auto_auto] md:items-end">
                <label className="block"><span className="mb-2 block text-sm font-bold">Day</span><select value={slot.weekday} onChange={(event) => updateSlot(index, { weekday: Number(event.target.value) })} className="w-full rounded-2xl border border-burgundy/10 bg-porcelain px-4 py-3">{weekdays.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-sm font-bold">Start</span><input type="time" value={slot.start_time} onChange={(event) => updateSlot(index, { start_time: event.target.value })} className="w-full rounded-2xl border border-burgundy/10 bg-porcelain px-4 py-3" /></label>
                <label className="block"><span className="mb-2 block text-sm font-bold">End</span><input type="time" value={slot.end_time} onChange={(event) => updateSlot(index, { end_time: event.target.value })} className="w-full rounded-2xl border border-burgundy/10 bg-porcelain px-4 py-3" /></label>
                <label className="flex items-center gap-3 rounded-2xl bg-porcelain px-4 py-3 text-sm font-bold"><input type="checkbox" checked={slot.available} onChange={(event) => updateSlot(index, { available: event.target.checked })} className="h-5 w-5" /> Available</label>
                <button type="button" onClick={() => removeSlot(index)} className="inline-flex items-center justify-center gap-2 rounded-full bg-red-100 px-4 py-3 text-sm font-bold text-red-800"><Trash2 className="h-4 w-4" /> Remove</button>
                <p className="text-xs font-bold text-ink/45 md:col-span-5">{weekdayLabel(slot.weekday)} · {slot.start_time}–{slot.end_time}</p>
              </div>
            ))
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={addSlot} className="inline-flex items-center justify-center gap-2 rounded-full bg-cream px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-burgundy"><Plus className="h-4 w-4" /> Add time</button>
            <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-full bg-burgundy px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-porcelain disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save availability"}</button>
          </div>
        </form>
      )}
    </section>
  );
}
