"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type Section = {
  title: string;
  body: string;
};

const SECTION_TITLES: Record<string, string> = {
  "Calculator snapshot": "Prisunderlag från kalkylatorn",
  "Final booking submitted": "Slutlig bokningsförfrågan",
  "Changes after estimate": "Ändringar efter prisindikationen",
  "Admin check": "Admin kontroll",
  "Kundtyp & RUT": "Kundtyp & RUT",
  "Recurring visit": "Återkommande besök"
};

const MARKER_RE = /^---\s*(.*?)\s*---$/gm;

function parseSections(raw: string) {
  const sections: Section[] = [];
  const matches = Array.from(raw.matchAll(MARKER_RE));
  const firstIndex = matches[0]?.index ?? raw.length;
  const intro = raw.slice(0, firstIndex).trim();
  if (intro) sections.push({ title: "Kundens uppgifter", body: normalizeIntro(intro) });

  matches.forEach((match, index) => {
    const title = match[1]?.trim() || "Detaljer";
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? raw.length;
    const body = raw.slice(start, end).trim();
    if (body) sections.push({ title: SECTION_TITLES[title] || title, body: normalizeBody(body) });
  });

  return sections;
}

function normalizeIntro(value: string) {
  const labels = ["Typ av objekt", "Antal rum", "Antal badrum", "Husdjur", "Våning", "Hiss", "Parkering", "Extra tjänster", "Önskemål"];
  let next = value.trim();
  for (const label of labels) next = next.replace(new RegExp(`\\s+(${label}:)`, "g"), "\n$1");
  return normalizeBody(next);
}

function normalizeBody(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function sectionTone(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("admin")) return "border-red-200 bg-red-50 text-red-900";
  if (lower.includes("pris")) return "border-gold/35 bg-gold/10 text-ink";
  if (lower.includes("ändring")) return "border-blue-200 bg-blue-50 text-blue-900";
  return "border-burgundy/10 bg-porcelain text-ink";
}

function buildSection(section: Section) {
  const box = document.createElement("details");
  box.open = section.title === "Admin kontroll" || section.title === "Prisunderlag från kalkylatorn";
  box.className = `rounded-2xl border p-4 ${sectionTone(section.title)}`;

  const summary = document.createElement("summary");
  summary.className = "cursor-pointer text-xs font-black uppercase tracking-[.16em] text-burgundy";
  summary.textContent = section.title;

  const pre = document.createElement("pre");
  pre.className = "mt-3 whitespace-pre-wrap break-words font-sans text-xs leading-6 text-ink/75";
  pre.textContent = section.body;

  box.appendChild(summary);
  box.appendChild(pre);
  return box;
}

function shouldPolish(node: HTMLElement) {
  const text = node.textContent || "";
  return text.includes("--- Calculator snapshot ---") || text.includes("--- Admin check ---") || text.includes("--- Final booking submitted ---");
}

function polishNode(node: HTMLElement) {
  if (node.dataset.iborenAdminNotesPolished === "1") return;
  if (!shouldPolish(node)) return;

  const raw = node.textContent || "";
  const sections = parseSections(raw.replace(/^Kundens önskemål:\s*/i, "").trim());
  if (!sections.length) return;

  const wrapper = document.createElement("div");
  wrapper.dataset.iborenAdminNotesPolish = "1";
  wrapper.className = "mt-4 grid gap-3";

  const heading = document.createElement("p");
  heading.className = "text-xs font-black uppercase tracking-[.18em] text-burgundy/65";
  heading.textContent = "Kundens önskemål och prisunderlag";
  wrapper.appendChild(heading);

  sections.forEach((section) => wrapper.appendChild(buildSection(section)));
  node.insertAdjacentElement("afterend", wrapper);
  node.dataset.iborenAdminNotesPolished = "1";
  node.style.display = "none";
}

function apply() {
  if (window.location.pathname !== "/admin") return;
  document.querySelectorAll<HTMLElement>("article p").forEach(polishNode);
}

export default function AdminBookingNotesPolish() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/admin") return;
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(apply, 500);
    window.setTimeout(apply, 1500);
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
