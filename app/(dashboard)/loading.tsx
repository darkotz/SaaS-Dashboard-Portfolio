export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded bg-muted" />
      <div className="h-4 w-80 max-w-full rounded bg-muted" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-28 rounded-md border bg-white" />)}
      </div>
      <div className="h-80 rounded-md border bg-white" />
    </div>
  );
}
