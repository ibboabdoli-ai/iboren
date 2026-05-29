import BookingAutofillSafetyGuard from "./BookingAutofillSafetyGuard";
import BookingRutEnhancer from "./BookingRutEnhancer";
import BookingSubmissionSnapshot from "./BookingSubmissionSnapshot";
import BookingValueSanityGuard from "./BookingValueSanityGuard";
import CinematicFrameLock from "./CinematicFrameLock";
import EnglishHomeServicesEnhancer from "./EnglishHomeServicesEnhancer";
import EnglishLinkNormalizer from "./EnglishLinkNormalizer";
import EnglishProfileLinkNormalizer from "./EnglishProfileLinkNormalizer";
import HeaderLogo from "./HeaderLogo";
import HomeMobileLanguageButton from "./HomeMobileLanguageButton";
import InternalLinkNormalizer from "./InternalLinkNormalizer";
import PerformanceHints from "./PerformanceHints";
import PriceCalculatorEmptyDefaults from "./PriceCalculatorEmptyDefaults";
import SeoInternalLinks from "./SeoInternalLinks";
import SwedishBookingCopyFix from "./SwedishBookingCopyFix";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InternalLinkNormalizer />
      <EnglishLinkNormalizer />
      <EnglishProfileLinkNormalizer />
      <SwedishBookingCopyFix />
      <HeaderLogo />
      <HomeMobileLanguageButton />
      <EnglishHomeServicesEnhancer />
      <CinematicFrameLock />
      <BookingAutofillSafetyGuard />
      <BookingRutEnhancer />
      <BookingSubmissionSnapshot />
      <BookingValueSanityGuard />
      <PriceCalculatorEmptyDefaults />
      <PerformanceHints />
      {children}
      <SeoInternalLinks />
    </>
  );
}
