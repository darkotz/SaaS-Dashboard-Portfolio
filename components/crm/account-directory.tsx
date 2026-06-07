"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Archive, ArrowLeft, ArrowRight, Building2, Plus, RotateCcw, Search } from "lucide-react";
import { saveAccount, setAccountArchived } from "@/app/(dashboard)/crm-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDemoCrm } from "@/lib/crm/demo-store";
import { accountHealth, type Account, type CrmSnapshot } from "@/lib/crm/types";
import { formatCurrency } from "@/lib/utils";

const pageSize = 6;

export function AccountDirectory({ initialSnapshot, demoMode }: { initialSnapshot: CrmSnapshot; demoMode: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demo = useDemoCrm(demoMode);
  const snapshot = demoMode ? demo.snapshot : initialSnapshot;
  const [showCreate, setShowCreate] = useState(false);
  const [feedback, setFeedback] = useState("");
  const query = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "all";
  const health = searchParams.get("health") ?? "all";
  const archived = searchParams.get("archived") === "true";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return snapshot.accounts.filter((account) => {
      const primary = snapshot.contacts.find((contact) => contact.account_id === account.id && contact.is_primary);
      const matchesText = !needle || [account.company, account.name, account.email, primary?.first_name, primary?.last_name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
      return matchesText &&
        (status === "all" || account.status === status) &&
        (health === "all" || accountHealth(account) === health) &&
        Boolean(account.archived_at) === archived;
    });
  }, [archived, health, query, snapshot, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  function setParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all" || value === "false") params.delete(name);
    else params.set(name, value);
    if (name !== "page") params.delete("page");
    router.replace(`/customers?${params.toString()}`);
  }

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const now = new Date().toISOString();
    const input = {
      company: String(form.get("company")),
      name: String(form.get("name")),
      email: String(form.get("email")),
      status: String(form.get("status")),
      seats: Number(form.get("seats")),
      mrr: Number(form.get("mrr")),
      industry: String(form.get("industry")),
      website: String(form.get("website")),
      phone: String(form.get("phone")),
      health_score: Number(form.get("health_score"))
    };

    if (demoMode) {
      const id = `account_${crypto.randomUUID()}`;
      const names = input.name.trim().split(/\s+/);
      demo.update((current) => ({
        ...current,
        accounts: [{
          ...input,
          id,
          owner_id: "demo-admin",
          status: input.status as Account["status"],
          last_activity_at: now,
          created_at: now,
          updated_at: now,
          archived_at: null
        }, ...current.accounts],
        contacts: [{
          id: `contact_${crypto.randomUUID()}`,
          account_id: id,
          first_name: names[0] ?? input.name,
          last_name: names.slice(1).join(" "),
          title: "Primary contact",
          email: input.email,
          phone: input.phone,
          is_primary: true,
          created_at: now,
          updated_at: now
        }, ...current.contacts]
      }));
      setFeedback(`${input.company} was created in the demo.`);
      setShowCreate(false);
      return;
    }

    const result = await saveAccount(input);
    setFeedback(result.message);
    if (result.success) {
      setShowCreate(false);
      router.refresh();
    }
  }

  async function archiveAccount(account: Account) {
    const nextArchived = !account.archived_at;
    if (demoMode) {
      demo.update((current) => ({
        ...current,
        accounts: current.accounts.map((item) => item.id === account.id
          ? { ...item, archived_at: nextArchived ? new Date().toISOString() : null }
          : item)
      }));
      setFeedback(nextArchived ? "Account archived." : "Account restored.");
      return;
    }
    const result = await setAccountArchived(account.id, nextArchived);
    setFeedback(result.message);
    if (result.success) router.refresh();
  }

  return (
    <div className="space-y-4">
      {feedback ? <div role="status" className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{feedback}</div> : null}
      <div className="flex flex-col gap-3 border-y bg-white px-4 py-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            aria-label="Search accounts"
            className="pl-9"
            placeholder="Search company, contact, or email"
            value={query}
            onChange={(event) => setParam("q", event.target.value)}
          />
        </div>
        <select aria-label="Filter by status" className="h-10 rounded-md border bg-background px-3 text-sm" value={status} onChange={(event) => setParam("status", event.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="at_risk">At risk</option>
          <option value="churned">Churned</option>
        </select>
        <select aria-label="Filter by health" className="h-10 rounded-md border bg-background px-3 text-sm" value={health} onChange={(event) => setParam("health", event.target.value)}>
          <option value="all">All health</option>
          <option value="healthy">Healthy</option>
          <option value="watch">Watch</option>
          <option value="critical">Critical</option>
        </select>
        <Button variant={archived ? "secondary" : "outline"} onClick={() => setParam("archived", String(!archived))}>
          <Archive className="h-4 w-4" />
          {archived ? "Active" : "Archived"}
        </Button>
        <Button onClick={() => setShowCreate((value) => !value)}>
          <Plus className="h-4 w-4" />
          Account
        </Button>
      </div>

      {showCreate ? (
        <Card>
          <CardHeader><CardTitle>New account</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={createAccount} className="grid gap-4 md:grid-cols-3">
              <Field label="Company" name="company" required />
              <Field label="Primary contact" name="name" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Industry" name="industry" />
              <Field label="Website" name="website" />
              <Field label="Phone" name="phone" />
              <Field label="Seats" name="seats" type="number" defaultValue="5" required />
              <Field label="MRR" name="mrr" type="number" defaultValue="500" required />
              <Field label="Health score" name="health_score" type="number" defaultValue="70" required />
              <div className="space-y-2">
                <Label htmlFor="account-status">Status</Label>
                <select id="account-status" name="status" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="trial">Trial</option>
                  <option value="active">Active</option>
                  <option value="at_risk">At risk</option>
                  <option value="churned">Churned</option>
                </select>
              </div>
              <div className="flex items-end gap-2 md:col-span-2">
                <Button type="submit">Create account</Button>
                <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Open deals</TableHead>
                <TableHead>Next task</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((account) => {
                const healthLevel = accountHealth(account);
                const openDeals = snapshot.deals.filter((deal) => deal.account_id === account.id && deal.status === "open").length;
                const nextTask = snapshot.tasks
                  .filter((task) => task.account_id === account.id && !task.completed_at)
                  .sort((a, b) => String(a.due_at).localeCompare(String(b.due_at)))[0];
                return (
                  <TableRow key={account.id}>
                    <TableCell>
                      <Link href={`/customers/${account.id}?from=${encodeURIComponent(searchParams.toString())}`} className="flex items-center gap-3 font-medium hover:text-primary">
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-muted"><Building2 className="h-4 w-4" /></span>
                        <span><span className="block">{account.company}</span><span className="block text-xs font-normal text-muted-foreground">{account.industry || account.email}</span></span>
                      </Link>
                    </TableCell>
                    <TableCell><HealthBadge level={healthLevel} score={account.health_score} /></TableCell>
                    <TableCell><Badge variant={account.status === "active" ? "success" : account.status === "at_risk" ? "warning" : "secondary"}>{account.status.replace("_", " ")}</Badge></TableCell>
                    <TableCell>{formatCurrency(account.mrr)}</TableCell>
                    <TableCell>{openDeals}</TableCell>
                    <TableCell className="text-muted-foreground">{nextTask?.due_at ? new Date(nextTask.due_at).toLocaleDateString() : "None"}</TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" aria-label={account.archived_at ? `Restore ${account.company}` : `Archive ${account.company}`} onClick={() => archiveAccount(account)}>
                        {account.archived_at ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 ? <TableRow><TableCell colSpan={7} className="py-14 text-center text-muted-foreground">No accounts match these filters.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filtered.length} accounts</span>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" disabled={page <= 1} aria-label="Previous page" onClick={() => setParam("page", String(page - 1))}><ArrowLeft className="h-4 w-4" /></Button>
          <span>Page {Math.min(page, pageCount)} of {pageCount}</span>
          <Button size="icon" variant="outline" disabled={page >= pageCount} aria-label="Next page" onClick={() => setParam("page", String(page + 1))}><ArrowRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, ...props }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <div className="space-y-2"><Label htmlFor={`field-${name}`}>{label}</Label><Input id={`field-${name}`} name={name} {...props} /></div>;
}

export function HealthBadge({ level, score }: { level: ReturnType<typeof accountHealth>; score: number }) {
  return <Badge variant={level === "healthy" ? "success" : level === "watch" ? "warning" : "destructive"}>{level} · {score}</Badge>;
}
