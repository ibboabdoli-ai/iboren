"use client";

/*
 * Emergency-disabled after live QA: the DOM-based add-on pricing enhancer made the public site heavy / slow to load.
 * Keep this placeholder mounted for rollback safety.
 * Next attempt must be implemented directly inside the real React booking form with controlled state,
 * not with MutationObserver + DOM scanning + textarea event dispatch loops.
 */
export default function BookingAddonDetailsEnhancer() {
  return null;
}
