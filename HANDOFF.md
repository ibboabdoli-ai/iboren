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
- Add-ons are aligned between calculator and booking.
- Calculator data is captured when the customer clicks the calculator CTA.
- Booking autofill has been rebuilt to separate service and extras more safely:
  - Calculator service should map only to booking service.
  - Calculator add-ons/tillval should map only to booking extra services.

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

- Helper: `app/BookingSubmissionSnapshot.tsx`
- Enabled in: `app/template.tsx`
- On booking submit, calculator snapshot and final submitted booking are appended to `notes` before POST to `/api/bookings`.
- Admin email receives these sections:
  - `--- Calculator snapshot ---`
  - `--- Final booking submitted ---`
  - `--- Changes after estimate ---`

Latest production-tested result:

- Admin email is received.
- Calculator inputs are included.
- Final booking values are included.
- Extra services are included.
- A cleanup fix was applied so language translations such as `Home cleaning` vs `Hemstädning` and `One-time` vs `Engång` are not reported as real changes.
- A cleanup fix was applied so only the customer free text is shown as customer free text in the final snapshot, instead of repeating the whole property-details block.

Recent commits:

- `f3e89b96c014bf36385479a1b86567889b3514be` — restored calculator snapshot capture before booking autofill.
- `e0c189290a8242148b7fdea5f0df452ff23eda8f` — cleaned Admin email snapshot formatting and false changes.

Deploy status:

- Commit `e0c189290a8242148b7fdea5f0df452ff23eda8f`: Vercel pending at the time this handoff was updated.

## Important files touched recently

- `app/PriceCalculator.tsx`
- `app/EnglishPriceCalculator.tsx`
- `app/PriceCalculatorEmptyDefaults.tsx`
- `app/BookingRutEnhancer.tsx`
- `app/BookingCalculatorAutofillFix.tsx`
- `app/BookingAutofillSafetyGuard.tsx`
- `app/BookingSubmissionSnapshot.tsx`
- `app/template.tsx`
- `app/api/bookings/route.ts` was inspected but not heavily changed for Step 50F.

## Known pending verification

User should retest after latest deploy:

1. `/priser`
   - Fill calculator.
   - Choose service `Hemstädning`.
   - Add add-ons such as `Fönsterputs`, `Ugn`, `Skåp/lådor`, `Grovstädning`.
   - Continue to booking.
   - Confirm service stays `Hemstädning`.
   - Confirm add-ons appear under Extra services.
   - Submit booking.
   - Admin email should include calculator snapshot and final booking.
   - Admin email should NOT mark `Home cleaning -> Hemstädning` or `One-time -> Engång` as real changes.

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
- Verify latest email cleanup in a real Admin inbox.
- If still too long or messy, format Admin email more cleanly in the backend route instead of appending a large block to notes.
- Later, move calculator snapshot from `notes` into first-class API fields if database/admin dashboard should store it structurally.

## Current caution

The current Step 50F/50G implementation is still low-risk: it appends snapshot data to `notes` before existing API submission, instead of making a large API/database migration.

If later we need structured reporting, improve in this order:
1. Add typed `calculatorEstimate` to API payload.
2. Store calculator snapshot in Supabase JSONB column.
3. Render clean section in Admin email.
4. Render in Admin dashboard.
