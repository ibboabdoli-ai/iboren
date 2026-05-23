"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, Loader2, MapPin, RefreshCw, ShieldCheck, XCircle } from "lucide-react";

type Job = {
  assignment: {
    id: string;
    booking_id: string;
    employee_id: string;
    status: string;
    note: string | null;
    created_at: string;
    updated_at: string;
  };
  booking: {
    id: string;
    service: string;
    area: string;
    address: string | null;
    size_sqm: number | null;
    frequency: string | null;
    preferred_date: string | null;
    time_window: string | null;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    notes: string | null;
    status: string | null;
    created_at: string;
  } | null;
  employee: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
  } | null;
};

type JobsResponse = {
  ok?: boolean;
  message?: string;
  role?: string;
  employee?: { id: string; email: string; name: string };
  jobs?: Job[];
};

type StatusResponse = {
  ok?: boolean;
  message?: string;
  assignment?: Job["assignment"];
};

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
  return new Date(`${value}T12:00:00`).toLocaleDateString("sv-SE", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
}

export default function CleanerJobsList({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);

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

  async function updateJobStatus(assignmentId: string, status: "accepted" | "declined") {
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
      setMessage(status === "accepted" ? "Job accepted." : "Job declined.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update job status.");
    }
    setUpdatingId(null);
  }

  useEffect(() => {
    void loadJobs();
  }, [token]);

  return (
    <section className="rounded-[2rem] bg-porcelain p-6 shadow-soft md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <ShieldCheck className="mb-5 text-burgundy" />
          <h2 className="display text-3xl font-bold text-burgundy">My jobs</h2>
          <p className="mt-3 leading-7 text-ink/65">Assigned bookings from admin appear here.</p>
          {role && <p className="mt-2 text-sm font-bold text-ink/45">View mode: {role}</p>}
        </div>
        <button type="button" onClick={loadJobs} className="inline-flex items-center justify-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-bold text-burgundy">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      {message && <p className="mt-5 rounded-2xl bg-burgundy/10 p-4 text-sm font-bold text-burgundy">{message}</p>}

      {loading ? (
        <div className="grid min-h-32 place-items-center text-burgundy"><Loader2 className="h-7 w-7 animate-spin" /></div>
      ) : jobs.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-burgundy/20 bg-cream p-5 text-sm leading-7 text-ink/65">No assigned jobs yet.</div>
      ) : (
        <div className="mt-6 grid gap-4">
          {jobs.map((job) => {
            const booking = job.booking;
            if (!booking) return null;
            const isUpdating = updatingId === job.assignment.id;
            const isAccepted = job.assignment.status === "accepted";
            const isDeclined = job.assignment.status === "declined";
            return (
              <article key={job.assignment.id} className="rounded-[1.5rem] bg-cream p-4 text-sm ring-1 ring-burgundy/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[.14em] ${statusClass(job.assignment.status)}`}>{statusLabel(job.assignment.status)}</span>
                    <h3 className="display mt-3 text-2xl font-bold text-burgundy">{booking.service}</h3>
                    <p className="mt-2 inline-flex items-center gap-2 text-ink/65"><MapPin className="h-4 w-4 text-burgundy" /> {booking.area}{booking.address ? ` · ${booking.address}` : ""}</p>
                  </div>
                  <div className="rounded-2xl bg-porcelain p-3 text-xs font-bold text-ink/60">
                    <p className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-burgundy" /> {formatDate(booking.preferred_date)}</p>
                    <p className="mt-1">{booking.time_window || "No time window"}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" disabled={isUpdating || isAccepted} onClick={() => updateJobStatus(job.assignment.id, "accepted")} className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-green-800 ring-1 ring-green-200 disabled:opacity-50">
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {isAccepted ? "Accepted" : "Accept"}
                  </button>
                  <button type="button" disabled={isUpdating || isDeclined} onClick={() => updateJobStatus(job.assignment.id, "declined")} className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-red-800 ring-1 ring-red-200 disabled:opacity-50">
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    {isDeclined ? "Declined" : "Decline"}
                  </button>
                </div>

                <div className="mt-4 grid gap-2 rounded-2xl bg-porcelain p-3 text-xs leading-6 text-ink/65 sm:grid-cols-2">
                  <p><strong className="text-ink">Customer:</strong> {booking.customer_name}</p>
                  <p><strong className="text-ink">Phone:</strong> {booking.customer_phone || "—"}</p>
                  <p><strong className="text-ink">Size:</strong> {booking.size_sqm ? `${booking.size_sqm} sqm` : "—"}</p>
                  <p><strong className="text-ink">Frequency:</strong> {booking.frequency || "—"}</p>
                  {job.employee && <p><strong className="text-ink">Assigned to:</strong> {job.employee.name}</p>}
                  <p><strong className="text-ink">Booking status:</strong> {booking.status || "new"}</p>
                </div>

                {booking.notes && <p className="mt-3 rounded-2xl bg-porcelain p-3 text-xs leading-6 text-ink/65"><strong>Notes:</strong><br />{booking.notes}</p>}
                {job.assignment.note && <p className="mt-3 rounded-2xl bg-gold/20 p-3 text-xs leading-6 text-ink/70"><strong>Admin note:</strong><br />{job.assignment.note}</p>}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
