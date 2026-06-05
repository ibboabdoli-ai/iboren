import type { BookingFormLanguage } from "./lib/bookingFormModel";
import UnifiedBookingFormCore from "./UnifiedBookingFormCore";

export default function UnifiedBookingForm({ language }: { language: BookingFormLanguage }) {
  return <UnifiedBookingFormCore language={language} variant="page" />;
}
