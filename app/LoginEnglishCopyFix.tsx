"use client";

import { useEffect } from "react";

const replacements: Array<[string, string]> = [
  ["Tillbaka", "Back"],
  ["Logga in med verifierad e-post.", "Log in with a verified email."],
  ["För tryggare bokningar använder Iboren inloggning via etablerade konton där e-postadressen verifieras av leverantören.", "For safer booking requests, Iboren uses login through established providers where the email address is verified."],
  ["Välj inloggning", "Choose login method"],
  ["Konto skapas automatiskt första gången. Din e-post kommer från Google, LinkedIn eller Microsoft.", "An account is created automatically the first time. Your email comes from Google, LinkedIn or Microsoft."],
  ["Vi använder verifierad OAuth-inloggning för att minska felaktiga bokningar och felaktiga e-postadresser.", "We use verified OAuth login to reduce incorrect booking requests and incorrect email addresses."],
  ["Fortsätt med Google", "Continue with Google"],
  ["Fortsätt med LinkedIn", "Continue with LinkedIn"],
  ["Fortsätt med Microsoft", "Continue with Microsoft"],
  ["Supabase saknas. Lägg till NEXT_PUBLIC_SUPABASE_URL och NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY i Vercel.", "Supabase is missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in Vercel."]
];

function replaceCopy(text: string) {
  return replacements.reduce((current, [from, to]) => current.split(from).join(to), text);
}

function patch() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    const current = node.nodeValue || "";
    const next = replaceCopy(current);
    if (next !== current) node.nodeValue = next;
  });

  document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
    if (anchor.getAttribute("href") === "/") anchor.setAttribute("href", "/en");
  });

  document.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
    button.addEventListener("click", () => {
      window.sessionStorage.setItem("iboren-return-language", "en");
    }, { once: false });
  });
}

export default function LoginEnglishCopyFix() {
  useEffect(() => {
    patch();
    const timer = window.setTimeout(patch, 250);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
