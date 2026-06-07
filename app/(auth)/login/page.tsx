import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { signIn } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_520px]">
      <section className="hidden bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center lg:block">
        <div className="flex h-full items-end bg-slate-950/55 p-12 text-white">
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md bg-white/12 px-3 py-2 text-sm backdrop-blur">
              <BarChart3 className="h-4 w-4" />
              AtlasOps SaaS command center
            </div>
            <h1 className="text-5xl font-semibold tracking-normal">Turn subscription operations into a calm daily cockpit.</h1>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center px-5 py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Owner access for managing the live Supabase workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            {params.error ? <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{params.error}</p> : null}
            <form action={signIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@company.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button className="w-full" type="submit">
                Login
              </Button>
            </form>
            <Button asChild className="mt-3 w-full" variant="outline">
              <Link href="/dashboard">View portfolio demo</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
