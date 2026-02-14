"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">TheJerome</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Tournament bracket prediction game
        </p>
      </div>

      {session ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>My Entry</CardTitle>
              <CardDescription>
                Create or edit your tournament picks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/entries/new">
                <Button className="w-full">Go to My Entry</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>
                See how everyone is doing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/leaders">
                <Button variant="outline" className="w-full">
                  View Leaderboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">
            Sign in to create your entry and compete!
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
