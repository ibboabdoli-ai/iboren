"use client";

import { useEffect } from "react";

const legacyWelcome = "Hej! Jag är Iborens digitala assistent.";
const welcome = "Hej! Hur kan vi hjälpa dig med städning, pris eller en förfrågan?";

function replaceText(element: Element | null, value: string) {
  if (element && element.textContent !== value) {
    element.textContent = value;
  }
}

function polishWidget(root: HTMLElement) {
  replaceText(root.querySelector("[data-subtitle]"), "Snabb återkoppling");
  replaceText(root.querySelector(".saic-button-label"), "Chatta med oss");

  root.querySelectorAll<HTMLElement>(".saic-name").forEach((element) => replaceText(element, "Iboren"));
  root.querySelectorAll<HTMLElement>(".saic-mini-avatar").forEach((element) => replaceText(element, "IB"));
  root.querySelectorAll<HTMLElement>(".saic-msg.bot").forEach((element) => {
    if ((element.textContent || "").trim().startsWith(legacyWelcome)) {
      replaceText(element, welcome);
    }
  });

  replaceText(root.querySelector("[data-prechat-card]"), welcome);
  root.querySelector<HTMLElement>(".saic-panel")?.setAttribute("aria-label", "Chatt med Iboren");
  root.querySelector<HTMLElement>(".saic-button")?.setAttribute("aria-label", "Chatta med Iboren");
}

export default function ChatWidgetPolish() {
  useEffect(() => {
    const applyPolish = () => {
      const root = document.getElementById("service-ai-chat-root");
      if (root) polishWidget(root);
    };

    applyPolish();
    const observer = new MutationObserver(applyPolish);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
