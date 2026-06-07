import { describe, expect, it } from "vitest";
import { demoCrmSnapshot } from "@/lib/crm/demo";
import { accountSchema, dealSchema } from "@/lib/crm/schemas";
import { computeCrmMetrics, effectiveProbability, isTaskOverdue } from "@/lib/crm/types";

describe("CRM domain", () => {
  it("keeps subscription MRR separate from open pipeline", () => {
    const metrics = computeCrmMetrics(demoCrmSnapshot);
    expect(metrics.mrr).toBe(23780);
    expect(metrics.pipelineValue).toBe(172000);
    expect(metrics.wonValue).toBe(68000);
  });

  it("uses deal probability overrides before stage probability", () => {
    const deal = demoCrmSnapshot.deals.find((item) => item.id === "deal_002")!;
    expect(effectiveProbability(deal, demoCrmSnapshot.stages)).toBe(40);
  });

  it("derives overdue state only for incomplete tasks", () => {
    const overdue = demoCrmSnapshot.tasks.find((item) => item.id === "task_003")!;
    const completed = demoCrmSnapshot.tasks.find((item) => item.id === "task_005")!;
    const now = new Date("2026-06-07T12:00:00.000Z");
    expect(isTaskOverdue(overdue, now)).toBe(true);
    expect(isTaskOverdue(completed, now)).toBe(false);
  });

  it("rejects invalid account and deal values", () => {
    expect(accountSchema.safeParse({
      company: "",
      name: "A",
      email: "invalid",
      status: "active",
      seats: 0,
      mrr: -1,
      industry: "",
      website: "",
      phone: "",
      health_score: 110
    }).success).toBe(false);

    expect(dealSchema.safeParse({
      account_id: "account",
      stage_id: "stage",
      title: "Expansion",
      amount: -10,
      currency: "USD",
      expected_close_date: "2026-07-01"
    }).success).toBe(false);
  });
});
