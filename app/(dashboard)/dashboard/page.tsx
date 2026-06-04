import { Activity, CreditCard, TrendingDown, Users } from "lucide-react";
import { MetricsCharts } from "@/components/dashboard/metrics-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCustomers } from "@/lib/supabase/queries";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const customers = await getCustomers();
  const totalMrr = customers.reduce((sum, customer) => sum + customer.mrr, 0);
  const active = customers.filter((customer) => customer.status === "active").length;
  const seats = customers.reduce((sum, customer) => sum + customer.seats, 0);
  const atRisk = customers.filter((customer) => customer.status === "at_risk").length;

  const metrics = [
    { label: "Monthly recurring revenue", value: formatCurrency(totalMrr), icon: CreditCard, delta: "+18.2%" },
    { label: "Active customers", value: String(active), icon: Users, delta: "+7 this month" },
    { label: "Seats provisioned", value: String(seats), icon: Activity, delta: "85% utilization" },
    { label: "At-risk accounts", value: String(atRisk), icon: TrendingDown, delta: "Review queue" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Subscription health, account motion, and revenue signals in one place.</p>
        </div>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
              <metric.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{metric.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{metric.delta}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      <MetricsCharts />
    </div>
  );
}
