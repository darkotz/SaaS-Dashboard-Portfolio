# Tasks

## 1. Foundation and database

- [x] 1.1 Define shared TypeScript CRM entities, mutation result types, and validation schemas.
- [x] 1.2 Add account CRM columns and create contacts, pipeline stages, deals, activities, and CRM tasks tables.
- [x] 1.3 Add foreign keys, checks, timestamps, archival behavior, and production query indexes.
- [x] 1.4 Add non-recursive owner/admin RLS policies for every CRM table.
- [x] 1.5 Backfill primary contacts from existing customer name/email fields.
- [x] 1.6 Seed ordered default pipeline stages for existing owners.
- [x] 1.7 Add a versioned normalized demo CRM repository with reset and migration support.

## 2. Account directory

- [x] 2.1 Add server-side account search, filters, stable pagination, and URL state.
- [x] 2.2 Redesign the account directory for scanning, selection, and responsive use.
- [x] 2.3 Add create, edit, archive, and restore account actions with typed feedback.
- [x] 2.4 Add empty, loading, error, and no-search-results states.
- [x] 2.5 Add account-directory unit and browser tests.

## 3. Account workspace and contacts

- [x] 3.1 Add `/customers/[customerId]` with not-found and error handling.
- [x] 3.2 Build overview, contacts, deals, activity, and tasks tabs.
- [x] 3.3 Add contact create, edit, delete, and atomic primary-contact selection.
- [x] 3.4 Add actionable account summary for health, MRR, open deals, tasks, and recent activity.
- [x] 3.5 Preserve account-directory navigation state when entering and leaving a workspace.
- [x] 3.6 Add RLS and browser tests for account and contact workflows.

## 4. Sales pipeline

- [x] 4.1 Add pipeline and deal query/server-action modules.
- [x] 4.2 Build responsive pipeline stage totals and deal cards.
- [x] 4.3 Integrate an accessible drag-and-drop library with keyboard and explicit stage controls.
- [x] 4.4 Add deal create/edit forms with account lookup and validation.
- [x] 4.5 Add optimistic stage movement with rollback on persistence failure.
- [x] 4.6 Add won/lost close dialogs, loss reasons, and activity events.
- [x] 4.7 Add database-backed pipeline totals and weighted forecast.
- [x] 4.8 Add pipeline unit, integration, and browser tests.

## 5. Activity timeline

- [x] 5.1 Add paginated newest-first activity queries.
- [x] 5.2 Add note, call, meeting, and email-summary creation.
- [x] 5.3 Generate append-only system events for account, contact, deal, and task changes.
- [x] 5.4 Build the account timeline with filters and load-more pagination.
- [x] 5.5 Prevent sensitive activity bodies from entering application logs.
- [x] 5.6 Add activity authorization and interaction tests.

## 6. Follow-up tasks

- [x] 6.1 Add task create, edit, complete, reopen, and delete actions.
- [x] 6.2 Build account-level task views and a top-level `/tasks` queue.
- [x] 6.3 Add assignee, priority, due-state, account, deal, and completion filters.
- [x] 6.4 Add overdue and due-soon derivation with deterministic timezone handling.
- [x] 6.5 Write activity events for task creation and completion.
- [x] 6.6 Add task unit, RLS, and browser tests.

## 7. CRM analytics and navigation

- [x] 7.1 Update navigation to Overview, Accounts, Pipeline, Tasks, Billing, and Admin.
- [x] 7.2 Add SQL view or RPC aggregation for CRM overview metrics.
- [x] 7.3 Add pipeline value, weighted forecast, open/won deals, overdue tasks, and recent activity.
- [x] 7.4 Clearly separate subscription MRR from pipeline and forecast values.
- [x] 7.5 Add loading skeletons and targeted cache/tag revalidation.

## 8. Portfolio demo and polish

- [x] 8.1 Create a realistic connected demo story across accounts, contacts, deals, activities, and tasks.
- [x] 8.2 Ensure every CRM workflow runs without registration and never mutates production data.
- [x] 8.3 Verify responsive layouts at mobile, tablet, and desktop viewports.
- [x] 8.4 Verify keyboard navigation, accessible names, focus behavior, and non-color status indicators.
- [x] 8.5 Add portfolio documentation describing product decisions, architecture, security, and tradeoffs.
- [x] 8.6 Run production build, type checks, automated tests, browser workflows, and visual regression checks.
