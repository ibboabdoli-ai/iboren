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

function addSupervisorShortcut() {
  if (document.querySelector('a[data-iboren-supervisor-shortcut="1"]')) return;
  const link = document.createElement("a");
  link.href = "/supervisor";
  link.dataset.iborenSupervisorShortcut = "1";
  link.textContent = "Supervisor";
  link.setAttribute("aria-label", "Open supervisor daily operations");
  link.className = "fixed bottom-4 right-4 z-[70] rounded-full bg-burgundy px-5 py-3 text-sm font-black text-porcelain shadow-luxe ring-1 ring-gold/30";
  document.body.appendChild(link);
}

function patchAdminPage() {
  patchAdminRecurringLabels();
  addSupervisorShortcut();
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
    };
  }, []);

  return <>{children}</>;
}
