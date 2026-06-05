"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type FieldRule = {
  key: string;
  labels: string[];
  placeholders?: string[];
  required?: boolean;
  validate: (value: string, language: Language) => string;
};

type Language = "sv" | "en";

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

function detectLanguage() {
  return window.location.pathname.startsWith("/en") ? "en" : "sv";
}

function text(language: Language, sv: string, en: string) {
  return language === "en" ? en : sv;
}

function requiredMessage(language: Language, label: string) {
  return text(language, `${label} måste fyllas i.`, `${label} is required.`);
}

const rules: FieldRule[] = [
  {
    key: "area",
    labels: ["Område / stad", "Area / city"],
    placeholders: ["Stockholm, Södertälje...", "Södertälje"],
    required: true,
    validate: () => ""
  },
  {
    key: "size",
    labels: ["Storlek kvm", "Size sqm", "Size (sqm)"],
    required: true,
    validate: (value, language) => {
      const size = numberValue(value);
      if (!size) return requiredMessage(language, text(language, "Storlek kvm", "Size"));
      if (size < 10 || size > 500) return text(language, "Storlek måste vara mellan 10 och 500 kvm.", "Size must be between 10 and 500 sqm.");
      return "";
    }
  },
  {
    key: "address",
    labels: ["Adress", "Address"],
    placeholders: ["Gatuadress", "Gatuadress och nummer", "Street address", "Street address and number"],
    required: true,
    validate: (value, language) => {
      if (!value.trim()) return requiredMessage(language, text(language, "Adress", "Address"));
      if (value.trim().length < 5 || !/[0-9]/.test(value)) return text(language, "Adress måste innehålla gata och nummer.", "Address must include street and number.");
      return "";
    }
  },
  {
    key: "rooms",
    labels: ["Antal rum", "Number of rooms", "Rooms"],
    validate: (value, language) => {
      if (!value) return "";
      const rooms = numberValue(value);
      if (!rooms || rooms < 1 || rooms > 20) return text(language, "Antal rum verkar fel. Ange ett värde mellan 1 och 20.", "Number of rooms looks incorrect. Use a value between 1 and 20.");
      return "";
    }
  },
  {
    key: "bathrooms",
    labels: ["Antal badrum", "Number of bathrooms", "Bathrooms"],
    validate: (value, language) => {
      if (!value) return "";
      const bathrooms = numberValue(value);
      if (!bathrooms || bathrooms < 1 || bathrooms > 10) return text(language, "Antal badrum verkar fel. Ange ett värde mellan 1 och 10.", "Number of bathrooms looks incorrect. Use a value between 1 and 10.");
      return "";
    }
  },
  {
    key: "floor",
    labels: ["Våning", "Floor"],
    validate: (value, language) => {
      if (!value) return "";
      const floor = numberValue(value);
      if (floor === null || floor < 0 || floor > 60) return text(language, "Våning verkar fel. Ange ett värde mellan 0 och 60.", "Floor looks incorrect. Use a value between 0 and 60.");
      return "";
    }
  },
  {
    key: "date",
    labels: ["Önskat datum", "Preferred date"],
    required: true,
    validate: (value, language) => {
      if (!value) return requiredMessage(language, text(language, "Önskat datum", "Preferred date"));
      if (value < todayIso()) return text(language, "Datum kan inte vara bakåt i tiden.", "Date cannot be in the past.");
      return "";
    }
  },
  {
    key: "name",
    labels: ["Namn", "Name"],
    required: true,
    validate: (value, language) => {
      if (!value.trim()) return requiredMessage(language, text(language, "Namn", "Name"));
      if (value.trim().length < 2) return text(language, "Namn verkar för kort.", "Name looks too short.");
      return "";
    }
  },
  {
    key: "email",
    labels: ["E-post", "Email"],
    required: true,
    validate: (value, language) => {
      if (!value.trim()) return requiredMessage(language, text(language, "E-post", "Email"));
      if (!/^\S+@\S+\.\S+$/.test(value.trim())) return text(language, "E-postadressen verkar fel. Kontrollera den.", "Email address looks incorrect. Please check it.");
      return "";
    }
  },
  {
    key: "phone",
    labels: ["Telefon", "Phone"],
    required: true,
    validate: (value, language) => {
      if (!value.trim()) return requiredMessage(language, text(language, "Telefon", "Phone"));
      const count = digits(value).length;
      if (count < 7 || count > 15) return text(language, "Telefonnummer verkar fel. Kontrollera numret.", "Phone number looks incorrect. Please check it.");
      return "";
    }
  }
];

function bookingForms() {
  return Array.from(document.querySelectorAll<HTMLFormElement>("form")).filter((form) => form.closest("#booking") || form.querySelector("#booking-address"));
}

function allInputs(form: HTMLFormElement) {
  return Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select"));
}

function fieldText(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  return input.value || "";
}

function inputLabelText(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  const label = input.closest("label");
  const span = label?.querySelector("span");
  if (span?.textContent) return span.textContent.replace("*", "").trim();
  const wrapper = input.parentElement?.parentElement;
  const previousLabel = wrapper?.querySelector("label");
  return previousLabel?.textContent?.replace("*", "").trim() || input.getAttribute("aria-label") || "";
}

function findInput(form: HTMLFormElement, rule: FieldRule) {
  const inputs = allInputs(form);
  return inputs.find((input) => {
    const label = inputLabelText(input).toLowerCase();
    const placeholder = String(input.getAttribute("placeholder") || "").toLowerCase();
    return rule.labels.some((item) => label === item.toLowerCase()) || (rule.placeholders || []).some((item) => placeholder === item.toLowerCase());
  }) || null;
}

function fieldContainer(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  const label = input.closest("label");
  if (label) return label;
  return input.parentElement?.parentElement || input.parentElement || input;
}

function setError(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, key: string, error: string) {
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

function validateRule(form: HTMLFormElement, rule: FieldRule, language: Language) {
  const input = findInput(form, rule);
  if (!input) return "";
  const value = fieldText(input);
  const error = rule.required && !value.trim() ? requiredMessage(language, inputLabelText(input) || rule.labels[0]) : rule.validate(value, language);
  setError(input, rule.key, error);
  return error;
}

function validateAll(form: HTMLFormElement, language: Language) {
  return rules.map((rule) => validateRule(form, rule, language)).filter(Boolean);
}

function showGlobalMessage(form: HTMLFormElement, message: string) {
  let node = form.querySelector<HTMLParagraphElement>('[data-iboren-global-error="booking"]');
  if (!node) {
    node = document.createElement("p");
    node.dataset.iborenGlobalError = "booking";
    node.className = "rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200";
    form.insertBefore(node, form.firstChild);
  }
  node.textContent = message;
  node.style.display = "block";
  node.scrollIntoView({ behavior: "smooth", block: "center" });
}

function clearGlobalMessage(form: HTMLFormElement) {
  const node = form.querySelector<HTMLParagraphElement>('[data-iboren-global-error="booking"]');
  if (node) node.style.display = "none";
}

function focusFirstInvalid(form: HTMLFormElement) {
  const firstInvalid = form.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[aria-invalid="true"]');
  firstInvalid?.focus();
  firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
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
      const language = detectLanguage();
      for (const form of bookingForms()) {
        for (const rule of rules) {
          const input = findInput(form, rule);
          if (!input || input.dataset.iborenInlineValidation === "1") continue;
          input.dataset.iborenInlineValidation = "1";
          input.addEventListener("input", () => {
            validateRule(form, rule, language);
            if (!form.querySelector('[aria-invalid="true"]')) clearGlobalMessage(form);
          });
          input.addEventListener("blur", () => validateRule(form, rule, language));
          input.addEventListener("invalid", (event) => {
            event.preventDefault();
            const label = inputLabelText(input) || rule.labels[0];
            setError(input, rule.key, requiredMessage(language, label));
            showGlobalMessage(form, text(language, "Kontrollera markerade fält innan du skickar förfrågan.", "Please check the highlighted fields before sending the request."));
            focusFirstInvalid(form);
          });
        }
      }
    };

    attach();
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });

    const submitHandler = (event: Event) => {
      const target = event.target as HTMLFormElement | null;
      if (!target || !bookingForms().includes(target)) return;
      const language = detectLanguage();
      const errors = validateAll(target, language);
      if (errors.length) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showGlobalMessage(target, errors[0]);
        focusFirstInvalid(target);
        return;
      }
      clearGlobalMessage(target);

      if (target.closest("#booking") && hasUser === false) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showGlobalMessage(target, text(language, "Du behöver logga in för att skicka en bokningsförfrågan.", "You need to log in to send a booking request."));
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
