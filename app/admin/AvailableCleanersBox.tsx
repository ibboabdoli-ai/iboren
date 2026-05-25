"use client";

import { useEffect, useMemo, useState } from "react";
import { Car, CheckCircle2, Clock3, Loader2, Phone, RefreshCw, Save, Send, UserCheck, UsersRound, XCircle } from "lucide-react";

type Suggestion = { employee: { id: string; email: string; name: string; phone: string | null; has_car: boolean; max_hours_per_day: number }; slots: Array<{ id: string; start_time: string; end_time: string; weekday: number }>; matchesService: boolean; matchesArea: boolean; score: number };
type Offer = { assignment: { id: string; employee_id: string; status: string; updated_at: string }; employee: Suggestion["employee"] | null };
type SuggestionsResponse = { ok?: boolean; message?: string; weekday?: number; suggestions?: Suggestion[] };
type CleanerEmailResult = { sent?: boolean; skipped?: boolean; reason?: string | null };
type OffersResponse = { ok?: boolean; message?: string; offers?: Offer[]; assignment?: Offer["assignment"]; employee?: Suggestion["employee"] | null; cleanerEmail?: CleanerEmailResult };
type CloseResponse = { ok?: boolean; message?: string; count?: number; emails?: Array<{ to: string; sent: boolean; skipped: boolean; reason: string | null }> };
type CrewResponse = { ok?: boolean; message?: string; cleaners_needed?: number; needsMigration?: boolean; estimated_hours?: number; suggested_cleaners?: number; hours_per_cleaner?: number };

const headerName = ["Author", "ization"].join("");
const tokenWord = ["Bear", "er"].join("");
const weekdays: Record<number, string> = { 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday", 7: "Sunday" };

function formatTime(value: string) { return String(value || "").slice(0, 5); }
function statusClass(status: string | null) { if (status === "accepted") return "bg-green-100 text-green-800 ring-1 ring-green-200"; if (status === "confirmed" || status === "completed") return "bg-ink text-porcelain ring-1 ring-ink/15"; if (status === "declined" || status === "not_selected") return "bg-red-100 text-red-800 ring-1 ring-red-200"; return "bg-gold text-ink ring-1 ring-gold/30"; }
function statusLabel(status: string | null) { if (status === "accepted") return "Available"; if (status === "confirmed") return "Confirmed"; if (status === "declined") return "Not available"; if (status === "completed") return "Completed"; if (status === "not_selected") return "Not selected"; return "Offer sent"; }
function statusHint(status: string | null) { if (status === "accepted") return "Cleaner has answered yes. Confirm to select."; if (status === "confirmed") return "Selected by admin."; if (status === "completed") return "Job completed."; if (status === "declined") return "Cleaner cannot take this job."; if (status === "not_selected") return "Closed after another cleaner was selected."; return "Waiting for cleaner response."; }
function offerMessage(employee: Suggestion["employee"], email?: CleanerEmailResult) { if (email?.sent) return `Offer sent to ${employee.name}. Email sent to ${employee.email}.`; if (email?.skipped) return `Offer saved for ${employee.name}. Email was not sent: ${email.reason || "skipped"}.`; if (email && email.sent === false) return `Offer saved for ${employee.name}. Email failed: ${email.reason || "unknown error"}.`; return `Offer saved for ${employee.name}.`; }
function confirmMessage(employee: Suggestion["employee"] | null | undefined, email?: CleanerEmailResult) { const name = employee?.name || "cleaner"; if (email?.sent) return `${name} confirmed. Confirmation email sent.`; if (email?.skipped) return `${name} confirmed. Email was not sent: ${email.reason || "skipped"}.`; if (email && email.sent === false) return `${name} confirmed. Email failed: ${email.reason || "unknown error"}.`; return `${name} confirmed.`; }
function closeMessage(result: CloseResponse | null) { const count = result?.count || 0; const sent = (result?.emails || []).filter((email) => email.sent).length; if (!count) return result?.message || "No remaining offers to close."; return `Closed ${count} remaining offers. Emails sent: ${sent}.`; }
function offerOrder(status: string | null) { if (status === "confirmed") return 0; if (status === "completed") return 1; if (status === "accepted") return 2; if (status === "assigned") return 3; if (status === "declined") return 5; if (status === "not_selected") return 6; return 4; }

export default function AvailableCleanersBox({ bookingId, getToken }: { bookingId: string; getToken: () => Promise<string | null> }) {
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [savingCrew, setSavingCrew] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [weekday, setWeekday] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [cleanersNeeded, setCleanersNeeded] = useState(1);
  const [crewMigrationNeeded, setCrewMigrationNeeded] = useState(false);
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [suggestedCleaners, setSuggestedCleaners] = useState(1);
  const [hoursPerCleaner, setHoursPerCleaner] = useState(0);

  async function authHeaders(contentType = false) { const token = await getToken(); if (!token) throw new Error("Du behöver logga in igen."); const headers: Record<string, string> = {}; headers[headerName] = `${tokenWord} ${token}`; if (contentType) headers["Content-Type"] = "application/json"; return headers; }
  function applyCrew(result: CrewResponse | null) { setCleanersNeeded(result?.cleaners_needed || 1); setCrewMigrationNeeded(Boolean(result?.needsMigration)); setEstimatedHours(result?.estimated_hours || 0); setSuggestedCleaners(result?.suggested_cleaners || 1); setHoursPerCleaner(result?.hours_per_cleaner || 0); if (result?.needsMigration && result.message) setMessage(result.message); }
  async function loadCrew() { const headers = await authHeaders(false); const response = await fetch(`/api/admin/bookings/${bookingId}/crew`, { headers }); const result = await response.json().catch(() => null) as CrewResponse | null; if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not load cleaners needed."); applyCrew(result); }
  async function loadOffers() { const headers = await authHeaders(false); const response = await fetch(`/api/admin/bookings/${bookingId}/offers`, { headers }); const result = await response.json().catch(() => null) as OffersResponse | null; if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not load offers."); setOffers(result.offers || []); }
  async function loadSuggestions() { setLoading(true); setMessage(""); try { const headers = await authHeaders(false); const response = await fetch(`/api/admin/bookings/${bookingId}/available-cleaners`, { headers }); const result = await response.json().catch(() => null) as SuggestionsResponse | null; if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not load available cleaners."); setWeekday(typeof result.weekday === "number" ? result.weekday : null); setSuggestions(result.suggestions || []); await loadOffers(); await loadCrew(); setLoaded(true); if (result.message) setMessage(result.message); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not load available cleaners."); } setLoading(false); }
  async function saveCrewNeeded() { setSavingCrew(true); setMessage(""); try { const headers = await authHeaders(true); const response = await fetch(`/api/admin/bookings/${bookingId}/crew`, { method: "PATCH", headers, body: JSON.stringify({ cleaners_needed: cleanersNeeded }) }); const result = await response.json().catch(() => null) as CrewResponse | null; if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not save cleaners needed."); applyCrew(result); setCrewMigrationNeeded(false); setMessage(`Cleaners needed saved: ${result.cleaners_needed || cleanersNeeded}.`); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save cleaners needed."); } setSavingCrew(false); }
  async function sendOffer(employee: Suggestion["employee"]) { setSendingId(employee.id); setMessage(""); try { const headers = await authHeaders(true); const response = await fetch(`/api/admin/bookings/${bookingId}/offers`, { method: "POST", headers, body: JSON.stringify({ employee_id: employee.id }) }); const result = await response.json().catch(() => null) as OffersResponse | null; if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not send offer."); setOffers(result.offers || []); setMessage(offerMessage(result.employee || employee, result.cleanerEmail)); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not send offer."); } setSendingId(null); }
  async function confirmOffer(offer: Offer) { setConfirmingId(offer.assignment.id); setMessage(""); try { const headers = await authHeaders(true); const response = await fetch(`/api/admin/bookings/${bookingId}/offers`, { method: "PATCH", headers, body: JSON.stringify({ assignment_id: offer.assignment.id, status: "confirmed" }) }); const result = await response.json().catch(() => null) as OffersResponse | null; if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not confirm cleaner."); setOffers(result.offers || []); setMessage(confirmMessage(result.employee || offer.employee, result.cleanerEmail)); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not confirm cleaner."); } setConfirmingId(null); }
  async function closeRemainingOffers() { setClosing(true); setMessage(""); try { const headers = await authHeaders(false); const response = await fetch(`/api/admin/bookings/${bookingId}/offers/close-remaining`, { method: "POST", headers }); const result = await response.json().catch(() => null) as CloseResponse | null; if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not close remaining offers."); setMessage(closeMessage(result)); await loadOffers(); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not close remaining offers."); } setClosing(false); }

  useEffect(() => { void loadSuggestions(); }, [bookingId]);

  const confirmedOffers = offers.filter((offer) => ["confirmed", "completed"].includes(offer.assignment.status));
  const confirmedCount = confirmedOffers.length;
  const completedCount = offers.filter((offer) => offer.assignment.status === "completed").length;
  const availableCount = offers.filter((offer) => offer.assignment.status === "accepted").length;
  const sentCount = offers.filter((offer) => ["assigned", "accepted", "confirmed", "completed"].includes(offer.assignment.status)).length;
  const remainingNeeded = Math.max(cleanersNeeded - confirmedCount, 0);
  const hasConfirmed = confirmedCount > 0;
  const hasRemaining = offers.some((offer) => ["assigned", "accepted"].includes(offer.assignment.status));
  const sortedOffers = useMemo(() => [...offers].sort((a, b) => offerOrder(a.assignment.status) - offerOrder(b.assignment.status)), [offers]);
  const sortedSuggestions = useMemo(() => [...suggestions].sort((a, b) => {
    const offerA = offers.find((item) => item.assignment.employee_id === a.employee.id);
    const offerB = offers.find((item) => item.assignment.employee_id === b.employee.id);
    const orderA = offerA ? offerOrder(offerA.assignment.status) : 4;
    const orderB = offerB ? offerOrder(offerB.assignment.status) : 4;
    if (orderA !== orderB) return orderA - orderB;
    return b.score - a.score;
  }), [suggestions, offers]);

  return <div className="mt-4 rounded-[2rem] bg-porcelain p-4 text-sm shadow-sm ring-1 ring-burgundy/10 md:p-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="inline-flex items-center gap-2 font-black text-burgundy"><UsersRound className="h-4 w-4" /> Cleaner assignment</p>
        <p className="mt-1 text-xs font-bold text-ink/45">{weekday ? `${weekdays[weekday]} · available candidates and active offers` : "Booking date · available candidates and active offers"}</p>
      </div>
      <button type="button" onClick={loadSuggestions} className="inline-flex items-center justify-center gap-2 rounded-full bg-cream px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-burgundy">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}Refresh</button>
    </div>

    <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryPill label="Needed" value={cleanersNeeded} tone="default" />
      <SummaryPill label="Confirmed" value={`${confirmedCount}/${cleanersNeeded}`} tone={confirmedCount >= cleanersNeeded ? "dark" : "default"} />
      <SummaryPill label="Remaining" value={remainingNeeded} tone={remainingNeeded ? "gold" : "dark"} />
      <SummaryPill label="Available replies" value={availableCount} tone="green" />
      <SummaryPill label="Offers sent" value={sentCount} tone="gold" />
    </div>

    <div className="mt-3 rounded-2xl bg-cream p-3 ring-1 ring-burgundy/10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-ink/45">Crew planning</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[.12em]"><span className="rounded-full bg-porcelain px-3 py-1 text-ink/70">Est. {estimatedHours || "—"}h</span><span className="rounded-full bg-porcelain px-3 py-1 text-ink/70">System suggests {suggestedCleaners}</span><span className="rounded-full bg-porcelain px-3 py-1 text-ink/70">{hoursPerCleaner || "—"}h/cleaner</span></div>
        </div>
        <div className="flex flex-wrap items-center gap-2"><label className="text-xs font-black uppercase tracking-[.12em] text-ink/45">Cleaners needed</label><input type="number" min={1} max={20} value={cleanersNeeded} onChange={(event) => setCleanersNeeded(Number(event.target.value))} className="w-20 rounded-xl border border-burgundy/10 bg-porcelain px-3 py-2 text-sm font-bold text-ink" /><button type="button" disabled={savingCrew || crewMigrationNeeded} onClick={saveCrewNeeded} className="inline-flex items-center gap-2 rounded-full bg-burgundy px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-porcelain disabled:opacity-50">{savingCrew ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save</button></div>
      </div>{crewMigrationNeeded && <p className="mt-2 text-xs font-bold text-red-800">Run the Step 18F Supabase SQL before saving cleaners needed.</p>}
    </div>

    {confirmedOffers.length > 0 && <div className="mt-3 rounded-2xl bg-ink p-4 text-porcelain"><p className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.14em] text-gold"><UserCheck className="h-4 w-4" /> Selected cleaner</p><div className="grid gap-2 md:grid-cols-2">{confirmedOffers.map((offer) => offer.employee ? <CleanerMiniCard key={offer.assignment.id} employee={offer.employee} status={offer.assignment.status} /> : null)}</div></div>}

    {sortedOffers.length > 0 && <div className="mt-3 rounded-2xl bg-cream p-3 ring-1 ring-burgundy/10"><div className="mb-2 flex items-center justify-between gap-2"><p className="text-xs font-black uppercase tracking-[.14em] text-ink/45">Offer status</p>{hasConfirmed && hasRemaining && <button type="button" disabled={closing} onClick={closeRemainingOffers} className="inline-flex items-center justify-center gap-2 rounded-full bg-red-100 px-3 py-2 text-xs font-black uppercase tracking-[.12em] text-red-800 ring-1 ring-red-200 disabled:opacity-50">{closing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}Close remaining</button>}</div><div className="grid gap-2">{sortedOffers.map((offer) => offer.employee ? <div key={offer.assignment.id} className={`rounded-xl p-3 text-xs font-bold ${statusClass(offer.assignment.status)}`}><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><span className="inline-flex flex-wrap items-center gap-2"><UserCheck className="h-4 w-4" /> {offer.employee.name} · {offer.employee.email} · {statusLabel(offer.assignment.status)}</span>{offer.assignment.status === "accepted" && <button type="button" disabled={Boolean(confirmingId)} onClick={() => confirmOffer(offer)} className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-3 py-2 text-xs font-black uppercase tracking-[.12em] text-porcelain disabled:opacity-50">{confirmingId === offer.assignment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Confirm cleaner</button>}</div><p className="mt-1 opacity-80">{statusHint(offer.assignment.status)}</p></div> : null)}</div></div>}

    {message && <p className="mt-3 rounded-xl bg-burgundy/10 p-3 text-xs font-bold text-burgundy">{message}</p>}

    {loading && !loaded ? <div className="mt-4 grid min-h-16 place-items-center text-burgundy"><Loader2 className="h-5 w-5 animate-spin" /></div> : suggestions.length === 0 ? <p className="mt-4 rounded-xl bg-cream p-3 text-xs font-bold text-ink/55">No available cleaner found for this date/time yet.</p> : <div className="mt-4"><p className="mb-2 text-xs font-black uppercase tracking-[.14em] text-ink/45">Candidates</p><div className="grid gap-3">{sortedSuggestions.map((suggestion) => {
      const offer = offers.find((item) => item.assignment.employee_id === suggestion.employee.id);
      const status = offer?.assignment.status || null;
      const isSending = sendingId === suggestion.employee.id;
      const isConfirming = offer && confirmingId === offer.assignment.id;
      const canConfirm = offer?.assignment.status === "accepted";
      const canSend = !offer;
      return <article key={suggestion.employee.id} className={`rounded-2xl p-4 ring-1 ${offer ? "bg-green-50 ring-green-200" : "bg-cream ring-burgundy/10"}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><p className="font-black text-burgundy">{suggestion.employee.name}</p>{offer && <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] ${statusClass(status)}`}>{statusLabel(status)}</span>}</div>
            <p className="mt-1 break-words text-xs text-ink/55">{suggestion.employee.email}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-ink/60">
              <span className="inline-flex items-center gap-1 rounded-full bg-porcelain px-3 py-1 ring-1 ring-burgundy/10"><Phone className="h-3.5 w-3.5 text-burgundy" />{suggestion.employee.phone || "No phone"}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-porcelain px-3 py-1 ring-1 ring-burgundy/10"><Car className="h-3.5 w-3.5 text-burgundy" />Car: {suggestion.employee.has_car ? "Yes" : "No"}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-porcelain px-3 py-1 ring-1 ring-burgundy/10"><Clock3 className="h-3.5 w-3.5 text-burgundy" />Max {suggestion.employee.max_hours_per_day}h/day</span>
              <span className="rounded-full bg-porcelain px-3 py-1 ring-1 ring-burgundy/10">Score {suggestion.score}</span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 lg:items-end">
            <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[.12em]"><span className={`rounded-full px-3 py-1 ${suggestion.matchesArea ? "bg-green-100 text-green-800 ring-1 ring-green-200" : "bg-red-100 text-red-800 ring-1 ring-red-200"}`}>{suggestion.matchesArea ? "Area match" : "Area mismatch"}</span><span className={`rounded-full px-3 py-1 ${suggestion.matchesService ? "bg-green-100 text-green-800 ring-1 ring-green-200" : "bg-gold text-ink ring-1 ring-gold/30"}`}>{suggestion.matchesService ? "Service match" : "Service unknown"}</span></div>
            <button type="button" disabled={Boolean(sendingId) || Boolean(confirmingId) || (!canSend && !canConfirm)} onClick={() => canConfirm && offer ? confirmOffer(offer) : sendOffer(suggestion.employee)} className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[.12em] disabled:opacity-60 ${canConfirm ? "bg-ink text-porcelain" : canSend ? "bg-burgundy text-porcelain" : "bg-green-100 text-green-800"}`}>{isSending || isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : canConfirm ? <CheckCircle2 className="h-4 w-4" /> : canSend ? <Send className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}{isSending ? "Sending" : isConfirming ? "Confirming" : canConfirm ? "Confirm cleaner" : canSend ? "Send offer" : statusLabel(status)}</button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">{suggestion.slots.map((slot) => <span key={slot.id} className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800 ring-1 ring-green-200">{formatTime(slot.start_time)}–{formatTime(slot.end_time)}</span>)}</div>
      </article>;
    })}</div></div>}
  </div>;
}

function SummaryPill({ label, value, tone }: { label: string; value: string | number; tone: "default" | "green" | "gold" | "dark" }) {
  const classes = tone === "green" ? "bg-green-100 text-green-800 ring-green-200" : tone === "gold" ? "bg-gold text-ink ring-gold/30" : tone === "dark" ? "bg-ink text-porcelain ring-ink/15" : "bg-cream text-ink/70 ring-burgundy/10";
  return <div className={`rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[.14em] ring-1 ${classes}`}><p className="opacity-70">{label}</p><p className="mt-1 text-lg opacity-100">{value}</p></div>;
}

function CleanerMiniCard({ employee, status }: { employee: Suggestion["employee"]; status: string }) {
  return <div className="rounded-2xl bg-porcelain/10 p-3 text-xs font-bold"><p className="text-sm font-black text-gold">{employee.name}</p><p className="mt-1 break-words text-porcelain/75">{employee.email}</p><p className="mt-1 text-porcelain/60">{employee.phone || "No phone"}</p><span className="mt-2 inline-flex rounded-full bg-gold px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-ink">{statusLabel(status)}</span></div>;
}
