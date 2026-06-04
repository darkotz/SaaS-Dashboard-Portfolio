"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/login");
}

export async function createCustomer(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    revalidatePath("/customers");
    return;
  }

  await supabase.from("customers").insert({
    name: String(formData.get("name")),
    email: String(formData.get("email")),
    company: String(formData.get("company")),
    status: String(formData.get("status")),
    seats: Number(formData.get("seats")),
    mrr: Number(formData.get("mrr"))
  });

  revalidatePath("/customers");
  revalidatePath("/dashboard");
}

export async function deleteCustomer(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const id = String(formData.get("id"));
  await supabase?.from("customers").delete().eq("id", id);
  revalidatePath("/customers");
  revalidatePath("/dashboard");
}
