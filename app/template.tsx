import CinematicScrollDriver from "./CinematicScrollDriver";
import InternalLinkNormalizer from "./InternalLinkNormalizer";
import SeoInternalLinks from "./SeoInternalLinks";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InternalLinkNormalizer />
      <CinematicScrollDriver />
      {children}
      <SeoInternalLinks />
    </>
  );
}
