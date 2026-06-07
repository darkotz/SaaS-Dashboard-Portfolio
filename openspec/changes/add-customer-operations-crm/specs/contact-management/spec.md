# Contact Management

## ADDED Requirements

### Requirement: Manage account contacts

Permitted users SHALL create, edit, and remove contacts associated with an account.

#### Scenario: Contact is created

- **WHEN** valid contact details are submitted
- **THEN** the contact appears in the account workspace
- **AND** an activity entry records the creation

#### Scenario: Contact is removed

- **WHEN** a permitted user confirms contact removal
- **THEN** the contact is removed
- **AND** historical activities retain safe contact context

### Requirement: Maintain one primary contact

An account SHALL have at most one primary contact.

#### Scenario: New primary contact is selected

- **WHEN** a user marks a contact as primary
- **THEN** any previous primary contact is demoted atomically
- **AND** the selected contact becomes primary

### Requirement: Validate contact identity

The system SHALL validate contact email and required identity fields.

#### Scenario: Invalid contact is submitted

- **WHEN** required names are missing or an email is malformed
- **THEN** the contact is not persisted
- **AND** the interface displays an actionable validation error
