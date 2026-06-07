export type AccountStatus = "active" | "trial" | "at_risk" | "churned";
export type HealthLevel = "healthy" | "watch" | "critical";
export type DealStatus = "open" | "won" | "lost";
export type ActivityType = "note" | "call" | "meeting" | "email" | "system";
export type TaskPriority = "low" | "medium" | "high";

export type Account = {
  id: string;
  owner_id: string;
  company: string;
  name: string;
  email: string;
  status: AccountStatus;
  seats: number;
  mrr: number;
  industry: string;
  website: string;
  phone: string;
  health_score: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type Contact = {
  id: string;
  account_id: string;
  first_name: string;
  last_name: string;
  title: string;
  email: string;
  phone: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type PipelineStage = {
  id: string;
  name: string;
  position: number;
  probability: number;
  color: string;
  is_closed: boolean;
  is_won: boolean;
};

export type Deal = {
  id: string;
  account_id: string;
  stage_id: string;
  owner_id: string;
  title: string;
  amount: number;
  currency: "USD" | "EUR" | "SEK";
  probability: number | null;
  expected_close_date: string;
  status: DealStatus;
  loss_reason: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
};

export type Activity = {
  id: string;
  account_id: string;
  deal_id: string | null;
  contact_id: string | null;
  created_by: string;
  type: ActivityType;
  subject: string;
  body: string;
  occurred_at: string;
  is_system: boolean;
};

export type CrmTask = {
  id: string;
  account_id: string;
  deal_id: string | null;
  contact_id: string | null;
  assignee_id: string;
  created_by: string;
  title: string;
  description: string;
  priority: TaskPriority;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CrmSnapshot = {
  version: 2;
  accounts: Account[];
  contacts: Contact[];
  stages: PipelineStage[];
  deals: Deal[];
  activities: Activity[];
  tasks: CrmTask[];
};

export type CrmMetrics = {
  mrr: number;
  activeAccounts: number;
  pipelineValue: number;
  weightedForecast: number;
  openDeals: number;
  wonValue: number;
  overdueTasks: number;
};

export function accountHealth(account: Account): HealthLevel {
  if (account.health_score >= 75) return "healthy";
  if (account.health_score >= 45) return "watch";
  return "critical";
}

export function effectiveProbability(deal: Deal, stages: PipelineStage[]) {
  return deal.probability ?? stages.find((stage) => stage.id === deal.stage_id)?.probability ?? 0;
}

export function isTaskOverdue(task: CrmTask, now = new Date()) {
  return Boolean(task.due_at && !task.completed_at && new Date(task.due_at) < now);
}

export function computeCrmMetrics(snapshot: CrmSnapshot): CrmMetrics {
  const openDeals = snapshot.deals.filter((deal) => deal.status === "open");
  const wonDeals = snapshot.deals.filter((deal) => deal.status === "won");

  return {
    mrr: snapshot.accounts.filter((account) => !account.archived_at).reduce((sum, account) => sum + account.mrr, 0),
    activeAccounts: snapshot.accounts.filter((account) => !account.archived_at && account.status === "active").length,
    pipelineValue: openDeals.reduce((sum, deal) => sum + deal.amount, 0),
    weightedForecast: openDeals.reduce(
      (sum, deal) => sum + deal.amount * (effectiveProbability(deal, snapshot.stages) / 100),
      0
    ),
    openDeals: openDeals.length,
    wonValue: wonDeals.reduce((sum, deal) => sum + deal.amount, 0),
    overdueTasks: snapshot.tasks.filter((task) => isTaskOverdue(task)).length
  };
}
