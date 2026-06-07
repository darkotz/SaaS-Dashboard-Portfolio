"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-red-50 text-red-700">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">This workspace could not be loaded</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Check the Supabase connection and database policies, then retry the request.
        </p>
        <Button className="mt-5" type="button" onClick={reset}>
          <RefreshCcw className="h-4 w-4" />
          Retry
        </Button>
        {error.digest ? <p className="mt-3 text-xs text-muted-foreground">Reference: {error.digest}</p> : null}
      </div>
    </div>
  );
}
