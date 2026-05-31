export type AdminWorkflowBooking = {
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

export type OperationalStatus =
  | "New request"
  | "Need review"
  | "Waiting customer"
  | "Confirmed"
  | "Need cleaner"
  | "Assigned"
  | "Cleaner accepted"
  | "Done"
  | "Time reported"
  | "Approved"
  | "Invoiced"
  | "Paid"
  | "Cancelled"
  | "Problem";

export type NextActionLabel =
  | "Fix booking data"
  | "Set price"
  | "Assign cleaner"
  | "Send confirmation/reminder"
  | "Wait for time report"
  | "Approve hours"
  | "Ready for invoice/payroll"
  | "Review problem"
  | "No action";

export type PriorityLabel = "Urgent" | "Today" | "Missing info" | "Waiting" | "Ready" | "Problem" | "Normal";

export type BookingWorkflow = {
  operationalStatus: OperationalStatus;
  nextAction: NextActionLabel;
  priority: PriorityLabel;
  reasons: string[];
  needsAction: boolean;
};

function parseDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function daysFromToday(value: string | null) {
  const date = parseDate(value);
  if (!date) return null;
  const today = startOfToday();
  return Math.floor((date.getTime() - today.getTime()) / 86400000);
}

function noteText(booking: AdminWorkflowBooking) {
  return `${booking.notes || ""}\n${booking.admin_notes || ""}`.toLowerCase();
}

function hasAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word.toLowerCase()));
}

function missingRequiredFields(booking: AdminWorkflowBooking) {
  const missing: string[] = [];
  if (!booking.service) missing.push("service");
  if (!booking.area) missing.push("area");
  if (!booking.address) missing.push("address");
  if (!booking.size_sqm || booking.size_sqm < 10) missing.push("size");
  if (!booking.preferred_date) missing.push("date");
  if (!booking.customer_name) missing.push("name");
  if (!booking.customer_email) missing.push("email");
  if (!booking.customer_phone) missing.push("phone");
  return missing;
}

function hasPriceSnapshot(text: string) {
  return hasAny(text, ["prisindikation", "price indication", "price before rut", "före rut", "efter rut", "estimate title"]);
}

function hasCleanerSignal(text: string) {
  return hasAny(text, ["confirmed cleaner", "cleaner accepted", "assigned cleaner", "tilldelad", "bekräftad städare"]);
}

function hasTimeReportedSignal(text: string) {
  return hasAny(text, ["time reported", "tid rapporterad", "approved_entries", "worked_hours"]);
}

function hasApprovedSignal(text: string) {
  return hasAny(text, ["approved", "godkänd", "approved hours", "mark as paid"]);
}

function hasPaidSignal(text: string) {
  return hasAny(text, ["paid", "betald", "invoiced", "fakturerad"]);
}

function hasProblemSignal(text: string) {
  return hasAny(text, ["problem", "manual check", "manuell kontroll", "warning", "varning", "missing", "saknas", "unusual", "requires review"]);
}

export function getBookingWorkflow(booking: AdminWorkflowBooking): BookingWorkflow {
  const status = booking.status || "new";
  const text = noteText(booking);
  const missing = missingRequiredFields(booking);
  const diff = daysFromToday(booking.preferred_date);
  const isToday = diff === 0;
  const isOverdue = diff !== null && diff < 0;
  const cancelled = status === "cancelled";
  const completed = status === "completed";
  const confirmed = status === "confirmed";

  const reasons: string[] = [];
  if (missing.length) reasons.push(`Missing required field: ${missing.join(", ")}`);
  if (isToday) reasons.push("Job is today");
  if (isOverdue && !completed && !cancelled) reasons.push("Booking date has passed");
  if (!hasPriceSnapshot(text)) reasons.push("Missing price snapshot");
  if (hasProblemSignal(text)) reasons.push("Problem/manual check signal found");

  if (cancelled) {
    return { operationalStatus: "Cancelled", nextAction: "No action", priority: "Normal", reasons, needsAction: false };
  }

  if (missing.length) {
    return { operationalStatus: "Problem", nextAction: "Fix booking data", priority: "Missing info", reasons, needsAction: true };
  }

  if (hasProblemSignal(text)) {
    return { operationalStatus: "Problem", nextAction: "Review problem", priority: "Problem", reasons, needsAction: true };
  }

  if (!hasPriceSnapshot(text)) {
    return { operationalStatus: "Need review", nextAction: "Set price", priority: isToday || isOverdue ? "Urgent" : "Missing info", reasons, needsAction: true };
  }

  if (completed) {
    if (hasPaidSignal(text)) return { operationalStatus: "Paid", nextAction: "No action", priority: "Normal", reasons, needsAction: false };
    if (hasApprovedSignal(text)) return { operationalStatus: "Approved", nextAction: "Ready for invoice/payroll", priority: "Ready", reasons, needsAction: true };
    if (hasTimeReportedSignal(text)) return { operationalStatus: "Time reported", nextAction: "Approve hours", priority: "Ready", reasons, needsAction: true };
    return { operationalStatus: "Done", nextAction: "Wait for time report", priority: "Waiting", reasons, needsAction: true };
  }

  if (confirmed) {
    if (hasCleanerSignal(text)) {
      return { operationalStatus: "Cleaner accepted", nextAction: "No action", priority: isToday ? "Today" : "Normal", reasons, needsAction: isToday };
    }
    return { operationalStatus: "Need cleaner", nextAction: "Assign cleaner", priority: isToday || isOverdue ? "Urgent" : "Ready", reasons, needsAction: true };
  }

  return { operationalStatus: "New request", nextAction: "Send confirmation/reminder", priority: isToday || isOverdue ? "Urgent" : "Ready", reasons, needsAction: true };
}

export function getWorkflowStats(bookings: AdminWorkflowBooking[]) {
  const workflows = bookings.map((booking) => getBookingWorkflow(booking));
  return {
    todayJobs: bookings.filter((booking) => daysFromToday(booking.preferred_date) === 0).length,
    newRequests: workflows.filter((workflow) => workflow.operationalStatus === "New request").length,
    needAction: workflows.filter((workflow) => workflow.needsAction).length,
    unassignedJobs: workflows.filter((workflow) => workflow.nextAction === "Assign cleaner").length,
    timeReportsWaitingApproval: workflows.filter((workflow) => workflow.nextAction === "Approve hours").length,
    problems: workflows.filter((workflow) => workflow.priority === "Problem" || workflow.priority === "Missing info").length
  };
}
