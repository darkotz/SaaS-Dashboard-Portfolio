"use server";

import { revalidatePath } from "next/cache";
import { accountSchema, activitySchema, contactSchema, dealSchema, taskSchema } from "@/lib/crm/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CrmActionResult<T = undefined> =
  | { success: true; message: string; data?: T }
  | { success: false; message: string };

async function authenticatedClient() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { supabase, user: data.user };
}

function refreshCrm(accountId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/customers");
  revalidatePath("/pipeline");
  revalidatePath("/tasks");
  if (accountId) revalidatePath(`/customers/${accountId}`);
}

export async function saveAccount(input: unknown, accountId?: string): Promise<CrmActionResult<Record<string, unknown>>> {
  const parsed = accountSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid account." };
  const auth = await authenticatedClient();
  if (!auth) return { success: false, message: "Sign in to change production CRM data." };

  const payload = { ...parsed.data, owner_id: auth.user.id, last_activity_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  const query = accountId
    ? auth.supabase.from("customers").update(payload).eq("id", accountId)
    : auth.supabase.from("customers").insert(payload);
  const { data, error } = await query.select().single();
  if (error) {
    console.error("Account mutation failed", { code: error.code, accountId, userId: auth.user.id });
    return { success: false, message: "The account could not be saved." };
  }
  refreshCrm(data.id);
  return { success: true, message: accountId ? "Account updated." : "Account created.", data };
}

export async function setAccountArchived(accountId: string, archived: boolean): Promise<CrmActionResult> {
  const auth = await authenticatedClient();
  if (!auth) return { success: false, message: "Sign in to change production CRM data." };
  const { error } = await auth.supabase
    .from("customers")
    .update({ archived_at: archived ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
    .eq("id", accountId);
  if (error) return { success: false, message: "The account archive state could not be changed." };
  refreshCrm(accountId);
  return { success: true, message: archived ? "Account archived." : "Account restored." };
}

export async function saveContact(accountId: string, input: unknown, contactId?: string): Promise<CrmActionResult<Record<string, unknown>>> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid contact." };
  const auth = await authenticatedClient();
  if (!auth) return { success: false, message: "Sign in to change production CRM data." };
  if (parsed.data.is_primary) {
    await auth.supabase.from("contacts").update({ is_primary: false }).eq("account_id", accountId);
  }
  const payload = { ...parsed.data, account_id: accountId, owner_id: auth.user.id, updated_at: new Date().toISOString() };
  const query = contactId
    ? auth.supabase.from("contacts").update(payload).eq("id", contactId)
    : auth.supabase.from("contacts").insert(payload);
  const { data, error } = await query.select().single();
  if (error) return { success: false, message: "The contact could not be saved." };
  refreshCrm(accountId);
  return { success: true, message: "Contact saved.", data };
}

export async function deleteContact(accountId: string, contactId: string): Promise<CrmActionResult> {
  const auth = await authenticatedClient();
  if (!auth) return { success: false, message: "Sign in to change production CRM data." };
  const { error } = await auth.supabase.from("contacts").delete().eq("id", contactId);
  if (error) return { success: false, message: "The contact could not be deleted." };
  refreshCrm(accountId);
  return { success: true, message: "Contact deleted." };
}

export async function saveDeal(input: unknown, dealId?: string): Promise<CrmActionResult<Record<string, unknown>>> {
  const parsed = dealSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid deal." };
  const auth = await authenticatedClient();
  if (!auth) return { success: false, message: "Sign in to change production CRM data." };
  const payload = { ...parsed.data, owner_id: auth.user.id, updated_at: new Date().toISOString() };
  const query = dealId ? auth.supabase.from("deals").update(payload).eq("id", dealId) : auth.supabase.from("deals").insert(payload);
  const { data, error } = await query.select().single();
  if (error) return { success: false, message: "The deal could not be saved." };
  refreshCrm(parsed.data.account_id);
  return { success: true, message: "Deal saved.", data };
}

export async function moveDeal(dealId: string, accountId: string, stageId: string, status: "open" | "won" | "lost", lossReason?: string): Promise<CrmActionResult> {
  const auth = await authenticatedClient();
  if (!auth) return { success: false, message: "Sign in to change production CRM data." };
  const now = new Date().toISOString();
  const { error } = await auth.supabase
    .from("deals")
    .update({ stage_id: stageId, status, loss_reason: lossReason ?? null, closed_at: status === "open" ? null : now, updated_at: now })
    .eq("id", dealId);
  if (error) return { success: false, message: "The deal stage could not be changed." };
  await auth.supabase.from("activities").insert({
    account_id: accountId,
    deal_id: dealId,
    owner_id: auth.user.id,
    created_by: auth.user.id,
    type: "system",
    subject: status === "open" ? "Deal stage changed" : `Deal marked ${status}`,
    body: "",
    is_system: true
  });
  refreshCrm(accountId);
  return { success: true, message: "Deal stage updated." };
}

export async function addActivity(input: unknown): Promise<CrmActionResult<Record<string, unknown>>> {
  const parsed = activitySchema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid activity." };
  const auth = await authenticatedClient();
  if (!auth) return { success: false, message: "Sign in to change production CRM data." };
  const { data, error } = await auth.supabase
    .from("activities")
    .insert({ ...parsed.data, owner_id: auth.user.id, created_by: auth.user.id, is_system: false })
    .select()
    .single();
  if (error) {
    console.error("Activity mutation failed", { code: error.code, accountId: parsed.data.account_id, userId: auth.user.id });
    return { success: false, message: "The activity could not be added." };
  }
  await auth.supabase.from("customers").update({ last_activity_at: parsed.data.occurred_at }).eq("id", parsed.data.account_id);
  refreshCrm(parsed.data.account_id);
  return { success: true, message: "Activity added.", data };
}

export async function saveTask(input: unknown, taskId?: string): Promise<CrmActionResult<Record<string, unknown>>> {
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid task." };
  const auth = await authenticatedClient();
  if (!auth) return { success: false, message: "Sign in to change production CRM data." };
  const payload = { ...parsed.data, owner_id: auth.user.id, assignee_id: auth.user.id, created_by: auth.user.id, updated_at: new Date().toISOString() };
  const query = taskId ? auth.supabase.from("crm_tasks").update(payload).eq("id", taskId) : auth.supabase.from("crm_tasks").insert(payload);
  const { data, error } = await query.select().single();
  if (error) return { success: false, message: "The task could not be saved." };
  refreshCrm(parsed.data.account_id);
  return { success: true, message: "Task saved.", data };
}

export async function setTaskComplete(taskId: string, accountId: string, complete: boolean): Promise<CrmActionResult> {
  const auth = await authenticatedClient();
  if (!auth) return { success: false, message: "Sign in to change production CRM data." };
  const { error } = await auth.supabase
    .from("crm_tasks")
    .update({ completed_at: complete ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
    .eq("id", taskId);
  if (error) return { success: false, message: "The task could not be updated." };
  refreshCrm(accountId);
  return { success: true, message: complete ? "Task completed." : "Task reopened." };
}

export async function deleteTask(taskId: string, accountId: string): Promise<CrmActionResult> {
  const auth = await authenticatedClient();
  if (!auth) return { success: false, message: "Sign in to change production CRM data." };
  const { error } = await auth.supabase.from("crm_tasks").delete().eq("id", taskId);
  if (error) return { success: false, message: "The task could not be deleted." };
  refreshCrm(accountId);
  return { success: true, message: "Task deleted." };
}

export async function deleteDeal(dealId: string, accountId: string): Promise<CrmActionResult> {
  const auth = await authenticatedClient();
  if (!auth) return { success: false, message: "Sign in to change production CRM data." };
  const { error } = await auth.supabase.from("deals").delete().eq("id", dealId);
  if (error) return { success: false, message: "The deal could not be deleted." };
  refreshCrm(accountId);
  return { success: true, message: "Deal deleted." };
}
