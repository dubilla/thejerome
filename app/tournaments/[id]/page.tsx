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
  seed: number | null;
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

function MobileTeamRow({ team }: { team: Team }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium">{team.name}</span>
      {team.isEliminated ? (
        <Badge variant="destructive" className="text-xs">Eliminated</Badge>
      ) : (
        <Badge variant="secondary" className="text-xs">Active</Badge>
      )}
    </div>
  );
}

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
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl font-bold md:text-2xl">{tournament.name}</h1>

      {sortedRounds.map(([roundName, teams]) => (
        <Card key={roundName}>
          <CardHeader className="px-4 py-3 md:px-6 md:py-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold md:text-base">
              {roundName}
              {teams[0]?.round?.points ? (
                <Badge variant="secondary" className="text-xs">
                  {teams[0].round.points} pts
                </Badge>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 md:px-6">
            {/* Mobile layout */}
            <div className="divide-y md:hidden">
              {teams.map((team) => (
                <MobileTeamRow key={team.id} team={team} />
              ))}
            </div>

            {/* Desktop table layout */}
            <div className="hidden md:block">
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
                      <TableCell className="font-medium">
                        {team.seed != null ? `(${team.seed}) ` : ""}
                        {team.name}
                      </TableCell>
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
