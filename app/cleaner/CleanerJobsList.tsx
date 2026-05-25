"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Download, ExternalLink, Loader2, MapPin, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import CleanerTimeEntryForm from "./CleanerTimeEntryForm";

type Lang = "sv" | "en";
type OfferStatus = "accepted" | "declined" | "completed";
type Job = {
  assignment: { id: string; booking_id: string; employee_id: string; status: string; note: string | null; created_at: string; updated_at: string };
  booking: { id: string; service: string; area: string; address: string | null; size_sqm: number | null; frequency: string | null; preferred_date: string | null; time_window: string | null; customer_name: string; customer_phone: string | null; notes: string | null; status: string | null } | null;
  employee: { id: string; email: string; name: string; phone: string | null } | null;
};
type JobsResponse = { ok?: boolean; message?: string; role?: string; jobs?: Job[] };
type StatusResponse = { ok?: boolean; message?: string; assignment?: Job["assignment"] };

const headerName = ["Author", "ization"].join("");
const tokenWord = ["Bear", "er"].join("");

const copy = {
  sv: {
    available: "Tillgänglig",
    notAvailable: "Inte tillgänglig",
    confirmed: "Bekräftad av admin",
    completed: "Klar",
    closed: "Stängd",
    offer: "Erbjudande",
    noDate: "Inget datum",
    flexible: "Flexibel",
    service: "Tjänst",
    customer: "Kund",
    phone: "Telefon",
    size: "Storlek",
    frequency: "Frekvens",
    time: "Tid",
    panelUrl: "Städarpanel: https://iboren.se/cleaner",
    myOffers: "Mina erbjudanden",
    intro: "Jobberbjudanden från admin visas här. Markera om du är tillgänglig eller inte. Jobbet är bara bekräftat efter att admin har valt dig.",
    offers: "erbjudanden",
    refresh: "Uppdatera",
    loadError: "Kunde inte ladda erbjudanden.",
    updateError: "Kunde inte uppdatera erbjudandet.",
    acceptedMessage: "Du är markerad som tillgänglig. Vänta på bekräftelse från admin innan du åker till jobbet.",
    declinedMessage: "Du är markerad som inte tillgänglig för detta erbjudande.",
    completedMessage: "Jobbet markerades som klart. Admin har meddelats.",
    calendarError: "Kunde inte skapa kalenderfil.",
    calendarDownloaded: "Kalenderfil nedladdad.",
    noOffers: "Inga jobberbjudanden ännu.",
    waiting: "Tillgänglig · väntar på admin",
    markCompleted: "Markera klar",
    googleCalendar: "Google Kalender",
    downloadIcs: "Ladda ner .ics",
    jobDetails: "Jobbdetaljer",
    adminNote: "Adminanteckning"
  },
  en: {
    available: "Available",
    notAvailable: "Not available",
    confirmed: "Confirmed by admin",
    completed: "Completed",
    closed: "Closed",
    offer: "Offer",
    noDate: "No date",
    flexible: "Flexible",
    service: "Service",
    customer: "Customer",
    phone: "Phone",
    size: "Size",
    frequency: "Frequency",
    time: "Time",
    panelUrl: "Cleaner panel: https://iboren.se/en/cleaner",
    myOffers: "My offers",
    intro: "Job offers from admin appear here. Mark yourself available or not available. The job is only confirmed after admin selects you.",
    offers: "offers",
    refresh: "Refresh",
    loadError: "Could not load offers.",
    updateError: "Could not update offer.",
    acceptedMessage: "You are marked as available. Wait for admin confirmation before going to the job.",
    declinedMessage: "You are marked as not available for this offer.",
    completedMessage: "Job marked as completed. Admin has been notified.",
    calendarError: "Could not create calendar file.",
    calendarDownloaded: "Calendar file downloaded.",
    noOffers: "No job offers yet.",
    waiting: "Available · waiting for admin",
    markCompleted: "Mark completed",
    googleCalendar: "Google Calendar",
    downloadIcs: "Download .ics",
    jobDetails: "Job details",
    adminNote: "Admin note"
  }
} as const;

const svToEn: Record<string, string> = {
  Hemstädning: "Home cleaning",
  Flyttstädning: "Move-out cleaning",
  Kontorsstädning: "Office cleaning",
  Fönsterputs: "Window cleaning",
  Engång: "One-time",
  "Varje vecka": "Every week",
  "Varannan vecka": "Every other week",
  "Varje månad": "Every month",
  Morgon: "Morning",
  Förmiddag: "Late morning",
  Eftermiddag: "Afternoon",
  Kväll: "Evening",
  Flexibel: "Flexible",
  Ja: "Yes",
  Nej: "No",
  "Vet ej": "Not sure",
  Lägenhet: "Apartment",
  Villa: "House",
  Radhus: "Townhouse",
  Kontor: "Office",
  Annat: "Other",
  "Inga valda": "None selected"
};

const enToSv: Record<string, string> = {
  "Home cleaning": "Hemstädning",
  "Move-out cleaning": "Flyttstädning",
  "Office cleaning": "Kontorsstädning",
  "Window cleaning": "Fönsterputs",
  "One-time": "Engång",
  "Every week": "Varje vecka",
  "Every other week": "Varannan vecka",
  "Every month": "Varje månad",
  Morning: "Morgon",
  "Late morning": "Förmiddag",
  Afternoon: "Eftermiddag",
  Evening: "Kväll",
  Flexible: "Flexibel",
  Yes: "Ja",
  No: "Nej",
  "Not sure": "Vet ej",
  Apartment: "Lägenhet",
  House: "Villa",
  Townhouse: "Radhus",
  Office: "Kontor",
  Other: "Annat",
  "None selected": "Inga valda"
};

const noteSvToEn: Record<string, string> = {
  "--- Objekt & detaljer ---": "--- Property & details ---",
  "--- Kundens önskemål ---": "--- Customer notes ---",
  "Typ av objekt": "Property type",
  "Antal rum": "Rooms",
  "Antal badrum": "Bathrooms",
  Husdjur: "Pets",
  "Våning": "Floor",
  Hiss: "Elevator",
  Parkering: "Parking",
  "Extra tjänster": "Extra services",
  "Kundtyp": "Customer type",
  "RUT önskas": "RUT requested",
  "Språk / Language": "Language"
};

const noteEnToSv: Record<string, string> = {
  "--- Property & details ---": "--- Objekt & detaljer ---",
  "--- Customer notes ---": "--- Kundens önskemål ---",
  "Property type": "Typ av objekt",
  Rooms: "Antal rum",
  Bathrooms: "Antal badrum",
  Pets: "Husdjur",
  Floor: "Våning",
  Elevator: "Hiss",
  Parking: "Parkering",
  "Extra services": "Extra tjänster",
  "Customer type": "Kundtyp",
  "RUT requested": "RUT önskas",
  Language: "Språk / Language"
};

function translateValue(value: string | null | undefined, lang: Lang) {
  if (!value) return "—";
  return lang === "en" ? svToEn[value] || value : enToSv[value] || value;
}

function translateRole(value: string, lang: Lang) {
  if (!value) return "";
  const normalized = value.toLowerCase();
  if (normalized === "cleaner") return lang === "sv" ? "Städare" : "Cleaner";
  if (normalized === "supervisor") return "Supervisor";
  if (normalized === "admin") return "Admin";
  return value;
}

function translateNoteLine(line: string, lang: Lang) {
  let next = line;
  const labelMap = lang === "en" ? noteSvToEn : noteEnToSv;
  const valueMap = lang === "en" ? svToEn : enToSv;

  if (labelMap[next]) return labelMap[next];

  Object.entries(labelMap).forEach(([from, to]) => {
    next = next.replace(`${from}:`, `${to}:`);
  });
  Object.entries(valueMap).forEach(([from, to]) => {
    next = next.replace(new RegExp(`: ${from}$`), `: ${to}`);
  });

  return next;
}

function label(status: string | null | undefined, lang: Lang) {
  const text = copy[lang];
  if (status === "accepted") return text.available;
  if (status === "declined") return text.notAvailable;
  if (status === "confirmed") return text.confirmed;
  if (status === "completed") return text.completed;
  if (status === "cancelled") return text.closed;
  return text.offer;
}

function pillClass(status: string | null | undefined) {
  if (status === "accepted") return "bg-green-100 text-green-800 ring-1 ring-green-200";
  if (status === "confirmed" || status === "completed") return "bg-ink text-porcelain ring-1 ring-ink/15";
  if (status === "declined" || status === "cancelled") return "bg-red-100 text-red-800 ring-1 ring-red-200";
  return "bg-gold text-ink";
}

function formatDate(value: string | null | undefined, lang: Lang) {
  if (!value) return copy[lang].noDate;
  return new Date(`${value}T12:00:00`).toLocaleDateString(lang === "sv" ? "sv-SE" : "en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function shortNote(notes: string | null, lang: Lang) {
  return String(notes || "").split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 8).map((line) => translateNoteLine(line, lang));
}

function pad(value: number) { return String(value).padStart(2, "0"); }

function calendarRange(timeWindow: string | null | undefined) {
  const value = String(timeWindow || "").toLowerCase();
  if (value.includes("morgon") || value.includes("morning")) return { start: "080000", end: "120000" };
  if (value.includes("eftermiddag") || value.includes("afternoon")) return { start: "130000", end: "170000" };
  if (value.includes("kväll") || value.includes("evening")) return { start: "170000", end: "200000" };
  return { start: "090000", end: "120000" };
}

function googleDate(dateValue: string | null | undefined, time: string) {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${time}`;
}

function googleCalendarUrl(booking: Job["booking"], lang: Lang) {
  if (!booking?.preferred_date) return "";
  const text = copy[lang];
  const range = calendarRange(booking.time_window);
  const start = googleDate(booking.preferred_date, range.start);
  const end = googleDate(booking.preferred_date, range.end);
  if (!start || !end) return "";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Iboren · ${translateValue(booking.service, lang)}`,
    dates: `${start}/${end}`,
    ctz: "Europe/Stockholm",
    location: [booking.address, booking.area].filter(Boolean).join(", "),
    details: [`${text.service}: ${translateValue(booking.service, lang)}`, `${text.customer}: ${booking.customer_name}`, `${text.phone}: ${booking.customer_phone || "-"}`, `${text.size}: ${booking.size_sqm ? `${booking.size_sqm} ${lang === "sv" ? "kvm" : "sqm"}` : "-"}`, `${text.frequency}: ${translateValue(booking.frequency, lang)}`, `${text.time}: ${translateValue(booking.time_window, lang) || text.flexible}`, text.panelUrl].join("\n")
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function CleanerJobsList({ token, lang = "en" }: { token: string; lang?: Lang }) {
  const text = copy[lang];
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [calendarLoadingId, setCalendarLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const count = useMemo(() => jobs.filter((job) => job.booking).length, [jobs]);

  function headers(contentType = false) {
    const result: Record<string, string> = {};
    result[headerName] = `${tokenWord} ${token}`;
    if (contentType) result["Content-Type"] = "application/json";
    return result;
  }

  async function loadJobs() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/cleaner/jobs", { headers: headers() });
      const result = await response.json().catch(() => null) as JobsResponse | null;
      if (!response.ok || !result?.ok) throw new Error(result?.message || text.loadError);
      setRole(result.role || "");
      setJobs(result.jobs || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : text.loadError);
    }
    setLoading(false);
  }

  async function respond(assignmentId: string, status: OfferStatus) {
    setUpdatingId(assignmentId);
    setMessage("");
    try {
      const response = await fetch(`/api/cleaner/jobs/${assignmentId}/status`, { method: "PATCH", headers: headers(true), body: JSON.stringify({ status }) });
      const result = await response.json().catch(() => null) as StatusResponse | null;
      if (!response.ok || !result?.ok || !result.assignment) throw new Error(result?.message || text.updateError);
      setJobs((current) => current.map((job) => job.assignment.id === assignmentId ? { ...job, assignment: { ...job.assignment, ...result.assignment } } : job));
      if (status === "accepted") setMessage(text.acceptedMessage);
      else if (status === "declined") setMessage(text.declinedMessage);
      else setMessage(text.completedMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : text.updateError);
    }
    setUpdatingId(null);
  }

  async function downloadCalendar(assignmentId: string) {
    setCalendarLoadingId(assignmentId);
    setMessage("");
    try {
      const response = await fetch(`/api/cleaner/jobs/${assignmentId}/calendar.ics`, { headers: headers() });
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(result?.message || text.calendarError);
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
      setMessage(text.calendarDownloaded);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : text.calendarError);
    }
    setCalendarLoadingId(null);
  }

  useEffect(() => { void loadJobs(); }, [token]);

  return <section className="rounded-[2rem] bg-porcelain p-6 shadow-soft md:p-7">
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <ShieldCheck className="mb-5 text-burgundy" />
        <h2 className="display text-4xl font-bold text-burgundy">{text.myOffers}</h2>
        <p className="mt-3 leading-7 text-ink/65">{text.intro}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[.14em]"><span className="rounded-full bg-cream px-3 py-1 text-ink/55 ring-1 ring-burgundy/10">{count} {text.offers}</span>{role && <span className="rounded-full bg-gold px-3 py-1 text-ink">{translateRole(role, lang)}</span>}</div>
      </div>
      <button type="button" onClick={loadJobs} className="inline-flex items-center justify-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-bold text-burgundy">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}{text.refresh}</button>
    </div>

    {message && <p className="mt-5 rounded-2xl bg-burgundy/10 p-4 text-sm font-bold text-burgundy">{message}</p>}
    {loading ? <div className="grid min-h-32 place-items-center text-burgundy"><Loader2 className="h-7 w-7 animate-spin" /></div> : jobs.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-burgundy/20 bg-cream p-5 text-sm leading-7 text-ink/65">{text.noOffers}</div> : <div className="mt-6 grid gap-5">{jobs.map((job) => {
      const booking = job.booking;
      if (!booking) return null;
      const isOffer = !["accepted", "declined", "confirmed", "completed", "cancelled"].includes(job.assignment.status);
      const isUpdating = updatingId === job.assignment.id;
      const googleUrl = googleCalendarUrl(booking, lang);
      const showCalendar = job.assignment.status === "confirmed" || job.assignment.status === "completed";
      const showTimeReport = job.assignment.status === "confirmed" || job.assignment.status === "completed";
      const notes = shortNote(booking.notes, lang);

      return <article key={job.assignment.id} className="rounded-[2rem] bg-cream p-5 text-sm ring-1 ring-burgundy/10 md:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_260px] lg:items-start">
          <div><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[.14em] ${pillClass(job.assignment.status)}`}>{label(job.assignment.status, lang)}</span><h3 className="display mt-3 text-3xl font-bold text-burgundy md:text-4xl">{translateValue(booking.service, lang)}</h3><p className="mt-3 flex items-start gap-2 text-base font-bold text-ink"><MapPin className="mt-1 h-4 w-4 shrink-0 text-burgundy" /> {booking.address || booking.area}</p><p className="mt-2 text-sm text-ink/55">{booking.area}</p></div>
          <div className="rounded-[1.5rem] bg-porcelain p-4 text-sm font-bold text-ink"><p className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-burgundy" /> <span>{formatDate(booking.preferred_date, lang)}</span></p><p className="mt-2 rounded-full bg-cream px-3 py-2 text-xs uppercase tracking-[.12em] text-ink/60">{translateValue(booking.time_window, lang) || text.flexible}</p></div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {isOffer && <button type="button" disabled={isUpdating} onClick={() => respond(job.assignment.id, "accepted")} className="inline-flex items-center gap-2 rounded-full bg-green-100 px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-green-800 ring-1 ring-green-200 disabled:opacity-50">{isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{text.available}</button>}
          {isOffer && <button type="button" disabled={isUpdating} onClick={() => respond(job.assignment.id, "declined")} className="inline-flex items-center gap-2 rounded-full bg-red-100 px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-red-800 ring-1 ring-red-200 disabled:opacity-50">{isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}{text.notAvailable}</button>}
          {job.assignment.status === "accepted" && <span className="rounded-full bg-green-100 px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-green-800 ring-1 ring-green-200">{text.waiting}</span>}
          {job.assignment.status === "confirmed" && <button type="button" disabled={isUpdating} onClick={() => respond(job.assignment.id, "completed")} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-porcelain ring-1 ring-ink/15 disabled:opacity-50">{isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{text.markCompleted}</button>}
          {showCalendar && googleUrl && <a href={googleUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-burgundy px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-porcelain"><ExternalLink className="h-4 w-4" />{text.googleCalendar}</a>}
          {showCalendar && <button type="button" disabled={calendarLoadingId === job.assignment.id} onClick={() => downloadCalendar(job.assignment.id)} className="inline-flex items-center gap-2 rounded-full bg-porcelain px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-burgundy ring-1 ring-burgundy/10 disabled:opacity-50">{calendarLoadingId === job.assignment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}{text.downloadIcs}</button>}
          {job.assignment.status === "declined" && <span className="rounded-full bg-red-100 px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-red-800 ring-1 ring-red-200">{text.notAvailable}</span>}
          {job.assignment.status === "completed" && <span className="rounded-full bg-ink px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-porcelain">{text.completed}</span>}
        </div>

        <div className="mt-5 grid gap-3 rounded-[1.5rem] bg-porcelain p-4 sm:grid-cols-2 lg:grid-cols-4"><p><strong>{text.customer}:</strong> {booking.customer_name}</p><p><strong>{text.phone}:</strong> {booking.customer_phone || "—"}</p><p><strong>{text.size}:</strong> {booking.size_sqm ? `${booking.size_sqm} ${lang === "sv" ? "kvm" : "sqm"}` : "—"}</p><p><strong>{text.frequency}:</strong> {translateValue(booking.frequency, lang)}</p></div>
        {notes.length > 0 && <div className="mt-4 rounded-[1.5rem] bg-porcelain p-4 text-sm leading-7 text-ink/70"><strong className="text-ink">{text.jobDetails}</strong><ul className="mt-3 grid gap-2 md:grid-cols-2">{notes.map((line, index) => <li key={`${line}-${index}`} className="rounded-2xl bg-cream px-4 py-2">{line}</li>)}</ul></div>}
        {job.assignment.note && <p className="mt-4 rounded-2xl bg-gold/20 p-4 text-sm leading-7 text-ink/70"><strong>{text.adminNote}:</strong><br />{job.assignment.note}</p>}
        {showTimeReport && <CleanerTimeEntryForm token={token} assignmentId={job.assignment.id} defaultDate={booking.preferred_date} lang={lang} />}
      </article>;
    })}</div>}
  </section>;
}
