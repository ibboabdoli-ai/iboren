"use client";

import { ReactNode, useEffect } from "react";

const labels: Record<string, string> = {
  "Renew next visits": "Create next period",
  "Confirm active": "Confirm remaining visits",
  "Mark active completed": "Mark remaining completed",
  "Cancel active": "Cancel remaining visits"
};

function patchAdminRecurringLabels() {
  document.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
    const current = button.textContent?.trim();
    if (!current) return;
    const next = labels[current];
    if (next) button.lastChild && button.lastChild.nodeType === Node.TEXT_NODE ? button.lastChild.textContent = next : button.append(` ${next}`);
  });
}

export default function AdminTemplate({ children }: { children: ReactNode }) {
  useEffect(() => {
    patchAdminRecurringLabels();
    const observer = new MutationObserver(patchAdminRecurringLabels);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}
