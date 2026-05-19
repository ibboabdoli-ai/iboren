# Iboren Production Launch Checklist

Use this checklist before switching from the Vercel preview domain to `iboren.se`.

## 1. Vercel domain

Add these domains in Vercel Project Settings → Domains:

- `iboren.se`
- `www.iboren.se`

Recommended setup:

- Primary domain: `iboren.se`
- Redirect `www.iboren.se` to `iboren.se`

## 2. DNS at domain provider

For the root domain:

```txt
Type: A
Name: @
Value: 76.76.21.21
```

For www:

```txt
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Wait until Vercel shows the domain configuration as valid.

## 3. Supabase Auth URLs

Go to Supabase → Authentication → URL Configuration.

Set Site URL:

```txt
https://iboren.se
```

Add Redirect URLs:

```txt
https://iboren.se/profile
https://iboren.se/login
https://iboren.vercel.app/profile
https://iboren.vercel.app/login
```

Keep the Vercel URLs during testing. Remove them later if only the production domain should work.

## 4. OAuth providers

For Google, LinkedIn, and Microsoft OAuth providers, the provider callback should point to the Supabase auth callback URL:

```txt
https://YOUR-SUPABASE-PROJECT.supabase.co/auth/v1/callback
```

The app redirect after login is handled by Supabase and the frontend.

## 5. Vercel environment settings

Check that production environment variables are configured for:

- Supabase public URL
- Supabase public browser key
- Supabase admin/server key for admin APIs
- Resend API key
- booking recipient email
- booking sender email
- admin email list

Do not commit secret values to GitHub.

## 6. Resend domain verification

In Resend:

1. Add domain: `iboren.se`
2. Add the DNS records Resend gives you at the domain provider.
3. Wait until Resend shows the domain as verified.
4. Use `hej@iboren.se` as the booking sender after verification.

Until the domain is verified, use the Resend test sender only for testing.

## 7. Database duplicate protection

The booking duplicate index must be applied in Supabase SQL Editor.

Expected active protection:

- Same user
- Same service
- Same address
- Same size
- Same frequency
- Same date
- Same time window
- Same email
- Not cancelled

## 8. Smoke test after domain is live

Test on `https://iboren.se`:

- Home page loads.
- Login with Google works.
- User lands on `/profile` after login.
- Booking form is hidden when logged out.
- Booking form works when logged in.
- Duplicate booking is blocked.
- Customer confirmation email is sent.
- Admin page loads for admin email only.
- CSV export works.
- Open Graph preview loads from `/og.svg`.
