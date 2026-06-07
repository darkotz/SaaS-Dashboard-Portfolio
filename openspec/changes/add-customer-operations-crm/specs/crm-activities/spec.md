# CRM Activities

## ADDED Requirements

### Requirement: Record account interactions

Permitted users SHALL record notes, calls, meetings, and email summaries against an account.

#### Scenario: Activity is added

- **WHEN** a user submits a supported activity type, subject, and occurrence time
- **THEN** the activity appears in the account timeline
- **AND** the account last-activity timestamp is updated

### Requirement: Display unified timeline

The system SHALL display user and system activity in one newest-first timeline.

#### Scenario: Timeline loads

- **WHEN** an account has interactions, deal changes, and task events
- **THEN** those records appear in chronological order with type, actor, and time
- **AND** older records are available through pagination

### Requirement: Protect system events

System-generated activity SHALL remain append-only to ordinary users.

#### Scenario: User targets system event

- **WHEN** a non-admin attempts to edit or delete a system activity
- **THEN** the operation is denied

### Requirement: Avoid sensitive log leakage

Application diagnostics SHALL not include free-form activity bodies.

#### Scenario: Activity mutation fails

- **WHEN** an activity operation returns an error
- **THEN** logs include operation and entity identifiers
- **AND** omit note or interaction body content
