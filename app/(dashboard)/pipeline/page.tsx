import { PipelineBoard } from "@/components/crm/pipeline-board";
import { getCrmSnapshot } from "@/lib/crm/queries";
import { isDemoVisitor } from "@/lib/supabase/queries";

export default async function PipelinePage() {
  const [snapshot, demoMode] = await Promise.all([getCrmSnapshot(), isDemoVisitor()]);
  return <PipelineBoard initialSnapshot={snapshot} demoMode={demoMode} />;
}
