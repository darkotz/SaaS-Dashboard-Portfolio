# Customer Management

## MODIFIED Requirements

### Requirement: Create customer

The system SHALL allow an authenticated production user or a demo visitor to create a validated account with CRM-ready identity, ownership, lifecycle, health, and subscription context.

#### Scenario: Demo account is created

- **WHEN** a demo visitor submits valid account details
- **THEN** the account appears in the account directory
- **AND** a primary contact may be created as part of the same workflow
- **AND** the normalized demo repository persists the related records after reload

#### Scenario: Production account is created

- **WHEN** an authenticated user submits valid account and optional primary-contact details
- **THEN** the server creates records with consistent ownership in one transaction or RPC
- **AND** the account appears in directory and dashboard results

#### Scenario: Account creation fails partway

- **WHEN** the account is created but a required related record cannot be created
- **THEN** the operation rolls back
- **AND** the interface displays an actionable error without leaving partial CRM data

### Requirement: Delete customer

The system SHALL archive accounts by default and SHALL reserve permanent deletion for explicitly authorized administrative cleanup.

#### Scenario: Account is archived

- **WHEN** a permitted user confirms removal from active CRM work
- **THEN** the account receives an archive timestamp
- **AND** it disappears from default active views
- **AND** relationship history is retained

#### Scenario: Archived account is restored

- **WHEN** a permitted user restores an archived account
- **THEN** the archive timestamp is cleared
- **AND** the account returns to active directory results

#### Scenario: Permanent deletion is requested

- **WHEN** a non-admin requests permanent deletion
- **THEN** the operation is denied

### Requirement: Mutation feedback

The system SHALL expose pending, optimistic, success, rollback, and failure states for CRM account mutations.

#### Scenario: Optimistic account update succeeds

- **WHEN** the interface updates an account before persistence completes
- **THEN** successful persistence reconciles the client with server data

#### Scenario: Optimistic account update fails

- **WHEN** persistence rejects an optimistic update
- **THEN** the prior account state is restored
- **AND** the interface displays a concise error
