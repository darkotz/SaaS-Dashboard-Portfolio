# Account Directory

## ADDED Requirements

### Requirement: Search and filter accounts

The system SHALL provide a server-backed account directory that can be searched and filtered without loading every account into the browser.

#### Scenario: Search by account identity

- **WHEN** a user searches by company, contact name, or contact email
- **THEN** matching active accounts are returned
- **AND** the search value is represented in the URL

#### Scenario: Filter account state

- **WHEN** a user filters by lifecycle status, health, owner, or industry
- **THEN** only matching accounts are displayed
- **AND** filters can be cleared without losing unrelated navigation state

### Requirement: Paginate account results

The system SHALL paginate account results with stable ordering.

#### Scenario: More results exist

- **WHEN** the current result set exceeds the configured page size
- **THEN** the user can request the next result page
- **AND** no account appears twice because of unstable ordering

### Requirement: Edit and archive accounts

Permitted users SHALL be able to update account details and archive accounts without permanently deleting relationship history.

#### Scenario: Account is edited

- **WHEN** a permitted user submits valid account changes
- **THEN** the account directory and detail page reflect the changes
- **AND** an account activity entry records the update

#### Scenario: Account is archived

- **WHEN** a permitted user confirms archival
- **THEN** the account is excluded from default active views
- **AND** related contacts, deals, activities, and tasks remain available for authorized historical access

### Requirement: Portfolio demo isolation

Public visitors SHALL use isolated demo account data.

#### Scenario: Visitor changes an account

- **WHEN** an unauthenticated visitor creates, edits, or archives a demo account
- **THEN** only browser-local demo state is changed
- **AND** production Supabase data remains untouched
