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

type ParsedNotes = {
  propertyType: string;
  rooms: string;
  bathrooms: string;
  pets: string;
  floor: string;
  elevator: string;
  parking: string;
  extras: string;
  customerRequest: string;
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

function pickLine(lines: string[], label: string) {
  const prefix = `${label}:`;
  const line = lines.find((item) => item.trim().toLowerCase().startsWith(prefix.toLowerCase()));
  return line ? line.slice(prefix.length).trim() : "";
}

function parseNotes(notes: string | null): ParsedNotes {
  const text = String(notes ?? "").replace(/\r\n/g, "\n");
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const customerMarkerIndex = lines.findIndex((line) => line.includes("Kundens önskemål"));

  return {
    propertyType: pickLine(lines, "Typ av objekt"),
    rooms: pickLine(lines, "Antal rum"),
    bathrooms: pickLine(lines, "Antal badrum"),
    pets: pickLine(lines, "Husdjur"),
    floor: pickLine(lines, "Våning"),
    elevator: pickLine(lines, "Hiss"),
    parking: pickLine(lines, "Parkering"),
    extras: pickLine(lines, "Extra tjänster"),
    customerRequest: customerMarkerIndex >= 0 ? lines.slice(customerMarkerIndex + 1).join(" | ") : ""
  };
}

function csvEscape(value: unknown) {
  const text = String(value ?? "").replace(/\r?\n|\r/g, " | ").trim();
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
    "Typ av objekt",
    "Antal rum",
    "Antal badrum",
    "Husdjur",
    "Våning",
    "Hiss",
    "Parkering",
    "Extra tjänster",
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

  const rows = bookings.map((booking) => {
    const parsed = parseNotes(booking.notes);
    return [
      booking.id,
      statusLabel(booking.status),
      booking.service,
      booking.area,
      booking.address,
      booking.size_sqm,
      parsed.propertyType,
      parsed.rooms,
      parsed.bathrooms,
      parsed.pets,
      parsed.floor,
      parsed.elevator,
      parsed.parking,
      parsed.extras,
      booking.frequency,
      booking.preferred_date,
      booking.time_window,
      booking.customer_name,
      booking.customer_email,
      booking.customer_phone,
      parsed.customerRequest || booking.notes,
      booking.admin_notes,
      formatDate(booking.created_at)
    ];
  });

  // Swedish Excel expects semicolon-separated CSV. The sep row tells Excel to split columns correctly.
  return ["sep=;", [headers, ...rows].map((row) => row.map(csvEscape).join(";")).join("\r\n")].join("\r\n");
}

export default function AdminCsvExport({ bookings }: { bookings: CsvBooking[] }) {
  function exportCsv() {
    const csv = buildCsv(bookings);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.href = url;
    link.download = `iboren-bokningar-excel-${date}.csv`;
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
