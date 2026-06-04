# AtlasOps SaaS Dashboard

A portfolio-ready SaaS dashboard built with Next.js, TypeScript, Tailwind, shadcn/ui-style components, Supabase, and Stripe.

## Features

- Login and registration with Supabase Auth
- Protected dashboard layout
- `user` and `admin` roles through the `profiles.role` field
- Customer table with create/delete CRUD
- Revenue metrics and charts with Recharts
- Subscription page with Stripe Checkout
- Stripe Customer Portal launcher
- Stripe webhook route that syncs subscription status to Supabase
- Demo mode when Supabase or Stripe keys are not configured

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
```

## Supabase

Run `supabase/schema.sql` in the Supabase SQL editor. The schema creates:

- `profiles`
- `customers`
- `subscriptions`
- Auth trigger for new profiles
- RLS policies for owner/admin access

To promote a portfolio account to admin:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## Stripe

Create a recurring price in Stripe and place the price id in `STRIPE_PRO_PRICE_ID`.

For local webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Use the signing secret from Stripe CLI as `STRIPE_WEBHOOK_SECRET`.
