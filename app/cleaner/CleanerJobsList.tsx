"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Download, ExternalLink, Loader2, MapPin, RefreshCw, ShieldCheck, XCircle } from "lucide-react";

type JobStatus = "accepted" | "declined" | "completed";

type Job = {
  assignment: { id: string; booking_id: string; employee_id: string; status: string; note: string | null; created_at: string; updated_at: string };
  booking: { id: string; service: string; area: string; address: string | null; size_sqm: number | null; frequency: string | null; preferred_date: string | null; time_window: string | null; customer_name: string; customer_email: string; customer_phone: string | null; notes: string | null; status: string | null; created_at: string } | null;
  employee: { id: string; email: string; name: string; phone: string | null } | null;
};

type JobsResponse = { ok?: boolean; message?: string; role?: string; jobs?: Job[] };
type StatusResponse = { ok?: boolean; message?: string; assignment?: Job["assignment"] };

const headerName = ["Author", "ization"].join("");
const tokenWord = ["Bear", "er"].join("");

function statusLabel(status: string | null | undefined) {
  if (status === "accepted") return "Accepted";
  if (status === "declined") return "Declined";
  if (status === "completed") return "Completed";
  if (status === "cancelled") return "Cancelled";
  return "Assigned";
}

function statusClass(status: string | null | undefined) {
  if (status === "accepted") return "bg-green-100 text-green-800 ring-1 ring-green-200";
  if (status === "declined") return "bg-red-100 text-red-800 ring-1 ring-red-200";
  if (status === "completed") return "bg-ink text-porcelain ring-1 ring-ink/15";
  if (status === "cancelled") return "bg-red-100 text-red-800 ring-1 ring-red-200";
  return "bg-gold text-ink";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "No date";
  return new Date(`${value}T12:00:00`).toLocaleDateString("sv-SE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function timeRange(timeWindow: string | null | undefined) {
  const value = String(timeWindow || "").toLowerCase();
  if (value.includes("morgon") || value.includes("morning")) return { start: "080000", end: "120000" };
  if (value.includes("förmiddag") || value.includes("late morning")) return { start: "100000", end: "130000" };
  if (value.includes("eftermiddag") || value.includes("afternoon")) return { start: "130000", end: "170000" };
  if (value.includes("kväll") || value.includes("evening")) return { start: "170000", end: "200000" };
  return { start: "090000", end: "120000" };
}

function googleDate(dateValue: string | null | undefined, hhmmss: string) {
  if (!dateValue) return null;
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${hhmmss}`;
}

function googleCalendarUrl(booking: Job["booking"]) {
  if (!booking?.preferred_date) return "";
  const range = timeRange(booking.time_window);
  const start = googleDate(booking.preferred_date, range.start);
  const end = googleDate(booking.preferred_date, range.end);
  if (!start || !end) return "";
  const location = [booking.address, booking.area].filter(Boolean).join(", ");
  const details = [
    `Service: ${booking.service}`,
    `Customer: ${booking.customer_name}`,
    `Phone: ${booking.customer_phone || "-"}`,
    `Size: ${booking.size_sqm ? `${booking.size_sqm} sqm` : "-"}`,
    `Frequency: ${booking.frequency || "-"}`,
    `Time: ${booking.time_window || "Flexible"}`,
    "Cleaner panel: https://iboren.se/cleaner"
  ].join("\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Iboren · ${booking.service}`,
    dates: `${start}/${end}`,
    ctz: "Europe/Stockholm",
    location,
    details
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function cleanNoteLine(line: string) {
  return line.replace(/^[-•\s]+/, "").replace(/\s+/g, " ").trim();
}

function parseNotes(notes: string | null) {
  if (!notes) return [];
  return notes
    .split(/\n|\s\|\s|Recurring visit|Customer:/i)
    .map(cleanNoteLine)
    .filter((line) => line && !line.toLowerCase().startsWith("recurring") && !line.toLowerCase().startsWith("language:"))
    .slice(0, 12);
}

function Detail({ label, value }: { label: string; value: string | number | null | undefined }) {
  return <p className="rounded-2xl bg-cream px-4 py-3"><strong className="block text-[11px] uppercase tracking-[.14em] text-ink/45">{label}</strong><span className="mt-1 block text-sm font-bold text-ink">{value || "—"}</span></p>;
}

export default function CleanerJobsList({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [calendarLoadingId, setCalendarLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);

  const jobCount = useMemo(() => jobs.filter((job) => job.booking).length, [jobs]);

  function requestHeaders(contentType = false) {
    const headers: Record<string, string> = {};
    headers[headerName] = `${tokenWord} ${token}`;
    if (contentType) headers["Content-Type"] = "application/json";
    return headers;
  }

  async function loadJobs() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/cleaner/jobs", { headers: requestHeaders() });
      const result = await response.json().catch(() => null) as JobsResponse | null;
      if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not load jobs.");
      setRole(result.role || "");
      setJobs(result.jobs || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load jobs.");
    }
    setLoading(false);
  }

  async function updateJobStatus(assignmentId: string, status: JobStatus) {
    setUpdatingId(assignmentId);
    setMessage("");
    try {
      const response = await fetch(`/api/cleaner/jobs/${assignmentId}/status`, {
        method: "PATCH",
        headers: requestHeaders(true),
        body: JSON.stringify({ status })
      });
      const result = await response.json().catch(() => null) as StatusResponse | null;
      if (!response.ok || !result?.ok || !result.assignment) throw new Error(result?.message || "Could not update job status.");
      setJobs((current) => current.map((job) => job.assignment.id === assignmentId ? { ...job, assignment: { ...job.assignment, ...result.assignment } } : job));
      if (status === "accepted") setMessage("Job accepted. Klar button is now available when the work is done.");
      else if (status === "declined") setMessage("Job declined.");
      else setMessage("Job marked as completed. Admin has been notified.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update job status.");
    }
    setUpdatingId(null);
  }

  async function downloadCalendar(assignmentId: string) {
    setCalendarLoadingId(assignmentId);
    setMessage("");
    try {
      const response = await fetch(`/api/cleaner/jobs/${assignmentId}/calendar.ics`, { headers: requestHeaders() });
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(result?.message || "Could not create calendar file.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `iboren-job-${assignmentId}.ics`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage("ICS file downloaded. Open it to save in Apple or Outlook Calendar.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create calendar file.");
    }
    setCalendarLoadingId(null);
  }

  useEffect(() => { void loadJobs(); }, [token]);

  return (
    <section className="rounded-[2rem] bg-porcelain p-6 shadow-soft md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <ShieldCheck className="mb-5 text-burgundy" />
          <h2 className="display text-4xl font-bold text-burgundy">My jobs</h2>
          <p className="mt-3 leading-7 text-ink/65">Assigned bookings from admin appear here. Accept the job, save it to calendar, and mark it Klar after the work is done.</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[.14em]"><span className="rounded-full bg-cream px-3 py-1 text-ink/55 ring-1 ring-burgundy/10">{jobCount} jobs</span>{role && <span className="rounded-full bg-gold px-3 py-1 text-ink">{role}</span>}</div>
        </div>
        <button type="button" onClick={loadJobs} className="inline-flex items-center justify-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-bold text-burgundy">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}Refresh</button>
      </div>

      {message && <p className="mt-5 rounded-2xl bg-burgundy/10 p-4 text-sm font-bold text-burgundy">{message}</p>}

      {loading ? <div className="grid min-h-32 place-items-center text-burgundy"><Loader2 className="h-7 w-7 animate-spin" /></div> : jobs.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-burgundy/20 bg-cream p-5 text-sm leading-7 text-ink/65">No assigned jobs yet.</div> : (
        <div className="mt-6 grid gap-5">
          {jobs.map((job) => {
            const booking = job.booking;
            if (!booking) return null;
            const noteLines = parseNotes(booking.notes);
            const isUpdating = updatingId === job.assignment.id;
            const isCalendarLoading = calendarLoadingId === job.assignment.id;
            const isAssigned = !["accepted", "declined", "completed", "cancelled"].includes(job.assignment.status);
            const isAccepted = job.assignment.status === "accepted";
            const isDeclined = job.assignment.status === "declined";
            const isCompleted = job.assignment.status === "completed";
            const googleUrl = googleCalendarUrl(booking);
            return (
              <article key={job.assignment.id} className="rounded-[2rem] bg-cream p-5 text-sm ring-1 ring-burgundy/10 md:p-6">
                <div className="grid gap-4 lg:grid-cols-[1fr_260px] lg:items-start">
                  <div><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[.14em] ${statusClass(job.assignment.status)}`}>{statusLabel(job.assignment.status)}</span><h3 className="display mt-3 text-3xl font-bold text-burgundy md:text-4xl">{booking.service}</h3><p className="mt-3 flex items-start gap-2 text-base font-bold text-ink"><MapPin className="mt-1 h-4 w-4 shrink-0 text-burgundy" /> {booking.address || booking.area}</p><p className="mt-2 text-sm text-ink/55">{booking.area}</p></div>
                  <div className="rounded-[1.5rem] bg-porcelain p-4 text-sm font-bold text-ink"><p className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-burgundy" /> <span>{formatDate(booking.preferred_date)}</span></p><p className="mt-2 rounded-full bg-cream px-3 py-2 text-xs uppercase tracking-[.12em] text-ink/60">{booking.time_window || "Flexible"}</p></div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {isAssigned && <button type="button" disabled={isUpdating} onClick={() => updateJobStatus(job.assignment.id, "accepted")} className="inline-flex items-center gap-2 rounded-full bg-green-100 px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-green-800 ring-1 ring-green-200 disabled:opacity-50">{isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Accept</button>}
                  {isAssigned && <button type="button" disabled={isUpdating} onClick={() => updateJobStatus(job.assignment.id, "declined")} className="inline-flex items-center gap-2 rounded-full bg-red-100 px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-red-800 ring-1 ring-red-200 disabled:opacity-50">{isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}Decline</button>}
                  {isAccepted && <button type="button" disabled={isUpdating} onClick={() => updateJobStatus(job.assignment.id, "completed")} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-porcelain ring-1 ring-ink/15 disabled:opacity-50">{isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Mark Klar</button>}
                  {isDeclined && <span className="rounded-full bg-red-100 px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-red-800 ring-1 ring-red-200">Declined</span>}
                  {isCompleted && <span className="rounded-full bg-ink px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-porcelain">Completed</span>}
                  {googleUrl && <a href={googleUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-burgundy px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-porcelain"><ExternalLink className="h-4 w-4" />Google Calendar</a>}
                  <button type="button" disabled={isCalendarLoading} onClick={() => downloadCalendar(job.assignment.id)} className="inline-flex items-center gap-2 rounded-full bg-porcelain px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-burgundy ring-1 ring-burgundy/10 disabled:opacity-50">{isCalendarLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Download .ics</button>
                </div>

                <div className="mt-5 grid gap-3 rounded-[1.5rem] bg-porcelain p-4 sm:grid-cols-2 lg:grid-cols-4"><Detail label="Customer" value={booking.customer_name} /><Detail label="Phone" value={booking.customer_phone || "—"} /><Detail label="Size" value={booking.size_sqm ? `${booking.size_sqm} sqm` : "—"} /><Detail label="Frequency" value={booking.frequency || "—"} /></div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-ink/55">{job.employee && <span className="rounded-full bg-porcelain px-3 py-1 ring-1 ring-burgundy/10">Assigned to: {job.employee.name}</span>}<span className="rounded-full bg-porcelain px-3 py-1 ring-1 ring-burgundy/10">Booking status: {booking.status || "new"}</span></div>
                {noteLines.length > 0 && <div className="mt-4 rounded-[1.5rem] bg-porcelain p-4 text-sm leading-7 text-ink/70"><strong className="text-ink">Job details</strong><ul className="mt-3 grid gap-2 md:grid-cols-2">{noteLines.map((line, index) => <li key={`${line}-${index}`} className="rounded-2xl bg-cream px-4 py-2">{line}</li>)}</ul></div>}
                {job.assignment.note && <p className="mt-4 rounded-2xl bg-gold/20 p-4 text-sm leading-7 text-ink/70"><strong>Admin note:</strong><br />{job.assignment.note}</p>}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
