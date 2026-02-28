"use client";

import Leaderboard from "@/app/components/Leaderboard";
import { Trophy } from "lucide-react";

export default function LeadersPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page header */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg trophy-glow">
            <Trophy className="h-6 w-6" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl tracking-wider text-secondary">
            LEADERBOARD
          </h1>
        </div>
        <div className="h-0.5 w-24 bg-primary"></div>
        <p className="mt-3 text-muted-foreground">
          See who's leading the pack
        </p>
      </div>

      <Leaderboard />
    </div>
  );
}
