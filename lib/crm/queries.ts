import { demoCrmSnapshot } from "@/lib/crm/demo";
import type { Account, Activity, Contact, CrmSnapshot, CrmTask, Deal, PipelineStage } from "@/lib/crm/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/supabase/queries";

export async function getCrmSnapshot(): Promise<CrmSnapshot> {
  const viewer = await getViewer();
  if (viewer.demoMode) return demoCrmSnapshot;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return demoCrmSnapshot;

  const [accounts, contacts, stages, deals, activities, tasks] = await Promise.all([
    supabase
      .from("customers")
      .select("id, owner_id, company, name, email, status, seats, mrr, industry, website, phone, health_score, last_activity_at, created_at, updated_at, archived_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("contacts").select("id, account_id, first_name, last_name, title, email, phone, is_primary, created_at, updated_at").limit(500),
    supabase.from("pipeline_stages").select("id, name, position, probability, color, is_closed, is_won").order("position").limit(20),
    supabase.from("deals").select("id, account_id, stage_id, owner_id, title, amount, currency, probability, expected_close_date, status, loss_reason, created_at, updated_at, closed_at").order("updated_at", { ascending: false }).limit(300),
    supabase.from("activities").select("id, account_id, deal_id, contact_id, created_by, type, subject, body, occurred_at, is_system").order("occurred_at", { ascending: false }).limit(300),
    supabase.from("crm_tasks").select("id, account_id, deal_id, contact_id, assignee_id, created_by, title, description, priority, due_at, completed_at, created_at, updated_at").order("due_at").limit(300)
  ]);

  const error = [accounts.error, contacts.error, stages.error, deals.error, activities.error, tasks.error].find(Boolean);
  if (error) {
    console.error("CRM snapshot query failed", { code: error.code, message: error.message });
    throw new Error("CRM data could not be loaded. Apply the CRM Supabase migration and retry.");
  }

  return {
    version: 2,
    accounts: (accounts.data ?? []) as Account[],
    contacts: (contacts.data ?? []) as Contact[],
    stages: (stages.data ?? []) as PipelineStage[],
    deals: (deals.data ?? []).map((deal) => ({ ...deal, amount: Number(deal.amount) })) as Deal[],
    activities: (activities.data ?? []) as Activity[],
    tasks: (tasks.data ?? []) as CrmTask[]
  };
}

export async function getAccountCrm(accountId: string) {
  const snapshot = await getCrmSnapshot();
  const account = snapshot.accounts.find((item) => item.id === accountId && !item.archived_at);
  if (!account) return null;
  return {
    account,
    contacts: snapshot.contacts.filter((item) => item.account_id === accountId),
    deals: snapshot.deals.filter((item) => item.account_id === accountId),
    activities: snapshot.activities.filter((item) => item.account_id === accountId),
    tasks: snapshot.tasks.filter((item) => item.account_id === accountId),
    stages: snapshot.stages
  };
}
