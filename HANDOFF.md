# Iboren project handoff

Last updated: 2026-05-29
Project: Iboren cleaning/booking website
Production: https://iboren.se
Vercel preview/main: https://iboren.vercel.app
Repository: ibboabdoli-ai/iboren
Official public email: hej@iboren.se

## Working rules

- Work step by step.
- Keep changes small and reversible.
- Check deploy status after each change.
- Do not continue to the next step until the current step is verified or clearly marked as pending user test.
- Avoid unnecessary Vercel deploys and avoid wasting build minutes.
- After meaningful project changes, update this handoff.
- Treat this handoff as the project lead source of truth for future Iboren work.

## Business context

Iboren is being built as a serious local cleaning services business in Södertälje and Stockholm.

Main positioning:
- Local cleaning company, Swedish-first.
- Services for private customers and companies.
- Clear pricing, RUT handling, simple booking, and fast follow-up.
- Website must feel like a real Swedish cleaning business, not a tech/AI product.

## Tax, registration and accounting context

### Preliminary tax / debiterad preliminärskatt

- Skatteverket has sent a `Debiterad preliminärskatt` letter.
- For tax year 2026, debiterad preliminärskatt is `0 kr`.
- For now, nothing is paid for preliminärskatt.
- If real income/profit starts, `preliminär inkomstdeklaration` should be updated.

### VAT / moms

- Skatteverket has sent a `Mervärdesskatt / moms` letter.
- Iboren / verksamheten is registered for moms from `20 maj 2026`.
- Sales of services in Sweden must charge moms.
- Cleaning services should normally use `25% moms`.
- Because moms was chosen voluntarily, moms must be charged even if omsättning is under `120 000 kr`.
- This applies until `31 december 2028`.
- Earliest possible return to momsbefrielse is likely `1 januari 2029`, if conditions are met.
- Current decision: keep moms registration because it is more professional and better for Iboren's growth.

### Pricing and invoice implications

For the website:
- Prices for private customers should be displayed as `inkl. moms`.
- Add wording such as: `Alla priser visas inklusive moms för privatpersoner.`
- For private customers with RUT, write clearly:
  - `Pris efter RUT: X kr`
  - `Moms ingår`

For invoices, the preferred structure is:
- `Pris exkl. moms`
- `+ Moms 25%`
- `= Pris inkl. moms`
- `- RUT-avdrag`
- `= Att betala`

Pending tax/accounting verification:
- Check the moms reporting period in Skatteverket / Mina sidor:
  - månad
  - kvartal
  - år
- Even if sales are zero, a zero momsdeklaration may still be required depending on the reporting period.
- Create folder `Iboren Bokföring 2026` and save Skatteverket letters there.
- After the first customer, prepare invoice workflow with moms and RUT correctly.

## Email, DNS and domain context

### Email status

- Domain `iboren.se` has been moved to Cloudflare and Cloudflare is active.
- Previous Inleed DNSSEC/DS record was removed.
- Cloudflare Email Routing is active.
- Email address `hej@iboren.se` has been created.
- `hej@iboren.se` forwards to the user's personal Gmail.
- Email test was completed and works.
- Official public Iboren email from now on: `hej@iboren.se`.

### DNS / hosting caution

- The site is hosted on Vercel.
- Do not move the site to webhotell.
- Do not enable Cloudflare proxy for Vercel website records.
- Keep Vercel website DNS records as `DNS only`.
- Do not change DNS / MX / TXT without checking first.

### Email / contact follow-up tasks

- Add `hej@iboren.se` to:
  - Google Business Profile
  - Website footer
  - Contact page
  - Facebook
  - Instagram
- Test `/boka` and booking forms so booking emails arrive correctly.
- Later check Vercel environment variable:
  - `BOOKING_TO_EMAIL=hej@iboren.se`

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

Moms/pricing note:
- Website price copy must clarify that prices for private customers are shown including moms.
- Calculator and booking email should continue to distinguish before RUT / after RUT clearly.

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
- `c79b5cfbbeca60e4632205a98ef4446d4f457974` — fixed BookingRutEnhancer syntax error after failed deploy.

Deploy status:

- Commit `c79b5cfbbeca60e4632205a98ef4446d4f457974`: Vercel pending at the time this handoff update started.

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
- `HANDOFF.md`

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
   - Admin email should not list `Private customer` as an add-on.

2. `/en/prices`
   - Same flow in English.
   - Confirm `Home cleaning` does not become `Window cleaning` when Window cleaning is an add-on.
   - Confirm Admin email includes the same snapshot sections.

3. Email send behavior
   - Confirm submit does not get stuck at `Skickar bokningsförfrågan...` / sending state.
   - Confirm Admin email is received.
   - Confirm customer confirmation email is still received.

4. Moms/pricing copy
   - Add or verify wording: `Alla priser visas inklusive moms för privatpersoner.`
   - For RUT price presentation, verify wording includes `Moms ingår` where appropriate.

## Next recommended step

Step 50G — QA and cleanup of booking email format

Goal:
- Verify latest email cleanup in a real Admin inbox.
- If still too long or messy, format Admin email more cleanly in the backend route instead of appending a large block to notes.
- Later, move calculator snapshot from `notes` into first-class API fields if database/admin dashboard should store it structurally.

Step 50H — Moms and official contact cleanup

Goal:
- Add `hej@iboren.se` to visible contact areas.
- Check if `BOOKING_TO_EMAIL` should be changed to `hej@iboren.se` in Vercel.
- Add private customer price wording about moms included.
- Ensure invoice/RUT wording supports moms + RUT correctly.

## Current caution

The current Step 50F/50G implementation is still low-risk: it appends snapshot data to `notes` before existing API submission, instead of making a large API/database migration.

If later we need structured reporting, improve in this order:
1. Add typed `calculatorEstimate` to API payload.
2. Store calculator snapshot in Supabase JSONB column.
3. Render clean section in Admin email.
4. Render in Admin dashboard.

Tax/accounting caution:
- Information in this handoff is based on the user's Skatteverket letters and project decisions.
- Confirm exact moms reporting period in Skatteverket before deadlines.
- For invoice handling, verify with accounting/bookkeeping if unsure.
