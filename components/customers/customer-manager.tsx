"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  createCustomer,
  deleteCustomer,
  type CustomerActionResult
} from "@/app/(dashboard)/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Customer } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";

const demoStorageKey = "atlasops.demo-customers.v1";

const statusVariant = {
  active: "success",
  trial: "secondary",
  at_risk: "warning",
  churned: "destructive"
} as const;

type Feedback = {
  tone: "success" | "error";
  message: string;
} | null;

export function CustomerManager({
  initialCustomers,
  demoMode
}: {
  initialCustomers: Customer[];
  demoMode: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [customers, setCustomers] = useState(initialCustomers);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (!demoMode) {
      setCustomers(initialCustomers);
      return;
    }

    const stored = window.localStorage.getItem(demoStorageKey);

    if (!stored) {
      window.localStorage.setItem(demoStorageKey, JSON.stringify(initialCustomers));
      return;
    }

    try {
      setCustomers(JSON.parse(stored) as Customer[]);
    } catch {
      window.localStorage.setItem(demoStorageKey, JSON.stringify(initialCustomers));
      setCustomers(initialCustomers);
    }
  }, [demoMode, initialCustomers]);

  function persistDemoCustomers(nextCustomers: Customer[]) {
    setCustomers(nextCustomers);
    window.localStorage.setItem(demoStorageKey, JSON.stringify(nextCustomers));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setFeedback(null);

    const formData = new FormData(event.currentTarget);

    if (demoMode) {
      const result = createDemoCustomer(formData);

      if (result.success && result.customer) {
        persistDemoCustomers([result.customer, ...customers]);
        formRef.current?.reset();
      }

      setFeedback(toFeedback(result));
      setCreating(false);
      return;
    }

    const result = await createCustomer(formData);

    if (result.success && result.customer) {
      setCustomers((current) => [result.customer!, ...current]);
      formRef.current?.reset();
      router.refresh();
    }

    setFeedback(toFeedback(result));
    setCreating(false);
  }

  async function handleDelete(customer: Customer) {
    if (!window.confirm(`Delete ${customer.company}? This cannot be undone.`)) {
      return;
    }

    setDeletingId(customer.id);
    setFeedback(null);

    if (demoMode) {
      persistDemoCustomers(customers.filter((item) => item.id !== customer.id));
      setFeedback({ tone: "success", message: `${customer.company} was deleted from this demo.` });
      setDeletingId(null);
      return;
    }

    const result = await deleteCustomer(customer.id);

    if (result.success && result.deletedId) {
      setCustomers((current) => current.filter((item) => item.id !== result.deletedId));
      router.refresh();
    }

    setFeedback(toFeedback(result));
    setDeletingId(null);
  }

  return (
    <div className="space-y-4">
      {feedback ? (
        <div
          role="status"
          className={
            feedback.tone === "success"
              ? "rounded-md bg-emerald-50 p-3 text-sm text-emerald-700"
              : "rounded-md bg-red-50 p-3 text-sm text-red-700"
          }
        >
          {feedback.message}
        </div>
      ) : null}
      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add account</CardTitle>
            <CardDescription>
              {demoMode
                ? "Demo changes are saved in this browser."
                : "Create a customer record secured by Supabase RLS."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Contact</Label>
                <Input id="name" name="name" placeholder="Alex Morgan" disabled={creating} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="alex@company.com" disabled={creating} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" placeholder="Acme Inc." disabled={creating} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="seats">Seats</Label>
                  <Input id="seats" name="seats" type="number" min="1" defaultValue="5" disabled={creating} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mrr">MRR</Label>
                  <Input id="mrr" name="mrr" type="number" min="0" defaultValue="500" disabled={creating} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  defaultValue="trial"
                  disabled={creating}
                >
                  <option value="trial">Trial</option>
                  <option value="active">Active</option>
                  <option value="at_risk">At risk</option>
                  <option value="churned">Churned</option>
                </select>
              </div>
              <Button className="w-full" type="submit" disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {creating ? "Creating..." : "Create customer"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Account table</CardTitle>
            <CardDescription>
              {customers.length} {customers.length === 1 ? "account" : "accounts"}
              {demoMode ? " in this browser demo." : " available to your role."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>MRR</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="font-medium">{customer.company}</div>
                      <div className="text-xs text-muted-foreground">{customer.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[customer.status]}>{customer.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>{customer.seats}</TableCell>
                    <TableCell>{formatCurrency(customer.mrr)}</TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        type="button"
                        disabled={deletingId !== null}
                        onClick={() => handleDelete(customer)}
                        aria-label={`Delete ${customer.company}`}
                      >
                        {deletingId === customer.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      No accounts yet. Create the first one from the form.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function createDemoCustomer(formData: FormData): CustomerActionResult {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const company = String(formData.get("company") ?? "").trim();
  const status = String(formData.get("status") ?? "") as Customer["status"];
  const seats = Number(formData.get("seats"));
  const mrr = Number(formData.get("mrr"));
  const validStatuses: Customer["status"][] = ["active", "trial", "at_risk", "churned"];

  if (!name || !company || !email.includes("@")) {
    return { success: false, message: "Enter a contact name, company, and valid email address." };
  }

  if (!validStatuses.includes(status)) {
    return { success: false, message: "Choose a valid customer status." };
  }

  if (!Number.isInteger(seats) || seats < 1 || !Number.isFinite(mrr) || mrr < 0) {
    return { success: false, message: "Seats must be at least 1 and MRR cannot be negative." };
  }

  return {
    success: true,
    message: `${company} was added to this demo.`,
    customer: {
      id: `demo_${crypto.randomUUID()}`,
      name,
      email,
      company,
      status,
      seats,
      mrr,
      created_at: new Date().toISOString()
    }
  };
}

function toFeedback(result: CustomerActionResult): Feedback {
  return {
    tone: result.success ? "success" : "error",
    message: result.message
  };
}
