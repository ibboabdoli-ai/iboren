"use client";

import { Download } from "lucide-react";

type CsvBooking = {
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
  admin_notes: string | null;
  status: string | null;
  created_at: string;
};

function statusLabel(status: string | null) {
  if (status === "cancelled") return "Avbokad";
  if (status === "confirmed") return "Bekräftad";
  if (status === "completed") return "Klar";
  return "Ny";
}

function formatDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function csvEscape(value: unknown) {
  const text = String(value ?? "").replace(/\r?\n|\r/g, " ").trim();
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(bookings: CsvBooking[]) {
  const headers = [
    "ID",
    "Status",
    "Tjänst",
    "Område",
    "Adress",
    "Storlek kvm",
    "Frekvens",
    "Bokningsdatum",
    "Tidsfönster",
    "Kundnamn",
    "E-post",
    "Telefon",
    "Kundens önskemål",
    "Adminanteckning",
    "Skapad"
  ];

  const rows = bookings.map((booking) => [
    booking.id,
    statusLabel(booking.status),
    booking.service,
    booking.area,
    booking.address,
    booking.size_sqm,
    booking.frequency,
    booking.preferred_date,
    booking.time_window,
    booking.customer_name,
    booking.customer_email,
    booking.customer_phone,
    booking.notes,
    booking.admin_notes,
    formatDate(booking.created_at)
  ]);

  // Swedish Excel commonly expects semicolon-separated CSV.
  return [headers, ...rows]
    .map((row) => row.map(csvEscape).join(";"))
    .join("\r\n");
}

export default function AdminCsvExport({ bookings }: { bookings: CsvBooking[] }) {
  function exportCsv() {
    const csv = buildCsv(bookings);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.href = url;
    link.download = `iboren-bokningar-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={exportCsv}
      disabled={!bookings.length}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-gold/40 bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink shadow-lg transition hover:bg-porcelain disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      aria-label="Exportera bokningar som Excel-vänlig CSV"
    >
      <Download className="h-4 w-4" />
      Exportera Excel CSV
    </button>
  );
}
