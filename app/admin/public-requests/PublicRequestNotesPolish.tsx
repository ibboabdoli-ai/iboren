"use client";

import { useEffect } from "react";

type Section = {
  title: string;
  body: string;
};

const HEADING_RE = /^(Tjänst|Kundtyp|RUT-avdrag|Område \/ stad|Adress|Storlek kvm|--- Objekt & detaljer ---|--- Prisindikation ---|--- Kundens önskemål ---)$/gm;
const SECTION_MARKERS = ["--- Objekt & detaljer ---", "--- Prisindikation ---", "--- Kundens önskemål ---"];

function normalizeLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatKeyValueLines(lines: string[]) {
  const formatted: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const next = lines[index + 1];

    if (line.includes(":")) {
      formatted.push(line);
      continue;
    }

    if (next && !next.includes(":") && !SECTION_MARKERS.includes(next)) {
      formatted.push(`${line}: ${next}`);
      index += 1;
    } else {
      formatted.push(line);
    }
  }

  return formatted.join("\n");
}

function splitByMarkers(raw: string) {
  const sections: Section[] = [];
  const normalized = raw.trim();
  if (!normalized) return sections;

  const firstMarkerIndex = SECTION_MARKERS.map((marker) => normalized.indexOf(marker)).filter((index) => index >= 0).sort((a, b) => a - b)[0];
  const intro = firstMarkerIndex === undefined ? normalized : normalized.slice(0, firstMarkerIndex);
  const introLines = normalizeLines(intro);
  if (introLines.length) sections.push({ title: "Grunduppgifter", body: formatKeyValueLines(introLines) });

  for (const marker of SECTION_MARKERS) {
    const start = normalized.indexOf(marker);
    if (start < 0) continue;
    const sectionStart = start + marker.length;
    const nextStarts = SECTION_MARKERS.map((nextMarker) => normalized.indexOf(nextMarker, sectionStart)).filter((index) => index >= 0).sort((a, b) => a - b);
    const end = nextStarts[0] ?? normalized.length;
    const body = formatKeyValueLines(normalizeLines(normalized.slice(sectionStart, end)));
    if (body) sections.push({ title: titleForMarker(marker), body });
  }

  return sections;
}

function titleForMarker(marker: string) {
  if (marker.includes("Objekt")) return "Objekt & detaljer";
  if (marker.includes("Pris")) return "Prisindikation";
  if (marker.includes("Kundens")) return "Kundens önskemål";
  return marker.replace(/---/g, "").trim();
}

function shouldPolish(pre: HTMLPreElement) {
  const text = pre.textContent || "";
  return SECTION_MARKERS.some((marker) => text.includes(marker)) || HEADING_RE.test(text);
}

function tone(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("pris")) return "border-gold/35 bg-gold/10";
  if (lower.includes("önskemål")) return "border-blue-200 bg-blue-50";
  return "border-burgundy/10 bg-porcelain";
}

function buildSection(section: Section) {
  const details = document.createElement("details");
  details.open = section.title === "Prisindikation" || section.title === "Kundens önskemål";
  details.className = `rounded-2xl border p-4 ${tone(section.title)}`;

  const summary = document.createElement("summary");
  summary.className = "cursor-pointer text-xs font-black uppercase tracking-[.16em] text-burgundy";
  summary.textContent = section.title;

  const body = document.createElement("pre");
  body.className = "mt-3 whitespace-pre-wrap break-words font-sans text-xs leading-6 text-ink/75";
  body.textContent = section.body;

  details.appendChild(summary);
  details.appendChild(body);
  return details;
}

function polishPre(pre: HTMLPreElement) {
  if (pre.dataset.iborenPublicRequestNotesPolished === "1") return;
  if (!shouldPolish(pre)) return;

  const sections = splitByMarkers(pre.textContent || "");
  if (!sections.length) return;

  const wrapper = document.createElement("div");
  wrapper.dataset.iborenPublicRequestNotesPolish = "1";
  wrapper.className = "mt-4 grid gap-3";

  const heading = document.createElement("p");
  heading.className = "text-xs font-black uppercase tracking-[.18em] text-burgundy/65";
  heading.textContent = "Förfrågans detaljer";
  wrapper.appendChild(heading);

  sections.forEach((section) => wrapper.appendChild(buildSection(section)));
  pre.insertAdjacentElement("afterend", wrapper);
  pre.dataset.iborenPublicRequestNotesPolished = "1";
  pre.style.display = "none";
}

function apply() {
  if (window.location.pathname !== "/admin/public-requests") return;
  document.querySelectorAll<HTMLPreElement>("article pre").forEach(polishPre);
}

export default function PublicRequestNotesPolish() {
  useEffect(() => {
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(apply, 500);
    window.setTimeout(apply, 1500);
    return () => observer.disconnect();
  }, []);

  return null;
}
