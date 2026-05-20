import BookingResponseGuard from "./BookingResponseGuard";
import InternalLinkNormalizer from "./InternalLinkNormalizer";
import SeoInternalLinks from "./SeoInternalLinks";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InternalLinkNormalizer />
      <BookingResponseGuard />
      {children}
      <SeoInternalLinks />
    </>
  );
}
