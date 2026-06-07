# Design

## Context

The app supports two runtime modes:

- Demo mode when Supabase public credentials are absent.
- Production mode when Supabase is configured and requests are authenticated.

The current server actions return no result and intentionally do nothing in demo mode. Production actions also ignore Supabase errors. The page is server-rendered, so it has no local state to represent pending operations or persist demo mutations.

## Goals

- Make create and delete deterministic in both runtime modes.
- Surface failures instead of presenting silent success.
- Keep the production source of truth in Supabase.
- Keep demo data isolated to the browser and clearly labeled.
- Make RLS behavior explicit and non-recursive.

## Decisions

### Client coordinator for customer operations

Add a client-side customer manager that receives the initial rows and runtime mode. It owns pending and feedback state.

In demo mode, it stores customer rows in versioned `localStorage`. This is intentionally a portfolio preview mechanism, not a production database.

In production mode, it calls typed server actions. A successful create returns the inserted row so the table can update immediately; a successful delete returns the deleted id. The component also calls `router.refresh()` to reconcile with Supabase and refresh server-rendered metrics.

### Typed mutation results

Server actions return a discriminated result:

```ts
type CustomerActionResult =
  | { success: true; message: string; customer?: Customer; deletedId?: string }
  | { success: false; message: string };
```

Actions validate required strings, email shape, status, numeric bounds, authenticated user identity, and Supabase responses. Database details stay server-side while the user receives a safe message.

### Explicit ownership

Create actions set `owner_id` from the authenticated user instead of relying only on a database default. This makes intent auditable and avoids ambiguous inserts.

### Non-recursive role authorization

Create `public.is_admin()` as a `security definer` SQL function with a fixed search path. RLS policies call this helper instead of selecting from `profiles` inside a `profiles` policy.

Customer policies are split by operation. Owners manage their rows; admins can manage all rows. The migration drops the previous combined policies before creating replacements.

### Performance boundary

Customer reads remain server-side and select only displayed fields. Immediate UI updates avoid a blocking full-page round trip, while `router.refresh()` provides eventual reconciliation. Future pagination, indexed search, rate limiting, logging, and monitoring are specified but not all implemented in this correctness-focused change.

## Error Handling

- Unconfigured Supabase is treated as demo mode, not a successful production mutation.
- Unauthenticated production requests return an actionable sign-in error.
- Validation failures return field-independent messages without touching Supabase.
- Supabase errors are logged server-side and mapped to safe user-facing messages.
- Delete success requires a returned deleted row, preventing false positives when RLS matches zero records.

## Testing

- Production build and TypeScript checks.
- Demo create persists across reload and appears at the top of the table.
- Demo delete removes seeded and newly created rows.
- Invalid input does not mutate state.
- Live actions return failures for unauthenticated or rejected requests.
- SQL migration contains non-recursive, operation-specific policies.
