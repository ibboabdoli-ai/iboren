import type { ReactNode } from "react";
import PublicRequestNotesPolish from "./PublicRequestNotesPolish";

export default function PublicRequestsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicRequestNotesPolish />
      {children}
    </>
  );
}
