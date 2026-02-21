"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isTournamentLocked } from "@/lib/utils/tournament";

type Tournament = {
  id: number;
  name: string;
  startsAt: string;
  endsAt: string;
  isNeutralSite: boolean;
  yearId: number;
};

function MobileTournamentCard({
  tournament,
  locked,
  isEditing,
  editStartsAt,
  editEndsAt,
  saving,
  onEdit,
  onSave,
  onCancel,
  onEditStartsAtChange,
  onEditEndsAtChange,
}: {
  tournament: Tournament;
  locked: boolean;
  isEditing: boolean;
  editStartsAt: string;
  editEndsAt: string;
  saving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onEditStartsAtChange: (value: string) => void;
  onEditEndsAtChange: (value: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="px-4 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{tournament.name}</CardTitle>
          {locked ? (
            <Badge variant="destructive" className="text-xs">Locked</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Unlocked</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-3">
        {isEditing ? (
          <>
            <Input
              type="datetime-local"
              value={editStartsAt}
              onChange={(e) => onEditStartsAtChange(e.target.value)}
              className="w-full"
              placeholder="Starts at"
            />
            <Input
              type="datetime-local"
              value={editEndsAt}
              onChange={(e) => onEditEndsAtChange(e.target.value)}
              className="w-full"
              placeholder="Ends at"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={onSave} disabled={saving} className="flex-1">
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Starts: {new Date(tournament.startsAt).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Ends: {new Date(tournament.endsAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={onEdit} className="flex-1">
                Edit Time
              </Button>
              <Link href={`/admin/tournaments/${tournament.id}/teams`} className="flex-1">
                <Button size="sm" variant="outline" className="w-full">
                  Manage Teams
                </Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminTournamentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStartsAt, setEditStartsAt] = useState("");
  const [editEndsAt, setEditEndsAt] = useState("");
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

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/tournaments");
      if (!res.ok) throw new Error("Failed to fetch tournaments");

      const data = await res.json();
      setTournaments(data.tournaments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user.isAdmin) {
      fetchTournaments();
    }
  }, [session, fetchTournaments]);

  async function handleToggleNeutralSite(tournament: Tournament) {
    try {
      const res = await fetch("/api/admin/tournaments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId: tournament.id,
          isNeutralSite: !tournament.isNeutralSite,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }

      fetchTournaments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  }

  async function handleSave(tournamentId: number) {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/tournaments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId,
          startsAt: editStartsAt,
          endsAt: editEndsAt,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }

      setEditingId(null);
      fetchTournaments();
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

  if (!session?.user.isAdmin) return null;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold md:text-2xl">Admin: Tournaments</h1>
        <Badge variant="outline">Admin</Badge>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Mobile card layout */}
      <div className="space-y-3 md:hidden">
        {tournaments.map((tournament) => {
          const locked = isTournamentLocked(new Date(tournament.startsAt));
          return (
            <MobileTournamentCard
              key={tournament.id}
              tournament={tournament}
              locked={locked}
              isEditing={editingId === tournament.id}
              editStartsAt={editStartsAt}
              editEndsAt={editEndsAt}
              saving={saving}
              onEdit={() => {
                setEditingId(tournament.id);
                setEditStartsAt(
                  new Date(tournament.startsAt).toISOString().slice(0, 16)
                );
                setEditEndsAt(
                  new Date(tournament.endsAt).toISOString().slice(0, 16)
                );
              }}
              onSave={() => handleSave(tournament.id)}
              onCancel={() => setEditingId(null)}
              onEditStartsAtChange={setEditStartsAt}
              onEditEndsAtChange={setEditEndsAt}
            />
          );
        })}
        {tournaments.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            No tournaments found
          </p>
        )}
      </div>

      {/* Desktop table layout */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Starts At</TableHead>
              <TableHead>Ends At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Neutral Site</TableHead>
              <TableHead>Teams</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments.map((tournament) => {
              const locked = isTournamentLocked(new Date(tournament.startsAt));
              const isEditing = editingId === tournament.id;

              return (
                <TableRow key={tournament.id}>
                  <TableCell className="font-medium">
                    {tournament.name}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="datetime-local"
                        value={editStartsAt}
                        onChange={(e) => setEditStartsAt(e.target.value)}
                        className="w-60"
                      />
                    ) : (
                      new Date(tournament.startsAt).toLocaleString()
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="datetime-local"
                        value={editEndsAt}
                        onChange={(e) => setEditEndsAt(e.target.value)}
                        className="w-60"
                      />
                    ) : (
                      new Date(tournament.endsAt).toLocaleString()
                    )}
                  </TableCell>
                  <TableCell>
                    {locked ? (
                      <Badge variant="destructive">Locked</Badge>
                    ) : (
                      <Badge variant="secondary">Unlocked</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`neutral-${tournament.id}`}
                        checked={tournament.isNeutralSite}
                        onCheckedChange={() =>
                          handleToggleNeutralSite(tournament)
                        }
                      />
                      <Label
                        htmlFor={`neutral-${tournament.id}`}
                        className="text-sm"
                      >
                        {tournament.isNeutralSite ? "Yes" : "No"}
                      </Label>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/tournaments/${tournament.id}/teams`}
                      className="text-sm underline hover:text-primary"
                    >
                      Manage Teams
                    </Link>
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(tournament.id)}
                          disabled={saving}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(tournament.id);
                          setEditStartsAt(
                            new Date(tournament.startsAt)
                              .toISOString()
                              .slice(0, 16)
                          );
                          setEditEndsAt(
                            new Date(tournament.endsAt)
                              .toISOString()
                              .slice(0, 16)
                          );
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {tournaments.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No tournaments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
