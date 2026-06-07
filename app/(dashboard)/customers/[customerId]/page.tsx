import { notFound } from "next/navigation";
import { AccountWorkspace } from "@/components/crm/account-workspace";
import { getCrmSnapshot } from "@/lib/crm/queries";
import { isDemoVisitor } from "@/lib/supabase/queries";

export default async function AccountPage({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params;
  const [snapshot, demoMode] = await Promise.all([getCrmSnapshot(), isDemoVisitor()]);
  if (!snapshot.accounts.some((account) => account.id === customerId && !account.archived_at)) notFound();
  return <AccountWorkspace accountId={customerId} initialSnapshot={snapshot} demoMode={demoMode} />;
}
