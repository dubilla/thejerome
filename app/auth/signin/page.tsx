"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="flex items-center justify-center px-4 pt-8 pb-12 md:pt-20">
      <Card className="w-full max-w-md border-2 shadow-xl">
        <CardHeader className="text-center pb-8 bg-gradient-to-b from-secondary/5 to-transparent">
          <CardTitle className="font-display text-3xl md:text-4xl tracking-wider text-secondary">
            SIGN IN
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Enter the game. Make your picks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="rounded-md bg-red-50 border-2 border-red-200 p-3 text-sm text-red-600 font-semibold">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold uppercase tracking-wide">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 border-2 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold uppercase tracking-wide">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 border-2 focus:border-primary"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-base font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-center text-sm text-muted-foreground pt-2">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="font-semibold text-primary hover:underline cursor-pointer">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
