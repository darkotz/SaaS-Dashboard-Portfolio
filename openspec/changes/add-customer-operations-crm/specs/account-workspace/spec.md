# Account Workspace

## ADDED Requirements

### Requirement: View account detail

The system SHALL provide a dedicated account workspace containing relationship and revenue context.

#### Scenario: Account exists

- **WHEN** a user opens an accessible account
- **THEN** the page displays account identity, owner, lifecycle, health, MRR, seats, and last activity
- **AND** provides views for contacts, deals, activity, and tasks

#### Scenario: Account is unavailable

- **WHEN** an account does not exist or is unauthorized
- **THEN** the application displays a not-found response without leaking account details

### Requirement: Preserve navigational context

The account workspace SHALL allow users to return to their previous directory or pipeline context.

#### Scenario: Open account from filtered directory

- **WHEN** a user opens an account from a filtered account list and returns
- **THEN** the prior search, filters, and pagination state are retained

### Requirement: Show actionable relationship summary

The overview SHALL summarize current relationship work rather than only static metadata.

#### Scenario: Account has open work

- **WHEN** the account has open deals, overdue tasks, or recent activity
- **THEN** the overview displays those items ordered by urgency and recency
