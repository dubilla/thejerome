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
import { Trophy, ListOrdered } from "lucide-react";

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
    <div className="space-y-8 md:space-y-10">
      {/* Hero section */}
      <div className="pt-4 pb-2 md:pt-8 md:pb-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          TheJerome
        </h1>
        <p className="mt-2 text-base text-muted-foreground md:text-lg">
          Tournament bracket prediction game
        </p>
      </div>

      {session ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base md:text-lg">My Entry</CardTitle>
                  <CardDescription>
                    Create or edit your tournament picks
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/entries/new">
                <Button className="w-full">Go to My Entry</Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <ListOrdered className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base md:text-lg">Leaderboard</CardTitle>
                  <CardDescription>
                    See how everyone is doing
                  </CardDescription>
                </div>
              </div>
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
        <div className="text-center space-y-6">
          <p className="text-muted-foreground">
            Sign in to create your entry and compete!
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/auth/signin" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto sm:min-w-[120px]">Sign In</Button>
            </Link>
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto sm:min-w-[120px]">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
