"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronDown, ChevronRight, Loader2, PlusCircle, ShieldCheck, XCircle } from "lucide-react";
import AdminNoteBox from "./AdminNoteBox";
import AvailableCleanersBox from "./AvailableCleanersBox";

type AdminBooking = {
  id: string;
  user_id: string | null;
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
  admin_notes: string | null;
  status: string | null;
  created_at: string;
};

type RecurringGroup = {
  key: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  service: string;
  area: string;
  address: string | null;
  frequency: string | null;
  visits: AdminBooking[];
};

type BulkEmailResult = { sent?: boolean; skipped?: boolean; reason?: string | null };
type BulkStatusResponse = { ok?: boolean; message?: string; count?: number; email?: BulkEmailResult };
type RenewResponse = { ok?: boolean; message?: string; count?: number; dates?: string[] };

type Props = {
  bookings: AdminBooking[];
  updatingId: string | null;
  updateStatus: (bookingId: string, status: string) => Promise<void>;
  getToken: () => Promise<string | null>;
  onBulkUpdated?: () => Promise<void>;
};

function statusLabel(status: string | null) {
  if (status === "cancelled") return "Avbokad";
  if (status === "confirmed") return "Bekräftad";
  if (status === "completed") return "Klar";
  return "Ny";
}

function statusPillClass(status: string | null) {
  if (status === "cancelled") return "bg-red-100 text-red-800 ring-1 ring-red-200";
  if (status === "confirmed") return "bg-green-100 text-green-800 ring-1 ring-green-200";
  if (status === "completed") return "bg-ink text-porcelain ring-1 ring-ink/20";
  return "bg-burgundy text-porcelain ring-1 ring-burgundy/20";
}

function statusCardClass(status: string | null) {
  if (status === "cancelled") return "border-red-200 bg-red-50/70 opacity-80";
  if (status === "confirmed") return "border-green-200 bg-green-50/70";
  if (status === "completed") return "border-ink/15 bg-porcelain";
  return "border-burgundy/20 bg-cream";
}

function statusAccentClass(status: string | null) {
  if (status === "cancelled") return "bg-red-500";
  if (status === "confirmed") return "bg-green-500";
  if (status === "completed") return "bg-ink";
  return "bg-burgundy";
}

function getRecurringInfo(booking: AdminBooking) {
  const match = (booking.notes || "").match(/Visit:\s*(\d+)\s*of\s*(\d+)/i);
  if (match) return { current: Number(match[1]), total: Number(match[2]) };
  return { current: null, total: null };
}

function groupKey(booking: AdminBooking) {
  return [booking.customer_email || booking.customer_name, booking.service, booking.address || booking.area, booking.frequency || "recurring"]
    .map((value) => String(value || "").trim().toLowerCase())
    .join("|");
}

function groupBookings(bookings: AdminBooking[]) {
  const map = new Map<string, RecurringGroup>();
  for (const booking of bookings) {
    const key = groupKey(booking);
    const existing = map.get(key);
    if (existing) existing.visits.push(booking);
    else map.set(key, {
      key,
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
      customerPhone: booking.customer_phone,
      service: booking.service,
      area: booking.area,
      address: booking.address,
      frequency: booking.frequency,
      visits: [booking]
    });
  }

  return [...map.values()]
    .map((group) => ({ ...group, visits: [...group.visits].sort((a, b) => String(a.preferred_date || "9999-12-31").localeCompare(String(b.preferred_date || "9999-12-31"))) }))
    .sort((a, b) => String(a.visits[0]?.preferred_date || "9999-12-31").localeCompare(String(b.visits[0]?.preferred_date || "9999-12-31")));
}

function countByStatus(visits: AdminBooking[], status: string) {
  return visits.filter((visit) => (visit.status || "new") === status).length;
}

function activeVisitIds(visits: AdminBooking[]) {
  return visits.filter((visit) => !["completed", "cancelled"].includes(visit.status || "new")).map((visit) => visit.id);
}

function nextActiveVisit(visits: AdminBooking[]) {
  return visits.find((visit) => !["completed", "cancelled"].includes(visit.status || "new")) || visits[0];
}

function bulkEmailMessage(email?: BulkEmailResult) {
  if (email?.sent) return "One summary email was sent to the customer.";
  if (email?.skipped) return `Summary email was not sent: ${email.reason || "skipped"}.`;
  if (email && email.sent === false) return `Summary email failed: ${email.reason || "unknown error"}.`;
  return "Summary email status unknown.";
}

export default function AdminRecurringGroupView({ bookings, updatingId, updateStatus, getToken, onBulkUpdated }: Props) {
  const groups = useMemo(() => groupBookings(bookings), [bookings]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [bulkUpdatingKey, setBulkUpdatingKey] = useState<string | null>(null);
  const [bulkMessage, setBulkMessage] = useState("");

  function toggleGroup(key: string) {
    setOpenGroups((current) => ({ ...current, [key]: !current[key] }));
  }

  async function refreshAfterBulk() {
    if (onBulkUpdated) {
      await onBulkUpdated();
      return;
    }
    if (typeof window !== "undefined") window.location.reload();
  }

  async function bulkUpdate(group: RecurringGroup, status: "confirmed" | "completed" | "cancelled") {
    const ids = activeVisitIds(group.visits);
    if (!ids.length) {
      setBulkMessage("No active visits to update in this group.");
      return;
    }

    setBulkUpdatingKey(`${group.key}:${status}`);
    setBulkMessage("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Du behöver logga in igen.");
      const response = await fetch("/api/admin/bookings/bulk-status", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ bookingIds: ids, status })
      });
      const result = await response.json().catch(() => null) as BulkStatusResponse | null;
      if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not update recurring visits.");
      setBulkMessage(`Updated ${result.count || 0} visits to ${status}. ${bulkEmailMessage(result.email)}`);
      await refreshAfterBulk();
    } catch (error) {
      setBulkMessage(error instanceof Error ? error.message : "Could not update recurring visits.");
    }
    setBulkUpdatingKey(null);
  }

  async function renewGroup(group: RecurringGroup) {
    const ids = group.visits.map((visit) => visit.id);
    setBulkUpdatingKey(`${group.key}:renew`);
    setBulkMessage("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Du behöver logga in igen.");
      const response = await fetch("/api/admin/bookings/renew-recurring", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ bookingIds: ids })
      });
      const result = await response.json().catch(() => null) as RenewResponse | null;
      if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not renew recurring visits.");
      setBulkMessage(`Renewed ${result.count || 0} next visits. ${result.dates?.length ? `Dates: ${result.dates.join(", ")}` : result.message || ""}`);
      await refreshAfterBulk();
    } catch (error) {
      setBulkMessage(error instanceof Error ? error.message : "Could not renew recurring visits.");
    }
    setBulkUpdatingKey(null);
  }

  if (!groups.length) return <div className="rounded-[2rem] border border-dashed border-burgundy/20 bg-cream p-6 text-ink/65">Inga recurring-bokningar matchar filter/sökning.</div>;

  return (
    <div className="grid gap-4">
      {bulkMessage && <p className="rounded-2xl bg-burgundy/10 p-4 text-sm font-bold text-burgundy">{bulkMessage}</p>}
      {groups.map((group) => {
        const isOpen = openGroups[group.key] ?? false;
        const unassigned = countByStatus(group.visits, "new");
        const confirmed = countByStatus(group.visits, "confirmed");
        const completed = countByStatus(group.visits, "completed");
        const cancelled = countByStatus(group.visits, "cancelled");
        const firstDate = group.visits[0]?.preferred_date || "—";
        const lastDate = group.visits[group.visits.length - 1]?.preferred_date || "—";
        const activeCount = activeVisitIds(group.visits).length;
        const nextVisit = nextActiveVisit(group.visits);

        return (
          <section key={group.key} className="rounded-[2rem] border border-burgundy/10 bg-porcelain p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gold px-3 py-1 text-xs font-black uppercase tracking-[.16em] text-ink">
                  <CalendarDays className="h-3.5 w-3.5" /> Recurring group
                </div>
                <h2 className="display break-words text-3xl font-bold text-burgundy">{group.customerName}</h2>
                <p className="mt-2 break-words text-sm font-bold text-ink/60">{group.service} · {group.frequency || "Recurring"} · {group.area}{group.address ? ` · ${group.address}` : ""}</p>
                <p className="mt-2 break-words text-sm text-ink/55">{group.customerEmail}{group.customerPhone ? ` · ${group.customerPhone}` : ""}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[.12em]">
                  <span className="rounded-full bg-cream px-3 py-1 text-ink/65 ring-1 ring-burgundy/10">{group.visits.length} visits</span>
                  <span className="rounded-full bg-burgundy px-3 py-1 text-porcelain">New {unassigned}</span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-green-800 ring-1 ring-green-200">Confirmed {confirmed}</span>
                  <span className="rounded-full bg-ink px-3 py-1 text-porcelain">Klar {completed}</span>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-red-800 ring-1 ring-red-200">Avbokad {cancelled}</span>
                </div>
                <div className="mt-3 grid gap-2 text-xs font-bold text-ink/45 sm:grid-cols-3">
                  <p>Next active: {nextVisit?.preferred_date || "—"}</p>
                  <p>Period: {firstDate} → {lastDate}</p>
                  <p>Active visits: {activeCount}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => toggleGroup(group.key)} className="inline-flex items-center justify-center gap-2 rounded-full bg-burgundy px-5 py-3 text-sm font-black text-porcelain">
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  {isOpen ? "Hide visits" : "Show visits"}
                </button>
                <p className="text-center text-xs font-bold text-ink/45">Open only when needed</p>
              </div>
            </div>

            {isOpen && (
              <>
                <div className="mt-4 flex flex-wrap gap-2 rounded-2xl bg-cream p-3">
                  <button type="button" disabled={Boolean(bulkUpdatingKey)} onClick={() => renewGroup(group)} className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-ink ring-1 ring-gold/30 disabled:opacity-50">
                    {bulkUpdatingKey === `${group.key}:renew` ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                    Renew next visits
                  </button>
                  <button type="button" disabled={!activeCount || Boolean(bulkUpdatingKey)} onClick={() => bulkUpdate(group, "confirmed")} className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-green-800 ring-1 ring-green-200 disabled:opacity-50">
                    {bulkUpdatingKey === `${group.key}:confirmed` ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Confirm active
                  </button>
                  <button type="button" disabled={!activeCount || Boolean(bulkUpdatingKey)} onClick={() => bulkUpdate(group, "completed")} className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-porcelain ring-1 ring-ink/15 disabled:opacity-50">
                    {bulkUpdatingKey === `${group.key}:completed` ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Mark active completed
                  </button>
                  <button type="button" disabled={!activeCount || Boolean(bulkUpdatingKey)} onClick={() => bulkUpdate(group, "cancelled")} className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-red-800 ring-1 ring-red-200 disabled:opacity-50">
                    {bulkUpdatingKey === `${group.key}:cancelled` ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    Cancel active
                  </button>
                  <p className="w-full text-xs font-bold text-ink/45">Renew creates the next planned visits for this recurring customer. Bulk status actions send one summary email to the customer.</p>
                </div>

                <div className="mt-5 grid gap-4">
                  {group.visits.map((booking) => {
                    const currentStatus = booking.status || "new";
                    const isUpdating = updatingId === booking.id;
                    const recurring = getRecurringInfo(booking);
                    return (
                      <article key={booking.id} className={`relative overflow-hidden rounded-[1.5rem] border p-4 shadow-sm ${statusCardClass(currentStatus)}`}>
                        <span className={`absolute inset-y-0 left-0 w-1.5 ${statusAccentClass(currentStatus)}`} />
                        <div className="flex flex-col gap-4 pl-1 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap gap-2">
                              <p className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[.18em] ${statusPillClass(currentStatus)}`}><ShieldCheck className="h-3.5 w-3.5" /> {statusLabel(currentStatus)}</p>
                              <p className="inline-flex items-center rounded-full bg-gold px-3 py-1 text-xs font-black uppercase tracking-[.16em] text-ink">Visit {recurring.current && recurring.total ? `${recurring.current}/${recurring.total}` : ""}</p>
                            </div>
                            <h3 className="display mt-3 break-words text-2xl font-bold text-burgundy">{booking.service}</h3>
                            <p className="mt-2 break-words leading-7 text-ink/70">{booking.area}{booking.address ? ` · ${booking.address}` : ""}</p>
                          </div>
                          <select value={currentStatus} onChange={(event) => updateStatus(booking.id, event.target.value)} disabled={isUpdating} className="w-full rounded-2xl border border-burgundy/10 bg-porcelain px-4 py-3 text-sm font-bold text-ink outline-none disabled:opacity-50 sm:w-auto">
                            <option value="new">Ny</option>
                            <option value="confirmed">Bekräftad</option>
                            <option value="completed">Klar</option>
                            <option value="cancelled">Avbokad</option>
                          </select>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 pl-1">
                          <button disabled={isUpdating || currentStatus === "confirmed"} onClick={() => updateStatus(booking.id, "confirmed")} className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-800 ring-1 ring-green-200 disabled:opacity-40"><CheckCircle2 className="h-4 w-4" /> Bekräfta</button>
                          <button disabled={isUpdating || currentStatus === "completed"} onClick={() => updateStatus(booking.id, "completed")} className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-porcelain ring-1 ring-ink/15 disabled:opacity-40"><CheckCircle2 className="h-4 w-4" /> Klar</button>
                          <button disabled={isUpdating || currentStatus === "cancelled"} onClick={() => updateStatus(booking.id, "cancelled")} className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-800 ring-1 ring-red-200 disabled:opacity-40"><XCircle className="h-4 w-4" /> Avboka</button>
                          {isUpdating && <span className="inline-flex items-center gap-2 rounded-full bg-porcelain px-4 py-2 text-sm font-bold text-burgundy"><Loader2 className="h-4 w-4 animate-spin" /> Uppdaterar</span>}
                        </div>
                        <div className="mt-4 grid gap-3 rounded-[1.5rem] bg-porcelain/70 p-4 text-sm text-ink/68 md:grid-cols-2 xl:grid-cols-4">
                          <p><strong className="text-ink">Kund:</strong> {booking.customer_name}</p><p className="break-words"><strong className="text-ink">E-post:</strong> {booking.customer_email}</p><p><strong className="text-ink">Telefon:</strong> {booking.customer_phone || "—"}</p><p><strong className="text-ink">Datum:</strong> {booking.preferred_date || "—"}</p><p><strong className="text-ink">Storlek:</strong> {booking.size_sqm ? `${booking.size_sqm} kvm` : "—"}</p><p><strong className="text-ink">Frekvens:</strong> {booking.frequency || "—"}</p><p><strong className="text-ink">Tid:</strong> {booking.time_window || "—"}</p><p><strong className="text-ink">Skapad:</strong> {new Date(booking.created_at).toLocaleDateString("sv-SE")}</p>
                        </div>
                        <AvailableCleanersBox bookingId={booking.id} getToken={getToken} />
                        {booking.notes && <p className="mt-4 rounded-2xl bg-porcelain p-4 text-sm leading-7 text-ink/65"><strong>Kundens önskemål:</strong><br />{booking.notes}</p>}
                        <AdminNoteBox bookingId={booking.id} initialNote={booking.admin_notes || ""} />
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}
