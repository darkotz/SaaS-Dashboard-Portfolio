"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness, CalendarCheck, Mail, Pencil, Phone, Plus, Star, Trash2 } from "lucide-react";
import { addActivity, deleteContact, saveAccount, saveContact, saveTask } from "@/app/(dashboard)/crm-actions";
import { HealthBadge } from "@/components/crm/account-directory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDemoCrm } from "@/lib/crm/demo-store";
import { accountHealth, isTaskOverdue, type CrmSnapshot } from "@/lib/crm/types";
import { formatCurrency } from "@/lib/utils";

export function AccountWorkspace({ accountId, initialSnapshot, demoMode }: { accountId: string; initialSnapshot: CrmSnapshot; demoMode: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demo = useDemoCrm(demoMode);
  const snapshot = demoMode ? demo.snapshot : initialSnapshot;
  const account = snapshot.accounts.find((item) => item.id === accountId);
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState<"account" | "contact" | "activity" | "task" | null>(null);
  const [activityType, setActivityType] = useState("all");
  const [activityLimit, setActivityLimit] = useState(5);

  const contacts = useMemo(() => snapshot.contacts.filter((item) => item.account_id === accountId), [accountId, snapshot.contacts]);
  const deals = useMemo(() => snapshot.deals.filter((item) => item.account_id === accountId), [accountId, snapshot.deals]);
  const activities = useMemo(() => snapshot.activities.filter((item) => item.account_id === accountId).sort((a, b) => b.occurred_at.localeCompare(a.occurred_at)), [accountId, snapshot.activities]);
  const tasks = useMemo(() => snapshot.tasks.filter((item) => item.account_id === accountId).sort((a, b) => String(a.due_at).localeCompare(String(b.due_at))), [accountId, snapshot.tasks]);

  if (!account) return <div className="py-20 text-center text-muted-foreground">This account is no longer available.</div>;

  async function handleContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const now = new Date().toISOString();
    const isPrimary = data.is_primary === "on";
    if (demoMode) {
      demo.update((current) => ({
        ...current,
        contacts: [
          {
            id: `contact_${crypto.randomUUID()}`,
            account_id: accountId,
            first_name: String(data.first_name),
            last_name: String(data.last_name),
            title: String(data.title),
            email: String(data.email),
            phone: String(data.phone),
            is_primary: isPrimary,
            created_at: now,
            updated_at: now
          },
          ...current.contacts.map((item) => item.account_id === accountId && isPrimary ? { ...item, is_primary: false } : item)
        ]
      }));
      setFeedback("Contact added to the demo.");
    } else {
      const result = await saveContact(accountId, { ...data, is_primary: isPrimary });
      setFeedback(result.message);
      if (result.success) router.refresh();
    }
    setForm(null);
  }

  async function makePrimary(contactId: string) {
    const contact = contacts.find((item) => item.id === contactId);
    if (!contact) return;
    if (demoMode) {
      demo.update((current) => ({
        ...current,
        contacts: current.contacts.map((item) => item.account_id === accountId ? { ...item, is_primary: item.id === contactId } : item)
      }));
      setFeedback(`${contact.first_name} is now the primary contact.`);
      return;
    }
    const result = await saveContact(accountId, { ...contact, is_primary: true }, contact.id);
    setFeedback(result.message);
    if (result.success) router.refresh();
  }

  async function editContact(contactId: string) {
    const contact = contacts.find((item) => item.id === contactId);
    if (!contact) return;
    const title = window.prompt("Job title", contact.title);
    if (title === null) return;
    const phone = window.prompt("Phone", contact.phone);
    if (phone === null) return;
    const input = { ...contact, title, phone };
    if (demoMode) {
      demo.update((current) => ({
        ...current,
        contacts: current.contacts.map((item) => item.id === contactId ? { ...item, title, phone, updated_at: new Date().toISOString() } : item)
      }));
      setFeedback("Contact updated.");
      return;
    }
    const result = await saveContact(accountId, input, contactId);
    setFeedback(result.message);
    if (result.success) router.refresh();
  }

  async function handleAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const input = {
      company: String(data.company),
      name: String(data.name),
      email: String(data.email),
      industry: String(data.industry),
      website: String(data.website),
      phone: String(data.phone),
      status: String(data.status),
      seats: Number(data.seats),
      mrr: Number(data.mrr),
      health_score: Number(data.health_score)
    };
    if (demoMode) {
      demo.update((current) => ({
        ...current,
        accounts: current.accounts.map((item) => item.id === accountId ? { ...item, ...input, status: String(input.status) as typeof item.status, updated_at: new Date().toISOString() } : item)
      }));
      setFeedback("Account updated.");
    } else {
      const result = await saveAccount(input, accountId);
      setFeedback(result.message);
      if (result.success) router.refresh();
    }
    setForm(null);
  }

  async function removeContact(contactId: string) {
    if (demoMode) {
      demo.update((current) => ({ ...current, contacts: current.contacts.filter((item) => item.id !== contactId) }));
      setFeedback("Contact removed.");
    } else {
      const result = await deleteContact(accountId, contactId);
      setFeedback(result.message);
      if (result.success) router.refresh();
    }
  }

  async function handleActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const occurredAt = new Date().toISOString();
    if (demoMode) {
      demo.update((current) => ({
        ...current,
        activities: [{
          id: `activity_${crypto.randomUUID()}`,
          account_id: accountId,
          deal_id: null,
          contact_id: null,
          created_by: "demo-admin",
          type: String(data.type) as "note" | "call" | "meeting" | "email",
          subject: String(data.subject),
          body: String(data.body),
          occurred_at: occurredAt,
          is_system: false
        }, ...current.activities],
        accounts: current.accounts.map((item) => item.id === accountId ? { ...item, last_activity_at: occurredAt } : item)
      }));
      setFeedback("Activity added.");
    } else {
      const result = await addActivity({ ...data, account_id: accountId, occurred_at: occurredAt });
      setFeedback(result.message);
      if (result.success) router.refresh();
    }
    setForm(null);
  }

  async function handleTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const now = new Date().toISOString();
    const dueAt = data.due_at ? new Date(String(data.due_at)).toISOString() : null;
    if (demoMode) {
      demo.update((current) => ({
        ...current,
        tasks: [{
          id: `task_${crypto.randomUUID()}`,
          account_id: accountId,
          deal_id: null,
          contact_id: null,
          assignee_id: "demo-admin",
          created_by: "demo-admin",
          title: String(data.title),
          description: String(data.description),
          priority: String(data.priority) as "low" | "medium" | "high",
          due_at: dueAt,
          completed_at: null,
          created_at: now,
          updated_at: now
        }, ...current.tasks]
      }));
      setFeedback("Task added.");
    } else {
      const result = await saveTask({ ...data, account_id: accountId, due_at: dueAt });
      setFeedback(result.message);
      if (result.success) router.refresh();
    }
    setForm(null);
  }

  const back = searchParams.get("from");
  return (
    <div className="space-y-6">
      <Link href={back ? `/customers?${back}` : "/customers"} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Accounts
      </Link>
      {feedback ? <div role="status" className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{feedback}</div> : null}
      <section className="flex flex-col gap-5 border-y bg-white px-5 py-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold">{account.company}</h1>
            <HealthBadge level={accountHealth(account)} score={account.health_score} />
            <Badge variant={account.status === "active" ? "success" : account.status === "at_risk" ? "warning" : "secondary"}>{account.status.replace("_", " ")}</Badge>
          </div>
          <p className="mt-2 text-muted-foreground">{account.industry} · {account.website || account.email}</p>
        </div>
        <div className="flex items-center gap-4">
        <div className="grid grid-cols-3 gap-6 text-right">
          <Summary label="MRR" value={formatCurrency(account.mrr)} />
          <Summary label="Open deals" value={String(deals.filter((deal) => deal.status === "open").length)} />
          <Summary label="Open tasks" value={String(tasks.filter((task) => !task.completed_at).length)} />
        </div>
        <Button size="icon" variant="outline" aria-label="Edit account" onClick={() => setForm(form === "account" ? null : "account")}><Pencil className="h-4 w-4" /></Button>
        </div>
      </section>
      {form === "account" ? <AccountForm account={account} onSubmit={handleAccount} /> : null}

      <Tabs defaultValue="overview">
        <TabsList className="max-w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
          <TabsTrigger value="deals">Deals ({deals.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity ({activities.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <Card><CardHeader><CardTitle>Relationship summary</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
              <Fact label="Primary contact" value={contacts.find((contact) => contact.is_primary)?.email ?? account.email} />
              <Fact label="Phone" value={account.phone || "Not provided"} />
              <Fact label="Seats" value={String(account.seats)} />
              <Fact label="Last activity" value={new Date(account.last_activity_at).toLocaleDateString()} />
            </CardContent></Card>
            <Card><CardHeader><CardTitle>Next actions</CardTitle></CardHeader><CardContent className="space-y-3">
              {tasks.filter((task) => !task.completed_at).slice(0, 3).map((task) => <TaskLine key={task.id} task={task} />)}
              {!tasks.some((task) => !task.completed_at) ? <p className="text-sm text-muted-foreground">No open follow-ups.</p> : null}
            </CardContent></Card>
          </div>
        </TabsContent>
        <TabsContent value="contacts">
          <SectionHeader title="Contacts" action="Add contact" onAction={() => setForm(form === "contact" ? null : "contact")} />
          {form === "contact" ? <ContactForm onSubmit={handleContact} /> : null}
          <div className="grid gap-3 md:grid-cols-2">
            {contacts.map((contact) => <Card key={contact.id}><CardContent className="flex items-start justify-between p-4">
              <div><div className="flex items-center gap-2 font-medium">{contact.first_name} {contact.last_name}{contact.is_primary ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> : null}</div><p className="text-sm text-muted-foreground">{contact.title}</p><p className="mt-3 flex items-center gap-2 text-sm"><Mail className="h-4 w-4" />{contact.email}</p><p className="mt-1 flex items-center gap-2 text-sm"><Phone className="h-4 w-4" />{contact.phone || "No phone"}</p></div>
              <div className="flex gap-1"><Button size="icon" variant="ghost" aria-label={`Edit ${contact.first_name}`} onClick={() => editContact(contact.id)}><Pencil className="h-4 w-4" /></Button>{!contact.is_primary ? <Button size="icon" variant="ghost" aria-label={`Make ${contact.first_name} primary`} onClick={() => makePrimary(contact.id)}><Star className="h-4 w-4" /></Button> : null}<Button size="icon" variant="ghost" aria-label={`Delete ${contact.first_name}`} onClick={() => removeContact(contact.id)}><Trash2 className="h-4 w-4" /></Button></div>
            </CardContent></Card>)}
          </div>
        </TabsContent>
        <TabsContent value="deals">
          <SectionHeader title="Deals" action="Open pipeline" href="/pipeline" />
          <div className="space-y-3">{deals.map((deal) => {
            const stage = snapshot.stages.find((item) => item.id === deal.stage_id);
            return <Card key={deal.id}><CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="font-medium">{deal.title}</p><p className="text-sm text-muted-foreground">{stage?.name} · closes {new Date(deal.expected_close_date).toLocaleDateString()}</p></div><strong>{formatCurrency(deal.amount)}</strong><Badge variant={deal.status === "won" ? "success" : deal.status === "lost" ? "destructive" : "secondary"}>{deal.status}</Badge></CardContent></Card>;
          })}</div>
        </TabsContent>
        <TabsContent value="activity">
          <SectionHeader title="Activity timeline" action="Log activity" onAction={() => setForm(form === "activity" ? null : "activity")} />
          {form === "activity" ? <ActivityForm onSubmit={handleActivity} /> : null}
          <div className="mb-4 flex items-center gap-3"><select aria-label="Filter activity type" className="h-9 rounded-md border bg-background px-3 text-sm" value={activityType} onChange={(event) => { setActivityType(event.target.value); setActivityLimit(5); }}><option value="all">All activity</option><option value="note">Notes</option><option value="call">Calls</option><option value="meeting">Meetings</option><option value="email">Emails</option><option value="system">System</option></select></div>
          <div className="space-y-0 border-l-2 border-muted pl-5">{activities.filter((activity) => activityType === "all" || activity.type === activityType).slice(0, activityLimit).map((activity) => <div key={activity.id} className="relative pb-6"><span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-white" /><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{activity.type}</Badge><p className="font-medium">{activity.subject}</p><span className="text-xs text-muted-foreground">{new Date(activity.occurred_at).toLocaleString()}</span></div><p className="mt-2 max-w-3xl text-sm text-muted-foreground">{activity.body}</p></div>)}</div>
          {activities.filter((activity) => activityType === "all" || activity.type === activityType).length > activityLimit ? <Button variant="outline" onClick={() => setActivityLimit((value) => value + 5)}>Load more</Button> : null}
        </TabsContent>
        <TabsContent value="tasks">
          <SectionHeader title="Follow-up tasks" action="Add task" onAction={() => setForm(form === "task" ? null : "task")} />
          {form === "task" ? <TaskForm onSubmit={handleTask} /> : null}
          <div className="space-y-3">{tasks.map((task) => <TaskLine key={task.id} task={task} detailed />)}</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></div>; }
function Fact({ label, value }: { label: string; value: string }) { return <div className="border-b pb-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>; }
function SectionHeader({ title, action, onAction, href }: { title: string; action: string; onAction?: () => void; href?: string }) { return <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2>{href ? <Button asChild variant="outline"><Link href={href}><BriefcaseBusiness className="h-4 w-4" />{action}</Link></Button> : <Button onClick={onAction}><Plus className="h-4 w-4" />{action}</Button>}</div>; }
function TaskLine({ task, detailed = false }: { task: CrmSnapshot["tasks"][number]; detailed?: boolean }) { const overdue = isTaskOverdue(task); return <div className="flex items-start gap-3 rounded-md border bg-white p-3"><CalendarCheck className={overdue ? "mt-0.5 h-4 w-4 text-red-600" : "mt-0.5 h-4 w-4 text-primary"} /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{task.title}</p>{detailed ? <p className="mt-1 text-sm text-muted-foreground">{task.description}</p> : null}<p className={overdue ? "mt-1 text-xs text-red-600" : "mt-1 text-xs text-muted-foreground"}>{task.completed_at ? "Completed" : task.due_at ? `Due ${new Date(task.due_at).toLocaleString()}` : "No due date"}</p></div><Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "warning" : "secondary"}>{task.priority}</Badge></div>; }

function ContactForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <Card className="mb-4"><CardContent className="p-4"><form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-3"><Input name="first_name" placeholder="First name" required /><Input name="last_name" placeholder="Last name" required /><Input name="title" placeholder="Job title" /><Input name="email" type="email" placeholder="Email" required /><Input name="phone" placeholder="Phone" /><label className="flex items-center gap-2 text-sm"><input name="is_primary" type="checkbox" /> Primary contact</label><Button type="submit">Save contact</Button></form></CardContent></Card>;
}
function ActivityForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <Card className="mb-4"><CardContent className="p-4"><form onSubmit={onSubmit} className="grid gap-3"><div className="grid gap-3 md:grid-cols-[180px_1fr]"><select name="type" className="h-10 rounded-md border bg-background px-3 text-sm"><option value="note">Note</option><option value="call">Call</option><option value="meeting">Meeting</option><option value="email">Email</option></select><Input name="subject" placeholder="Subject" required /></div><textarea name="body" className="min-h-24 rounded-md border bg-background p-3 text-sm" placeholder="Interaction summary" required /><Button className="w-fit" type="submit">Add activity</Button></form></CardContent></Card>;
}
function TaskForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <Card className="mb-4"><CardContent className="p-4"><form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2"><Input name="title" placeholder="Task title" required /><Input name="due_at" type="datetime-local" /><select name="priority" className="h-10 rounded-md border bg-background px-3 text-sm"><option value="medium">Medium priority</option><option value="high">High priority</option><option value="low">Low priority</option></select><Input name="description" placeholder="Description" /><Button className="w-fit" type="submit">Add task</Button></form></CardContent></Card>;
}

function AccountForm({ account, onSubmit }: { account: CrmSnapshot["accounts"][number]; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <Card><CardHeader><CardTitle>Edit account</CardTitle></CardHeader><CardContent><form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-3">
    <Input name="company" defaultValue={account.company} aria-label="Company" required />
    <Input name="name" defaultValue={account.name} aria-label="Primary contact name" required />
    <Input name="email" type="email" defaultValue={account.email} aria-label="Primary email" required />
    <Input name="industry" defaultValue={account.industry} aria-label="Industry" />
    <Input name="website" defaultValue={account.website} aria-label="Website" />
    <Input name="phone" defaultValue={account.phone} aria-label="Phone" />
    <Input name="seats" type="number" defaultValue={account.seats} aria-label="Seats" />
    <Input name="mrr" type="number" defaultValue={account.mrr} aria-label="MRR" />
    <Input name="health_score" type="number" min="0" max="100" defaultValue={account.health_score} aria-label="Health score" />
    <select name="status" defaultValue={account.status} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="active">Active</option><option value="trial">Trial</option><option value="at_risk">At risk</option><option value="churned">Churned</option></select>
    <Button className="w-fit" type="submit">Save account</Button>
  </form></CardContent></Card>;
}
