import { CheckCircle2, CreditCard, ExternalLink, RefreshCcw } from "lucide-react";
import { createCheckoutSession, createCustomerPortalSession } from "@/app/(dashboard)/subscription/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SubscriptionPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; canceled?: string; demo?: string; missingCustomer?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Subscription</h1>
        <p className="mt-1 text-muted-foreground">Stripe Checkout, Customer Portal, and webhook-backed state updates.</p>
      </div>
      {params.success ? <Banner tone="success" text="Checkout completed. The webhook will update subscription state in Supabase." /> : null}
      {params.canceled ? <Banner tone="neutral" text="Checkout was canceled before payment was confirmed." /> : null}
      {params.demo ? <Banner tone="neutral" text="Stripe credentials are not configured, so this portfolio build stayed in demo mode." /> : null}
      {params.missingCustomer ? <Banner tone="neutral" text="No Stripe customer exists yet. Start with checkout first." /> : null}

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Growth plan</CardTitle>
                <CardDescription>Everything a modern SaaS dashboard needs for subscription operations.</CardDescription>
              </div>
              <Badge variant="success">Active demo</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 rounded-md border bg-muted/45 p-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly plan</p>
                <p className="mt-1 text-4xl font-semibold">$49</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={createCheckoutSession}>
                  <Button type="submit">
                    <CreditCard className="h-4 w-4" />
                    Stripe Checkout
                  </Button>
                </form>
                <form action={createCustomerPortalSession}>
                  <Button type="submit" variant="outline">
                    <ExternalLink className="h-4 w-4" />
                    Customer Portal
                  </Button>
                </form>
              </div>
            </div>
            <Tabs defaultValue="included">
              <TabsList>
                <TabsTrigger value="included">Included</TabsTrigger>
                <TabsTrigger value="webhook">Webhook</TabsTrigger>
              </TabsList>
              <TabsContent value="included" className="grid gap-3 sm:grid-cols-2">
                {["Role-based dashboard", "Customer CRUD", "Revenue metrics", "Supabase RLS schema"].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-md border bg-white p-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {item}
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="webhook">
                <div className="rounded-md border bg-white p-4 text-sm text-muted-foreground">
                  Stripe sends events to <span className="font-medium text-foreground">/api/stripe/webhook</span>. The route verifies
                  the signature and upserts status, current period, price, and customer IDs into Supabase.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subscription state</CardTitle>
            <CardDescription>Representative live fields updated by webhook events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Status", "trialing"],
              ["Stripe customer", "cus_demo"],
              ["Current period", "Jun 1 - Jul 1"],
              ["Renewal action", "Portal enabled"]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-md border bg-white p-3 text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 rounded-md bg-secondary p-3 text-sm">
              <RefreshCcw className="h-4 w-4 text-accent" />
              Webhook-safe subscription syncing
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Banner({ text, tone }: { text: string; tone: "success" | "neutral" }) {
  return (
    <div className={tone === "success" ? "rounded-md bg-emerald-50 p-3 text-sm text-emerald-700" : "rounded-md bg-muted p-3 text-sm text-muted-foreground"}>
      {text}
    </div>
  );
}
