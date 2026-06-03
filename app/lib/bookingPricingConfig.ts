import type {
  PricingAccess,
  PricingAddOn,
  PricingBalconyGlass,
  PricingCondition,
  PricingCustomerType,
  PricingFrequency,
  PricingFurnished,
  PricingService,
  PricingWindowSide,
  PricingYesNo
} from "./pricingCalculator";

export type BookingPricingLocale = "sv" | "en";

export type BookingPricingOption<T extends string = string> = {
  value: T;
  sv: string;
  en: string;
};

export const serviceOptions: BookingPricingOption<PricingService>[] = [
  { value: "Hemstädning", sv: "Hemstädning", en: "Home cleaning" },
  { value: "Flyttstädning", sv: "Flyttstädning", en: "Move-out cleaning" },
  { value: "Storstädning", sv: "Storstädning", en: "Deep cleaning" },
  { value: "Kontorsstädning", sv: "Kontorsstädning", en: "Office cleaning" },
  { value: "Fönsterputs", sv: "Fönsterputs", en: "Window cleaning" }
];

export const customerTypeOptions: BookingPricingOption<PricingCustomerType>[] = [
  { value: "Privatperson", sv: "Privatperson", en: "Private customer" },
  { value: "Företag", sv: "Företag", en: "Business" }
];

export const frequencyOptions: BookingPricingOption<PricingFrequency>[] = [
  { value: "Engång", sv: "Engång", en: "One-time" },
  { value: "Varje vecka", sv: "Varje vecka", en: "Every week" },
  { value: "Varannan vecka", sv: "Varannan vecka", en: "Every other week" },
  { value: "Var fjärde vecka", sv: "Var fjärde vecka", en: "Every month" }
];

export const conditionOptions: BookingPricingOption<PricingCondition>[] = [
  { value: "Normal", sv: "Normal", en: "Normal" },
  { value: "Smutsigt", sv: "Smutsigt", en: "Dirty" },
  { value: "Mycket smutsigt", sv: "Mycket smutsigt", en: "Very dirty" }
];

export const yesNoOptions: BookingPricingOption<PricingYesNo>[] = [
  { value: "Ja", sv: "Ja", en: "Yes" },
  { value: "Nej", sv: "Nej", en: "No" }
];

export const accessOptions: BookingPricingOption<PricingAccess>[] = [
  { value: "Normal", sv: "Normal", en: "Normal access" },
  { value: "Svår åtkomst", sv: "Svår åtkomst", en: "Difficult access" }
];

export const furnishedOptions: BookingPricingOption<PricingFurnished>[] = [
  { value: "Tom bostad", sv: "Tom bostad", en: "Empty home" },
  { value: "Möblerad", sv: "Möblerad", en: "Furnished" }
];

export const windowSideOptions: BookingPricingOption<PricingWindowSide>[] = [
  { value: "Båda sidor", sv: "Båda sidor", en: "Both sides" },
  { value: "Endast insida", sv: "Endast insida", en: "Inside only" },
  { value: "Endast utsida", sv: "Endast utsida", en: "Outside only" }
];

export const balconyGlassOptions: BookingPricingOption<PricingBalconyGlass>[] = [
  { value: "Nej", sv: "Nej", en: "No" },
  { value: "Liten", sv: "Liten", en: "Small" },
  { value: "Stor", sv: "Stor", en: "Large" }
];

export const addOnOptions: BookingPricingOption<PricingAddOn>[] = [
  { value: "Fönsterputs", sv: "Fönsterputs", en: "Window cleaning" },
  { value: "Ugn", sv: "Ugn", en: "Oven" },
  { value: "Kyl/frys", sv: "Kyl/frys", en: "Fridge/freezer" },
  { value: "Balkong", sv: "Balkong", en: "Balcony" },
  { value: "Grovstädning", sv: "Grovstädning", en: "Deep cleaning" },
  { value: "Skåp/lådor", sv: "Skåp/lådor", en: "Cabinets/drawers" },
  { value: "Garage", sv: "Garage", en: "Garage" }
];

export function optionLabel<T extends string>(option: BookingPricingOption<T>, locale: BookingPricingLocale) {
  return locale === "en" ? option.en : option.sv;
}

export function labelsFor<T extends string>(options: BookingPricingOption<T>[], locale: BookingPricingLocale) {
  return options.map((option) => optionLabel(option, locale));
}
