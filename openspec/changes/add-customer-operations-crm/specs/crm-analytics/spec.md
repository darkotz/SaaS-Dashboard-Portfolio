# CRM Analytics

## ADDED Requirements

### Requirement: Display CRM summary metrics

The overview SHALL display bounded, server-calculated CRM metrics.

#### Scenario: CRM metrics load

- **WHEN** the overview is requested
- **THEN** it displays open pipeline value, weighted forecast, open deals, won value, overdue tasks, and recent activity
- **AND** metrics respect the viewer's authorization scope

### Requirement: Relate SaaS and CRM context

The system SHALL present commercial opportunity data alongside subscription health without conflating them.

#### Scenario: Account has subscription and deal value

- **WHEN** an account has current MRR and open deals
- **THEN** both values are labeled independently
- **AND** neither is double-counted in revenue metrics

### Requirement: Efficient aggregation

CRM analytics SHALL be computed without transferring every deal or task row to the application.

#### Scenario: Metrics are queried

- **WHEN** dashboard aggregates are requested
- **THEN** the database returns aggregated values through a view or RPC
- **AND** the query is bounded by authorization and active-record filters
