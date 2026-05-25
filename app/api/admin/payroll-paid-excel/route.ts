import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type Row = { id: string; employee_id: string; work_date: string; worked_minutes: number; break_minutes: number; travel_minutes: number; mileage_km: number; cleaner_note: string | null };
type Employee = { id: string; email: string; name: string };
type Entry = Row & { employee_name: string; employee_email: string };

function getAdminEmails() { return (process.env.ADMIN_EMAILS || "ibbo.abdoli@gmail.com").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean); }
function getAdminClient() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY; if (!url || !key) return null; return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }); }
function validDate(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00`).getTime()); }
function dateString(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function nextDay(value: string) { const date = new Date(`${value}T12:00:00`); date.setDate(date.getDate() + 1); return dateString(date); }
function monthStart() { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`; }
function monthEnd(start: string) { const date = new Date(`${start}T12:00:00`); date.setMonth(date.getMonth() + 1); date.setDate(0); return dateString(date); }
function hours(minutes: number) { return Math.round((Number(minutes || 0) / 60) * 100) / 100; }
function xml(value: unknown) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function colName(index: number) { let name = ""; let n = index; while (n > 0) { const mod = (n - 1) % 26; name = String.fromCharCode(65 + mod) + name; n = Math.floor((n - mod) / 26); } return name; }
function stringCell(row: number, col: number, value: unknown) { const ref = `${colName(col)}${row}`; return `<c r="${ref}" t="inlineStr"><is><t>${xml(value)}</t></is></c>`; }
function numberCell(row: number, col: number, value: number) { const ref = `${colName(col)}${row}`; return `<c r="${ref}"><v>${Number(value || 0)}</v></c>`; }

function sheetXml(start: string, end: string, entries: Entry[]) {
  const headers = ["Datum", "Period start", "Period slut", "Städare", "E-post", "Arbetade timmar", "Rast minuter", "Restid minuter", "Körsträcka km", "Anteckning"];
  const headerRow = `<row r="1">${headers.map((header, index) => stringCell(1, index + 1, header)).join("")}</row>`;
  const rows = entries.map((entry, rowIndex) => {
    const row = rowIndex + 2;
    return `<row r="${row}">${stringCell(row, 1, entry.work_date)}${stringCell(row, 2, start)}${stringCell(row, 3, end)}${stringCell(row, 4, entry.employee_name)}${stringCell(row, 5, entry.employee_email)}${numberCell(row, 6, hours(entry.worked_minutes))}${numberCell(row, 7, entry.break_minutes)}${numberCell(row, 8, entry.travel_minutes)}${numberCell(row, 9, entry.mileage_km)}${stringCell(row, 10, entry.cleaner_note || "")}</row>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols><col min="1" max="1" width="14" customWidth="1"/><col min="2" max="3" width="14" customWidth="1"/><col min="4" max="5" width="24" customWidth="1"/><col min="6" max="9" width="16" customWidth="1"/><col min="10" max="10" width="32" customWidth="1"/></cols><sheetData>${headerRow}${rows}</sheetData></worksheet>`;
}

function crcTable() { const table = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[n] = c >>> 0; } return table; }
const table = crcTable();
function crc32(data: Uint8Array) { let c = 0xffffffff; for (const byte of data) c = table[(c ^ byte) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function u16(value: number) { return [value & 255, (value >>> 8) & 255]; }
function u32(value: number) { return [value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255]; }
function bytes(parts: (number[] | Uint8Array)[]) { const size = parts.reduce((sum, part) => sum + part.length, 0); const out = new Uint8Array(size); let offset = 0; for (const part of parts) { out.set(part, offset); offset += part.length; } return out; }

function zip(files: Array<{ name: string; content: string }>) {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const data = encoder.encode(file.content);
    const crc = crc32(data);
    const local = bytes([u32(0x04034b50), u16(20), u16(0), u16(0), u16(dosTime), u16(dosDate), u32(crc), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0), nameBytes, data]);
    const central = bytes([u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(dosTime), u16(dosDate), u32(crc), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), nameBytes]);
    localParts.push(local);
    centralParts.push(central);
    offset += local.length;
  }
  const centralOffset = offset;
  const central = bytes(centralParts);
  const end = bytes([u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(central.length), u32(centralOffset), u16(0)]);
  return bytes([...localParts, central, end]);
}

function workbook(start: string, end: string, entries: Entry[]) {
  return zip([
    { name: "[Content_Types].xml", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>` },
    { name: "_rels/.rels", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: "xl/workbook.xml", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Paid payroll" sheetId="1" r:id="rId1"/></sheets></workbook>` },
    { name: "xl/_rels/workbook.xml.rels", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
    { name: "xl/styles.xml", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellXfs></styleSheet>` },
    { name: "xl/worksheets/sheet1.xml", content: sheetXml(start, end, entries) }
  ]);
}

async function verifyAdmin(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false as const, status: 500, message: "Missing Supabase admin variables." };
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok: false as const, status: 401, message: "Missing access token." };
  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase() || "";
  if (error || !email) return { ok: false as const, status: 401, message: "Invalid session." };
  if (!getAdminEmails().includes(email)) return { ok: false as const, status: 403, message: "Admin access required." };
  return { ok: true as const, supabase };
}

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return Response.json({ ok: false, message: admin.message }, { status: admin.status });
  const url = new URL(request.url);
  const start = url.searchParams.get("start") || monthStart();
  const end = url.searchParams.get("end") || monthEnd(start);
  if (!validDate(start) || !validDate(end)) return Response.json({ ok: false, message: "Use start/end as YYYY-MM-DD." }, { status: 400 });
  const { data, error } = await admin.supabase.from("time_entries").select("id, employee_id, work_date, worked_minutes, break_minutes, travel_minutes, mileage_km, cleaner_note").eq("status", "paid").gte("work_date", start).lt("work_date", nextDay(end)).order("work_date", { ascending: true }).returns<Row[]>();
  if (error) return Response.json({ ok: false, message: error.message }, { status: 500 });
  const employeeIds = [...new Set((data || []).map((row) => row.employee_id))];
  const { data: employees } = employeeIds.length ? await admin.supabase.from("employees").select("id, email, name").in("id", employeeIds).returns<Employee[]>() : { data: [] as Employee[] };
  const employeeMap = new Map((employees || []).map((employee) => [employee.id, employee]));
  const entries = (data || []).map((row) => { const employee = employeeMap.get(row.employee_id); return { ...row, employee_name: employee?.name || "Cleaner", employee_email: employee?.email || "" }; });
  const body = workbook(start, end, entries);
  return new Response(body, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="iboren-paid-payroll-${start}-to-${end}.xlsx"` } });
}
