# Iboren Cinematic Landing

Luxury single-page website for **Iboren.se** — AI-assisted cleaning booking for Sweden.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Framer Motion-ready styling
- Lucide icons
- Vercel-ready deployment

## Pages

- `/` — cinematic landing + services + booking flow
- `/privacy` — GDPR/privacy placeholder
- `/terms` — usage terms placeholder
- `/api/bookings` — validates booking request and optionally sends email through Resend
- `/sitemap.xml`
- `/robots.txt`

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
npm run start
```

## Email setup

Booking API works in demo mode without email credentials. To enable email delivery on Vercel, add:

```bash
RESEND_API_KEY=your_resend_key
BOOKING_TO_EMAIL=hej@iboren.se
BOOKING_FROM_EMAIL=Iboren <verified@yourdomain.se>
```

Use a verified sender domain in Resend before production.

## Deploy on Vercel

1. Push this folder to GitHub.
2. Import repository in Vercel.
3. Add domain `iboren.se` and `www.iboren.se`.
4. Set DNS:
   - `A @ 76.76.21.21`
   - `CNAME www cname.vercel-dns.com`
5. Add email environment variables when ready.

## Important before public launch

- Replace `hej@iboren.se` if another contact email is used.
- Update privacy/terms with legal details when company/provider model is final.
- Add real company information only when available.
- Add analytics/cookie banner only if analytics is activated.
