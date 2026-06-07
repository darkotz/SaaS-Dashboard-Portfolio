"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, Circle, Clock, ListTodo, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { deleteTask, saveTask, setTaskComplete } from "@/app/(dashboard)/crm-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDemoCrm } from "@/lib/crm/demo-store";
import { isTaskOverdue, type CrmSnapshot } from "@/lib/crm/types";

export function TaskQueue({ initialSnapshot, demoMode }: { initialSnapshot: CrmSnapshot; demoMode: boolean }) {
  const router = useRouter();
  const demo = useDemoCrm(demoMode);
  const snapshot = demoMode ? demo.snapshot : initialSnapshot;
  const [completion, setCompletion] = useState("open");
  const [priority, setPriority] = useState("all");
  const [due, setDue] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [dealFilter, setDealFilter] = useState("all");
  const [feedback, setFeedback] = useState("");

  const tasks = useMemo(() => snapshot.tasks.filter((task) => {
    const completed = Boolean(task.completed_at);
    const overdue = isTaskOverdue(task);
    const dueSoon = Boolean(task.due_at && !completed && !overdue && new Date(task.due_at).getTime() - Date.now() < 3 * 86400000);
    return (completion === "all" || (completion === "completed") === completed) &&
      (priority === "all" || task.priority === priority) &&
      (due === "all" || (due === "overdue" && overdue) || (due === "soon" && dueSoon) || (due === "none" && !task.due_at)) &&
      (accountFilter === "all" || task.account_id === accountFilter) &&
      (dealFilter === "all" || task.deal_id === dealFilter);
  }).sort((a, b) => {
    const aOverdue = isTaskOverdue(a) ? 0 : 1;
    const bOverdue = isTaskOverdue(b) ? 0 : 1;
    return aOverdue - bOverdue || String(a.due_at).localeCompare(String(b.due_at));
  }), [accountFilter, completion, dealFilter, due, priority, snapshot.tasks]);

  async function toggle(task: CrmSnapshot["tasks"][number]) {
    const complete = !task.completed_at;
    if (demoMode) {
      const now = new Date().toISOString();
      demo.update((current) => ({
        ...current,
        tasks: current.tasks.map((item) => item.id === task.id ? { ...item, completed_at: complete ? now : null, updated_at: now } : item),
        activities: complete ? [{
          id: `activity_${crypto.randomUUID()}`,
          account_id: task.account_id,
          deal_id: task.deal_id,
          contact_id: task.contact_id,
          created_by: "demo-admin",
          type: "system",
          subject: `Task completed: ${task.title}`,
          body: "",
          occurred_at: now,
          is_system: true
        }, ...current.activities] : current.activities
      }));
      setFeedback(complete ? "Task completed." : "Task reopened.");
      return;
    }
    const result = await setTaskComplete(task.id, task.account_id, complete);
    setFeedback(result.message);
    if (result.success) router.refresh();
  }

  async function remove(task: CrmSnapshot["tasks"][number]) {
    if (!window.confirm(`Delete ${task.title}?`)) return;
    if (demoMode) {
      demo.update((current) => ({ ...current, tasks: current.tasks.filter((item) => item.id !== task.id) }));
      setFeedback("Task deleted.");
      return;
    }
    const result = await deleteTask(task.id, task.account_id);
    setFeedback(result.message);
    if (result.success) router.refresh();
  }

  async function edit(task: CrmSnapshot["tasks"][number]) {
    const title = window.prompt("Task title", task.title)?.trim();
    if (!title) return;
    const description = window.prompt("Description", task.description);
    if (description === null) return;
    if (demoMode) {
      demo.update((current) => ({
        ...current,
        tasks: current.tasks.map((item) => item.id === task.id ? { ...item, title, description, updated_at: new Date().toISOString() } : item)
      }));
      setFeedback("Task updated.");
      return;
    }
    const result = await saveTask({ account_id: task.account_id, deal_id: task.deal_id, contact_id: task.contact_id, title, description, priority: task.priority, due_at: task.due_at }, task.id);
    setFeedback(result.message);
    if (result.success) router.refresh();
  }

  const overdueCount = snapshot.tasks.filter((task) => isTaskOverdue(task)).length;
  const openCount = snapshot.tasks.filter((task) => !task.completed_at).length;

  return <div className="space-y-6">
    <div><h1 className="text-3xl font-semibold">Tasks</h1><p className="mt-1 text-muted-foreground">Prioritize customer and pipeline follow-ups.</p></div>
    {feedback ? <div role="status" className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{feedback}</div> : null}
    <div className="grid gap-4 sm:grid-cols-3">
      <Metric icon={ListTodo} label="Open tasks" value={String(openCount)} />
      <Metric icon={Clock} label="Overdue" value={String(overdueCount)} danger={overdueCount > 0} />
      <Metric icon={CheckCircle2} label="Completed" value={String(snapshot.tasks.length - openCount)} />
    </div>
    <div className="flex flex-wrap gap-3 border-y bg-white px-4 py-3">
      <select aria-label="Completion filter" className="h-10 rounded-md border bg-background px-3 text-sm" value={completion} onChange={(event) => setCompletion(event.target.value)}><option value="open">Open</option><option value="completed">Completed</option><option value="all">All</option></select>
      <select aria-label="Priority filter" className="h-10 rounded-md border bg-background px-3 text-sm" value={priority} onChange={(event) => setPriority(event.target.value)}><option value="all">All priorities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
      <select aria-label="Due filter" className="h-10 rounded-md border bg-background px-3 text-sm" value={due} onChange={(event) => setDue(event.target.value)}><option value="all">All due states</option><option value="overdue">Overdue</option><option value="soon">Due soon</option><option value="none">No due date</option></select>
      <select aria-label="Account filter" className="h-10 rounded-md border bg-background px-3 text-sm" value={accountFilter} onChange={(event) => setAccountFilter(event.target.value)}><option value="all">All accounts</option>{snapshot.accounts.map((account) => <option key={account.id} value={account.id}>{account.company}</option>)}</select>
      <select aria-label="Deal filter" className="h-10 rounded-md border bg-background px-3 text-sm" value={dealFilter} onChange={(event) => setDealFilter(event.target.value)}><option value="all">All deals</option>{snapshot.deals.map((deal) => <option key={deal.id} value={deal.id}>{deal.title}</option>)}</select>
    </div>
    <div className="space-y-3">
      {tasks.map((task) => {
        const account = snapshot.accounts.find((item) => item.id === task.account_id);
        const deal = snapshot.deals.find((item) => item.id === task.deal_id);
        const overdue = isTaskOverdue(task);
        return <Card key={task.id}><CardContent className="grid gap-3 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <Button size="icon" variant="ghost" aria-label={task.completed_at ? `Reopen ${task.title}` : `Complete ${task.title}`} onClick={() => toggle(task)}>
            {task.completed_at ? <RotateCcw className="h-4 w-4" /> : <Circle className="h-5 w-5" />}
          </Button>
          <div className={task.completed_at ? "opacity-60" : ""}>
            <div className="flex flex-wrap items-center gap-2"><p className={task.completed_at ? "font-medium line-through" : "font-medium"}>{task.title}</p><Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "warning" : "secondary"}>{task.priority}</Badge></div>
            <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground"><Link className="hover:text-primary" href={`/customers/${task.account_id}`}>{account?.company}</Link>{deal ? <span>{deal.title}</span> : null}<span className={overdue ? "font-medium text-red-600" : ""}>{task.completed_at ? "Completed" : task.due_at ? `${overdue ? "Overdue" : "Due"} ${new Date(task.due_at).toLocaleString()}` : "No due date"}</span></div>
          </div>
          <div className="flex items-center gap-1">{task.completed_at ? <Check className="h-5 w-5 text-emerald-600" /> : null}<Button size="icon" variant="ghost" aria-label={`Edit ${task.title}`} onClick={() => edit(task)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${task.title}`} onClick={() => remove(task)}><Trash2 className="h-4 w-4" /></Button></div>
        </CardContent></Card>;
      })}
      {tasks.length === 0 ? <div className="py-16 text-center text-muted-foreground">No tasks match these filters.</div> : null}
    </div>
  </div>;
}

function Metric({ icon: Icon, label, value, danger }: { icon: typeof ListTodo; label: string; value: string; danger?: boolean }) {
  return <Card><CardContent className="flex items-center justify-between p-4"><div><p className="text-xs text-muted-foreground">{label}</p><p className={danger ? "mt-2 text-2xl font-semibold text-red-600" : "mt-2 text-2xl font-semibold"}>{value}</p></div><Icon className={danger ? "h-5 w-5 text-red-600" : "h-5 w-5 text-primary"} /></CardContent></Card>;
}
