# Follow-up Tasks

## ADDED Requirements

### Requirement: Manage CRM tasks

Permitted users SHALL create, edit, complete, reopen, and delete tasks linked to accounts and optional deals or contacts.

#### Scenario: Task is created

- **WHEN** a user submits a valid title, assignee, priority, and optional due date
- **THEN** the task appears in the account workspace and assignee queue

#### Scenario: Task is completed

- **WHEN** a permitted user marks a task complete
- **THEN** the completion time is stored
- **AND** an activity entry records completion

### Requirement: Highlight urgency

The system SHALL derive and display overdue and due-soon task states.

#### Scenario: Open task is past due

- **WHEN** an incomplete task due time is earlier than the current time
- **THEN** the task is marked overdue
- **AND** appears in the overdue queue and CRM metrics

### Requirement: Filter task queue

Users SHALL filter tasks by assignee, completion, priority, due state, account, and deal.

#### Scenario: User opens personal queue

- **WHEN** an authenticated user chooses My Tasks
- **THEN** only tasks assigned to that user are displayed
- **AND** overdue tasks are ordered before later tasks
