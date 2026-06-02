"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const WORKFLOW_MARKERS = ["NEEDS ACTION", "THIS WEEK", "NEXT 30 DAYS", "RECURRING", "ALL"];
const STATUS_MARKERS = ["ALLA", "NY", "BEKRÄFTAD", "KLAR", "AVBOKAD"];

function normalize(value: string) {
  return value.toUpperCase().replace(/\s+/g, " ").trim();
}

function isButtonGrid(element: Element) {
  const buttons = Array.from(element.querySelectorAll(":scope > button"));
  return buttons.length >= 5;
}

function hasMarkers(element: Element, markers: string[]) {
  const text = normalize(element.textContent || "");
  return markers.every((marker) => text.includes(marker));
}

function findBigFilterGrids() {
  const grids = Array.from(document.querySelectorAll("main section > div.grid"));
  const workflowGrid = grids.find((grid) => isButtonGrid(grid) && hasMarkers(grid, WORKFLOW_MARKERS));
  const statusGrid = grids.find((grid) => isButtonGrid(grid) && hasMarkers(grid, STATUS_MARKERS) && normalize(grid.textContent || "").includes("STATUS"));
  return { workflowGrid, statusGrid };
}

function compactTextFromButton(button: HTMLButtonElement) {
  const label = button.querySelector("p")?.textContent?.trim() || "Filter";
  const count = Array.from(button.querySelectorAll("p"))[1]?.textContent?.trim() || "";
  const hint = Array.from(button.querySelectorAll("p"))[2]?.textContent?.trim() || "";
  return { label, count, hint };
}

function buildCompactPanel(workflowGrid: Element, statusGrid: Element) {
  const details = document.createElement("details");
  details.dataset.iborenAdminFilterPanelsPolish = "1";
  details.className = "mt-6 rounded-[2rem] bg-porcelain p-5 shadow-soft ring-1 ring-burgundy/10 md:p-6";

  const summary = document.createElement("summary");
  summary.className = "cursor-pointer text-sm font-black uppercase tracking-[.18em] text-burgundy";
  summary.textContent = "Filter overview / Visa filterstatistik";
  details.appendChild(summary);

  const help = document.createElement("p");
  help.className = "mt-3 text-sm font-bold leading-6 text-ink/55";
  help.textContent = "Sammanfattning av filter. Använd filterknapparna och sökfältet under för aktiv filtrering.";
  details.appendChild(help);

  const wrapper = document.createElement("div");
  wrapper.className = "mt-4 grid gap-3 md:grid-cols-2";

  const workflowBox = buildBox("Workflow", Array.from(workflowGrid.querySelectorAll<HTMLButtonElement>(":scope > button")));
  const statusBox = buildBox("Status", Array.from(statusGrid.querySelectorAll<HTMLButtonElement>(":scope > button")));
  wrapper.appendChild(workflowBox);
  wrapper.appendChild(statusBox);
  details.appendChild(wrapper);

  return details;
}

function buildBox(title: string, buttons: HTMLButtonElement[]) {
  const box = document.createElement("section");
  box.className = "rounded-2xl bg-cream p-4 ring-1 ring-burgundy/10";

  const heading = document.createElement("h3");
  heading.className = "text-xs font-black uppercase tracking-[.18em] text-burgundy/70";
  heading.textContent = title;
  box.appendChild(heading);

  const list = document.createElement("div");
  list.className = "mt-3 grid gap-2";

  buttons.forEach((button) => {
    const item = compactTextFromButton(button);
    const row = document.createElement("div");
    row.className = "flex items-center justify-between gap-3 rounded-xl bg-porcelain px-3 py-2 text-sm";

    const label = document.createElement("span");
    label.className = "font-black text-burgundy";
    label.textContent = item.label;

    const value = document.createElement("span");
    value.className = "text-right font-bold text-ink/60";
    value.textContent = [item.count, item.hint].filter(Boolean).join(" · ");

    row.appendChild(label);
    row.appendChild(value);
    list.appendChild(row);
  });

  box.appendChild(list);
  return box;
}

function apply() {
  if (window.location.pathname !== "/admin") return;
  if (document.querySelector("[data-iboren-admin-filter-panels-polish='1']")) return;

  const { workflowGrid, statusGrid } = findBigFilterGrids();
  if (!workflowGrid || !statusGrid) return;

  const compactPanel = buildCompactPanel(workflowGrid, statusGrid);
  workflowGrid.insertAdjacentElement("beforebegin", compactPanel);
  (workflowGrid as HTMLElement).style.display = "none";
  (statusGrid as HTMLElement).style.display = "none";
}

export default function AdminFilterPanelsPolish() {
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
