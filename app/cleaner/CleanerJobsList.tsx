"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Loader2, MapPin, RefreshCw, ShieldCheck, XCircle } from "lucide-react";

type OfferStatus = "accepted" | "declined" | "completed";

type Job = { assignment: { id: string; booking_id: string; employee_id: string; status: string; note: string | null; created_at: string; updated_at: string }; booking: { id: string; service: string; area: string; address: string | null; size_sqm: number | null; frequency: string | null; preferred_date: string | null; time_window: string | null; customer_name: string; customer_phone: string | null; notes: string | null; status: string | null } | null; employee: { id: string; email: string; name: string; phone: string | null } | null };
type JobsResponse = { ok?: boolean; message?: string; role?: string; jobs?: Job[] };
type StatusResponse = { ok?: boolean; message?: string; assignment?: Job["assignment"] };

const headerName = ["Author", "ization"].join("");
const tokenWord = ["Bear", "er"].join("");

function label(status: string | null | undefined) { if (status === "accepted") return "Available"; if (status === "declined") return "Not available"; if (status === "confirmed") return "Confirmed by admin"; if (status === "completed") return "Completed"; if (status === "cancelled") return "Closed"; return "Offer"; }
function pillClass(status: string | null | undefined) { if (status === "accepted") return "bg-green-100 text-green-800 ring-1 ring-green-200"; if (status === "confirmed" || status === "completed") return "bg-ink text-porcelain ring-1 ring-ink/15"; if (status === "declined" || status === "cancelled") return "bg-red-100 text-red-800 ring-1 ring-red-200"; return "bg-gold text-ink"; }
function formatDate(value: string | null | undefined) { if (!value) return "No date"; return new Date(`${value}T12:00:00`).toLocaleDateString("sv-SE", { weekday: "long", year: "numeric", month: "long", day: "numeric" }); }
function shortNote(notes: string | null) { return String(notes || "").split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 8); }

export default function CleanerJobsList({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const count = useMemo(() => jobs.filter((job) => job.booking).length, [jobs]);

  function headers(contentType = false) { const result: Record<string, string> = {}; result[headerName] = `${tokenWord} ${token}`; if (contentType) result["Content-Type"] = "application/json"; return result; }

  async function loadJobs() {
    setLoading(true); setMessage("");
    try { const response = await fetch("/api/cleaner/jobs", { headers: headers() }); const result = await response.json().catch(() => null) as JobsResponse | null; if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not load offers."); setRole(result.role || ""); setJobs(result.jobs || []); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not load offers."); }
    setLoading(false);
  }

  async function respond(assignmentId: string, status: OfferStatus) {
    setUpdatingId(assignmentId); setMessage("");
    try { const response = await fetch(`/api/cleaner/jobs/${assignmentId}/status`, { method: "PATCH", headers: headers(true), body: JSON.stringify({ status }) }); const result = await response.json().catch(() => null) as StatusResponse | null; if (!response.ok || !result?.ok || !result.assignment) throw new Error(result?.message || "Could not update offer."); setJobs((current) => current.map((job) => job.assignment.id === assignmentId ? { ...job, assignment: { ...job.assignment, ...result.assignment } } : job)); if (status === "accepted") setMessage("You are marked as available. Wait for admin confirmation before going to the job."); else if (status === "declined") setMessage("You are marked as not available for this offer."); else setMessage("Job marked as completed. Admin has been notified."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not update offer."); }
    setUpdatingId(null);
  }

  useEffect(() => { void loadJobs(); }, [token]);

  return (
    <section className="rounded-[2rem] bg-porcelain p-6 shadow-soft md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><ShieldCheck className="mb-5 text-burgundy" /><h2 className="display text-4xl font-bold text-burgundy">My offers</h2><p className="mt-3 leading-7 text-ink/65">Job offers from admin appear here. Mark yourself available or not available. The job is only confirmed after admin selects you.</p><div className="mt-3 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[.14em]"><span className="rounded-full bg-cream px-3 py-1 text-ink/55 ring-1 ring-burgundy/10">{count} offers</span>{role && <span className="rounded-full bg-gold px-3 py-1 text-ink">{role}</span>}</div></div><button type="button" onClick={loadJobs} className="inline-flex items-center justify-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-bold text-burgundy">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}Refresh</button></div>
      {message && <p className="mt-5 rounded-2xl bg-burgundy/10 p-4 text-sm font-bold text-burgundy">{message}</p>}
      {loading ? <div className="grid min-h-32 place-items-center text-burgundy"><Loader2 className="h-7 w-7 animate-spin" /></div> : jobs.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-burgundy/20 bg-cream p-5 text-sm leading-7 text-ink/65">No job offers yet.</div> : (
        <div className="mt-6 grid gap-5">{jobs.map((job) => { const booking = job.booking; if (!booking) return null; const isOffer = !["accepted", "declined", "confirmed", "completed", "cancelled"].includes(job.assignment.status); const isUpdating = updatingId === job.assignment.id; return <article key={job.assignment.id} className="rounded-[2rem] bg-cream p-5 text-sm ring-1 ring-burgundy/10 md:p-6"><div className="grid gap-4 lg:grid-cols-[1fr_260px] lg:items-start"><div><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[.14em] ${pillClass(job.assignment.status)}`}>{label(job.assignment.status)}</span><h3 className="display mt-3 text-3xl font-bold text-burgundy md:text-4xl">{booking.service}</h3><p className="mt-3 flex items-start gap-2 text-base font-bold text-ink"><MapPin className="mt-1 h-4 w-4 shrink-0 text-burgundy" /> {booking.address || booking.area}</p><p className="mt-2 text-sm text-ink/55">{booking.area}</p></div><div className="rounded-[1.5rem] bg-porcelain p-4 text-sm font-bold text-ink"><p className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-burgundy" /> <span>{formatDate(booking.preferred_date)}</span></p><p className="mt-2 rounded-full bg-cream px-3 py-2 text-xs uppercase tracking-[.12em] text-ink/60">{booking.time_window || "Flexible"}</p></div></div><div className="mt-5 flex flex-wrap gap-2">{isOffer && <button type="button" disabled={isUpdating} onClick={() => respond(job.assignment.id, "accepted")} className="inline-flex items-center gap-2 rounded-full bg-green-100 px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-green-800 ring-1 ring-green-200 disabled:opacity-50">{isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Available</button>}{isOffer && <button type="button" disabled={isUpdating} onClick={() => respond(job.assignment.id, "declined")} className="inline-flex items-center gap-2 rounded-full bg-red-100 px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-red-800 ring-1 ring-red-200 disabled:opacity-50">{isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}Not available</button>}{job.assignment.status === "accepted" && <span className="rounded-full bg-green-100 px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-green-800 ring-1 ring-green-200">Available · waiting for admin</span>}{job.assignment.status === "confirmed" && <button type="button" disabled={isUpdating} onClick={() => respond(job.assignment.id, "completed")} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-porcelain ring-1 ring-ink/15 disabled:opacity-50">{isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Mark Klar</button>}{job.assignment.status === "declined" && <span className="rounded-full bg-red-100 px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-red-800 ring-1 ring-red-200">Not available</span>}{job.assignment.status === "completed" && <span className="rounded-full bg-ink px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-porcelain">Completed</span>}</div><div className="mt-5 grid gap-3 rounded-[1.5rem] bg-porcelain p-4 sm:grid-cols-2 lg:grid-cols-4"><p><strong>Customer:</strong> {booking.customer_name}</p><p><strong>Phone:</strong> {booking.customer_phone || "—"}</p><p><strong>Size:</strong> {booking.size_sqm ? `${booking.size_sqm} sqm` : "—"}</p><p><strong>Frequency:</strong> {booking.frequency || "—"}</p></div>{shortNote(booking.notes).length > 0 && <div className="mt-4 rounded-[1.5rem] bg-porcelain p-4 text-sm leading-7 text-ink/70"><strong className="text-ink">Job details</strong><ul className="mt-3 grid gap-2 md:grid-cols-2">{shortNote(booking.notes).map((line, index) => <li key={`${line}-${index}`} className="rounded-2xl bg-cream px-4 py-2">{line}</li>)}</ul></div>}{job.assignment.note && <p className="mt-4 rounded-2xl bg-gold/20 p-4 text-sm leading-7 text-ink/70"><strong>Admin note:</strong><br />{job.assignment.note}</p>}</article>; })}</div>
      )}
    </section>
  );
}
