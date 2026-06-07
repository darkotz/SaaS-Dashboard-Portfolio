import { cache } from "react";
import { demoCustomers, demoProfile, type Customer, type Profile } from "@/lib/demo-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Viewer = {
  profile: Profile;
  demoMode: boolean;
};

export const getViewer = cache(async (): Promise<Viewer> => {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { profile: demoProfile, demoMode: true };
  }

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { profile: demoProfile, demoMode: true };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, company")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Profile query failed", {
      code: error.code,
      message: error.message,
      userId: user.id
    });
    throw new Error("The profile could not be loaded.");
  }

  return { profile: data as Profile, demoMode: false };
});

export async function getCurrentProfile(): Promise<Profile> {
  return (await getViewer()).profile;
}

export async function isDemoVisitor(): Promise<boolean> {
  return (await getViewer()).demoMode;
}

export async function getCustomers(): Promise<Customer[]> {
  const viewer = await getViewer();

  if (viewer.demoMode) {
    return demoCustomers;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return demoCustomers;
  }

  const { data, error } = await supabase
    .from("customers")
    .select("id, name, email, company, status, seats, mrr, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Customer query failed", {
      code: error.code,
      message: error.message
    });
    throw new Error("Customer accounts could not be loaded.");
  }

  return (data as Customer[] | null) ?? [];
}
