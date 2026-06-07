import { AccountDirectory } from "@/components/crm/account-directory";
import { getCrmSnapshot } from "@/lib/crm/queries";
import { isDemoVisitor } from "@/lib/supabase/queries";

export default async function CustomersPage() {
  const [snapshot, demoMode] = await Promise.all([getCrmSnapshot(), isDemoVisitor()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Accounts</h1>
        <p className="mt-1 text-muted-foreground">
          Search customer relationships, revenue context, health, and open work.
        </p>
      </div>
      <AccountDirectory initialSnapshot={snapshot} demoMode={demoMode} />
    </div>
  );
}
