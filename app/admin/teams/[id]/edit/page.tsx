"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

type Round = {
  id: number;
  name: string;
  order: number;
  points: number;
};

type Team = {
  id: number;
  name: string;
  seed: number | null;
  roundId: number;
  isEliminated: boolean;
  tournament: { id: number; name: string } | null;
  round: Round | null;
};

export default function EditTeamPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState("");
  const [seed, setSeed] = useState<string>("");
  const [isEliminated, setIsEliminated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && !session?.user.isAdmin) {
      router.push("/");
    }
  }, [status, session, router]);

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/teams");
      if (!res.ok) throw new Error("Failed to fetch teams");

      const data = await res.json();
      const found = (data.teams || []).find(
        (t: Team) => t.id === parseInt(params.id as string)
      );

      if (!found) {
        setError("Team not found");
        return;
      }

      setTeam(found);
      setSelectedRoundId(String(found.roundId));
      setSeed(found.seed != null ? String(found.seed) : "");
      setIsEliminated(found.isEliminated);
      setRounds(data.rounds || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (session?.user.isAdmin) {
      fetchTeam();
    }
  }, [session, fetchTeam]);

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: parseInt(params.id as string),
          roundId: parseInt(selectedRoundId),
          seed: seed === "" ? null : parseInt(seed),
          isEliminated,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }

      router.push("/admin/tournaments");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session?.user.isAdmin || !team) return null;

  return (
    <div className="mx-auto max-w-lg space-y-4 md:space-y-6">
      <h1 className="text-xl font-bold md:text-2xl">Edit Team</h1>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <Card>
        <CardHeader className="px-4 py-3 md:px-6 md:py-4">
          <CardTitle className="text-base md:text-lg">{team.name}</CardTitle>
          {team.tournament && (
            <p className="text-sm text-muted-foreground">
              {team.tournament.name}
            </p>
          )}
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 md:px-6 space-y-4">
          <div className="space-y-2">
            <Label>Round</Label>
            <Select
              value={selectedRoundId}
              onValueChange={setSelectedRoundId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select round" />
              </SelectTrigger>
              <SelectContent>
                {rounds
                  .sort((a, b) => a.order - b.order)
                  .map((round) => (
                    <SelectItem key={round.id} value={String(round.id)}>
                      {round.name} ({round.points} pts)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seed">Seed</Label>
            <Input
              id="seed"
              type="number"
              min="1"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="e.g. 1, 2, 3..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="eliminated"
              checked={isEliminated}
              onCheckedChange={(checked) =>
                setIsEliminated(checked === true)
              }
            />
            <Label htmlFor="eliminated">Eliminated</Label>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/tournaments")}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
