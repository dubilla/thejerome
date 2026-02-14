"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Team = {
  id: number;
  name: string;
  isEliminated: boolean;
  round: { id: number; name: string; order: number; points: number } | null;
};

type Tournament = {
  id: number;
  name: string;
  startsAt: string;
  locked: boolean;
  teams: Team[];
};

export default function TournamentDetailPage() {
  const params = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTournament = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tournaments");
      if (!res.ok) throw new Error("Failed to fetch tournaments");

      const data = await res.json();
      const found = (data.tournaments || []).find(
        (t: Tournament) => t.id === parseInt(params.id as string)
      );

      if (!found) {
        setError("Tournament not found");
      } else if (!found.locked) {
        setError("Tournament hasn't started yet");
      } else {
        setTournament(found);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchTournament();
  }, [fetchTournament]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
    );
  }

  if (!tournament) return null;

  // Group teams by round
  const teamsByRound = new Map<string, Team[]>();
  for (const team of tournament.teams) {
    const roundName = team.round?.name || "Unknown";
    if (!teamsByRound.has(roundName)) {
      teamsByRound.set(roundName, []);
    }
    teamsByRound.get(roundName)!.push(team);
  }

  // Sort rounds by order
  const sortedRounds = [...teamsByRound.entries()].sort((a, b) => {
    const orderA = a[1][0]?.round?.order || 0;
    const orderB = b[1][0]?.round?.order || 0;
    return orderB - orderA;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{tournament.name}</h1>

      {sortedRounds.map(([roundName, teams]) => (
        <Card key={roundName}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {roundName}
              {teams[0]?.round?.points ? (
                <Badge variant="secondary">
                  {teams[0].round.points} pts
                </Badge>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>
                      {team.isEliminated ? (
                        <Badge variant="destructive">Eliminated</Badge>
                      ) : (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
