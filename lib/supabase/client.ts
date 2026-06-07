import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export function createSupabaseBrowserClient() {
  if (!env.supabaseUrl || !env.supabasePublishableKey) {
    throw new Error("Supabase browser credentials are not configured.");
  }

  return createBrowserClient(env.supabaseUrl, env.supabasePublishableKey);
}
