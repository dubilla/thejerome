"use client";

import Leaderboard from "@/app/components/Leaderboard";

export default function LeadersPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl font-bold md:text-2xl">Leaderboard</h1>
      <Leaderboard />
    </div>
  );
}
