import Link from "next/link";
import { BriefcaseBusiness, CircleDollarSign, Clock, CreditCard, ListTodo, Users } from "lucide-react";
import { MetricsCharts } from "@/components/dashboard/metrics-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCrmSnapshot } from "@/lib/crm/queries";
import { computeCrmMetrics, isTaskOverdue } from "@/lib/crm/types";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const snapshot = await getCrmSnapshot();
  const totals = computeCrmMetrics(snapshot);

  const metrics = [
    { label: "Monthly recurring revenue", value: formatCurrency(totals.mrr), icon: CreditCard, delta: "Subscription revenue" },
    { label: "Active accounts", value: String(totals.activeAccounts), icon: Users, delta: `${snapshot.accounts.filter((account) => account.status === "at_risk").length} at risk` },
    { label: "Open pipeline", value: formatCurrency(totals.pipelineValue), icon: BriefcaseBusiness, delta: `${totals.openDeals} open deals` },
    { label: "Weighted forecast", value: formatCurrency(totals.weightedForecast), icon: CircleDollarSign, delta: "Probability adjusted" },
    { label: "Overdue tasks", value: String(totals.overdueTasks), icon: Clock, delta: "Needs attention" },
    { label: "Won value", value: formatCurrency(totals.wonValue), icon: ListTodo, delta: "Closed opportunities" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Overview</h1>
          <p className="mt-1 text-muted-foreground">Subscription health, commercial pipeline, and customer work in one place.</p>
        </div>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Recent activity</CardTitle><Link href="/customers" className="text-sm text-primary">View accounts</Link></CardHeader>
          <CardContent className="space-y-4">
            {[...snapshot.activities].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at)).slice(0, 5).map((activity) => {
              const account = snapshot.accounts.find((item) => item.id === activity.account_id);
              return <div key={activity.id} className="flex gap-3 border-b pb-4 last:border-0 last:pb-0"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" /><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium">{activity.subject}</p><Badge variant="outline">{activity.type}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{account?.company} · {new Date(activity.occurred_at).toLocaleString()}</p></div></div>;
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Priority follow-ups</CardTitle><Link href="/tasks" className="text-sm text-primary">Open queue</Link></CardHeader>
          <CardContent className="space-y-3">
            {snapshot.tasks.filter((task) => !task.completed_at).sort((a, b) => Number(isTaskOverdue(b)) - Number(isTaskOverdue(a)) || String(a.due_at).localeCompare(String(b.due_at))).slice(0, 5).map((task) => {
              const account = snapshot.accounts.find((item) => item.id === task.account_id);
              return <div key={task.id} className="rounded-md border p-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium">{task.title}</p><Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "warning" : "secondary"}>{task.priority}</Badge></div><p className={isTaskOverdue(task) ? "mt-1 text-xs text-red-600" : "mt-1 text-xs text-muted-foreground"}>{account?.company} · {task.due_at ? `${isTaskOverdue(task) ? "Overdue" : "Due"} ${new Date(task.due_at).toLocaleDateString()}` : "No due date"}</p></div>;
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
