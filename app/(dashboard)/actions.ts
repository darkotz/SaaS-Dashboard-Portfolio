"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Customer } from "@/lib/demo-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CustomerActionResult =
  | {
      success: true;
      message: string;
      customer?: Customer;
      deletedId?: string;
    }
  | {
      success: false;
      message: string;
    };

const customerStatuses = ["active", "trial", "at_risk", "churned"] as const;

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/login");
}

export async function createCustomer(formData: FormData): Promise<CustomerActionResult> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase is not configured. Demo changes are saved in this browser instead."
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const company = String(formData.get("company") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const seats = Number(formData.get("seats"));
  const mrr = Number(formData.get("mrr"));

  if (!name || !company || !email.includes("@")) {
    return { success: false, message: "Enter a contact name, company, and valid email address." };
  }

  if (!customerStatuses.includes(status as (typeof customerStatuses)[number])) {
    return { success: false, message: "Choose a valid customer status." };
  }

  if (!Number.isInteger(seats) || seats < 1 || !Number.isFinite(mrr) || mrr < 0) {
    return { success: false, message: "Seats must be at least 1 and MRR cannot be negative." };
  }

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: "Your session expired. Sign in and try again." };
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      owner_id: user.id,
      name,
      email,
      company,
      status,
      seats,
      mrr
    })
    .select("id, name, email, company, status, seats, mrr, created_at")
    .single();

  if (error || !data) {
    console.error("Customer creation failed", {
      code: error?.code,
      message: error?.message,
      userId: user.id
    });
    return { success: false, message: "The customer could not be created. Check your access and try again." };
  }

  revalidatePath("/customers");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `${company} was added.`,
    customer: data as Customer
  };
}

export async function deleteCustomer(customerId: string): Promise<CustomerActionResult> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase is not configured. Demo changes are saved in this browser instead."
    };
  }

  const id = customerId.trim();

  if (!id) {
    return { success: false, message: "The customer id is missing." };
  }

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: "Your session expired. Sign in and try again." };
  }

  const { data, error } = await supabase.from("customers").delete().eq("id", id).select("id").maybeSingle();

  if (error) {
    console.error("Customer deletion failed", {
      code: error.code,
      message: error.message,
      customerId: id,
      userId: user.id
    });
    return { success: false, message: "The customer could not be deleted. Check your access and try again." };
  }

  if (!data) {
    return { success: false, message: "No customer was deleted. It may already be gone or you may not have access." };
  }

  revalidatePath("/customers");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Customer deleted.",
    deletedId: data.id as string
  };
}
