import { ShieldCheck, UserCog } from "lucide-react";
import { DemoReset } from "@/components/crm/demo-reset";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { demoProfile } from "@/lib/demo-data";
import { getCurrentProfile, isDemoVisitor } from "@/lib/supabase/queries";

export default async function AdminPage() {
  const [profile, demoMode] = await Promise.all([getCurrentProfile(), isDemoVisitor()]);
  const canAdmin = profile?.role === "admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Admin</h1>
        <p className="mt-1 text-muted-foreground">Role-aware controls for workspace governance.</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Role gate</CardTitle>
            <CardDescription>Admin-only panels are guarded by the profile role stored in Supabase.</CardDescription>
          </div>
          <ShieldCheck className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          {canAdmin ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Access</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[profile ?? demoProfile].map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserCog className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.company}</TableCell>
                    <TableCell>
                      <Badge variant="success">{user.role}</Badge>
                    </TableCell>
                    <TableCell>Workspace owner</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-md border bg-muted p-5 text-sm text-muted-foreground">
              Your role is user. Ask an admin to grant elevated access.
            </div>
          )}
        </CardContent>
      </Card>
      {demoMode ? <DemoReset /> : null}
    </div>
  );
}
