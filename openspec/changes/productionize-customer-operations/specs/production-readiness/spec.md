# Production Readiness

## ADDED Requirements

### Requirement: Non-recursive authorization

The database SHALL evaluate admin authorization without recursively querying a table through its own RLS policy.

#### Scenario: Profile is read

- **WHEN** a user reads their profile or an admin reads another profile
- **THEN** authorization is evaluated through a security-definer role helper
- **AND** the query does not trigger recursive RLS evaluation

### Requirement: Explicit customer policies

The database SHALL define operation-specific customer policies.

#### Scenario: Owner manages own customers

- **WHEN** an authenticated owner selects, inserts, updates, or deletes their customer
- **THEN** the operation is permitted

#### Scenario: Admin manages customer

- **WHEN** an authenticated admin selects, inserts, updates, or deletes a customer
- **THEN** the operation is permitted regardless of customer owner

#### Scenario: User targets another owner's customer

- **WHEN** a non-admin user targets another owner's customer
- **THEN** the operation is denied

### Requirement: Observable server failures

Production server operations SHALL check and record backend failures.

#### Scenario: Supabase mutation fails

- **WHEN** Supabase returns an error
- **THEN** the server records diagnostic context without sensitive credentials
- **AND** the client receives a safe failure result

### Requirement: Efficient customer reads

Customer list requests SHALL transfer only necessary fields and SHALL support bounded result sets before production scale.

#### Scenario: Customer list is requested

- **WHEN** the account table loads
- **THEN** only fields required by the interface are selected
- **AND** the production roadmap includes pagination or cursor-based limits before unbounded growth

### Requirement: Production hardening roadmap

The production rollout SHALL include rate limiting, structured logs, error monitoring, health checks, database migrations, webhook idempotency, and automated tests.

#### Scenario: Production release is prepared

- **WHEN** the application is promoted beyond a portfolio demo
- **THEN** each hardening item is either implemented or explicitly accepted as release risk
