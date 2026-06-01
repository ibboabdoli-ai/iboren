import type { SupabaseClient } from "@supabase/supabase-js";

export type BookingNumberPayload = {
  service: string | null | undefined;
  area: string | null | undefined;
  createdAt?: Date;
};

type RpcClient = Pick<SupabaseClient, "rpc" | "from">;

const SERVICE_CODES: Array<[RegExp, string]> = [
  [/hemstädning|home cleaning/i, "HEM"],
  [/flyttstädning|move.?out cleaning/i, "FLY"],
  [/storstädning|deep cleaning/i, "STO"],
  [/kontorsstädning|office cleaning/i, "KON"],
  [/fönsterputs|fonsterputs|window cleaning/i, "FON"],
  [/trappstädning|stairwell cleaning/i, "TRA"],
  [/byggstädning|construction cleaning/i, "BYG"],
  [/visningsstädning|showing cleaning/i, "VIS"]
];

const AREA_CODES: Array<[RegExp, string]> = [
  [/södertälje|sodertalje/i, "SOD"],
  [/stockholm/i, "STO"],
  [/nykvarn/i, "NYK"],
  [/salem/i, "SAL"],
  [/botkyrka/i, "BOT"],
  [/huddinge/i, "HUD"]
];

function normalize(value: string | null | undefined) {
  return String(value || "").trim();
}

export function getServiceCode(service: string | null | undefined) {
  const value = normalize(service);
  const match = SERVICE_CODES.find(([pattern]) => pattern.test(value));
  return match?.[1] || "OVR";
}

export function getAreaCode(area: string | null | undefined) {
  const value = normalize(area);
  const match = AREA_CODES.find(([pattern]) => pattern.test(value));
  return match?.[1] || "OVR";
}

export function formatBookingDateKey(date = new Date()) {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function formatBookingNumber(params: BookingNumberPayload & { sequence: number }) {
  const dayKey = formatBookingDateKey(params.createdAt || new Date());
  const serviceCode = getServiceCode(params.service);
  const areaCode = getAreaCode(params.area);
  const sequence = Math.max(1, Math.floor(params.sequence)).toString().padStart(3, "0");
  return `IB-${dayKey}-${serviceCode}-${areaCode}-${sequence}`;
}

async function bookingNumberExists(client: RpcClient, bookingNumber: string) {
  const [bookingResult, requestResult] = await Promise.all([
    client.from("bookings").select("id").eq("booking_number", bookingNumber).maybeSingle(),
    client.from("public_booking_requests").select("id").eq("booking_number", bookingNumber).maybeSingle()
  ]);

  if (bookingResult.error && bookingResult.error.code !== "PGRST116") throw bookingResult.error;
  if (requestResult.error && requestResult.error.code !== "PGRST116") throw requestResult.error;

  return Boolean(bookingResult.data || requestResult.data);
}

export async function generateBookingNumber(client: RpcClient, params: BookingNumberPayload) {
  const createdAt = params.createdAt || new Date();
  const dayKey = formatBookingDateKey(createdAt);

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const { data, error } = await client.rpc("next_iboren_booking_sequence", { p_day_key: dayKey });
    if (error) throw error;

    const sequence = Number(data);
    if (!Number.isFinite(sequence) || sequence < 1) throw new Error("Invalid booking number sequence from database.");

    const bookingNumber = formatBookingNumber({ ...params, createdAt, sequence });
    const exists = await bookingNumberExists(client, bookingNumber);
    if (!exists) return bookingNumber;
  }

  throw new Error("Could not generate a unique booking number after multiple attempts.");
}

export function displayBookingReference(booking: { id?: string | null; booking_number?: string | null }, labels?: { bookingNumber?: string; bookingId?: string }) {
  const bookingNumberLabel = labels?.bookingNumber || "Bokningsnummer";
  const bookingIdLabel = labels?.bookingId || "Boknings-ID";
  if (booking.booking_number) return `${bookingNumberLabel}: ${booking.booking_number}`;
  const fallback = String(booking.id || "").slice(0, 8);
  return `${bookingIdLabel}: ${fallback || "—"}`;
}
