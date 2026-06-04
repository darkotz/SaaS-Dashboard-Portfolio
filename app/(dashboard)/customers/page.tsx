import { Plus, Trash2 } from "lucide-react";
import { createCustomer, deleteCustomer } from "@/app/(dashboard)/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCustomers } from "@/lib/supabase/queries";
import { formatCurrency } from "@/lib/utils";

const statusVariant = {
  active: "success",
  trial: "secondary",
  at_risk: "warning",
  churned: "destructive"
} as const;

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Customers</h1>
        <p className="mt-1 text-muted-foreground">CRUD surface for account records stored in Supabase.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add account</CardTitle>
            <CardDescription>Create a customer record with subscription context.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createCustomer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Contact</Label>
                <Input id="name" name="name" placeholder="Alex Morgan" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="alex@company.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" placeholder="Acme Inc." required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="seats">Seats</Label>
                  <Input id="seats" name="seats" type="number" min="1" defaultValue="5" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mrr">MRR</Label>
                  <Input id="mrr" name="mrr" type="number" min="0" defaultValue="500" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue="trial"
                >
                  <option value="trial">Trial</option>
                  <option value="active">Active</option>
                  <option value="at_risk">At risk</option>
                  <option value="churned">Churned</option>
                </select>
              </div>
              <Button className="w-full" type="submit">
                <Plus className="h-4 w-4" />
                Create customer
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Account table</CardTitle>
            <CardDescription>Demo rows render without Supabase; live rows use the customers table.</CardDescription>
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
                      <form action={deleteCustomer}>
                        <input type="hidden" name="id" value={customer.id} />
                        <Button size="icon" variant="ghost" type="submit" aria-label="Delete customer">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
