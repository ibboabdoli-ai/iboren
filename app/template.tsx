import BookingRutEnhancer from "./BookingRutEnhancer";
import CinematicFrameLock from "./CinematicFrameLock";
import HeaderLogo from "./HeaderLogo";
import InternalLinkNormalizer from "./InternalLinkNormalizer";
import SeoInternalLinks from "./SeoInternalLinks";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InternalLinkNormalizer />
      <HeaderLogo />
      <CinematicFrameLock />
      <BookingRutEnhancer />
      {children}
      <SeoInternalLinks />
    </>
  );
}
