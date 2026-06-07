# Customer Management

## ADDED Requirements

### Requirement: Create customer

The system SHALL allow an authenticated production user or a demo-mode visitor to create a valid customer record from the account form.

#### Scenario: Demo customer is created

- **WHEN** a demo visitor submits valid customer details
- **THEN** the new customer appears at the top of the account table
- **AND** the customer remains available after a browser reload

#### Scenario: Production customer is created

- **WHEN** an authenticated user submits valid customer details
- **THEN** the server inserts a customer owned by that user
- **AND** the inserted customer appears in the table without requiring a manual reload
- **AND** dashboard metrics are reconciled with the database

#### Scenario: Invalid customer is rejected

- **WHEN** submitted details contain a missing required value, invalid email, unsupported status, seats below one, or negative MRR
- **THEN** no customer is created
- **AND** the interface displays an actionable error

### Requirement: Delete customer

The system SHALL allow permitted users to delete customer records and SHALL not report success when no record was deleted.

#### Scenario: Demo customer is deleted

- **WHEN** a demo visitor confirms a customer deletion
- **THEN** the customer is removed from the table and demo persistence

#### Scenario: Production customer is deleted

- **WHEN** an owner or admin deletes a permitted customer
- **THEN** Supabase deletes and returns that customer id
- **AND** the table removes the row immediately
- **AND** server-rendered data is refreshed

#### Scenario: Database rejects deletion

- **WHEN** authentication or RLS prevents deletion
- **THEN** the table retains the customer
- **AND** the interface displays an error instead of silent success

### Requirement: Mutation feedback

The system SHALL expose pending and result states for customer mutations.

#### Scenario: Mutation is in progress

- **WHEN** create or delete is awaiting completion
- **THEN** the relevant controls are disabled
- **AND** duplicate submissions are prevented

#### Scenario: Mutation completes

- **WHEN** a mutation succeeds or fails
- **THEN** the interface displays a concise success or error message
