"use client";

import { ReactNode, useEffect } from "react";

const labels: Record<string, string> = {
  "Renew next visits": "Create next period",
  "Confirm active": "Confirm remaining visits",
  "Mark active completed": "Mark remaining completed",
  "Cancel active": "Cancel remaining visits"
};

const confirmationMessages: Record<string, string> = {
  "Create next period": "Create the next recurring period for this customer?",
  "Confirm remaining visits": "Confirm all remaining active visits in this recurring group?",
  "Mark remaining completed": "Mark all remaining active visits in this recurring group as completed?",
  "Cancel remaining visits": "Cancel all remaining active visits in this recurring group?"
};

function buttonText(button: HTMLButtonElement) {
  return (button.textContent || "").replace(/\s+/g, " ").trim();
}

function patchAdminRecurringLabels() {
  document.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
    const current = buttonText(button);
    const next = labels[current];
    if (!next) return;
    if (button.lastChild && button.lastChild.nodeType === Node.TEXT_NODE) button.lastChild.textContent = next;
    else button.append(` ${next}`);
  });
}

function addSupervisorLink() {
  if (document.querySelector('a[href="/supervisor"]')) return;
  const payrollLink = document.querySelector<HTMLAnchorElement>('a[href="/admin/payroll-basis"]');
  const grid = payrollLink?.parentElement;
  if (!grid) return;

  grid.classList.remove("md:grid-cols-2");
  grid.classList.add("md:grid-cols-3");

  const link = document.createElement("a");
  link.href = "/supervisor";
  link.className = "rounded-[1.5rem] bg-porcelain p-5 text-burgundy shadow-soft ring-1 ring-burgundy/10 transition hover:-translate-y-0.5";
  link.innerHTML = `
    <div class="mb-4 grid h-6 w-6 place-items-center rounded-full bg-burgundy/10 text-burgundy">S</div>
    <h2 class="display text-3xl font-bold">Supervisor</h2>
    <p class="mt-2 text-sm font-bold text-ink/55">Daily operations overview for today and the next 7 days.</p>
  `;
  grid.appendChild(link);
}

function patchAdminPage() {
  patchAdminRecurringLabels();
  addSupervisorLink();
}

function confirmBulkAction(event: MouseEvent) {
  const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("button") : null;
  if (!button || button.disabled) return;

  const message = confirmationMessages[buttonText(button)];
  if (!message) return;

  const accepted = window.confirm(`${message}\n\nThis can update several visits at once.`);
  if (accepted) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}

export default function AdminTemplate({ children }: { children: ReactNode }) {
  useEffect(() => {
    patchAdminPage();
    document.addEventListener("click", confirmBulkAction, true);
    const observer = new MutationObserver(patchAdminPage);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      document.removeEventListener("click", confirmBulkAction, true);
    };
  }, []);

  return <>{children}</>;
}
