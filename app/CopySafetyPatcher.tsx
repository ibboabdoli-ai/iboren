"use client";

import { useEffect } from "react";

const replacements: Array<[string, string]> = [
  ["Direkt bokning", "Bokningsförfrågan"],
  ["direkt bokning", "bokningsförfrågan"],
  ["Enkel bokning", "Bokningsförfrågan"],
  ["enkel bokning", "bokningsförfrågan"],
  ["Flexibel bokning", "Flexibel förfrågan"],
  ["Boka direkt", "Skicka förfrågan"],
  ["boka direkt", "skicka förfrågan"],
  ["Boka städning", "Skicka förfrågan"],
  ["boka städning", "skicka förfrågan"],
  ["Logga in och boka", "Logga in och skicka förfrågan"],
  ["boka enkelt", "skicka en bokningsförfrågan"],
  ["Fyra steg. En tydlig bokning.", "Fyra steg. En tydlig bokningsförfrågan."],
  ["Bokningsdetaljer", "Förfrågningsdetaljer"],
  ["Boka online", "Skicka förfrågan"],
  ["boka online", "skicka förfrågan"],
  ["Bokningen är sparad", "Bokningsförfrågan är sparad"],
  ["Bokning skickad", "Förfrågan skickad"]
];

const bookingHelpText = "Välj önskat datum och tid. Vi kontrollerar tillgänglighet och återkommer med bekräftelse.";
const rutSafeText = "RUT-avdrag kan tillämpas enligt Skatteverkets regler när villkoren är uppfyllda.";

function replaceText(input: string) {
  let output = input;
  replacements.forEach(([from, to]) => {
    output = output.split(from).join(to);
  });
  return output;
}

function patchTextNodes(root: ParentNode) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    const next = replaceText(node.nodeValue || "");
    if (next !== node.nodeValue) node.nodeValue = next;
  });
}

function addBookingHelpText() {
  const bookingSection = document.querySelector("#booking form");
  if (!bookingSection || document.getElementById("iboren-booking-request-help")) return;

  const dateInput = bookingSection.querySelector<HTMLInputElement>('input[type="date"]');
  const dateField = dateInput?.closest("label") || dateInput?.parentElement;
  if (!dateField?.parentElement) return;

  const help = document.createElement("p");
  help.id = "iboren-booking-request-help";
  help.className = "rounded-2xl border border-gold/15 bg-night/30 p-3 text-sm leading-6 text-porcelain/72";
  help.textContent = bookingHelpText;
  dateField.parentElement.insertAdjacentElement("afterend", help);
}

function patchRutCopy() {
  Array.from(document.querySelectorAll<HTMLElement>("label, p, span, small, div")).forEach((element) => {
    const text = element.textContent || "";
    if (!text.includes("RUT")) return;
    if (text.includes("Skatteverkets regler") || text.includes("villkoren är uppfyllda")) return;
    if (text.length > 240) return;
    element.textContent = replaceText(text)
      .replace("Gäller endast om kunden uppfyller Skatteverkets villkor.", rutSafeText)
      .replace("Jag vill använda RUT-avdrag och intygar att jag uppfyller Skatteverkets villkor.", "Jag vill att RUT-avdrag prövas enligt Skatteverkets regler.");
  });
}

export default function CopySafetyPatcher() {
  useEffect(() => {
    const run = () => {
      patchTextNodes(document.body);
      addBookingHelpText();
      patchRutCopy();
    };

    run();
    const observer = new MutationObserver(run);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
