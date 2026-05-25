"use client";

import { ReactNode, useEffect, useState } from "react";

type Lang = "en" | "sv";

const toEnglish: Record<string, string> = {
  "Tillbaka": "Back",
  "Tillbaka till profil": "Back to profile",
  "Städarpanel": "Cleaner panel",
  "Iboren personal": "Iboren staff",
  "Mina erbjudanden": "My offers",
  "Tillgänglighet": "Availability",
  "Åtkomstkontroll": "Access control",
  "Logga in": "Log in",
  "Ingen åtkomst": "Access denied",
  "Städare": "Cleaner",
  "Kund": "Customer",
  "Hemstädning": "Home cleaning",
  "Flyttstädning": "Move-out cleaning",
  "Kontorsstädning": "Office cleaning",
  "Fönsterputs": "Window cleaning",
  "Engång": "One-time",
  "Varje vecka": "Every week",
  "Varannan vecka": "Every other week",
  "Varje månad": "Every month",
  "Morgon": "Morning",
  "Förmiddag": "Late morning",
  "Eftermiddag": "Afternoon",
  "Kväll": "Evening",
  "Flexibel": "Flexible",
  "Tillgänglig": "Available",
  "Inte tillgänglig": "Not available",
  "Bekräftad av admin": "Confirmed by admin",
  "Klar": "Completed",
  "Stängd": "Closed",
  "Erbjudande": "Offer",
  "Uppdatera": "Refresh",
  "Markera klar": "Mark completed",
  "Kund:": "Customer:",
  "Telefon:": "Phone:",
  "Storlek:": "Size:",
  "Frekvens:": "Frequency:",
  "Jobbdetaljer": "Job details",
  "Adminanteckning:": "Admin note:",
  "Tidsrapport": "Time report",
  "Datum": "Date",
  "Arbetade h": "Worked h",
  "Rast min": "Break min",
  "Restid min": "Travel min",
  "Körsträcka km": "Mileage km",
  "Anteckning": "Note",
  "Skicka tid": "Submit time",
  "Spara tillgänglighet": "Save availability",
  "Lägg till tid": "Add time",
  "Ta bort": "Remove",
  "Dag": "Day",
  "Start": "Start",
  "Slut": "End",
  "Anställd:": "Employee:"
};

const toSwedish: Record<string, string> = {
  "Back": "Tillbaka",
  "Back to profile": "Tillbaka till profil",
  "Cleaner panel": "Städarpanel",
  "Iboren staff": "Iboren personal",
  "My offers": "Mina erbjudanden",
  "Availability": "Tillgänglighet",
  "Access control": "Åtkomstkontroll",
  "Log in": "Logga in",
  "Access denied": "Ingen åtkomst",
  "Cleaner": "Städare",
  "Customer": "Kund",
  "Home cleaning": "Hemstädning",
  "Move-out cleaning": "Flyttstädning",
  "Office cleaning": "Kontorsstädning",
  "Window cleaning": "Fönsterputs",
  "One-time": "Engång",
  "Every week": "Varje vecka",
  "Every other week": "Varannan vecka",
  "Every month": "Varje månad",
  "Morning": "Morgon",
  "Late morning": "Förmiddag",
  "Afternoon": "Eftermiddag",
  "Evening": "Kväll",
  "Flexible": "Flexibel",
  "Available": "Tillgänglig",
  "Not available": "Inte tillgänglig",
  "Confirmed by admin": "Bekräftad av admin",
  "Completed": "Klar",
  "Closed": "Stängd",
  "Offer": "Erbjudande",
  "Refresh": "Uppdatera",
  "Mark Klar": "Markera klar",
  "Mark completed": "Markera klar",
  "Customer:": "Kund:",
  "Phone:": "Telefon:",
  "Size:": "Storlek:",
  "Frequency:": "Frekvens:",
  "Job details": "Jobbdetaljer",
  "Admin note:": "Adminanteckning:",
  "Time report": "Tidsrapport",
  "Date": "Datum",
  "Worked h": "Arbetade h",
  "Break min": "Rast min",
  "Travel min": "Restid min",
  "Mileage km": "Körsträcka km",
  "Note": "Anteckning",
  "Submit time": "Skicka tid",
  "Save availability": "Spara tillgänglighet",
  "Add time": "Lägg till tid",
  "Remove": "Ta bort",
  "Day": "Dag",
  "Start": "Start",
  "End": "Slut",
  "Employee:": "Anställd:"
};

const paragraphs = {
  en: new Map<string, string>([
    ["Se tilldelade jobb, lägg till dem i kalendern och uppdatera din tillgänglighet.", "View assigned jobs, add them to your calendar and update your availability."],
    ["Öppna bara när du behöver ändra arbetsdagar eller tider.", "Open only when you need to change working days or hours."],
    ["Endast rollerna städare, supervisor och admin kan öppna den här panelen.", "Only cleaner, supervisor and admin roles can open this panel."],
    ["Du behöver logga in innan vi kan kontrollera din personalbehörighet.", "You need to log in before we can check your staff access."],
    ["Den här sidan är bara för städare, supervisor och admins.", "This page is only for cleaners, supervisors and admins."],
    ["Markera dig som tillgänglig eller inte tillgänglig. Jobbet är bara bekräftat efter att admin har valt dig.", "Mark yourself available or not available. The job is only confirmed after admin selects you."]
  ]),
  sv: new Map<string, string>([
    ["View assigned jobs, add them to your calendar and update your availability.", "Se tilldelade jobb, lägg till dem i kalendern och uppdatera din tillgänglighet."],
    ["Open only when you need to change working days or hours.", "Öppna bara när du behöver ändra arbetsdagar eller tider."],
    ["Only cleaner, supervisor and admin roles can open this panel.", "Endast rollerna städare, supervisor och admin kan öppna den här panelen."],
    ["You need to log in before we can check your staff access.", "Du behöver logga in innan vi kan kontrollera din personalbehörighet."],
    ["This page is only for cleaners, supervisors and admins.", "Den här sidan är bara för städare, supervisor och admins."],
    ["Mark yourself available or not available. The job is only confirmed after admin selects you.", "Markera dig som tillgänglig eller inte tillgänglig. Jobbet är bara bekräftat efter att admin har valt dig."]
  ])
};

function replaceText(value: string, lang: Lang) {
  let next = paragraphs[lang].get(value.trim()) || value;
  const dictionary = lang === "sv" ? toSwedish : toEnglish;
  for (const [from, to] of Object.entries(dictionary)) {
    next = next.replaceAll(from, to);
  }
  next = next.replaceAll(" sqm", lang === "sv" ? " kvm" : " sqm");
  return next;
}

function patchCleanerLanguage(lang: Lang) {
  document.querySelectorAll<HTMLElement>("h1,h2,h3,p,span,strong,button,a,label,summary,option,li").forEach((node) => {
    if (node.closest("[data-cleaner-language-toggle='1']")) return;
    if (node.children.length > 0 && !["BUTTON", "A", "OPTION", "STRONG", "SPAN"].includes(node.tagName)) return;
    const current = node.textContent || "";
    const next = replaceText(current, lang);
    if (next !== current) node.textContent = next;
  });

  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input[placeholder], textarea[placeholder]").forEach((input) => {
    const current = input.placeholder;
    const next = replaceText(current, lang);
    if (next !== current) input.placeholder = next;
  });
}

export default function CleanerTemplate({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("iboren-cleaner-lang");
      if (saved === "sv" || saved === "en") setLang(saved);
      else if (navigator.language.toLowerCase().startsWith("sv")) setLang("sv");
    } catch {}
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem("iboren-cleaner-lang", lang); } catch {}
    patchCleanerLanguage(lang);
    const observer = new MutationObserver(() => patchCleanerLanguage(lang));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [lang]);

  return (
    <>
      <div data-cleaner-language-toggle="1" className="fixed left-4 top-4 z-[80] inline-flex rounded-full bg-porcelain p-1 shadow-luxe ring-1 ring-burgundy/10">
        <button type="button" onClick={() => setLang("en")} className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[.14em] ${lang === "en" ? "bg-burgundy text-porcelain" : "text-burgundy"}`}>EN</button>
        <button type="button" onClick={() => setLang("sv")} className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[.14em] ${lang === "sv" ? "bg-burgundy text-porcelain" : "text-burgundy"}`}>SV</button>
      </div>
      {children}
    </>
  );
}
