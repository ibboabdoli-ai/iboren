# Iboren project handoff

Last updated: 2026-05-29
Project: Iboren cleaning/booking website
Production: https://iboren.se
Vercel preview/main: https://iboren.vercel.app
Repository: ibboabdoli-ai/iboren

## Working rules

- Work step by step.
- Keep changes small and reversible.
- Check deploy status after each change.
- Do not continue to the next step until the current step is verified or clearly marked as pending user test.
- Avoid unnecessary Vercel deploys and avoid wasting build minutes.
- After meaningful project changes, update this handoff.

## Current project status

### Calculator and booking flow

Completed:

- Swedish and English price calculators exist on `/priser` and `/en/prices`.
- Calculator starts with empty numeric/default input fields so customers enter their own values.
- Calculator hides the useful price estimate until required details are filled.
- Calculator has RUT display and risk/status level.
- Bathroom/Bathrooms logic blocks clearly unrealistic bathroom counts compared with size.
- Calculator estimate is shown inside the booking form after clicking the calculator CTA.
- Booking form is auto-filled from calculator where possible.
- Service selection and extra service selection are separated to prevent `Hemstädning` from being changed to `Fönsterputs` accidentally.
- Add-ons are aligned between calculator and booking.

Aligned add-ons:

SV:
- Fönsterputs
- Ugn
- Kyl/frys
- Balkong
- Grovstädning
- Skåp/lådor

EN:
- Window cleaning
- Oven
- Fridge/freezer
- Balcony
- Deep cleaning
- Cabinets/drawers

Add-on prices before RUT:
- Fönsterputs / Window cleaning: 700 kr
- Ugn / Oven: 350 kr
- Kyl/frys / Fridge/freezer: 350 kr
- Balkong / Balcony: 450 kr
- Grovstädning / Deep cleaning: 650 kr
- Skåp/lådor / Cabinets/drawers: 450 kr

### Step 50F — Calculator snapshot to Admin email

Implemented:

- New helper: `app/BookingSubmissionSnapshot.tsx`
- Enabled in: `app/template.tsx`
- On booking submit, calculator snapshot and final submitted booking are appended to `notes` before POST to `/api/bookings`.
- Admin email already includes notes, so the Admin email receives these sections:
  - `--- Calculator snapshot ---`
  - `--- Final booking submitted ---`
  - `--- Changes after estimate ---`

Latest commit for Step 50F:
- `7cc9653432323dc76b36f60228750767f7d7cb0e`

Deploy status:
- Vercel: success

## Important files touched recently

- `app/PriceCalculator.tsx`
- `app/EnglishPriceCalculator.tsx`
- `app/PriceCalculatorEmptyDefaults.tsx`
- `app/BookingRutEnhancer.tsx`
- `app/BookingCalculatorAutofillFix.tsx`
- `app/BookingSubmissionSnapshot.tsx`
- `app/template.tsx`
- `app/api/bookings/route.ts` was inspected but not heavily changed for Step 50F.

## Known pending verification

User should test:

1. `/priser`
   - Fill calculator.
   - Choose service `Hemstädning`.
   - Add add-ons such as `Fönsterputs`, `Ugn`, `Skåp/lådor`, `Grovstädning`.
   - Continue to booking.
   - Confirm service stays `Hemstädning` and add-ons appear under Extra services.
   - Change at least one field in booking, for example size.
   - Submit booking.
   - Admin email should include calculator snapshot, final booking, and changes.

2. `/en/prices`
   - Same flow in English.
   - Confirm `Home cleaning` does not become `Window cleaning` when Window cleaning is an add-on.
   - Confirm Admin email includes the same snapshot sections.

3. Email send behavior
   - Confirm submit does not get stuck at `Skickar bokningsförfrågan...` / sending state.
   - Confirm Admin email is received.
   - Confirm customer confirmation email is still received.

## Next recommended step

Step 50G — QA and cleanup of booking email format

Goal:
- Verify Step 50F email output in real admin inbox.
- If too long or messy, format Admin email more cleanly.
- Optionally move calculator snapshot from `notes` into first-class API fields later, if database/admin dashboard should store it structurally.

## Current caution

The current Step 50F implementation is intentionally low-risk: it appends snapshot data to `notes` before existing API submission, instead of making a large API/database migration.

If later we need structured reporting, improve in this order:
1. Add typed `calculatorEstimate` to API payload.
2. Store calculator snapshot in Supabase JSONB column.
3. Render clean section in Admin email.
4. Render in Admin dashboard.
