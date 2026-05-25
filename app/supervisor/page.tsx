"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient, User } from "@supabase/supabase-js";
import { ArrowLeft, CalendarDays, Loader2, RefreshCw, ShieldCheck } from "lucide-react";

type Job = {
  id: string;
  service: string;
  area: string;
  address: string | null;
  size_sqm: number | null;
  preferred_date: string | null;
  time_window: string | null;
  customer_name: string;
  customer_phone: string | null;
  status: string | null;
};

const serviceLabels: Record<string, string> = {
  Hemstädning: "Home cleaning",
  Flyttstädning: "Move-out cleaning",
  Kontorsstädning: "Office cleaning",
  Fönsterputs: "Window cleaning"
};

const timeLabels: Record<string, string> = {
  Morgon: "Morning",
  Förmiddag: "Late morning",
  Eftermiddag: "Afternoon",
  Kväll: "Evening",
  Flexibel: "Flexible"
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
}

function isoDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function inRange(date: string | null, start: string, end: string) {
  return Boolean(date && date >= start && date <= end);
}

function displayService(service: string) {
  return serviceLabels[service] || service;
}

function displayTime(time: string | null) {
  if (!time) return "Flexible";
  return timeLabels[time] || time;
}

function displaySize(size: number | null) {
  return size ? `${size} square meters` : "Size not set";
}

function statusLabel(status: string | null) {
  if (status === "cancelled") return "Cancelled";
  if (status === "confirmed") return "Confirmed";
  if (status === "completed") return "Completed";
  return "New";
}

function statusClass(status: string | null) {
  if (status === "cancelled") return "bg-red-100 text-red-800 ring-1 ring-red-200";
  if (status === "confirmed") return "bg-green-100 text-green-800 ring-1 ring-green-200";
  if (status === "completed") return "bg-ink text-porcelain ring-1 ring-ink/20";
  return "bg-burgundy text-porcelain ring-1 ring-burgundy/20";
}

export default function SupervisorPage() {
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [message, setMessage] = useState("");

  const today = isoDate(0);
  const next7 = isoDate(7);

  const visibleJobs = useMemo(() => jobs.filter((job) => job.status !== "cancelled"), [jobs]);
  const todaysJobs = useMemo(() => visibleJobs.filter((job) => job.preferred_date === today), [visibleJobs, today]);
  const next7Jobs = useMemo(() => visibleJobs.filter((job) => job.status !== "completed" && inRange(job.preferred_date, today, next7)), [visibleJobs, today, next7]);
  const openJobs = useMemo(() => visibleJobs.filter((job) => job.status !== "completed"), [visibleJobs]);
  const completedToday = useMemo(() => todaysJobs.filter((job) => job.status === "completed").length, [todaysJobs]);

  async function getToken() {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  async function loadJobs() {
    setJobsLoading(true);
    setMessage("");
    try {
      const token = await getToken();
      if (!token) throw new Error("You need to log in again.");
      const response = await fetch("/api/admin/bookings", { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Could not load jobs.");
      const data = (result.bookings || []) as Job[];
      setJobs(data.sort((a, b) => String(a.preferred_date || "9999-12-31").localeCompare(String(b.preferred_date || "9999-12-31"))));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
    setJobsLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const supabase = getSupabase();
      if (!supabase) {
        setMessage("Supabase environment variables are missing.");
        setLoading(false);
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      setUser(data.user ?? null);
      setLoading(false);
    }
    void init();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (user) void loadJobs();
  }, [user]);

  if (loading) return <main className="grid min-h-screen place-items-center bg-cream text-burgundy"><Loader2 className="h-8 w-8 animate-spin" /></main>;

  if (!user) {
    return (
      <main className="min-h-screen bg-cream py-16 text-ink">
        <section className="luxe-container max-w-2xl rounded-[2rem] bg-porcelain p-8 shadow-soft">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Back</Link>
          <h1 className="display text-5xl font-bold text-burgundy">Supervisor</h1>
          <p className="mt-4 leading-8 text-ink/70">You need to log in to see this page.</p>
          <Link href="/login" className="btn-primary mt-7">Log in</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream py-12 text-ink md:py-16">
      <section className="luxe-container">
        <Link href="/admin" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Back to admin</Link>
        <div className="rounded-[2.5rem] bg-burgundy p-7 text-porcelain shadow-luxe md:p-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-gold text-ink"><ShieldCheck size={25} /></div>
              <p className="text-xs font-bold uppercase tracking-[.32em] text-gold">Iboren Supervisor</p>
              <h1 className="display mt-3 text-5xl font-bold leading-[.9] md:text-7xl">Daily operations</h1>
              <p className="mt-5 max-w-2xl leading-8 text-porcelain/70">Read-only operational overview for today and the next 7 days.</p>
              <p className="mt-4 inline-flex rounded-full border border-gold/25 bg-night/20 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-gold">Read-only mode</p>
            </div>
            <button onClick={loadJobs} className="inline-flex items-center justify-center gap-2 rounded-full bg-porcelain px-5 py-3 text-sm font-bold text-burgundy">
              {jobsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </button>
          </div>
        </div>

        {message && <p className="mt-5 rounded-2xl bg-burgundy/10 p-4 text-sm font-bold text-burgundy">{message}</p>}

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Stat title="Today" value={todaysJobs.length} />
          <Stat title="Completed today" value={completedToday} />
          <Stat title="Next 7 days" value={next7Jobs.length} />
          <Stat title="Open jobs" value={openJobs.length} />
        </div>

        <JobList title="Today’s jobs" hint="All non-cancelled visits scheduled for today." jobs={todaysJobs} loading={jobsLoading} />
        <JobList title="Next 7 days" hint="Upcoming open visits, excluding completed and cancelled jobs." jobs={next7Jobs} loading={jobsLoading} />
      </section>
    </main>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return <article className="rounded-[1.5rem] bg-porcelain p-5 shadow-soft"><p className="text-xs font-black uppercase tracking-[.2em] text-burgundy/55">{title}</p><p className="display mt-3 text-5xl font-bold text-burgundy">{value}</p></article>;
}

function JobList({ title, hint, jobs, loading }: { title: string; hint: string; jobs: Job[]; loading: boolean }) {
  return (
    <section className="mt-6 rounded-[2rem] bg-porcelain p-5 shadow-soft md:p-7">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-burgundy" /><h2 className="display text-4xl font-bold text-burgundy">{title}</h2></div>
          <p className="mt-2 text-sm font-bold text-ink/50">{hint}</p>
        </div>
        <span className="w-fit rounded-full bg-cream px-3 py-1 text-xs font-black uppercase tracking-[.16em] text-ink/55 ring-1 ring-burgundy/10">{jobs.length} jobs</span>
      </div>
      {loading ? <Loader2 className="h-7 w-7 animate-spin text-burgundy" /> : jobs.length === 0 ? <p className="rounded-2xl bg-cream p-5 text-ink/65">No jobs found in this period.</p> : <div className="grid gap-4">{jobs.map((job) => <JobCard key={job.id} job={job} />)}</div>}
    </section>
  );
}

function JobCard({ job }: { job: Job }) {
  return (
    <article className="rounded-[1.5rem] border border-burgundy/10 bg-cream p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[.18em] text-ink/45">{job.preferred_date || "No date"} · {displayTime(job.time_window)}</p>
          <h3 className="display mt-2 break-words text-3xl font-bold text-burgundy">{displayService(job.service)}</h3>
          <p className="mt-2 break-words text-sm font-bold text-ink/65">{job.area}{job.address ? ` · ${job.address}` : ""}</p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-black uppercase tracking-[.14em] ${statusClass(job.status)}`}>{statusLabel(job.status)}</span>
      </div>
      <div className="mt-4 grid gap-2 rounded-2xl bg-porcelain/70 p-4 text-sm text-ink/65 md:grid-cols-3">
        <p><strong>Customer:</strong> {job.customer_name}</p>
        <p><strong>Phone:</strong> {job.customer_phone || "—"}</p>
        <p><strong>Size:</strong> {displaySize(job.size_sqm)}</p>
      </div>
    </article>
  );
}
