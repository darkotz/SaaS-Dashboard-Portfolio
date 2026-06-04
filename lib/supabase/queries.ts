import { demoCustomers, demoProfile, type Customer, type Profile } from "@/lib/demo-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return demoProfile;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, company")
    .eq("id", user.id)
    .single();

  return data as Profile | null;
}

export async function getCustomers(): Promise<Customer[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return demoCustomers;
  }

  const { data } = await supabase
    .from("customers")
    .select("id, name, email, company, status, seats, mrr, created_at")
    .order("created_at", { ascending: false });

  return (data as Customer[] | null) ?? [];
}
