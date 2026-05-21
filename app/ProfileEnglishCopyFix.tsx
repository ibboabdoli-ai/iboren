"use client";

import { useEffect } from "react";

const replacements: Array<[string, string]> = [
  ["Tillbaka", "Back"],
  ["Profil", "Profile"],
  ["Du behöver logga in för att se din profil och dina framtida bokningar.", "You need to log in to see your profile and your booking requests."],
  ["Logga in", "Log in"],
  ["Verifierad med Google", "Verified with Google"],
  ["Verifierad med LinkedIn", "Verified with LinkedIn"],
  ["Verifierad med Microsoft", "Verified with Microsoft"],
  ["Verifierad inloggning", "Verified login"],
  ["Avbokad", "Cancelled"],
  ["Bekräftad", "Confirmed"],
  ["Klar", "Completed"],
  ["Ny", "New"],
  ["Kunde inte hämta bokningar:", "Could not load booking requests:"],
  ["Kunde inte hämta profiluppgifter:", "Could not load profile details:"],
  ["Kunde inte spara profilen:", "Could not save profile:"],
  ["Profiluppgifter sparade.", "Profile details saved."],
  ["Du behöver logga in igen för att avboka.", "You need to log in again to cancel."],
  ["Kunde inte avboka bokningen:", "Could not cancel the request:"],
  ["Bokningen är markerad som avbokad.", "The request has been marked as cancelled."],
  ["Bokningar", "Booking requests"],
  ["Mina bokningar", "My booking requests"],
  ["Profiluppgifter", "Profile details"],
  ["Spara", "Save"],
  ["Logga ut", "Log out"],
  ["Visa avbokade", "Show cancelled"],
  ["Dölj avbokade", "Hide cancelled"],
  ["Avboka", "Cancel"],
  ["Område", "Area"],
  ["Adress", "Address"],
  ["Telefon", "Phone"],
  ["Namn", "Name"],
  ["E-post", "Email"],
  ["Status", "Status"],
  ["Tjänst", "Service"],
  ["Datum", "Date"],
  ["Tid", "Time"],
  ["Storlek", "Size"],
  ["Anteckningar", "Notes"],
  ["Inga bokningar ännu.", "No booking requests yet."],
  ["Iboren customer", "Iboren customer"]
];

function replaceCopy(text: string) {
  return replacements.reduce((current, [from, to]) => current.split(from).join(to), text);
}

function patch(root: ParentNode) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    const current = node.nodeValue || "";
    const next = replaceCopy(current);
    if (next !== current) node.nodeValue = next;
  });

  document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href");
    if (href === "/") anchor.setAttribute("href", "/en");
    if (href === "/login") anchor.setAttribute("href", "/en/login");
  });
}

export default function ProfileEnglishCopyFix() {
  useEffect(() => {
    patch(document.body);
    const observer = new MutationObserver(() => patch(document.body));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
