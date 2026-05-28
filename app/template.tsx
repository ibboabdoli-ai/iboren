import BookingCalculatorAutofillFix from "./BookingCalculatorAutofillFix";
import BookingRutEnhancer from "./BookingRutEnhancer";
import CinematicFrameLock from "./CinematicFrameLock";
import EnglishHomeServicesEnhancer from "./EnglishHomeServicesEnhancer";
import EnglishLinkNormalizer from "./EnglishLinkNormalizer";
import EnglishProfileLinkNormalizer from "./EnglishProfileLinkNormalizer";
import HeaderLogo from "./HeaderLogo";
import HomeMobileLanguageButton from "./HomeMobileLanguageButton";
import InternalLinkNormalizer from "./InternalLinkNormalizer";
import PerformanceHints from "./PerformanceHints";
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
      <BookingRutEnhancer />
      <BookingCalculatorAutofillFix />
      <PerformanceHints />
      {children}
      <SeoInternalLinks />
    </>
  );
}
