import Link from "next/link";
import { BarChart3, CreditCard, LayoutDashboard, LogIn, LogOut, Shield, Table2 } from "lucide-react";
import { signOut } from "@/app/(dashboard)/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getViewer } from "@/lib/supabase/queries";
import { initials } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Table2 },
  { href: "/subscription", label: "Billing", icon: CreditCard },
  { href: "/admin", label: "Admin", icon: Shield }
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, demoMode } = await getViewer();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white/85 backdrop-blur lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">AtlasOps</p>
            <p className="text-xs text-muted-foreground">SaaS dashboard</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{initials(profile.full_name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{profile.full_name}</p>
              <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
            </div>
          </div>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/92 px-4 backdrop-blur lg:px-8">
          <div>
            <p className="text-sm font-semibold">{profile.company}</p>
            <p className="text-xs text-muted-foreground">{demoMode ? "Portfolio preview" : "Protected workspace"}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={demoMode ? "secondary" : profile.role === "admin" ? "success" : "secondary"}>
              {demoMode ? "demo" : profile.role}
            </Badge>
            {demoMode ? (
              <Button asChild size="icon" variant="ghost">
                <Link href="/login" aria-label="Owner sign in">
                  <LogIn className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <form action={signOut}>
                <Button size="icon" variant="ghost" type="submit" aria-label="Log out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        </header>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
