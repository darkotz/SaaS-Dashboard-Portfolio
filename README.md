# AtlasOps SaaS Dashboard

A portfolio-ready SaaS dashboard built with Next.js, TypeScript, Tailwind, shadcn/ui-style components, Supabase, and Stripe.

## Features

- Owner login with Supabase Auth
- Registration-free public portfolio preview
- Protected dashboard layout
- `user` and `admin` roles through the `profiles.role` field
- Customer table with create/delete CRUD
- Searchable CRM account directory and account workspaces
- Contact management and primary contacts
- Sales pipeline with drag-and-drop and weighted forecast
- Activity timelines and customer follow-up tasks
- Revenue metrics and charts with Recharts
- Subscription page with Stripe Checkout
- Stripe Customer Portal launcher
- Stripe webhook route that syncs subscription status to Supabase
- Demo mode with browser-persisted customer CRUD when Supabase is not configured

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
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
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

If the original schema has already been applied, run this migration instead:

```text
supabase/migrations/202606060001_productionize_customer_policies.sql
```

It replaces recursive role policies, allows admins to manage customer rows, and prevents users from updating their own role column.

Then run the CRM migration:

```text
supabase/migrations/202606070001_add_customer_operations_crm.sql
```

This adds account health fields, contacts, pipeline stages, deals, activities, tasks, indexes, RLS policies, default stages, contact backfill, and the CRM metrics RPC.

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

## Runtime Modes

Unauthenticated visitors always receive an explicit portfolio demo, even when Supabase is configured. Create and delete operations are saved to versioned browser `localStorage`, so they survive reloads without touching production data.

Authenticated owners receive live Supabase data. Customer mutations run through authenticated server actions that validate input, check mutation results, log diagnostic error context, and refresh server-rendered dashboard data.

## Production Checklist

Before serving meaningful customer traffic:

- Apply every SQL migration through a deployment pipeline.
- Add cursor pagination and indexed search before exceeding 100 customer rows per workspace.
- Add rate limiting to authentication, mutations, checkout, portal, and webhook routes.
- Add structured logs, error monitoring, health checks, and alerting.
- Store processed Stripe event IDs and make webhook handling idempotent.
- Add unit tests for validation and integration tests for RLS, CRUD, auth, and billing.
- Configure secure production URLs, Supabase email settings, Stripe live-mode products, and secret rotation.
- Add database backups and a tested restore procedure.

The detailed requirements and implementation plan are tracked in:

```text
openspec/changes/productionize-customer-operations/
openspec/changes/add-customer-operations-crm/
```

## CRM Portfolio Flow

Public visitors can explore a connected CRM story without registering:

1. Review SaaS and CRM metrics on Overview.
2. Search and filter Accounts.
3. Open an account to inspect contacts, deals, activities, and follow-up tasks.
4. Move deals through Pipeline stages.
5. Complete overdue work in the Tasks queue.

Demo changes are stored only in that browser. Authenticated owners use Supabase and the same interface.
