import type { ReactNode } from "react";
import ProfileCancellationPolicy from "./ProfileCancellationPolicy";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ProfileCancellationPolicy />
      {children}
    </>
  );
}
