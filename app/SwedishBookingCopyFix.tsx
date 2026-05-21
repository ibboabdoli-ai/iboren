"use client";

import { useEffect } from "react";

const replacements: Array<[string, string]> = [
  ["Pris direkt & enkel bokning", "Prisindikation & bokningsförfrågan"],
  ["Boka städning", "Skicka förfrågan"],
  ["Boka", "Förfrågan"],
  ["boka enkelt", "skicka en bokningsförfrågan"],
  ["Logga in och boka", "Logga in och skicka förfrågan"],
  ["Fyra steg. En tydlig bokning.", "Fyra steg. En tydlig bokningsförfrågan."],
  ["Bokning", "Bokningsförfrågan"],
  ["Logga in för att boka och spara förfrågan på din profil.", "Logga in för att skicka och spara förfrågan på din profil."],
  ["Bokningsdetaljer", "Förfrågningsdetaljer"],
  ["Bokningsutkast", "Förfrågningsutkast"],
  ["bokningen", "förfrågan"],
  ["Kunde inte skicka bokningen just nu.", "Kunde inte skicka förfrågan just nu."],
  ["enkel bokning", "bokningsförfrågan"]
];

function replaceCopy(text: string) {
  return replacements.reduce((current, [from, to]) => current.split(from).join(to), text);
}

export default function SwedishBookingCopyFix() {
  useEffect(() => {
    if (window.location.pathname === "/en" || window.location.pathname.startsWith("/en/")) return;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);

    nodes.forEach((node) => {
      const current = node.nodeValue || "";
      const next = replaceCopy(current);
      if (next !== current) node.nodeValue = next;
    });
  }, []);

  return null;
}
