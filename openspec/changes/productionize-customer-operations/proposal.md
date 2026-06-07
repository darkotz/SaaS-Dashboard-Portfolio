# Productionize Customer Operations

## Why

The customer table currently looks interactive but does not mutate in demo mode, and live Supabase mutations silently discard errors. This makes create and delete appear broken and hides authentication, validation, and RLS failures. The existing RLS policies also use a recursive admin lookup and allow admins to read customer records they cannot manage.

The dashboard also needs a clearer production boundary: demo behavior should be explicit and reliable, server mutations should return actionable outcomes, and database access should be secure and observable.

## What Changes

- Make customer creation and deletion work immediately in demo mode with browser-local persistence.
- Return typed success and error results from production server actions.
- Validate customer input and authenticated identity before database mutations.
- Refresh the account table and dashboard metrics after successful live mutations.
- Add visible pending, success, and error states to customer controls.
- Replace recursive Supabase role policies with a security-definer role helper.
- Add explicit customer select, insert, update, and delete policies for owners and admins.
- Reduce production query payloads and document the next performance and reliability steps.

## Capabilities

### New Capabilities

- `customer-management`: Reliable customer create/delete behavior across demo and production modes.
- `production-readiness`: Secure database authorization, mutation observability, and performance requirements.

### Modified Capabilities

None. This repository does not yet contain baseline OpenSpec capability specs.

## Impact

- Customer UI and server actions
- Supabase customer/profile queries
- Supabase RLS schema and migration
- Dashboard cache invalidation
- Production setup documentation

## Non-goals

- Full customer edit workflow
- Multi-tenant organizations and invitations
- Background job infrastructure
- A complete observability vendor integration
