import BookingRutEnhancer from "./BookingRutEnhancer";
import CinematicFrameLock from "./CinematicFrameLock";
import CopySafetyPatcher from "./CopySafetyPatcher";
import HeaderLogo from "./HeaderLogo";
import InternalLinkNormalizer from "./InternalLinkNormalizer";
import PerformanceHints from "./PerformanceHints";
import SeoInternalLinks from "./SeoInternalLinks";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InternalLinkNormalizer />
      <HeaderLogo />
      <CinematicFrameLock />
      <BookingRutEnhancer />
      <PerformanceHints />
      <CopySafetyPatcher />
      {children}
      <SeoInternalLinks />
    </>
  );
}
