import type { ReactNode } from "react";
import OperationsBookingReferenceEnhancer from "./OperationsBookingReferenceEnhancer";

export default function OperationsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <OperationsBookingReferenceEnhancer />
      {children}
    </>
  );
}
