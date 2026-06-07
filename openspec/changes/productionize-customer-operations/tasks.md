# Tasks

## 1. Customer mutation correctness

- [x] 1.1 Add typed validation and result handling to customer server actions.
- [x] 1.2 Return inserted/deleted records and invalidate affected routes after successful mutations.
- [x] 1.3 Add a client customer manager with pending, success, and error feedback.
- [x] 1.4 Add versioned local persistence so demo create and delete operations work across reloads.

## 2. Supabase production hardening

- [x] 2.1 Add a migration that replaces recursive role checks with a security-definer admin helper.
- [x] 2.2 Split customer RLS into explicit owner/admin policies for select, insert, update, and delete.
- [x] 2.3 Harden profile/customer queries to surface backend errors and bound customer list reads.

## 3. Documentation and verification

- [x] 3.1 Document demo persistence, migration application, and production hardening priorities.
- [x] 3.2 Run the production build and resolve all type or framework failures.
