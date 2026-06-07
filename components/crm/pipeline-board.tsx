"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DndContext, DragEndEvent, PointerSensor, KeyboardSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { BriefcaseBusiness, Calendar, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteDeal, moveDeal, saveDeal } from "@/app/(dashboard)/crm-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDemoCrm } from "@/lib/crm/demo-store";
import { computeCrmMetrics, effectiveProbability, type CrmSnapshot, type Deal, type DealStatus, type PipelineStage } from "@/lib/crm/types";
import { formatCurrency } from "@/lib/utils";

export function PipelineBoard({ initialSnapshot, demoMode }: { initialSnapshot: CrmSnapshot; demoMode: boolean }) {
  const router = useRouter();
  const demo = useDemoCrm(demoMode);
  const [liveDeals, setLiveDeals] = useState(initialSnapshot.deals);
  useEffect(() => setLiveDeals(initialSnapshot.deals), [initialSnapshot.deals]);
  const snapshot = demoMode ? demo.snapshot : { ...initialSnapshot, deals: liveDeals };
  const [showCreate, setShowCreate] = useState(false);
  const [feedback, setFeedback] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));
  const metrics = computeCrmMetrics(snapshot);
  const stages = [...snapshot.stages].sort((a, b) => a.position - b.position);

  const grouped = useMemo(() => new Map(stages.map((stage) => [stage.id, snapshot.deals.filter((deal) => deal.stage_id === stage.id)])), [snapshot.deals, stages]);

  async function changeStage(deal: Deal, stage: PipelineStage) {
    if (deal.stage_id === stage.id) return;
    const previousDeals = snapshot.deals;
    const status: DealStatus = stage.is_closed ? (stage.is_won ? "won" : "lost") : "open";
    let lossReason: string | undefined;
    if (status === "lost") {
      lossReason = window.prompt("Why was this deal lost?") ?? undefined;
      if (!lossReason) return;
    }
    if (status === "won" && !window.confirm(`Mark ${deal.title} as won?`)) return;

    if (demoMode) {
      const now = new Date().toISOString();
      demo.update((current) => ({
        ...current,
        deals: current.deals.map((item) => item.id === deal.id ? { ...item, stage_id: stage.id, status, loss_reason: lossReason ?? null, closed_at: status === "open" ? null : now, updated_at: now } : item),
        activities: [{
          id: `activity_${crypto.randomUUID()}`,
          account_id: deal.account_id,
          deal_id: deal.id,
          contact_id: null,
          created_by: "demo-admin",
          type: "system",
          subject: status === "open" ? `Deal moved to ${stage.name}` : `Deal marked ${status}`,
          body: lossReason ?? "",
          occurred_at: now,
          is_system: true
        }, ...current.activities]
      }));
      setFeedback(`${deal.title} moved to ${stage.name}.`);
      return;
    }

    const optimistic: Deal[] = snapshot.deals.map((item) => item.id === deal.id ? { ...item, stage_id: stage.id, status, loss_reason: lossReason ?? null } : item);
    setLiveDeals(optimistic);
    const result = await moveDeal(deal.id, deal.account_id, stage.id, status, lossReason);
    setFeedback(result.message);
    if (result.success) router.refresh();
    else {
      setLiveDeals(previousDeals);
      setFeedback(`Move failed; deal returned to ${snapshot.stages.find((item) => item.id === deal.stage_id)?.name}.`);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const deal = snapshot.deals.find((item) => item.id === event.active.id);
    const stage = snapshot.stages.find((item) => item.id === event.over?.id);
    if (deal && stage) await changeStage(deal, stage);
  }

  async function createDeal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const now = new Date().toISOString();
    const input = {
      account_id: String(data.account_id),
      stage_id: String(data.stage_id),
      title: String(data.title),
      amount: Number(data.amount),
      currency: String(data.currency) as "USD" | "EUR" | "SEK",
      expected_close_date: String(data.expected_close_date)
    };
    if (demoMode) {
      const stage = snapshot.stages.find((item) => item.id === input.stage_id)!;
      demo.update((current) => ({
        ...current,
        deals: [{
          id: `deal_${crypto.randomUUID()}`,
          ...input,
          owner_id: "demo-admin",
          probability: null,
          status: stage.is_closed ? (stage.is_won ? "won" : "lost") : "open",
          loss_reason: null,
          created_at: now,
          updated_at: now,
          closed_at: stage.is_closed ? now : null
        }, ...current.deals]
      }));
      setFeedback("Deal created.");
      setShowCreate(false);
      return;
    }
    const result = await saveDeal(input);
    setFeedback(result.message);
    if (result.success) {
      setShowCreate(false);
      router.refresh();
    }
  }

  async function editDeal(deal: Deal) {
    const title = window.prompt("Deal title", deal.title)?.trim();
    if (!title) return;
    const amountText = window.prompt("Deal amount", String(deal.amount));
    const amount = Number(amountText);
    if (!Number.isFinite(amount) || amount < 0) {
      setFeedback("Enter a valid deal amount.");
      return;
    }
    if (demoMode) {
      demo.update((current) => ({
        ...current,
        deals: current.deals.map((item) => item.id === deal.id ? { ...item, title, amount, updated_at: new Date().toISOString() } : item)
      }));
      setFeedback("Deal updated.");
      return;
    }
    const result = await saveDeal({ account_id: deal.account_id, stage_id: deal.stage_id, title, amount, currency: deal.currency, expected_close_date: deal.expected_close_date }, deal.id);
    setFeedback(result.message);
    if (result.success) router.refresh();
  }

  async function removeDeal(deal: Deal) {
    if (!window.confirm(`Delete ${deal.title}?`)) return;
    if (demoMode) {
      demo.update((current) => ({ ...current, deals: current.deals.filter((item) => item.id !== deal.id) }));
      setFeedback("Deal deleted.");
      return;
    }
    const result = await deleteDeal(deal.id, deal.account_id);
    setFeedback(result.message);
    if (result.success) router.refresh();
  }

  return (
    <div className="space-y-5">
      {feedback ? <div role="status" className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{feedback}</div> : null}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Open pipeline" value={formatCurrency(metrics.pipelineValue)} />
        <Metric label="Weighted forecast" value={formatCurrency(metrics.weightedForecast)} />
        <Metric label="Open deals" value={String(metrics.openDeals)} />
        <Metric label="Won value" value={formatCurrency(metrics.wonValue)} />
      </section>
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-semibold">Pipeline</h1><p className="mt-1 text-muted-foreground">Move opportunities from first signal to commercial outcome.</p></div>
        <Button onClick={() => setShowCreate((value) => !value)}><Plus className="h-4 w-4" />Deal</Button>
      </div>
      {showCreate ? <DealForm snapshot={snapshot} onSubmit={createDeal} onCancel={() => setShowCreate(false)} /> : null}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid auto-cols-[290px] grid-flow-col gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => <PipelineColumn key={stage.id} stage={stage} deals={grouped.get(stage.id) ?? []} snapshot={snapshot} onMove={changeStage} onEdit={editDeal} onDelete={removeDeal} />)}
        </div>
      </DndContext>
    </div>
  );
}

function PipelineColumn({ stage, deals, snapshot, onMove, onEdit, onDelete }: { stage: PipelineStage; deals: Deal[]; snapshot: CrmSnapshot; onMove: (deal: Deal, stage: PipelineStage) => void; onEdit: (deal: Deal) => void; onDelete: (deal: Deal) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  return <section ref={setNodeRef} className={isOver ? "min-h-[480px] rounded-md border-2 border-primary bg-primary/5" : "min-h-[480px] rounded-md border bg-muted/35"}>
    <div className="flex items-center justify-between border-b p-3"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} /><h2 className="text-sm font-semibold">{stage.name}</h2><Badge variant="outline">{deals.length}</Badge></div><span className="text-xs text-muted-foreground">{formatCurrency(deals.reduce((sum, deal) => sum + deal.amount, 0))}</span></div>
    <div className="space-y-3 p-3">{deals.map((deal) => <DealCard key={deal.id} deal={deal} snapshot={snapshot} onMove={onMove} onEdit={onEdit} onDelete={onDelete} />)}</div>
  </section>;
}

function DealCard({ deal, snapshot, onMove, onEdit, onDelete }: { deal: Deal; snapshot: CrmSnapshot; onMove: (deal: Deal, stage: PipelineStage) => void; onEdit: (deal: Deal) => void; onDelete: (deal: Deal) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: deal.id });
  const account = snapshot.accounts.find((item) => item.id === deal.account_id);
  return <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.65 : 1 }}>
    <Card className="shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-start justify-between gap-2"><div><p className="font-medium">{deal.title}</p><p className="mt-1 text-xs text-muted-foreground">{account?.company}</p></div><button className="cursor-grab p-1 text-muted-foreground" aria-label={`Move ${deal.title}`} {...listeners} {...attributes}><GripVertical className="h-4 w-4" /></button></div>
      <p className="mt-4 text-lg font-semibold">{formatCurrency(deal.amount)}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground"><span>{effectiveProbability(deal, snapshot.stages)}% weighted</span><span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(deal.expected_close_date).toLocaleDateString()}</span></div>
      <select aria-label={`Change stage for ${deal.title}`} className="mt-3 h-8 w-full rounded-md border bg-background px-2 text-xs" value={deal.stage_id} onChange={(event) => onMove(deal, snapshot.stages.find((stage) => stage.id === event.target.value)!)}>
        {snapshot.stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}
      </select>
      <div className="mt-2 flex justify-end gap-1"><Button size="icon" variant="ghost" aria-label={`Edit ${deal.title}`} onClick={() => onEdit(deal)}><Pencil className="h-3.5 w-3.5" /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${deal.title}`} onClick={() => onDelete(deal)}><Trash2 className="h-3.5 w-3.5" /></Button></div>
    </CardContent>
    </Card>
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></CardContent></Card>; }

function DealForm({ snapshot, onSubmit, onCancel }: { snapshot: CrmSnapshot; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return <Card><CardHeader><CardTitle>New opportunity</CardTitle></CardHeader><CardContent><form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-3">
    <div className="space-y-2"><Label htmlFor="deal-title">Title</Label><Input id="deal-title" name="title" required /></div>
    <div className="space-y-2"><Label htmlFor="deal-account">Account</Label><select id="deal-account" name="account_id" className="h-10 w-full rounded-md border bg-background px-3 text-sm">{snapshot.accounts.filter((account) => !account.archived_at).map((account) => <option key={account.id} value={account.id}>{account.company}</option>)}</select></div>
    <div className="space-y-2"><Label htmlFor="deal-stage">Stage</Label><select id="deal-stage" name="stage_id" className="h-10 w-full rounded-md border bg-background px-3 text-sm">{snapshot.stages.filter((stage) => !stage.is_closed).map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select></div>
    <div className="space-y-2"><Label htmlFor="deal-amount">Amount</Label><Input id="deal-amount" name="amount" type="number" min="0" required /></div>
    <div className="space-y-2"><Label htmlFor="deal-currency">Currency</Label><select id="deal-currency" name="currency" className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option>USD</option><option>EUR</option><option>SEK</option></select></div>
    <div className="space-y-2"><Label htmlFor="deal-close">Expected close</Label><Input id="deal-close" name="expected_close_date" type="date" required /></div>
    <div className="flex gap-2 md:col-span-3"><Button type="submit"><BriefcaseBusiness className="h-4 w-4" />Create deal</Button><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button></div>
  </form></CardContent></Card>;
}
