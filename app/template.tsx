import SeoInternalLinks from "./SeoInternalLinks";
import TextCleanup from "./TextCleanup";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TextCleanup />
      {children}
      <SeoInternalLinks />
    </>
  );
}
