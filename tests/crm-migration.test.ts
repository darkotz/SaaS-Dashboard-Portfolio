import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  path.resolve("supabase/migrations/202606070001_add_customer_operations_crm.sql"),
  "utf8"
);

describe("CRM migration", () => {
  it("creates every CRM relationship table", () => {
    for (const table of ["contacts", "pipeline_stages", "deals", "activities", "crm_tasks"]) {
      expect(migration).toContain(`public.${table}`);
    }
  });

  it("enables RLS and uses the non-recursive admin helper", () => {
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("public.is_admin()");
    expect(migration).toContain('policy "activities update non-system"');
  });

  it("adds bounded-query indexes and aggregation", () => {
    expect(migration).toContain("activities_account_occurred_idx");
    expect(migration).toContain("crm_tasks_assignee_due_idx");
    expect(migration).toContain("crm_overview_metrics");
  });
});
