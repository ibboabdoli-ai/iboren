type Language = "sv" | "en";

type SnapshotPayload = {
  notes: string;
  name: string;
  area: string;
};

type SnapshotOptions = {
  includeWarnings?: boolean;
};

function isSectionLine(line: string) {
  return /^---\s*.+\s*---$/.test(line.trim());
}

function extractSection(notes: string, headings: string[]) {
  const lines = notes.split("\n");
  const targetHeadings = headings.map((heading) => `--- ${heading.toLowerCase()} ---`);
  const startIndex = lines.findIndex((line) => targetHeadings.includes(line.trim().toLowerCase()));
  if (startIndex < 0) return [] as string[];

  const sectionLines: string[] = [];
  for (const line of lines.slice(startIndex + 1)) {
    if (isSectionLine(line)) break;
    const clean = line.trim();
    if (clean && clean !== "-") sectionLines.push(normalizeDetailLine(clean));
  }
  return sectionLines;
}

function normalizeDetailLine(line: string) {
  const match = line.match(/^(Våning|Floor):\s*0+(\d+)$/i);
  if (!match) return line;
  return `${match[1]}: ${Number.parseInt(match[2], 10)}`;
}

function valueAfterColon(lines: string[], labels: string[]) {
  const match = lines.find((line) => labels.some((label) => line.toLowerCase().startsWith(`${label.toLowerCase()}:`)));
  return match?.split(":").slice(1).join(":").trim() || "";
}

function numberValue(value: string) {
  const parsed = Number.parseInt(value.replace(/[^0-9-]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function highRiskWarnings(details: string[], payload: SnapshotPayload, language: Language) {
  const size = numberValue(valueAfterColon(payload.notes.split("\n"), ["Storlek kvm", "Size sqm", "Storlek", "Size"]));
  const bathrooms = numberValue(valueAfterColon(details, ["Antal badrum", "Bathrooms"]));
  const floor = numberValue(valueAfterColon(details, ["Våning", "Floor"]));
  const elevator = valueAfterColon(details, ["Hiss", "Elevator"]);
  const parking = valueAfterColon(details, ["Parkering", "Parking"]);
  const extras = valueAfterColon(details, ["Extra tjänster", "Extra services"]).split(",").map((item) => item.trim()).filter(Boolean);

  if (language === "en") {
    return [
      size >= 250 ? "Large object: manual price/time check recommended." : "",
      bathrooms >= 4 ? "Many bathrooms: confirm scope before booking." : "",
      floor >= 5 && ["Nej", "No"].includes(elevator) ? "High floor without elevator: access must be confirmed." : "",
      ["Nej", "No"].includes(parking) ? "No parking: arrival and carrying time may affect the final price." : "",
      extras.length >= 4 ? "Many extra services selected: confirm final scope manually." : ""
    ].filter(Boolean);
  }

  return [
    size >= 250 ? "Stort objekt: kontrollera pris och tidsåtgång manuellt." : "",
    bathrooms >= 4 ? "Många badrum: bekräfta omfattning innan bokning." : "",
    floor >= 5 && ["Nej", "No"].includes(elevator) ? "Hög våning utan hiss: kontrollera åtkomst." : "",
    ["Nej", "No"].includes(parking) ? "Parkering saknas: kan påverka slutligt pris och tid." : "",
    extras.length >= 4 ? "Många extra tjänster: bekräfta omfattning manuellt." : ""
  ].filter(Boolean);
}

export function greetingName(name: string) {
  const clean = name.trim().replace(/\s+/g, " ");
  return clean.length >= 2 ? ` ${clean}` : "";
}

export function displayArea(area: string) {
  return area.replace(/södertalje/gi, "Södertälje").replace(/sodertalje/gi, "Södertälje");
}

export function displayAddress(address: string, language: Language) {
  const normalizedCity = displayArea(address);
  if (language === "sv") return normalizedCity.replace(/,\s*Sweden\s*$/i, "").replace(/,\s*Sverige\s*$/i, "");
  return normalizedCity;
}

export function publicRequestSnapshotLines(payload: SnapshotPayload, language: Language, options: SnapshotOptions = {}) {
  const details = extractSection(payload.notes, language === "en" ? ["Property & details", "Objekt & detaljer"] : ["Objekt & detaljer", "Property & details"]);
  const price = extractSection(payload.notes, language === "en" ? ["Price indication", "Prisindikation"] : ["Prisindikation", "Price indication"]);
  const customerNotes = extractSection(payload.notes, language === "en" ? ["Customer notes", "Kundens önskemål"] : ["Kundens önskemål", "Customer notes"]);
  const warnings = options.includeWarnings === false ? [] : highRiskWarnings(details, payload, language);

  const labels = language === "en" ? {
    details: "Property & details:",
    price: "Price indication:",
    manualCheck: "Manual check recommended:",
    customerNotes: "Customer notes:"
  } : {
    details: "Objekt & detaljer:",
    price: "Prisindikation:",
    manualCheck: "Manuell kontroll rekommenderas:",
    customerNotes: "Kundens önskemål:"
  };

  const output: string[] = [];
  if (details.length) output.push("", labels.details, ...details);
  if (price.length) output.push("", labels.price, ...price);
  if (warnings.length) output.push("", labels.manualCheck, ...warnings.map((warning) => `- ${warning}`));
  output.push("", labels.customerNotes, ...(customerNotes.length ? customerNotes : ["-"]));
  return output;
}
