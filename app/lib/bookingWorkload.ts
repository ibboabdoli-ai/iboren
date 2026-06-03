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

export function estimateBookingWorkload(input: BookingWorkloadInput | null): BookingWorkloadEstimate {
  const size = Number(input?.size_sqm || 0);
  const text = `${input?.service || ""}\n${input?.frequency || ""}\n${input?.notes || ""}`.toLowerCase();
  const service = String(input?.service || "").toLowerCase();
  const frequency = String(input?.frequency || "").toLowerCase();

  let base = baseHoursBySize(size) * frequencyFactor(frequency);
  let extras = 0;

  if (textHas(text, ["husdjur", "pet", "hund", "katt"])) extras += 0.25;
  if (textHas(text, ["första", "first", "förstagång"])) extras += 0.75;
  if (textHas(text, ["grovstädning", "deep cleaning", "heavy cleaning"])) extras += Math.max(1, baseHoursBySize(size) * 0.35);
  if (textHas(text, ["fönsterputs", "window cleaning"])) extras += 1;
  if (textHas(text, ["balkong", "balcony"])) extras += 0.5;
  if (textHas(text, ["ugn", "oven"])) extras += 0.5;
  if (textHas(text, ["kyl", "frys", "fridge", "freezer"])) extras += 0.5;
  if (textHas(text, ["skåp", "lådor", "cabinet", "drawers"])) extras += 0.5;
  if (textHas(text, ["hiss: nej", "no elevator"]) && textHas(text, ["våning: 3", "floor: 3", "våning: 4", "floor: 4", "våning: 5", "floor: 5"])) extras += 0.25;

  let hours = base + extras;
  if (service.includes("flytt") || service.includes("moving")) hours = Math.max(hours, size > 0 ? size / 18 : 4);
  if (service.includes("fönster") || service.includes("window")) hours = Math.max(2, size > 0 ? size / 40 : 2);

  const estimatedHours = roundHalf(hours);
  const suggestedCleaners = estimatedHours <= 4 ? 1 : estimatedHours <= 8 ? 2 : estimatedHours <= 12 ? 3 : Math.min(20, Math.ceil(estimatedHours / 4));
  const hoursPerCleaner = roundHalf(estimatedHours / suggestedCleaners);

  return { estimated_hours: estimatedHours, suggested_cleaners: suggestedCleaners, hours_per_cleaner: hoursPerCleaner };
}
