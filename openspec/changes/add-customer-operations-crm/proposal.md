# Add Customer Operations CRM

## Why

AtlasOps already presents subscription metrics, customer accounts, billing, and role-aware administration. Adding a focused CRM layer will turn those disconnected account records into an operational customer workspace and make the portfolio project demonstrate a complete SaaS workflow:

1. Understand account health.
2. Track commercial opportunities.
3. Record customer interactions.
4. Assign follow-up work.
5. Connect CRM activity to recurring revenue.

The CRM should extend the existing SaaS product rather than resemble a separate generic dashboard.

## What Changes

- Replace the basic customer table with a searchable, filterable, paginated account directory.
- Add customer detail pages with overview, contacts, subscription context, deals, activities, notes, and tasks.
- Add a kanban-style sales pipeline with ordered stages and drag-based deal movement.
- Add contacts belonging to customer accounts.
- Add a unified activity timeline for notes, calls, meetings, emails, deal changes, and system events.
- Add follow-up tasks with assignee, due date, priority, completion state, and overdue indicators.
- Add CRM dashboard metrics for pipeline value, weighted forecast, open deals, overdue tasks, and recent activity.
- Extend Supabase with relational CRM tables, indexes, constraints, and owner/admin RLS policies.
- Preserve the registration-free portfolio demo with realistic seeded CRM data and browser-local demo mutations.

## Capabilities

### New Capabilities

- `account-directory`: Searchable and filterable customer account management.
- `account-workspace`: Customer detail pages aggregating commercial and relationship context.
- `contact-management`: Contacts associated with customer accounts.
- `sales-pipeline`: Deal creation, stage movement, forecasting, and win/loss tracking.
- `crm-activities`: Notes and interaction history in a unified timeline.
- `follow-up-tasks`: Assignable customer and deal tasks with due-state management.
- `crm-analytics`: Operational CRM and pipeline metrics.

### Modified Capabilities

- `customer-management`: Extend customer CRUD into full account editing, archival, and detail navigation.
- `production-readiness`: Add CRM-specific indexing, pagination, authorization, validation, and audit requirements.

## Impact

- Dashboard navigation and CRM information architecture
- Customer/account pages and server actions
- Demo data model and browser persistence
- Supabase schema, migrations, RLS, indexes, and generated TypeScript types
- Dashboard metrics and charts
- Responsive interaction patterns for tables, detail pages, and pipeline
- Automated tests and portfolio documentation

## Non-goals

- Gmail, Outlook, calendar, or telephony synchronization
- Automated marketing campaigns
- Lead scraping or enrichment
- Multi-organization workspaces and invitations
- Custom CRM object builders
- Complex workflow automation
- AI-generated sales recommendations
