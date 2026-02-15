"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

type Team = {
  id: number;
  name: string;
  tournamentId: number;
  roundId: number;
  isEliminated: boolean;
  round: { id: number; name: string; order: number; points: number } | null;
};

type Tournament = {
  id: number;
  name: string;
  startsAt: string;
  endsAt: string;
  locked: boolean;
  teams: Team[];
};

type ExistingEntry = {
  id: number;
  name: string;
  userId: number;
  yearId: number;
};

export default function EntryForm() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [entryName, setEntryName] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<
    Record<number, string>
  >({});
  const [existingEntry, setExistingEntry] = useState<ExistingEntry | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [tournamentsRes, entryRes] = await Promise.all([
        fetch("/api/tournaments"),
        fetch("/api/entries"),
      ]);

      if (!tournamentsRes.ok) throw new Error("Failed to fetch tournaments");

      const tournamentsData = await tournamentsRes.json();
      setTournaments(tournamentsData.tournaments || []);

      if (entryRes.ok) {
        const entryData = await entryRes.json();
        if (entryData.entry) {
          setExistingEntry(entryData.entry);
          setEntryName(entryData.entry.name);

          // Pre-populate picks
          const pickMap: Record<number, string> = {};
          for (const pick of entryData.picks || []) {
            pickMap[pick.tournamentId] = String(pick.teamId);
          }
          setSelectedTeams(pickMap);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validate all unlocked tournaments have picks
    const unlockedTournaments = tournaments.filter((t) => !t.locked);
    const missingPicks = unlockedTournaments.filter(
      (t) => !selectedTeams[t.id]
    );

    if (missingPicks.length > 0) {
      setError(
        `Please make picks for: ${missingPicks.map((t) => t.name).join(", ")}`
      );
      return;
    }

    setSaving(true);

    const picks = Object.entries(selectedTeams).map(
      ([tournamentId, teamId]) => ({
        tournamentId: parseInt(tournamentId),
        teamId: parseInt(teamId),
      })
    );

    try {
      if (existingEntry) {
        // Update existing entry
        const res = await fetch("/api/entries", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entryId: existingEntry.id,
            name: entryName,
            picks,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update entry");
        }
      } else {
        // Create new entry
        const res = await fetch("/api/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: entryName, picks }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create entry");
        }
      }

      router.push("/leaders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-muted-foreground">Loading tournaments...</p>
      </div>
    );
  }

  const unlockedTournaments = tournaments.filter((t) => !t.locked);
  const lockedTournaments = tournaments.filter((t) => t.locked);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="entryName">Entry Name</Label>
        <Input
          id="entryName"
          value={entryName}
          onChange={(e) => setEntryName(e.target.value)}
          placeholder="Enter your entry name"
          required
        />
      </div>

      {unlockedTournaments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold md:text-lg">Make Your Picks</h3>
          <div className="space-y-3">
            {unlockedTournaments.map((tournament) => (
              <Card key={tournament.id}>
                <CardHeader className="px-4 py-3 md:px-6 md:py-4">
                  <CardTitle className="text-sm font-medium md:text-base">
                    {tournament.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0 md:px-6">
                  <Select
                    value={selectedTeams[tournament.id] || ""}
                    onValueChange={(value) =>
                      setSelectedTeams((prev) => ({
                        ...prev,
                        [tournament.id]: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {tournament.teams.map((team) => (
                        <SelectItem key={team.id} value={String(team.id)}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {lockedTournaments.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-base font-semibold text-muted-foreground md:text-lg">
            <Lock className="h-4 w-4" />
            Locked Tournaments
          </h3>
          <div className="space-y-2">
            {lockedTournaments.map((tournament) => {
              const pickedTeamId = selectedTeams[tournament.id];
              const pickedTeam = tournament.teams.find(
                (t) => String(t.id) === pickedTeamId
              );
              return (
                <div
                  key={tournament.id}
                  className="flex items-center justify-between rounded-lg border border-dashed p-3 opacity-60"
                >
                  <span className="text-sm font-medium">{tournament.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {pickedTeam ? pickedTeam.name : "No pick"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {unlockedTournaments.length > 0 && (
        <Button type="submit" disabled={saving} className="w-full">
          {saving
            ? "Saving..."
            : existingEntry
              ? "Update Entry"
              : "Create Entry"}
        </Button>
      )}

      {unlockedTournaments.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          All tournaments are locked. No changes can be made.
        </p>
      )}
    </form>
  );
}
