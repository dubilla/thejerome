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
import { Trophy, Target, TrendingUp } from "lucide-react";

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
    <div className="space-y-10 md:space-y-14">
      {/* Hero section */}
      <div className="relative pt-8 pb-6 md:pt-16 md:pb-10 text-center overflow-hidden">
        {/* Diagonal background accent */}
        <div className="absolute inset-0 -z-10 energy-diagonal"></div>

        {/* Main headline */}
        <div className="relative inline-block">
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-wider text-foreground mb-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
            THE JEROME
          </h1>
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        </div>

        <p className="mt-6 text-lg md:text-xl lg:text-2xl text-foreground/80 font-medium tracking-wide max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          Dominate the bracket. <span className="text-primary font-bold">Own the leaderboard.</span>
        </p>

        {!session && (
          <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            The ultimate college basketball tournament prediction league
          </p>
        )}
      </div>

      {session ? (
        <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          {/* My Entry Card */}
          <Card className="card-lift border-2 border-primary/20 shadow-lg overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg trophy-glow group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-7 w-7" />
                </div>
                <div>
                  <CardTitle className="text-xl md:text-2xl font-display tracking-wide">
                    MY ENTRY
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Lock in your tournament picks
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <Link href="/entries/new">
                <Button className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer">
                  Go to My Entry
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Leaderboard Card */}
          <Card className="card-lift border-2 border-secondary/30 shadow-lg overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <div>
                  <CardTitle className="text-xl md:text-2xl font-display tracking-wide">
                    LEADERBOARD
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    See who's dominating the league
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <Link href="/leaders">
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-semibold border-2 hover:bg-secondary hover:text-secondary-foreground transition-all cursor-pointer"
                >
                  View Leaderboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <div className="p-6 rounded-lg bg-card border border-border">
              <Trophy className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-display text-lg tracking-wide mb-2">COMPETE</h3>
              <p className="text-sm text-muted-foreground">
                Challenge friends and climb the rankings
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <Target className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-display text-lg tracking-wide mb-2">PREDICT</h3>
              <p className="text-sm text-muted-foreground">
                Pick winners for every tournament round
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-display text-lg tracking-wide mb-2">WIN</h3>
              <p className="text-sm text-muted-foreground">
                Score points and prove you know hoops
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center max-w-md mx-auto">
            <Link href="/auth/signin" className="w-full sm:w-auto flex-1">
              <Button className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup" className="w-full sm:w-auto flex-1">
              <Button
                variant="outline"
                className="w-full h-12 text-base font-semibold border-2 hover:bg-secondary hover:text-secondary-foreground transition-all cursor-pointer"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
