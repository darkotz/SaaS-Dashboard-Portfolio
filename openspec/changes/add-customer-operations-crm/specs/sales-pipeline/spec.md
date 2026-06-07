# Sales Pipeline

## ADDED Requirements

### Requirement: View deals by stage

The system SHALL display open deals grouped by ordered pipeline stages.

#### Scenario: Pipeline loads

- **WHEN** a user opens the pipeline
- **THEN** each stage displays its deal count and total value
- **AND** deals display account, amount, owner, and expected close date

### Requirement: Create and edit deals

Permitted users SHALL create and edit commercial opportunities linked to accounts.

#### Scenario: Valid deal is created

- **WHEN** a user submits an account, title, stage, amount, and close date
- **THEN** the deal appears in the selected stage
- **AND** an activity entry records deal creation

#### Scenario: Invalid deal is submitted

- **WHEN** amount is negative, currency is unsupported, or required references are absent
- **THEN** the deal is rejected with an actionable error

### Requirement: Move deals between stages

Permitted users SHALL move deals between stages with pointer, keyboard, or explicit stage controls.

#### Scenario: Open deal changes stage

- **WHEN** a user moves an open deal to another open stage
- **THEN** the board updates optimistically
- **AND** the stage change is persisted and recorded as activity

#### Scenario: Stage persistence fails

- **WHEN** the backend rejects a stage change
- **THEN** the deal returns to its previous stage
- **AND** the interface displays an error

### Requirement: Close deals

The system SHALL capture structured won and lost outcomes.

#### Scenario: Deal is won

- **WHEN** a user moves a deal to a won stage and confirms close details
- **THEN** the deal is marked won with a close timestamp
- **AND** forecast metrics update

#### Scenario: Deal is lost

- **WHEN** a user moves a deal to a lost stage
- **THEN** the system requests a loss reason
- **AND** marks the deal lost after confirmation

### Requirement: Calculate forecast

The system SHALL calculate pipeline totals and weighted forecast using stage or deal probability.

#### Scenario: Forecast is displayed

- **WHEN** open deals have amounts and probabilities
- **THEN** total pipeline value and weighted forecast are displayed
- **AND** closed lost deals are excluded
