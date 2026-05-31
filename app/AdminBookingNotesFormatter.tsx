"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const ENHANCED_ATTR = "data-iboren-notes-formatted";
const NOTE_LABEL = "Kundens önskemål:";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sectionTitle(line: string) {
  const match = line.trim().match(/^---\s*(.+?)\s*---$/);
  return match?.[1]?.trim() || null;
}

function splitSections(notes: string) {
  const sections: Array<{ title: string; lines: string[]; tone: "normal" | "price" | "warning" | "conversion" }> = [];
  let current: { title: string; lines: string[]; tone: "normal" | "price" | "warning" | "conversion" } | null = null;

  notes.split("\n").forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) return;
    const title = sectionTitle(line);
    if (title) {
      const lower = title.toLowerCase();
      const tone = lower.includes("pris") || lower.includes("price") ? "price" : lower.includes("manual") || lower.includes("manuell") || lower.includes("warning") ? "warning" : lower.includes("conversion") ? "conversion" : "normal";
      current = { title, lines: [], tone };
      sections.push(current);
      return;
    }
    if (!current) {
      current = { title: NOTE_LABEL.replace(":", ""), lines: [], tone: "normal" };
      sections.push(current);
    }
    current.lines.push(line);
  });

  return sections.filter((section) => section.lines.length > 0);
}

function rowHtml(line: string) {
  const index = line.indexOf(":");
  if (index > 0) {
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim() || "—";
    return `<div class="grid gap-1 rounded-2xl bg-porcelain/80 px-4 py-3 text-sm sm:grid-cols-[150px_1fr]"><dt class="font-black text-ink">${escapeHtml(key)}</dt><dd class="break-words text-ink/70">${escapeHtml(value)}</dd></div>`;
  }

  const warning = line.startsWith("-") ? line.replace(/^[-•]\s*/, "") : line;
  return `<p class="rounded-2xl bg-porcelain/80 px-4 py-3 text-sm leading-6 text-ink/70">${escapeHtml(warning)}</p>`;
}

function sectionClass(tone: string) {
  if (tone === "price") return "border-green-200 bg-green-50/80";
  if (tone === "warning") return "border-gold/40 bg-gold/10";
  if (tone === "conversion") return "border-blue-200 bg-blue-50/80";
  return "border-burgundy/10 bg-cream";
}

function formatNoteElement(element: HTMLParagraphElement) {
  if (element.getAttribute(ENHANCED_ATTR) === "true") return;
  const text = element.textContent || "";
  if (!text.trim().startsWith(NOTE_LABEL)) return;

  const notes = text.replace(NOTE_LABEL, "").trim();
  if (!notes) return;

  const sections = splitSections(notes);
  if (!sections.length) {
    element.classList.add("whitespace-pre-wrap");
    element.setAttribute(ENHANCED_ATTR, "true");
    return;
  }

  element.setAttribute(ENHANCED_ATTR, "true");
  element.className = "mt-4 rounded-2xl bg-porcelain p-4 text-sm leading-7 text-ink/70";
  element.innerHTML = [
    `<strong class="mb-3 block text-base text-ink">${NOTE_LABEL}</strong>`,
    `<div class="grid gap-3">${sections.map((section) => `<section class="rounded-[1.35rem] border p-4 ${sectionClass(section.tone)}"><h3 class="mb-3 text-xs font-black uppercase tracking-[.18em] text-burgundy">${escapeHtml(section.title)}</h3><dl class="grid gap-2">${section.lines.map(rowHtml).join("")}</dl></section>`).join("")}</div>`
  ].join("");
}

function formatAdminNotes() {
  document.querySelectorAll<HTMLParagraphElement>("p").forEach(formatNoteElement);
}

export default function AdminBookingNotesFormatter() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/admin") return;

    let frame = 0;
    const schedule = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(formatAdminNotes);
    };

    schedule();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
