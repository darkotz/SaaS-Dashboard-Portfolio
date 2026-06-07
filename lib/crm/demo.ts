import type { CrmSnapshot } from "@/lib/crm/types";

const owner = "demo-admin";

export const demoCrmSnapshot: CrmSnapshot = {
  version: 2,
  accounts: [
    {
      id: "cus_001",
      owner_id: owner,
      company: "Northstar Labs",
      name: "Maya Lind",
      email: "maya@northstar.io",
      status: "active",
      seats: 28,
      mrr: 4200,
      industry: "Developer tools",
      website: "northstar.io",
      phone: "+1 415 555 0180",
      health_score: 88,
      last_activity_at: "2026-06-06T09:30:00.000Z",
      created_at: "2026-02-14T10:00:00.000Z",
      updated_at: "2026-06-06T09:30:00.000Z",
      archived_at: null
    },
    {
      id: "cus_002",
      owner_id: owner,
      company: "Greenline",
      name: "Jonas Berg",
      email: "jonas@greenline.co",
      status: "trial",
      seats: 9,
      mrr: 980,
      industry: "Climate software",
      website: "greenline.co",
      phone: "+46 8 410 245 00",
      health_score: 67,
      last_activity_at: "2026-06-05T13:00:00.000Z",
      created_at: "2026-05-21T08:00:00.000Z",
      updated_at: "2026-06-05T13:00:00.000Z",
      archived_at: null
    },
    {
      id: "cus_003",
      owner_id: owner,
      company: "Lumos Cloud",
      name: "Amira Cole",
      email: "amira@lumos.dev",
      status: "active",
      seats: 44,
      mrr: 7600,
      industry: "Cloud infrastructure",
      website: "lumos.dev",
      phone: "+44 20 7946 0182",
      health_score: 94,
      last_activity_at: "2026-06-06T15:15:00.000Z",
      created_at: "2026-01-29T12:00:00.000Z",
      updated_at: "2026-06-06T15:15:00.000Z",
      archived_at: null
    },
    {
      id: "cus_004",
      owner_id: owner,
      company: "Shipyard",
      name: "Theo Carter",
      email: "theo@shipyard.app",
      status: "at_risk",
      seats: 14,
      mrr: 1800,
      industry: "Logistics",
      website: "shipyard.app",
      phone: "+1 212 555 0142",
      health_score: 34,
      last_activity_at: "2026-05-29T11:45:00.000Z",
      created_at: "2026-03-18T09:00:00.000Z",
      updated_at: "2026-05-29T11:45:00.000Z",
      archived_at: null
    },
    {
      id: "cus_005",
      owner_id: owner,
      company: "Ember Health",
      name: "Leah Kim",
      email: "leah@ember.health",
      status: "active",
      seats: 61,
      mrr: 9200,
      industry: "Healthcare",
      website: "ember.health",
      phone: "+1 617 555 0119",
      health_score: 79,
      last_activity_at: "2026-06-04T16:20:00.000Z",
      created_at: "2025-12-10T14:00:00.000Z",
      updated_at: "2026-06-04T16:20:00.000Z",
      archived_at: null
    }
  ],
  contacts: [
    { id: "con_001", account_id: "cus_001", first_name: "Maya", last_name: "Lind", title: "VP Engineering", email: "maya@northstar.io", phone: "+1 415 555 0180", is_primary: true, created_at: "2026-02-14T10:00:00.000Z", updated_at: "2026-02-14T10:00:00.000Z" },
    { id: "con_002", account_id: "cus_001", first_name: "Eli", last_name: "Stone", title: "Platform Lead", email: "eli@northstar.io", phone: "+1 415 555 0181", is_primary: false, created_at: "2026-03-02T10:00:00.000Z", updated_at: "2026-03-02T10:00:00.000Z" },
    { id: "con_003", account_id: "cus_002", first_name: "Jonas", last_name: "Berg", title: "Founder", email: "jonas@greenline.co", phone: "+46 8 410 245 00", is_primary: true, created_at: "2026-05-21T08:00:00.000Z", updated_at: "2026-05-21T08:00:00.000Z" },
    { id: "con_004", account_id: "cus_003", first_name: "Amira", last_name: "Cole", title: "COO", email: "amira@lumos.dev", phone: "+44 20 7946 0182", is_primary: true, created_at: "2026-01-29T12:00:00.000Z", updated_at: "2026-01-29T12:00:00.000Z" },
    { id: "con_005", account_id: "cus_004", first_name: "Theo", last_name: "Carter", title: "Head of Operations", email: "theo@shipyard.app", phone: "+1 212 555 0142", is_primary: true, created_at: "2026-03-18T09:00:00.000Z", updated_at: "2026-03-18T09:00:00.000Z" },
    { id: "con_006", account_id: "cus_005", first_name: "Leah", last_name: "Kim", title: "Chief Digital Officer", email: "leah@ember.health", phone: "+1 617 555 0119", is_primary: true, created_at: "2025-12-10T14:00:00.000Z", updated_at: "2025-12-10T14:00:00.000Z" }
  ],
  stages: [
    { id: "stage_lead", name: "Lead", position: 1, probability: 10, color: "#64748b", is_closed: false, is_won: false },
    { id: "stage_qualified", name: "Qualified", position: 2, probability: 30, color: "#2563eb", is_closed: false, is_won: false },
    { id: "stage_proposal", name: "Proposal", position: 3, probability: 55, color: "#7c3aed", is_closed: false, is_won: false },
    { id: "stage_negotiation", name: "Negotiation", position: 4, probability: 75, color: "#ea580c", is_closed: false, is_won: false },
    { id: "stage_won", name: "Won", position: 5, probability: 100, color: "#059669", is_closed: true, is_won: true },
    { id: "stage_lost", name: "Lost", position: 6, probability: 0, color: "#dc2626", is_closed: true, is_won: false }
  ],
  deals: [
    { id: "deal_001", account_id: "cus_001", stage_id: "stage_negotiation", owner_id: owner, title: "Enterprise observability rollout", amount: 54000, currency: "USD", probability: null, expected_close_date: "2026-06-28", status: "open", loss_reason: null, created_at: "2026-05-02T10:00:00.000Z", updated_at: "2026-06-06T09:30:00.000Z", closed_at: null },
    { id: "deal_002", account_id: "cus_002", stage_id: "stage_qualified", owner_id: owner, title: "Growth plan conversion", amount: 14400, currency: "USD", probability: 40, expected_close_date: "2026-06-20", status: "open", loss_reason: null, created_at: "2026-05-23T10:00:00.000Z", updated_at: "2026-06-05T13:00:00.000Z", closed_at: null },
    { id: "deal_003", account_id: "cus_003", stage_id: "stage_proposal", owner_id: owner, title: "Regional capacity expansion", amount: 82000, currency: "USD", probability: null, expected_close_date: "2026-07-12", status: "open", loss_reason: null, created_at: "2026-05-18T10:00:00.000Z", updated_at: "2026-06-06T15:15:00.000Z", closed_at: null },
    { id: "deal_004", account_id: "cus_004", stage_id: "stage_lead", owner_id: owner, title: "Retention rescue package", amount: 21600, currency: "USD", probability: 20, expected_close_date: "2026-06-30", status: "open", loss_reason: null, created_at: "2026-05-29T10:00:00.000Z", updated_at: "2026-05-29T10:00:00.000Z", closed_at: null },
    { id: "deal_005", account_id: "cus_005", stage_id: "stage_won", owner_id: owner, title: "Clinical analytics add-on", amount: 68000, currency: "USD", probability: 100, expected_close_date: "2026-05-31", status: "won", loss_reason: null, created_at: "2026-04-10T10:00:00.000Z", updated_at: "2026-05-31T14:00:00.000Z", closed_at: "2026-05-31T14:00:00.000Z" }
  ],
  activities: [
    { id: "act_001", account_id: "cus_001", deal_id: "deal_001", contact_id: "con_001", created_by: owner, type: "meeting", subject: "Security review completed", body: "Procurement approved the security package. Legal review is the final dependency.", occurred_at: "2026-06-06T09:30:00.000Z", is_system: false },
    { id: "act_002", account_id: "cus_003", deal_id: "deal_003", contact_id: "con_004", created_by: owner, type: "email", subject: "Proposal delivered", body: "Sent the regional capacity proposal with implementation timeline.", occurred_at: "2026-06-06T15:15:00.000Z", is_system: false },
    { id: "act_003", account_id: "cus_002", deal_id: "deal_002", contact_id: "con_003", created_by: owner, type: "call", subject: "Trial success check-in", body: "Activation is strong. Jonas requested a comparison of annual and monthly terms.", occurred_at: "2026-06-05T13:00:00.000Z", is_system: false },
    { id: "act_004", account_id: "cus_004", deal_id: null, contact_id: "con_005", created_by: owner, type: "note", subject: "Account risk", body: "Usage fell after the operations team reorganized. Executive sponsor meeting needed.", occurred_at: "2026-05-29T11:45:00.000Z", is_system: false },
    { id: "act_005", account_id: "cus_005", deal_id: "deal_005", contact_id: null, created_by: owner, type: "system", subject: "Deal marked won", body: "Clinical analytics add-on closed for $68,000.", occurred_at: "2026-05-31T14:00:00.000Z", is_system: true }
  ],
  tasks: [
    { id: "task_001", account_id: "cus_001", deal_id: "deal_001", contact_id: "con_001", assignee_id: owner, created_by: owner, title: "Send final contract redlines", description: "Incorporate legal feedback and send for signature.", priority: "high", due_at: "2026-06-09T15:00:00.000Z", completed_at: null, created_at: "2026-06-06T09:45:00.000Z", updated_at: "2026-06-06T09:45:00.000Z" },
    { id: "task_002", account_id: "cus_002", deal_id: "deal_002", contact_id: "con_003", assignee_id: owner, created_by: owner, title: "Share annual pricing options", description: "Send a two-option pricing summary before the trial ends.", priority: "medium", due_at: "2026-06-08T10:00:00.000Z", completed_at: null, created_at: "2026-06-05T13:15:00.000Z", updated_at: "2026-06-05T13:15:00.000Z" },
    { id: "task_003", account_id: "cus_004", deal_id: "deal_004", contact_id: "con_005", assignee_id: owner, created_by: owner, title: "Book executive sponsor call", description: "Align on recovery plan and account ownership.", priority: "high", due_at: "2026-06-03T09:00:00.000Z", completed_at: null, created_at: "2026-05-29T12:00:00.000Z", updated_at: "2026-05-29T12:00:00.000Z" },
    { id: "task_004", account_id: "cus_003", deal_id: "deal_003", contact_id: "con_004", assignee_id: owner, created_by: owner, title: "Confirm implementation resources", description: "Validate solutions engineering coverage for July.", priority: "medium", due_at: "2026-06-12T13:00:00.000Z", completed_at: null, created_at: "2026-06-06T15:30:00.000Z", updated_at: "2026-06-06T15:30:00.000Z" },
    { id: "task_005", account_id: "cus_005", deal_id: "deal_005", contact_id: "con_006", assignee_id: owner, created_by: owner, title: "Complete won-deal handoff", description: "Introduce customer success and confirm onboarding milestones.", priority: "low", due_at: "2026-06-05T12:00:00.000Z", completed_at: "2026-06-04T16:20:00.000Z", created_at: "2026-05-31T14:10:00.000Z", updated_at: "2026-06-04T16:20:00.000Z" }
  ]
};
