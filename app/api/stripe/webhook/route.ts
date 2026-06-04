import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const stripe = getStripe();
  const supabase = createSupabaseAdminClient();

  if (!stripe || !supabase || !env.stripeWebhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, env.stripeWebhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await supabase.from("subscriptions").upsert({
      user_id: session.metadata?.supabaseUserId,
      stripe_customer_id: String(session.customer),
      stripe_subscription_id: String(session.subscription),
      status: "active"
    });
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const item = subscription.items.data[0];
    await supabase.from("subscriptions").upsert({
      user_id: subscription.metadata.supabaseUserId,
      stripe_customer_id: String(subscription.customer),
      stripe_subscription_id: subscription.id,
      stripe_price_id: item?.price.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await supabase
      .from("subscriptions")
      .update({
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end
      })
      .eq("stripe_subscription_id", subscription.id);
  }

  return NextResponse.json({ received: true });
}
