import BookingRutEnhancer from "./BookingRutEnhancer";
import CinematicFrameLock from "./CinematicFrameLock";
import EnglishLinkNormalizer from "./EnglishLinkNormalizer";
import EnglishProfileLinkNormalizer from "./EnglishProfileLinkNormalizer";
import HeaderLogo from "./HeaderLogo";
import InternalLinkNormalizer from "./InternalLinkNormalizer";
import LanguageSwitcher from "./LanguageSwitcher";
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
      <CinematicFrameLock />
      <BookingRutEnhancer />
      <PerformanceHints />
      <LanguageSwitcher />
      {children}
      <SeoInternalLinks />
    </>
  );
}
