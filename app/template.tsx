import BookingRutEnhancer from "./BookingRutEnhancer";
import CinematicFrameLock from "./CinematicFrameLock";
import EnglishLinkNormalizer from "./EnglishLinkNormalizer";
import HeaderLogo from "./HeaderLogo";
import InternalLinkNormalizer from "./InternalLinkNormalizer";
import LanguageSwitcher from "./LanguageSwitcher";
import PerformanceHints from "./PerformanceHints";
import SeoInternalLinks from "./SeoInternalLinks";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InternalLinkNormalizer />
      <EnglishLinkNormalizer />
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
