import { NextResponse } from "next/server";

type NominatimAddress = Record<string, string | undefined>;

type NominatimResponse = {
  display_name?: string;
  address?: NominatimAddress;
};

function pickCity(address: NominatimAddress) {
  return address.city || address.town || address.village || address.municipality || address.county || "";
}

function formatStreetAddress(address: NominatimAddress, fallback = "") {
  const street = address.road || address.pedestrian || address.footway || address.path || address.residential || "";
  const houseNumber = address.house_number || "";
  const postcode = address.postcode || "";
  const city = pickCity(address);
  const streetLine = [street, houseNumber].filter(Boolean).join(" ");
  const cityLine = [postcode, city].filter(Boolean).join(" ");
  return [streetLine, cityLine].filter(Boolean).join(", ") || fallback;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ ok: false, message: "Missing lat/lon" }, { status: 400 });
  }

  const latitude = Number(lat);
  const longitude = Number(lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ ok: false, message: "Invalid lat/lon" }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "sv");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "Iboren/1.0 (https://iboren.se)"
      },
      next: { revalidate: 86400 }
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false, message: "Could not fetch address" }, { status: 502 });
    }

    const data = (await response.json()) as NominatimResponse;
    const address = data.address || {};
    const formattedAddress = formatStreetAddress(address, data.display_name || "");
    const city = pickCity(address);

    return NextResponse.json({
      ok: true,
      address: formattedAddress,
      area: city,
      raw: data.display_name || ""
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Reverse geocoding failed" }, { status: 500 });
  }
}
