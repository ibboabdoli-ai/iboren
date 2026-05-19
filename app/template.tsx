import SeoInternalLinks from "./SeoInternalLinks";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SeoInternalLinks />
    </>
  );
}
