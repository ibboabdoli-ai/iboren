import type { BookingFormLanguage } from "./bookingFormModel";

export type BookingGeolocationSuccess = {
  ok: true;
  address: string;
  area?: string;
  message: string;
};

export type BookingGeolocationFailure = {
  ok: false;
  message: string;
};

export type BookingGeolocationResult = BookingGeolocationSuccess | BookingGeolocationFailure;

type ReverseGeocodeResponse = {
  ok?: boolean;
  address?: string;
  area?: string;
  message?: string;
};

export function getLocationLoadingMessage(language: BookingFormLanguage) {
  return language === "sv" ? "Hämtar din position..." : "Getting your location...";
}

function getLocationSuccessMessage(language: BookingFormLanguage) {
  return language === "sv"
    ? "Adressen har fyllts i från din position. Kontrollera att den stämmer."
    : "The address has been filled from your location. Please check that it is correct.";
}

export function getLocationFailureMessage(language: BookingFormLanguage) {
  return language === "sv"
    ? "Kunde inte hämta adressen. Skriv adressen manuellt."
    : "Could not get the address. Please enter it manually.";
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    });
  });
}

export async function getAddressFromCurrentLocation(language: BookingFormLanguage): Promise<BookingGeolocationResult> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return { ok: false, message: getLocationFailureMessage(language) };
  }

  try {
    const position = await getCurrentPosition();
    const lat = encodeURIComponent(String(position.coords.latitude));
    const lon = encodeURIComponent(String(position.coords.longitude));
    const response = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
    const json = (await response.json().catch(() => null)) as ReverseGeocodeResponse | null;

    if (!response.ok || !json?.ok || !json.address) {
      return { ok: false, message: getLocationFailureMessage(language) };
    }

    return {
      ok: true,
      address: json.address,
      area: json.area,
      message: getLocationSuccessMessage(language)
    };
  } catch {
    return { ok: false, message: getLocationFailureMessage(language) };
  }
}
