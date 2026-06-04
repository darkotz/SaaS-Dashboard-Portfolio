"use server";

import { redirect } from "next/navigation";
import { env, hasStripeEnv } from "@/lib/env";
import { getCurrentProfile } from "@/lib/supabase/queries";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

async function getOrCreateStripeCustomer(userId: string, email: string, name: string) {
  const stripe = getStripe();
  const supabase = createSupabaseAdminClient();

  if (!stripe || !supabase) {
    return null;
  }

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id as string;
  }

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      supabaseUserId: userId
    }
  });

  await supabase.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: customer.id,
    status: "incomplete"
  });

  return customer.id;
}

export async function createCheckoutSession() {
  const profile = await getCurrentProfile();
  const stripe = getStripe();

  if (!profile || !stripe || !hasStripeEnv) {
    redirect("/subscription?demo=stripe");
  }

  const customer = await getOrCreateStripeCustomer(profile.id, profile.email, profile.full_name);

  if (!customer) {
    redirect("/subscription?demo=stripe");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer,
    line_items: [{ price: env.stripeProPriceId!, quantity: 1 }],
    success_url: `${env.appUrl}/subscription?success=true`,
    cancel_url: `${env.appUrl}/subscription?canceled=true`,
    metadata: {
      supabaseUserId: profile.id
    },
    subscription_data: {
      metadata: {
        supabaseUserId: profile.id
      }
    }
  });

  redirect(session.url ?? "/subscription");
}

export async function createCustomerPortalSession() {
  const profile = await getCurrentProfile();
  const stripe = getStripe();
  const supabase = createSupabaseAdminClient();

  if (!profile || !stripe || !supabase) {
    redirect("/subscription?demo=portal");
  }

  const { data } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!data?.stripe_customer_id) {
    redirect("/subscription?missingCustomer=true");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: data.stripe_customer_id as string,
    return_url: `${env.appUrl}/subscription`
  });

  redirect(session.url);
}
