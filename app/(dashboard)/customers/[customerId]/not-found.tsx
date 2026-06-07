import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AccountNotFound() {
  return <div className="flex min-h-[60vh] flex-col items-center justify-center text-center"><h1 className="text-2xl font-semibold">Account not found</h1><p className="mt-2 text-muted-foreground">It may be archived, removed, or unavailable to this workspace.</p><Button asChild className="mt-5"><Link href="/customers">Return to accounts</Link></Button></div>;
}
