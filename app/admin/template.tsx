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

function removeOldSupervisorShortcut() {
  document.querySelector('a[data-iboren-supervisor-shortcut="1"]')?.remove();
}

function addSupervisorTopButton() {
  if (document.querySelector('a[data-iboren-supervisor-top="1"]')) return;

  const refreshButton = Array.from(document.querySelectorAll<HTMLButtonElement>("button"))
    .find((button) => buttonText(button).includes("Uppdatera"));
  const actions = refreshButton?.parentElement;
  if (!actions) return;

  const link = document.createElement("a");
  link.href = "/supervisor";
  link.dataset.iborenSupervisorTop = "1";
  link.textContent = "Supervisor";
  link.setAttribute("aria-label", "Open supervisor daily operations");
  link.className = "inline-flex items-center justify-center gap-2 rounded-full border border-gold/35 bg-gold px-5 py-3 text-sm font-bold text-night";
  actions.appendChild(link);
}

function patchAdminPage() {
  patchAdminRecurringLabels();
  removeOldSupervisorShortcut();
  addSupervisorTopButton();
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
      document.querySelector('a[data-iboren-supervisor-shortcut="1"]')?.remove();
      document.querySelector('a[data-iboren-supervisor-top="1"]')?.remove();
    };
  }, []);

  return <>{children}</>;
}

// Build probe after Vercel rate limit.
