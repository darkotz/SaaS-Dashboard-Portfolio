"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetDemoCrm } from "@/lib/crm/demo-store";

export function DemoReset() {
  const [reset, setReset] = useState(false);

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border bg-white p-4">
      <div>
        <p className="text-sm font-medium">Portfolio demo data</p>
        <p className="text-xs text-muted-foreground">Restore accounts, deals, activity, and tasks to the original connected scenario.</p>
      </div>
      <Button
        variant="outline"
        onClick={() => {
          resetDemoCrm();
          setReset(true);
        }}
      >
        <RotateCcw className="h-4 w-4" />
        {reset ? "Reset complete" : "Reset demo"}
      </Button>
    </div>
  );
}
