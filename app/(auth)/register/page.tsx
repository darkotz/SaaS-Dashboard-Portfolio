import Link from "next/link";
import { signUp } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create workspace</CardTitle>
          <CardDescription>Register an owner profile and start with the user role by default.</CardDescription>
        </CardHeader>
        <CardContent>
          {params.error ? <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{params.error}</p> : null}
          <form action={signUp} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" placeholder="Nikita Sosnovshchen" required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" placeholder="AtlasOps" required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@company.com" required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" minLength={8} required />
            </div>
            <Button className="sm:col-span-2" type="submit">
              Register
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="font-medium text-primary" href="/login">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
