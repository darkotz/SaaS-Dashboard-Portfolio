# Production Readiness

## MODIFIED Requirements

### Requirement: Explicit CRM authorization

The database SHALL define owner/admin authorization policies for accounts, contacts, deals, stages, activities, and tasks.

#### Scenario: Owner manages related CRM data

- **WHEN** an authenticated owner accesses CRM records belonging to an owned account
- **THEN** permitted select and mutation operations succeed

#### Scenario: User targets another owner's CRM data

- **WHEN** a non-admin targets CRM records belonging to another owner
- **THEN** the operation is denied without leaking record details

#### Scenario: Admin manages CRM data

- **WHEN** an admin manages workspace CRM records
- **THEN** the operation is permitted through the non-recursive admin helper

### Requirement: Efficient CRM queries

CRM list and timeline requests SHALL be indexed, paginated, and bounded.

#### Scenario: Large account history exists

- **WHEN** an account has more activities than the page limit
- **THEN** only the newest page is returned
- **AND** older pages can be requested using stable pagination

#### Scenario: Pipeline is requested

- **WHEN** open deals are loaded
- **THEN** closed historical deals are excluded by default
- **AND** stage, owner, account, and close-date indexes support the query

### Requirement: Auditable CRM mutations

Material CRM mutations SHALL produce diagnostic context and relationship activity events.

#### Scenario: Deal stage changes

- **WHEN** a deal stage update succeeds
- **THEN** an immutable activity event records the previous and new stage

#### Scenario: CRM mutation fails

- **WHEN** Supabase rejects a CRM mutation
- **THEN** structured logs identify the operation, user, and entity
- **AND** exclude secrets and free-form customer content
