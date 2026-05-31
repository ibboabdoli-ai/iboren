type Language = "sv" | "en";

type SnapshotPayload = {
  notes: string;
  name: string;
  area: string;
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
    if (clean && clean !== "-") sectionLines.push(clean);
  }
  return sectionLines;
}

export function greetingName(name: string) {
  const clean = name.trim().replace(/\s+/g, " ");
  return clean.length >= 2 ? ` ${clean}` : "";
}

export function displayArea(area: string) {
  return area.replace(/södertalje/gi, "Södertälje").replace(/sodertalje/gi, "Södertälje");
}

export function publicRequestSnapshotLines(payload: SnapshotPayload, language: Language) {
  const details = extractSection(payload.notes, language === "en" ? ["Property & details", "Objekt & detaljer"] : ["Objekt & detaljer", "Property & details"]);
  const price = extractSection(payload.notes, language === "en" ? ["Price indication", "Prisindikation"] : ["Prisindikation", "Price indication"]);
  const customerNotes = extractSection(payload.notes, language === "en" ? ["Customer notes", "Kundens önskemål"] : ["Kundens önskemål", "Customer notes"]);

  const labels = language === "en" ? {
    details: "Property & details:",
    price: "Price indication:",
    customerNotes: "Customer notes:"
  } : {
    details: "Objekt & detaljer:",
    price: "Prisindikation:",
    customerNotes: "Kundens önskemål:"
  };

  const output: string[] = [];
  if (details.length) output.push("", labels.details, ...details);
  if (price.length) output.push("", labels.price, ...price);
  if (customerNotes.length) output.push("", labels.customerNotes, ...customerNotes);
  return output;
}
