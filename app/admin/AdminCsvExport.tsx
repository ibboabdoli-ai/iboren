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

function csvEscape(value: unknown) {
  const text = String(value ?? "").replace(/\r?\n|\r/g, " ");
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(bookings: CsvBooking[]) {
  const headers = [
    "ID",
    "Status",
    "Service",
    "Area",
    "Address",
    "Size sqm",
    "Frequency",
    "Preferred date",
    "Time window",
    "Customer name",
    "Customer email",
    "Customer phone",
    "Customer notes",
    "Admin notes",
    "Created at"
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
    booking.created_at
  ]);

  return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

export default function AdminCsvExport({ bookings }: { bookings: CsvBooking[] }) {
  function exportCsv() {
    const csv = buildCsv(bookings);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.href = url;
    link.download = `iboren-bookings-${date}.csv`;
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
      className="inline-flex items-center justify-center gap-2 rounded-full bg-burgundy px-4 py-2 text-sm font-bold text-porcelain disabled:opacity-40"
    >
      <Download className="h-4 w-4" />
      Exportera CSV
    </button>
  );
}
