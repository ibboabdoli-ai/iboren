"use client";

import { useEffect } from "react";

const STORAGE_KEY = "iboren:calculatorEstimate:v1";

type CalculatorEstimate = {
  capturedAt?: string;
  language?: string;
  sourcePath?: string;
  inputs?: Record<string, string>;
  selectedButtons?: string[];
  result?: {
    title?: string;
    riskLabel?: string;
    priceBeforeRut?: string;
    priceAfterRut?: string;
    estimatedTime?: string;
  };
};

function cleanText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalize(value: unknown) {
  return cleanText(value).toLowerCase();
}

function canonical(value: unknown) {
  const key = normalize(value);
  const map: Record<string, string> = {
    "hemstädning": "home-cleaning",
    "home cleaning": "home-cleaning",
    "flyttstädning": "move-out-cleaning",
    "move-out cleaning": "move-out-cleaning",
    "kontorsstädning": "office-cleaning",
    "office cleaning": "office-cleaning",
    "fönsterputs": "window-cleaning",
    "window cleaning": "window-cleaning",
    "storstädning": "deep-cleaning",
    "deep cleaning": "deep-cleaning",
    "engång": "one-time",
    "one-time": "one-time",
    "varje vecka": "weekly",
    "every week": "weekly",
    "varannan vecka": "biweekly",
    "every other week": "biweekly",
    "varje månad": "monthly",
    "var fjärde vecka": "monthly",
    "every fourth week": "monthly",
    "every month": "monthly",
    "privatperson": "private-customer",
    "private customer": "private-customer",
    "företag": "company",
    "company": "company",
    "ja": "yes",
    "yes": "yes",
    "true": "yes",
    "nej": "no",
    "no": "no",
    "false": "no",
    "ugn": "oven",
    "ugnsrengöring": "oven",
    "oven": "oven",
    "oven cleaning": "oven",
    "kyl/frys": "fridge-freezer",
    "fridge/freezer": "fridge-freezer",
    "balkong": "balcony",
    "balcony": "balcony",
    "grovstädning": "deep-cleaning-addon",
    "extra smutsigt": "deep-cleaning-addon",
    "skåp/lådor": "cabinets-drawers",
    "cabinets/drawers": "cabinets-drawers"
  };
  return map[key] || key;
}

function sanitizeLine(value: unknown) {
  return cleanText(value).replace(/[<>]/g, "").slice(0, 500);
}

function readStoredEstimate(): CalculatorEstimate | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CalculatorEstimate;
  } catch {
    return null;
  }
}

function getEstimateInput(estimate: CalculatorEstimate, keys: string[]) {
  const entries = Object.entries(estimate.inputs || {});
  const wanted = keys.map(normalize);
  const match = entries.find(([key, value]) => cleanText(value) && wanted.some((item) => normalize(key).includes(item)));
  return cleanText(match?.[1]);
}

function firstFilled(...values: unknown[]) {
  for (const value of values) {
    const clean = cleanText(value);
    if (clean) return clean;
  }
  return "";
}

function addLine(lines: string[], label: string, value: unknown) {
  const clean = sanitizeLine(value);
  if (clean) lines.push(`${label}: ${clean}`);
}

function selectedContains(estimate: CalculatorEstimate, labels: string[]) {
  const selected = (estimate.selectedButtons || []).map(normalize);
  return labels.some((label) => selected.includes(normalize(label)));
}

function estimateCustomerType(estimate: CalculatorEstimate) {
  const input = getEstimateInput(estimate, ["kundtyp", "customer type"]);
  if (input) return canonical(input) === "company" ? "Företag" : "Privatperson";
  if (selectedContains(estimate, ["Företag", "Company"])) return "Företag";
  return "Privatperson";
}

function estimateRutRequested(estimate: CalculatorEstimate) {
  return canonical(getEstimateInput(estimate, ["rut"])) === "yes";
}

function customerFreeText(notes: unknown) {
  const raw = String(notes ?? "").replace(/\r/g, "");
  const markers = ["--- Customer notes ---", "--- Kundens önskemål ---"];
  for (const marker of markers) {
    const index = raw.indexOf(marker);
    if (index < 0) continue;
    const after = raw.slice(index + marker.length);
    return cleanText(after.split("--- Calculator snapshot ---")[0].split("--- Final booking submitted ---")[0].trim());
  }
  return "";
}

function buildCalculatorSection(estimate: CalculatorEstimate) {
  const lines = ["--- Calculator snapshot ---"];
  addLine(lines, "Captured at", estimate.capturedAt);
  addLine(lines, "Source", estimate.sourcePath);
  addLine(lines, "Language", estimate.language);
  addLine(lines, "Estimate title", estimate.result?.title);
  addLine(lines, "Estimate status", estimate.result?.riskLabel);
  addLine(lines, "Price before RUT", estimate.result?.priceBeforeRut);
  addLine(lines, "Price after RUT", estimate.result?.priceAfterRut);
  addLine(lines, "Estimated time", estimate.result?.estimatedTime);

  const inputs = Object.entries(estimate.inputs || {}).filter(([, value]) => cleanText(value));
  if (inputs.length) {
    lines.push("", "Calculator inputs:");
    inputs.forEach(([key, value]) => addLine(lines, key, value));
  }

  const addOns = estimateAddOns(estimate);
  if (addOns.length) lines.push("", `Selected add-ons: ${addOns.join(", ")}`);

  return lines.join("\n");
}

function bodyExtraServices(body: Record<string, unknown>) {
  const raw = body.extraServices ?? body.extra_services ?? body.addOns ?? body.add_ons;
  if (Array.isArray(raw)) return raw.map(sanitizeLine).filter(Boolean);
  return cleanText(raw).split(",").map(sanitizeLine).filter(Boolean);
}

function estimateAddOns(estimate: CalculatorEstimate) {
  const allowed = new Map([
    ["window-cleaning", "Fönsterputs"],
    ["oven", "Ugn"],
    ["fridge-freezer", "Kyl/frys"],
    ["balcony", "Balkong"],
    ["deep-cleaning-addon", "Grovstädning"],
    ["cabinets-drawers", "Skåp/lådor"]
  ]);
  const selected = (estimate.selectedButtons || []).map(canonical).filter((item) => allowed.has(item));
  return Array.from(new Set(selected)).map((item) => allowed.get(item) || item);
}

function comparableList(values: string[]) {
  return Array.from(new Set(values.map(canonical).filter(Boolean))).sort().join("|");
}

function numberValue(value: unknown) {
  const parsed = Number(cleanText(value).replace(/[^0-9]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function finalFieldMap(body: Record<string, unknown>) {
  return {
    service: firstFilled(body.service),
    area: firstFilled(body.area),
    address: firstFilled(body.address),
    size: firstFilled(body.size, body.sizeSqm, body.size_sqm),
    rooms: firstFilled(body.rooms, body.numberOfRooms, body.number_of_rooms),
    bathrooms: firstFilled(body.bathrooms, body.numberOfBathrooms, body.number_of_bathrooms),
    extraServices: bodyExtraServices(body),
    frequency: firstFilled(body.frequency),
    date: firstFilled(body.date, body.preferredDate, body.preferred_date),
    time: firstFilled(body.timeWindow, body.time, body.time_window),
    customerType: firstFilled(body.customerType),
    rutRequested: body.rutRequested === true || body.rutRequested === "true" ? "Yes" : body.rutRequested === false || body.rutRequested === "false" ? "No" : firstFilled(body.rutRequested),
    name: firstFilled(body.name, body.customerName, body.customer_name),
    email: firstFilled(body.email, body.customerEmail, body.customer_email),
    phone: firstFilled(body.phone, body.customerPhone, body.customer_phone)
  };
}

function buildFinalBookingSection(body: Record<string, unknown>) {
  const fields = finalFieldMap(body);
  const lines = ["--- Final booking submitted ---"];
  addLine(lines, "Service", fields.service);
  addLine(lines, "Area", fields.area);
  addLine(lines, "Address", fields.address);
  addLine(lines, "Size", fields.size);
  addLine(lines, "Rooms", fields.rooms);
  addLine(lines, "Bathrooms", fields.bathrooms);
  if (fields.extraServices.length) addLine(lines, "Extra services", fields.extraServices.join(", "));
  addLine(lines, "Frequency", fields.frequency);
  addLine(lines, "Date", fields.date);
  addLine(lines, "Time window", fields.time);
  addLine(lines, "Customer type", fields.customerType);
  addLine(lines, "RUT requested", fields.rutRequested);
  addLine(lines, "Name", fields.name);
  addLine(lines, "Email", fields.email);
  addLine(lines, "Phone", fields.phone);
  addLine(lines, "Customer free text", customerFreeText(body.notes));
  return lines.join("\n");
}

function buildChangesSection(estimate: CalculatorEstimate, body: Record<string, unknown>) {
  const finalFields = finalFieldMap(body);
  const comparisons: Array<[string, string, string]> = [
    ["Service", getEstimateInput(estimate, ["tjänst", "service"]), finalFields.service],
    ["Size", getEstimateInput(estimate, ["storlek", "size sqm", "size"]), finalFields.size],
    ["Rooms", getEstimateInput(estimate, ["antal rum", "rooms"]), finalFields.rooms],
    ["Bathrooms", getEstimateInput(estimate, ["antal badrum", "bathrooms"]), finalFields.bathrooms],
    ["Frequency", getEstimateInput(estimate, ["frekvens", "frequency"]), finalFields.frequency],
    ["Customer type", getEstimateInput(estimate, ["kundtyp", "customer type"]), finalFields.customerType],
    ["RUT", getEstimateInput(estimate, ["rut"]), finalFields.rutRequested],
    ["Extra services", estimateAddOns(estimate).join(", "), finalFields.extraServices.join(", ")]
  ];

  const changes = comparisons
    .map(([label, from, to]) => [label, sanitizeLine(from), sanitizeLine(to)] as const)
    .filter(([label, from, to]) => {
      if (!from && !to) return false;
      if (label === "Extra services") return comparableList(from.split(",")) !== comparableList(to.split(","));
      return from && to && canonical(from) !== canonical(to);
    });

  if (!changes.length) return "--- Changes after estimate ---\nNo key changes detected between calculator estimate and submitted booking.";

  return ["--- Changes after estimate ---", ...changes.map(([label, from, to]) => `${label}: ${from || "not set"} -> ${to || "not set"}`)].join("\n");
}

function buildAdminCheckSection(estimate: CalculatorEstimate, body: Record<string, unknown>) {
  const fields = finalFieldMap(body);
  const warnings: string[] = [];
  const size = numberValue(fields.size);
  const rooms = numberValue(fields.rooms);
  const bathrooms = numberValue(fields.bathrooms);
  const estimateBathrooms = numberValue(getEstimateInput(estimate, ["antal badrum", "bathrooms"]));

  if (size > 180) warnings.push(`Large home: ${size} sqm. Manual price check recommended.`);
  if (rooms > 10) warnings.push(`Many rooms: ${rooms}. Check that the booking value is correct.`);
  if (bathrooms > 5) warnings.push(`Many bathrooms: ${bathrooms}. Check that the booking value is correct.`);
  if (estimateBathrooms > 10) warnings.push(`Calculator bathrooms looked unusual: ${estimateBathrooms}. Price indication may need manual check.`);
  if (fields.extraServices.length > 3) warnings.push(`Many extra services selected: ${fields.extraServices.join(", ")}. Check that the price indication covers the work.`);

  if (!warnings.length) return "--- Admin check ---\nStatus: OK\nNo admin warnings detected.";
  return ["--- Admin check ---", "Status: Manual check recommended", "Warnings:", ...warnings.map((warning) => `- ${sanitizeLine(warning)}`)].join("\n");
}

function appendSnapshotToNotes(body: Record<string, unknown>) {
  const estimate = readStoredEstimate();
  if (!estimate) return body;
  if (body.__calculatorSnapshotAttached === true) return body;

  const enhancedBody: Record<string, unknown> = {
    ...body,
    customerType: body.customerType || estimateCustomerType(estimate),
    rutRequested: body.rutRequested ?? estimateRutRequested(estimate)
  };

  const existingNotes = cleanText(enhancedBody.notes);
  const snapshotText = [
    existingNotes,
    "",
    buildCalculatorSection(estimate),
    "",
    buildFinalBookingSection(enhancedBody),
    "",
    buildChangesSection(estimate, enhancedBody),
    "",
    buildAdminCheckSection(estimate, enhancedBody)
  ].filter((part) => cleanText(part)).join("\n");

  return {
    ...enhancedBody,
    notes: snapshotText.slice(0, 14000),
    calculatorEstimate: estimate,
    __calculatorSnapshotAttached: true
  };
}

export default function BookingSubmissionSnapshot() {
  useEffect(() => {
    const previousFetch = window.fetch.bind(window);

    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      const method = init?.method?.toUpperCase();

      if (url.includes("/api/bookings") && method === "POST" && typeof init?.body === "string") {
        try {
          const body = JSON.parse(init.body) as Record<string, unknown>;
          init = { ...init, body: JSON.stringify(appendSnapshotToNotes(body)) };
        } catch {
          // Never block booking submission if snapshot formatting fails.
        }
      }

      return previousFetch(input, init);
    }) as typeof window.fetch;

    return () => {
      window.fetch = previousFetch;
    };
  }, []);

  return null;
}
