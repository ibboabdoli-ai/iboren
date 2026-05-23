export type BookingStatusLocale = "sv" | "en";

export function getBookingStatusLocale(notes: string | null | undefined): BookingStatusLocale {
  const value = String(notes || "").toLowerCase();
  if (value.includes("language: en")) return "en";
  if (value.includes("property & details")) return "en";
  return "sv";
}
