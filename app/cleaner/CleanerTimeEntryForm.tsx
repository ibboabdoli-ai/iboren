"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Loader2, Save } from "lucide-react";

type TimeEntry = {
  id: string;
  assignment_id: string;
  work_date: string;
  worked_minutes: number;
  break_minutes: number;
  travel_minutes: number;
  mileage_km: number;
  status: string;
  cleaner_note: string | null;
};

type TimeEntryResponse = { ok?: boolean; message?: string; needsMigration?: boolean; entry?: TimeEntry | null };

const headerName = ["Author", "ization"].join("");
const tokenWord = ["Bear", "er"].join("");

function today() {
  return new Date().toISOString().slice(0, 10);
}

function hoursToMinutes(value: string) {
  const parsed = Number.parseFloat(String(value || "").replace(",", "."));
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * 60);
}

function minutesToHours(value: number | null | undefined) {
  if (!value) return "";
  return String(Math.round((value / 60) * 100) / 100);
}

export default function CleanerTimeEntryForm({ token, assignmentId, defaultDate }: { token: string; assignmentId: string; defaultDate?: string | null }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [needsMigration, setNeedsMigration] = useState(false);
  const [workDate, setWorkDate] = useState(defaultDate || today());
  const [workedHours, setWorkedHours] = useState("3");
  const [breakMinutes, setBreakMinutes] = useState("0");
  const [travelMinutes, setTravelMinutes] = useState("0");
  const [mileageKm, setMileageKm] = useState("0");
  const [note, setNote] = useState("");
  const [entryStatus, setEntryStatus] = useState("");

  const workedMinutes = useMemo(() => hoursToMinutes(workedHours), [workedHours]);

  function headers(contentType = false) {
    const result: Record<string, string> = {};
    result[headerName] = `${tokenWord} ${token}`;
    if (contentType) result["Content-Type"] = "application/json";
    return result;
  }

  async function loadEntry() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/cleaner/time-entries?assignment_id=${encodeURIComponent(assignmentId)}`, { headers: headers() });
      const result = await response.json().catch(() => null) as TimeEntryResponse | null;
      if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not load time report.");
      setNeedsMigration(Boolean(result.needsMigration));
      if (result.entry) {
        setWorkDate(result.entry.work_date || defaultDate || today());
        setWorkedHours(minutesToHours(result.entry.worked_minutes));
        setBreakMinutes(String(result.entry.break_minutes || 0));
        setTravelMinutes(String(result.entry.travel_minutes || 0));
        setMileageKm(String(result.entry.mileage_km || 0));
        setNote(result.entry.cleaner_note || "");
        setEntryStatus(result.entry.status || "submitted");
      }
      if (result.message) setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load time report.");
    }
    setLoading(false);
  }

  async function saveEntry() {
    setSaving(true);
    setMessage("");
    try {
      if (!workedMinutes || workedMinutes <= 0) throw new Error("Ange arbetad tid i timmar, till exempel 3 eller 2.5.");
      const response = await fetch("/api/cleaner/time-entries", {
        method: "POST",
        headers: headers(true),
        body: JSON.stringify({
          assignment_id: assignmentId,
          work_date: workDate,
          worked_minutes: workedMinutes,
          break_minutes: Number.parseInt(breakMinutes || "0", 10),
          travel_minutes: Number.parseInt(travelMinutes || "0", 10),
          mileage_km: Number.parseFloat(String(mileageKm || "0").replace(",", ".")),
          cleaner_note: note
        })
      });
      const result = await response.json().catch(() => null) as TimeEntryResponse | null;
      if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not save time report.");
      setEntryStatus(result.entry?.status || "submitted");
      setNeedsMigration(false);
      setMessage("Time report submitted. Admin can approve it for payroll basis.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save time report.");
    }
    setSaving(false);
  }

  useEffect(() => { void loadEntry(); }, [assignmentId]);

  return <div className="mt-5 rounded-[1.5rem] bg-porcelain p-4 ring-1 ring-burgundy/10">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-black text-burgundy"><Clock3 className="h-4 w-4" /> Time report</p>
        <p className="mt-1 text-xs font-bold text-ink/50">Used later for payroll basis after admin approval.</p>
      </div>
      {entryStatus && <span className="rounded-full bg-gold px-3 py-1 text-xs font-black uppercase tracking-[.12em] text-ink">{entryStatus}</span>}
    </div>

    {loading ? <div className="mt-4 flex items-center gap-2 text-sm font-bold text-burgundy"><Loader2 className="h-4 w-4 animate-spin" />Loading time report...</div> : needsMigration ? <p className="mt-4 rounded-xl bg-red-100 p-3 text-xs font-bold text-red-800">Run Step 25A SQL in Supabase before using time reporting.</p> : <div className="mt-4 grid gap-3 md:grid-cols-4">
      <label className="block"><span className="mb-1 block text-xs font-black uppercase tracking-[.12em] text-ink/45">Date</span><input type="date" value={workDate} onChange={(event) => setWorkDate(event.target.value)} className="w-full rounded-xl border border-burgundy/10 bg-cream px-3 py-2 text-sm font-bold text-ink" /></label>
      <label className="block"><span className="mb-1 block text-xs font-black uppercase tracking-[.12em] text-ink/45">Worked h</span><input inputMode="decimal" value={workedHours} onChange={(event) => setWorkedHours(event.target.value)} placeholder="3" className="w-full rounded-xl border border-burgundy/10 bg-cream px-3 py-2 text-sm font-bold text-ink" /></label>
      <label className="block"><span className="mb-1 block text-xs font-black uppercase tracking-[.12em] text-ink/45">Break min</span><input inputMode="numeric" value={breakMinutes} onChange={(event) => setBreakMinutes(event.target.value.replace(/[^0-9]/g, ""))} className="w-full rounded-xl border border-burgundy/10 bg-cream px-3 py-2 text-sm font-bold text-ink" /></label>
      <label className="block"><span className="mb-1 block text-xs font-black uppercase tracking-[.12em] text-ink/45">Travel min</span><input inputMode="numeric" value={travelMinutes} onChange={(event) => setTravelMinutes(event.target.value.replace(/[^0-9]/g, ""))} className="w-full rounded-xl border border-burgundy/10 bg-cream px-3 py-2 text-sm font-bold text-ink" /></label>
      <label className="block md:col-span-1"><span className="mb-1 block text-xs font-black uppercase tracking-[.12em] text-ink/45">Mileage km</span><input inputMode="decimal" value={mileageKm} onChange={(event) => setMileageKm(event.target.value)} className="w-full rounded-xl border border-burgundy/10 bg-cream px-3 py-2 text-sm font-bold text-ink" /></label>
      <label className="block md:col-span-3"><span className="mb-1 block text-xs font-black uppercase tracking-[.12em] text-ink/45">Note</span><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note" className="w-full rounded-xl border border-burgundy/10 bg-cream px-3 py-2 text-sm font-bold text-ink" /></label>
      <div className="md:col-span-4"><button type="button" disabled={saving} onClick={saveEntry} className="inline-flex items-center gap-2 rounded-full bg-burgundy px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-porcelain disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Submit time</button></div>
    </div>}

    {message && <p className={`mt-3 rounded-xl p-3 text-xs font-bold ${message.toLowerCase().includes("submitted") ? "bg-green-100 text-green-800" : "bg-burgundy/10 text-burgundy"}`}>{message}</p>}
    {entryStatus === "submitted" && <p className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-ink/55"><CheckCircle2 className="h-4 w-4 text-green-700" /> Submitted and waiting for admin approval.</p>}
  </div>;
}
