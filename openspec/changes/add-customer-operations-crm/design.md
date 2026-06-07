# Design

## Context

AtlasOps currently models each customer as one flat record containing a primary contact name, email, company, lifecycle status, seats, and MRR. This is sufficient for a SaaS account table but cannot represent multiple contacts, commercial opportunities, relationship history, or follow-up work.

The application has two access modes:

- Public portfolio visitors use isolated demo data.
- Authenticated owners use Supabase-backed production data.

CRM behavior must remain credible in both modes without allowing public visitors to mutate production records.

## Goals

- Present one coherent customer-operations product combining SaaS metrics and CRM workflows.
- Make the primary portfolio journey understandable without registration.
- Keep account, deal, activity, and task data relational and authorization-safe.
- Support responsive desktop and mobile workflows.
- Avoid loading an entire CRM dataset into one page.

## Information Architecture

The dashboard navigation becomes:

- `Overview`: SaaS and CRM summary metrics.
- `Accounts`: searchable account directory.
- `Pipeline`: sales opportunities grouped by stage.
- `Tasks`: personal and team follow-up queue.
- `Billing`: subscription and Stripe controls.
- `Admin`: role and workspace controls.

Contacts and activities are accessed primarily through an account detail page instead of separate top-level sections.

## Data Model

### Accounts

The existing `customers` table remains the account record to minimize migration risk. It gains:

- `industry`
- `website`
- `phone`
- `account_owner_id`
- `health_score`
- `last_activity_at`
- `updated_at`
- `archived_at`

The existing `name` and `email` values are retained temporarily as denormalized primary-contact fields for backward compatibility. New CRM views use the `contacts` relation as the source of truth.

### Contacts

`contacts` belongs to one customer account and contains:

- identity and job information
- email and phone
- primary-contact marker
- owner and timestamps
- optional lifecycle state

A partial unique index allows at most one primary contact per account.

### Pipeline stages

`pipeline_stages` defines ordered workspace stages such as Lead, Qualified, Proposal, Negotiation, Won, and Lost. Stages carry display order, probability, color token, and closed/won flags.

Stages are database records rather than a PostgreSQL enum so admins can reorder or rename them later.

### Deals

`deals` belongs to an account and pipeline stage. It contains:

- title
- amount and currency
- expected close date
- probability override
- owner
- status
- won/lost timestamps
- optional loss reason

Weighted forecast is `amount * effective probability`.

### Activities

`activities` is an append-oriented timeline containing:

- account and optional deal/contact references
- activity type
- subject and body
- occurrence timestamp
- creator
- metadata JSON for system-generated events

User-created notes, calls, meetings, and emails can be edited or deleted by permitted users. System activity records remain append-only.

### Tasks

`crm_tasks` belongs to an account with optional deal/contact references. It contains:

- title and description
- assignee
- due timestamp
- priority
- completion timestamp
- creator and timestamps

Overdue state is derived rather than stored.

## Application Architecture

### Server-first reads

Account lists, detail records, pipeline data, and task queues are loaded in Server Components. Queries select only the required fields and use explicit pagination or bounded stage limits.

URL search parameters hold directory filters so views are shareable and browser navigation works naturally.

### Typed mutation boundary

CRM mutations use server actions with:

- schema validation
- authenticated viewer checks
- typed success/error results
- Supabase error logging
- targeted path revalidation
- optional optimistic client updates for pipeline movement and task completion

The implementation should introduce a schema validator such as Zod rather than duplicate manual validation across actions.

### Demo repository

Demo CRM data uses a versioned client repository backed by `localStorage`. The repository stores accounts, contacts, deals, activities, and tasks as one normalized snapshot. A versioned migration/reset mechanism prevents older demo data from breaking after schema changes.

Server-rendered demo pages use seed data. Interactive client surfaces hydrate from the demo repository and reconcile deterministically.

### Account detail composition

The account detail route is `/customers/[customerId]`. It uses:

- summary header with health, owner, MRR, and lifecycle
- tabbed views for Overview, Contacts, Deals, Activity, and Tasks
- compact side facts rather than nested decorative cards
- route-level not-found and error states

### Pipeline interaction

The pipeline is a horizontally scrollable kanban on desktop and a stage-filtered list on narrow screens. A proven drag-and-drop library should handle accessible pointer and keyboard movement.

Moving a deal:

1. Optimistically updates the visible stage.
2. Persists the stage change.
3. Writes an activity event.
4. Reverts and displays an error if persistence fails.

Won/lost movement prompts for close details before persistence.

## Authorization

- Public demo visitors only mutate local browser data.
- Authenticated users manage CRM records they own.
- Admins manage all workspace CRM records.
- Referenced account, contact, deal, and task ownership must be consistent.
- RLS policies use the existing non-recursive `public.is_admin()` helper.
- Service-role credentials are never used for ordinary CRM browser requests.

## Performance

- Account directory uses server-side cursor or page-number pagination.
- Search uses indexed normalized company, contact, and email fields.
- Pipeline queries load bounded open deals grouped by stage.
- Activity timeline is paginated newest-first.
- Dashboard metrics use SQL views/RPC aggregation rather than loading all deal rows into JavaScript.
- Add indexes for foreign keys, stage ordering, due dates, activity timestamps, ownership, and active records.
- Revalidate only affected pages and tags after mutations.

## Accessibility and Responsive UX

- Pipeline cards are keyboard movable and have non-drag stage controls.
- Status, stage, and priority are not communicated by color alone.
- Tables become readable stacked rows or horizontal scroll surfaces on small screens.
- Confirmation dialogs identify the affected account/deal.
- All icon-only actions have accessible names and tooltips.

## Migration Strategy

1. Add new nullable account columns and CRM tables.
2. Backfill one primary contact from each existing customer `name` and `email`.
3. Seed default pipeline stages for existing owners.
4. Add constraints and indexes after successful backfill.
5. Deploy read paths before enabling all mutation controls.
6. Keep old account fields during the first release; remove them only in a later migration.

## Observability and Audit

- Log failed CRM mutations with operation, entity id, Supabase code, and user id.
- Write activity events for material deal stage changes and task completion.
- Add error-monitoring context without storing note bodies or sensitive customer content.
- Track query latency for account search, pipeline load, and activity pagination.

## Testing

- Unit tests for validation, weighted forecast, overdue state, and demo repository migration.
- Integration tests for owner/admin RLS on every CRM table.
- Server-action tests for create, edit, archive, stage move, and task completion.
- Browser tests for public demo account flow, pipeline movement, timeline creation, and reload persistence.
- Responsive visual checks for account directory, detail page, and pipeline.
- Production build, lint, and TypeScript checks.

## Rollout

### Phase 1: Account foundation

Account directory, account detail, contacts, editing, search, filters, pagination, and demo persistence.

### Phase 2: Pipeline

Stages, deals, pipeline board, stage movement, forecast metrics, and deal activity events.

### Phase 3: Relationship operations

Activity timeline, notes, calls/meetings, follow-up tasks, overdue queue, and dashboard CRM metrics.

### Phase 4: Portfolio polish

Responsive refinement, loading/error/empty states, seeded demo story, browser tests, screenshots, and documentation.
