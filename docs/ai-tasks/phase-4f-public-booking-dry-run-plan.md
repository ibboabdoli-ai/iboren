# Phase 4F public booking dry-run plan

Goal: allow the mobile app to test public booking payloads safely before real submit is enabled.

Safety requirements:

- `dryRun=true` validates and normalizes the request.
- `dryRun=true` must not save to Supabase.
- `dryRun=true` must not generate a booking number.
- `dryRun=true` must not send admin or customer email.
- Real submit path must stay unchanged.

Implementation target:

- `app/api/public-booking-request/route.ts`

Expected dry-run response:

```json
{
  "ok": true,
  "dryRun": true,
  "saved": false,
  "emailStatus": {
    "adminSent": false,
    "customerSent": false,
    "configured": false,
    "dryRun": true
  },
  "payload": {},
  "message": "Dry-run godkänd. Ingen bokning har sparats och inga mejl har skickats."
}
```
