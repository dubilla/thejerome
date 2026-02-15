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
    return <Badge className="bg-yellow-500 hover:bg-yellow-600">1st</Badge>;
  }
  if (rank === 2) {
    return <Badge className="bg-gray-400 hover:bg-gray-500">2nd</Badge>;
  }
  if (rank === 3) {
    return <Badge className="bg-amber-700 hover:bg-amber-800">3rd</Badge>;
  }
  return <span className="text-muted-foreground">{rank}</span>;
}

function MobileLeaderCard({ entry }: { entry: LeaderEntry }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center">
        <RankBadge rank={entry.rank} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{entry.entryName}</p>
        <p className="text-sm text-muted-foreground truncate">
          {entry.userEmail}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-mono font-semibold">{entry.score}</p>
        <p className="text-xs text-muted-foreground font-mono">{entry.ppr} PPR</p>
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
      <p className="py-8 text-center text-muted-foreground">
        No entries yet. Be the first to create one!
      </p>
    );
  }

  return (
    <>
      {/* Mobile card layout */}
      <div className="space-y-2 md:hidden">
        {leaders.map((entry) => (
          <MobileLeaderCard key={entry.entryId} entry={entry} />
        ))}
      </div>

      {/* Desktop table layout */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Entry</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">PPR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaders.map((entry) => (
              <TableRow key={entry.entryId}>
                <TableCell>
                  <RankBadge rank={entry.rank} />
                </TableCell>
                <TableCell className="font-medium">{entry.entryName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.userEmail}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {entry.score}
                </TableCell>
                <TableCell className="text-right font-mono">{entry.ppr}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
