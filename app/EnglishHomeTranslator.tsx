"use client";

import { useEffect } from "react";

const textMap: Record<string, string> = {
  "Pris direkt & enkel bokning": "Price estimate & booking request",
  "Tjänster": "Services",
  "Priser": "Prices",
  "Boka": "Request",
  "Jobba hos oss": "Work with us",
  "Om oss": "About us",
  "Logga in": "Log in",
  "Min profil": "My profile",
  "Boka städning": "Send request",
  "Södertälje · Stockholm · RUT-avdrag": "Södertälje · Stockholm · RUT deduction",
  "Städning i Södertälje och Stockholm": "Cleaning in Södertälje and Stockholm",
  "Få hjälp med hemstädning, flyttstädning, kontorsstädning och fönsterputs. Beräkna ditt pris online och boka enkelt när det passar dig.": "Get help with home cleaning, move-out cleaning, office cleaning and window cleaning. Calculate a price estimate online and send a booking request when it suits you.",
  "RUT-avdrag": "RUT deduction",
  "Tydliga priser": "Clear prices",
  "Flexibel bokning": "Flexible request",
  "Snabb återkoppling": "Fast response",
  "Beräkna pris": "Calculate price",
  "Logga in och boka": "Log in and send request",
  "Se före och efter": "See before and after",
  "Före städningen": "Before cleaning",
  "Ett hem innan återställningen: rörigt, tungt och svårt att slappna av i.": "A home before the reset: messy, heavy and difficult to relax in.",
  "Arbetet börjar": "The work begins",
  "Yta för yta återställs med metod, rytm och precision.": "Surface by surface, the space is restored with method, rhythm and precision.",
  "Lugnet efteråt": "The calm afterwards",
  "Ett rent, ljust och lugnt hem där allt känns lättare.": "A clean, bright and calm home where everything feels lighter.",
  "När arbetsplatsen behöver lyftas": "When the workplace needs a lift",
  "Kontoret innan städning: ytor, detaljer och saker som tar fokus.": "The office before cleaning: surfaces, details and things that steal focus.",
  "Yta för yta": "Surface by surface",
  "Arbetsytor, mötesrum och entré återställs utan att störa verksamheten.": "Workspaces, meeting rooms and entrances are restored without disturbing operations.",
  "Redo igen": "Ready again",
  "En renare arbetsplats, redo för fokus, kunder och nästa produktiva dag.": "A cleaner workplace, ready for focus, customers and the next productive day.",
  "Föregående": "Previous",
  "Nästa bild": "Next image",
  "I / Tjänster": "I / Services",
  "Städtjänster för hem och företag.": "Cleaning services for homes and companies.",
  "Hemstädning": "Home cleaning",
  "Flyttstädning": "Move-out cleaning",
  "Kontorsstädning": "Office cleaning",
  "Fönsterputs": "Window cleaning",
  "För återkommande eller enstaka städning hemma.": "For recurring or one-time cleaning at home.",
  "För flytt, överlämning och tydlig checklista.": "For moving, handover and a clear checklist.",
  "För företag, lokaler och återkommande service.": "For companies, premises and recurring service.",
  "från 255 kr/tim efter RUT": "from 255 SEK/hour after RUT",
  "pris efter yta": "price by size",
  "skräddarsydd offert": "custom quote",
  "II / Så fungerar det": "II / How it works",
  "Fyra steg. En tydlig bokning.": "Four steps. A clear booking request.",
  "Välj tjänst": "Choose service",
  "Fyll i plats": "Enter location",
  "Se sammanfattning": "Review summary",
  "Skicka förfrågan": "Send request",
  "Ett enkelt steg som gör bokningsunderlaget tydligare och lättare att följa upp.": "A simple step that makes the request clearer and easier to follow up.",
  "Bokning": "Booking request",
  "Skapa en tydlig bokningsförfrågan.": "Create a clear booking request.",
  "Formuläret samlar rätt information direkt: tjänst, plats, storlek, rum, datum, kontakt och särskilda önskemål.": "The form collects the right information: service, location, size, rooms, date, contact details and special requests.",
  "Plats delas bara efter aktivt val.": "Location is shared only after active consent.",
  "Din förfrågan sparas även på din profil.": "Your request is also saved to your profile.",
  "Logga in för att boka och spara förfrågan på din profil.": "Log in to send and save the request on your profile.",
  "Steg 1 / Förfrågan": "Step 1 / Request",
  "Bokningsdetaljer": "Request details",
  "Utkast": "Draft",
  "Område / stad": "Area / city",
  "Storlek kvm": "Size sqm",
  "Adress": "Address",
  "Gatuadress": "Street address",
  "Objekt & detaljer": "Property & details",
  "Typ av objekt": "Property type",
  "Antal rum": "Number of rooms",
  "Antal badrum": "Number of bathrooms",
  "Husdjur": "Pets",
  "Våning": "Floor",
  "Hiss": "Elevator",
  "Parkering": "Parking",
  "Extra tjänster": "Extra services",
  "Önskat datum": "Preferred date",
  "Tidsfönster": "Time window",
  "Frekvens": "Frequency",
  "Namn": "Name",
  "E-post": "Email",
  "Telefon": "Phone",
  "Särskilda önskemål...": "Special requests...",
  "Skicka bokningsförfrågan": "Send booking request",
  "Sammanfattning": "Summary",
  "Bokningsutkast": "Request draft",
  "Iboren": "Iboren",
  "Städning i Södertälje och Stockholm med tydlig prisbild, RUT-avdrag och enkel bokning.": "Cleaning in Södertälje and Stockholm with clear pricing, RUT information and easy booking requests.",
  "Privacy": "Privacy",
  "Terms": "Terms"
};

const valueMap: Record<string, string> = {
  "Lägenhet": "Apartment",
  "Villa": "House",
  "Radhus": "Townhouse",
  "Kontor": "Office",
  "Annat": "Other",
  "Ja": "Yes",
  "Nej": "No",
  "Vet ej": "Not sure",
  "Engång": "One-time",
  "Varje vecka": "Every week",
  "Varannan vecka": "Every other week",
  "Varje månad": "Every month",
  "Morgon": "Morning",
  "Förmiddag": "Late morning",
  "Eftermiddag": "Afternoon",
  "Kväll": "Evening",
  "Flexibel": "Flexible",
  "Ugn": "Oven",
  "Kyl/frys": "Fridge/freezer",
  "Balkong": "Balcony",
  "Grovstädning": "Deep cleaning",
  "Skåp/lådor": "Cabinets/drawers"
};

function translateText(value: string) {
  return textMap[value.trim()] || value;
}

function translateVisibleText() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    const original = node.nodeValue || "";
    const trimmed = original.trim();
    if (!trimmed) return;
    const translated = textMap[trimmed];
    if (!translated) return;
    node.nodeValue = original.replace(trimmed, translated);
  });
}

function translateAttributes() {
  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea").forEach((element) => {
    if (element.placeholder) element.placeholder = translateText(element.placeholder);
  });

  document.querySelectorAll<HTMLOptionElement>("option").forEach((option) => {
    const translated = valueMap[option.textContent?.trim() || ""];
    if (translated) option.textContent = translated;
  });

  document.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>("button, a").forEach((element) => {
    const label = element.textContent?.trim() || "";
    if (textMap[label]) element.textContent = textMap[label];
  });
}

function injectLanguageToggle() {
  const nav = document.querySelector("header nav");
  if (!nav || document.getElementById("iboren-lang-toggle")) return;

  const wrap = document.createElement("div");
  wrap.id = "iboren-lang-toggle";
  wrap.className = "fixed right-4 top-24 z-[60] flex overflow-hidden rounded-full border border-gold/30 bg-night/85 text-xs font-black uppercase tracking-[.16em] text-porcelain shadow-xl backdrop-blur md:right-8";
  wrap.innerHTML = `<a href="/" class="px-3 py-2 text-porcelain/70">SV</a><a href="/en" class="bg-gold px-3 py-2 text-night">EN</a>`;
  document.body.appendChild(wrap);
}

function injectEnglishHelpText() {
  const form = document.querySelector("#booking form");
  if (!form || document.getElementById("iboren-en-booking-help")) return;

  const dateInput = form.querySelector<HTMLInputElement>('input[type="date"]');
  const dateField = dateInput?.closest("label") || dateInput?.parentElement;
  if (!dateField?.parentElement) return;

  const help = document.createElement("p");
  help.id = "iboren-en-booking-help";
  help.className = "rounded-2xl border border-gold/15 bg-night/30 p-3 text-sm leading-6 text-porcelain/72";
  help.textContent = "Choose your preferred date and time. We check availability and get back to you with confirmation.";
  dateField.parentElement.insertAdjacentElement("afterend", help);
}

export default function EnglishHomeTranslator() {
  useEffect(() => {
    const run = () => {
      document.documentElement.lang = "en";
      translateVisibleText();
      translateAttributes();
      injectLanguageToggle();
      injectEnglishHelpText();
    };

    run();
    const timer = window.setTimeout(run, 750);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
