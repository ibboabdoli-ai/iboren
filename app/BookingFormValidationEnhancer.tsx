"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type FieldRule = {
  key: string;
  labels: string[];
  placeholders?: string[];
  validate: (value: string) => string;
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function digits(value: string) {
  return String(value || "").replace(/\D/g, "");
}

function numberValue(value: string) {
  const clean = String(value || "").replace(/[^0-9-]/g, "");
  if (!clean) return null;
  const parsed = Number.parseInt(clean, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function todayIso() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().slice(0, 10);
}

const rules: FieldRule[] = [
  {
    key: "size",
    labels: ["Storlek kvm", "Size sqm"],
    validate: (value) => {
      if (!value) return "";
      const size = numberValue(value);
      if (!size || size < 10 || size > 500) return "Storlek måste vara mellan 10 och 500 kvm.";
      return "";
    }
  },
  {
    key: "rooms",
    labels: ["Antal rum", "Number of rooms", "Rooms"],
    validate: (value) => {
      if (!value) return "";
      const rooms = numberValue(value);
      if (!rooms || rooms < 1 || rooms > 20) return "Antal rum verkar fel. Ange ett värde mellan 1 och 20.";
      return "";
    }
  },
  {
    key: "bathrooms",
    labels: ["Antal badrum", "Number of bathrooms", "Bathrooms"],
    validate: (value) => {
      if (!value) return "";
      const bathrooms = numberValue(value);
      if (!bathrooms || bathrooms < 1 || bathrooms > 10) return "Antal badrum verkar fel. Ange ett värde mellan 1 och 10.";
      return "";
    }
  },
  {
    key: "floor",
    labels: ["Våning", "Floor"],
    validate: (value) => {
      if (!value) return "";
      const floor = numberValue(value);
      if (floor === null || floor < 0 || floor > 60) return "Våning verkar fel. Ange ett värde mellan 0 och 60.";
      return "";
    }
  },
  {
    key: "phone",
    labels: ["Telefon", "Phone"],
    validate: (value) => {
      if (!value) return "";
      const count = digits(value).length;
      if (count < 7 || count > 15) return "Telefonnummer verkar fel. Kontrollera numret.";
      return "";
    }
  },
  {
    key: "address",
    labels: ["Adress", "Address"],
    placeholders: ["Gatuadress", "Street address"],
    validate: (value) => {
      if (!value) return "";
      if (value.trim().length < 5 || !/[0-9]/.test(value)) return "Adress måste innehålla gata och nummer.";
      return "";
    }
  },
  {
    key: "date",
    labels: ["Önskat datum", "Preferred date"],
    validate: (value) => {
      if (!value) return "";
      if (value < todayIso()) return "Datum kan inte vara bakåt i tiden.";
      return "";
    }
  }
];

function allInputs() {
  return Array.from(document.querySelectorAll<HTMLInputElement>("form input"));
}

function inputLabelText(input: HTMLInputElement) {
  const label = input.closest("label");
  const span = label?.querySelector("span");
  if (span?.textContent) return span.textContent.trim();
  const wrapper = input.parentElement?.parentElement;
  const previousLabel = wrapper?.querySelector("label");
  return previousLabel?.textContent?.trim() || "";
}

function findInput(rule: FieldRule) {
  const inputs = allInputs();
  return inputs.find((input) => {
    const label = inputLabelText(input).toLowerCase();
    const placeholder = String(input.getAttribute("placeholder") || "").toLowerCase();
    return rule.labels.some((item) => label === item.toLowerCase()) || (rule.placeholders || []).some((item) => placeholder === item.toLowerCase());
  }) || null;
}

function fieldContainer(input: HTMLInputElement) {
  const label = input.closest("label");
  if (label) return label;
  return input.parentElement?.parentElement || input.parentElement || input;
}

function setError(input: HTMLInputElement, key: string, error: string) {
  const container = fieldContainer(input);
  let node = container.querySelector<HTMLParagraphElement>(`[data-iboren-error="${key}"]`);
  if (!node) {
    node = document.createElement("p");
    node.dataset.iborenError = key;
    node.className = "mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200";
    container.appendChild(node);
  }

  if (error) {
    node.textContent = error;
    node.style.display = "block";
    input.setAttribute("aria-invalid", "true");
    input.classList.add("ring-2", "ring-red-400");
  } else {
    node.textContent = "";
    node.style.display = "none";
    input.removeAttribute("aria-invalid");
    input.classList.remove("ring-2", "ring-red-400");
  }
}

function validateRule(rule: FieldRule) {
  const input = findInput(rule);
  if (!input) return "";
  const error = rule.validate(input.value);
  setError(input, rule.key, error);
  return error;
}

function validateAll() {
  return rules.map(validateRule).filter(Boolean);
}

function showGlobalMessage(message: string) {
  const form = document.querySelector<HTMLFormElement>("#booking form");
  if (!form) return;
  let node = form.querySelector<HTMLParagraphElement>('[data-iboren-global-error="booking"]');
  if (!node) {
    node = document.createElement("p");
    node.dataset.iborenGlobalError = "booking";
    node.className = "rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200";
    form.appendChild(node);
  }
  node.textContent = message;
  node.style.display = "block";
}

export default function BookingFormValidationEnhancer() {
  const [hasUser, setHasUser] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setHasUser(Boolean(data.user)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setHasUser(Boolean(session?.user)));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const attach = () => {
      for (const rule of rules) {
        const input = findInput(rule);
        if (!input || input.dataset.iborenInlineValidation === "1") continue;
        input.dataset.iborenInlineValidation = "1";
        input.addEventListener("input", () => validateRule(rule));
        input.addEventListener("blur", () => validateRule(rule));
      }
    };

    attach();
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });

    const submitHandler = (event: Event) => {
      const target = event.target as HTMLFormElement | null;
      if (!target || !target.closest("#booking")) return;
      const errors = validateAll();
      if (errors.length) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showGlobalMessage(errors[0]);
        const firstInvalid = target.querySelector<HTMLInputElement>('[aria-invalid="true"]');
        firstInvalid?.focus();
        firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (hasUser === false) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showGlobalMessage("Du behöver logga in för att skicka en bokningsförfrågan.");
      }
    };

    document.addEventListener("submit", submitHandler, true);
    return () => {
      observer.disconnect();
      document.removeEventListener("submit", submitHandler, true);
    };
  }, [hasUser]);

  return null;
}
