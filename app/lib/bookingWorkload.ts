export type BookingWorkloadInput = {
  size_sqm?: number | null;
  service?: string | null;
  frequency?: string | null;
  notes?: string | null;
};

export type BookingWorkloadEstimate = {
  estimated_hours: number;
  suggested_cleaners: number;
  hours_per_cleaner: number;
};

export function roundHalf(value: number) {
  return Math.max(1, Math.round(value * 2) / 2);
}

export function textHas(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

export function baseHoursBySize(size: number) {
  if (!size || size <= 0) return 2;
  if (size <= 50) return 2;
  if (size <= 80) return 2.5;
  if (size <= 110) return 3.5;
  if (size <= 140) return 4.5;
  if (size <= 170) return 5.5;
  return 5.5 + Math.ceil((size - 170) / 30);
}

export function frequencyFactor(frequency: string) {
  if (textHas(frequency, ["varje vecka", "weekly", "every week"])) return 0.95;
  if (textHas(frequency, ["varannan", "biweekly", "every other"])) return 1;
  if (textHas(frequency, ["månad", "monthly", "every month"])) return 1.1;
  if (textHas(frequency, ["engång", "one-time", "once"])) return 1.2;
  return 1;
}

function parseNumberAfter(text: string, labels: string[]) {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = text.match(new RegExp(`${escaped}\\s*:?\\s*(\\d+)`, "i"));
    if (match) {
      const value = Number(match[1]);
      if (Number.isFinite(value) && value > 0) return value;
    }
  }
  return null;
}

function addWindowHours(text: string) {
  if (!textHas(text, ["fönsterputs", "window cleaning"])) return 0;
  const windows = parseNumberAfter(text, ["antal fönster", "number of windows"]);
  const bothSides = textHas(text, ["båda sidor", "both sides"]);
  const oneSide = textHas(text, ["endast insida", "endast utsida", "inside only", "outside only"]);
  if (!windows) return 1;
  const perWindow = bothSides ? 0.1 : oneSide ? 0.065 : 0.085;
  return Math.max(0.75, Math.min(4.5, windows * perWindow));
}

function addBalconyGlassHours(text: string) {
  const hasBalconyGlass = textHas(text, ["inglasad balkong", "balcony glass"]);
  if (!hasBalconyGlass) return 0;
  if (textHas(text, ["stor", "large"])) return 1;
  if (textHas(text, ["liten", "small"])) return 0.6;
  return 0;
}

function addAccessHours(text: string) {
  let hours = 0;
  if (textHas(text, ["svår åtkomst", "difficult access"])) hours += 0.5;
  if (textHas(text, ["parkering: nej", "parking: no", "parkering saknas", "no parking"])) hours += 0.25;

  const floor = parseNumberAfter(text, ["våning", "floor"]);
  const noElevator = textHas(text, ["hiss: nej", "elevator: no", "no elevator"]);
  if (floor && noElevator && floor >= 3) hours += floor >= 6 ? 0.75 : 0.35;

  return hours;
}

function addPlanningRiskHours(text: string) {
  let hours = 0;
  if (textHas(text, ["kort varsel: ja", "short notice: yes", "kort varsel"])) hours += 0.25;
  if (textHas(text, ["helg/kväll: ja", "weekend/evening: yes", "weekend/evening", "helg/kväll"])) hours += 0.25;
  return hours;
}

export function estimateBookingWorkload(input: BookingWorkloadInput | null): BookingWorkloadEstimate {
  const size = Number(input?.size_sqm || 0);
  const text = `${input?.service || ""}\n${input?.frequency || ""}\n${input?.notes || ""}`.toLowerCase();
  const service = String(input?.service || "").toLowerCase();
  const frequency = String(input?.frequency || "").toLowerCase();

  const base = baseHoursBySize(size) * frequencyFactor(frequency);
  let extras = 0;

  if (textHas(text, ["husdjur: ja", "pets: yes", "hund", "katt"])) extras += 0.25;
  if (textHas(text, ["första", "first", "förstagång"])) extras += 0.75;
  if (textHas(text, ["grovstädning", "deep cleaning", "heavy cleaning"])) extras += Math.max(1, baseHoursBySize(size) * 0.35);
  extras += addWindowHours(text);
  if (textHas(text, ["balkong", "balcony"])) extras += 0.5;
  extras += addBalconyGlassHours(text);
  if (textHas(text, ["ugn", "oven"])) extras += 0.5;
  if (textHas(text, ["kyl", "frys", "fridge", "freezer"])) extras += 0.5;
  if (textHas(text, ["skåp", "lådor", "cabinet", "drawers"])) extras += 0.5;
  if (textHas(text, ["garage"])) extras += 1;
  extras += addAccessHours(text);
  extras += addPlanningRiskHours(text);

  let hours = base + extras;
  if (service.includes("flytt") || service.includes("moving")) hours = Math.max(hours, size > 0 ? size / 18 : 4);
  if (service.includes("fönster") || service.includes("window")) hours = Math.max(2, size > 0 ? size / 40 : 2);

  const estimatedHours = roundHalf(hours);
  const suggestedCleaners = estimatedHours <= 4 ? 1 : estimatedHours <= 8 ? 2 : estimatedHours <= 12 ? 3 : Math.min(20, Math.ceil(estimatedHours / 4));
  const hoursPerCleaner = roundHalf(estimatedHours / suggestedCleaners);

  return { estimated_hours: estimatedHours, suggested_cleaners: suggestedCleaners, hours_per_cleaner: hoursPerCleaner };
}
