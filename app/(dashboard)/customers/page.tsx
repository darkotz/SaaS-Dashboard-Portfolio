import { CustomerManager } from "@/components/customers/customer-manager";
import { getCustomers, isDemoVisitor } from "@/lib/supabase/queries";

export default async function CustomersPage() {
  const [customers, demoMode] = await Promise.all([getCustomers(), isDemoVisitor()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Customers</h1>
        <p className="mt-1 text-muted-foreground">
          Manage customer accounts with immediate feedback and production-safe permissions.
        </p>
      </div>
      <CustomerManager initialCustomers={customers} demoMode={demoMode} />
    </div>
  );
}
