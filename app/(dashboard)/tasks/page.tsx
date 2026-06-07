import { TaskQueue } from "@/components/crm/task-queue";
import { getCrmSnapshot } from "@/lib/crm/queries";
import { isDemoVisitor } from "@/lib/supabase/queries";

export default async function TasksPage() {
  const [snapshot, demoMode] = await Promise.all([getCrmSnapshot(), isDemoVisitor()]);
  return <TaskQueue initialSnapshot={snapshot} demoMode={demoMode} />;
}
