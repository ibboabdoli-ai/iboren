"use client";

/*
 * Legacy fallback enhancer kept intentionally for rollback safety.
 * Booking numbers are now rendered directly in:
 * - /profile
 * - /admin
 * - /admin/operations, through route-scoped OperationsBookingReferenceEnhancer
 * - /admin/public-requests
 *
 * Do not delete this file without checking the booking-number rollout history.
 */
export default function BookingNumberUiEnhancer() {
  return null;
}
