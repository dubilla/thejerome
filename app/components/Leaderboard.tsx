"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

type LeaderEntry = {
  rank: number;
  entryId: number;
  entryName: string;
  userEmail: string;
  score: number;
  ppr: number;
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500 trophy-glow" />
        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold shadow-lg">
          1ST
        </Badge>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center gap-2">
        <Medal className="h-5 w-5 text-gray-400" />
        <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 hover:from-gray-400 hover:to-gray-600 text-white font-bold shadow-md">
          2ND
        </Badge>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5 text-amber-600" />
        <Badge className="bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-bold shadow-md">
          3RD
        </Badge>
      </div>
    );
  }
  return <span className="scoreboard-number text-lg text-muted-foreground ml-7">{rank}</span>;
}

function MobileLeaderCard({ entry }: { entry: LeaderEntry }) {
  const isTopThree = entry.rank <= 3;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
        isTopThree
          ? "border-primary/40 bg-gradient-to-r from-primary/5 to-transparent shadow-md"
          : "border-border bg-card"
      }`}
    >
      <div className="flex shrink-0 items-center justify-start min-w-[80px]">
        <RankBadge rank={entry.rank} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`font-bold truncate ${isTopThree ? "text-lg" : "text-base"}`}>
          {entry.entryName}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {entry.userEmail}
        </p>
      </div>
      <div className="text-right shrink-0 bg-secondary/10 rounded-lg px-3 py-2">
        <p className="scoreboard-number text-2xl text-primary">{entry.score}</p>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
          {entry.ppr} PPR
        </p>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeaders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/leaders");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");

      const data = await res.json();
      setLeaders(data.leaders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaders();
  }, [fetchLeaders]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-muted-foreground">Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
    );
  }

  if (leaders.length === 0) {
    return (
      <div className="py-16 text-center">
        <Trophy className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">
          No entries yet. Be the first to create one!
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile card layout */}
      <div className="space-y-3 md:hidden">
        {leaders.map((entry, index) => (
          <div
            key={entry.entryId}
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <MobileLeaderCard entry={entry} />
          </div>
        ))}
      </div>

      {/* Desktop table layout */}
      <div className="hidden md:block overflow-hidden rounded-lg border-2 border-border shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary hover:bg-secondary">
              <TableHead className="w-32 text-primary-foreground font-display text-base tracking-wider">
                RANK
              </TableHead>
              <TableHead className="text-primary-foreground font-display text-base tracking-wider">
                ENTRY
              </TableHead>
              <TableHead className="text-primary-foreground font-display text-base tracking-wider">
                PLAYER
              </TableHead>
              <TableHead className="text-right text-primary-foreground font-display text-base tracking-wider">
                SCORE
              </TableHead>
              <TableHead className="text-right text-primary-foreground font-display text-base tracking-wider">
                PPR
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaders.map((entry, index) => {
              const isTopThree = entry.rank <= 3;
              return (
                <TableRow
                  key={entry.entryId}
                  className={`animate-in fade-in slide-in-from-bottom-2 duration-500 ${
                    isTopThree
                      ? "bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-l-primary"
                      : ""
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="py-4">
                    <RankBadge rank={entry.rank} />
                  </TableCell>
                  <TableCell className={`font-bold ${isTopThree ? "text-lg" : "text-base"}`}>
                    {entry.entryName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {entry.userEmail}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center justify-center bg-secondary/10 rounded-lg px-4 py-2">
                      <span className={`scoreboard-number ${isTopThree ? "text-2xl text-primary" : "text-xl"}`}>
                        {entry.score}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right scoreboard-number text-lg">
                    {entry.ppr}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
