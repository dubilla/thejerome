"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  yearId: number;
};

export default function AdminTournamentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStartsAt, setEditStartsAt] = useState("");
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin: Tournaments</h1>
        <Link href="/admin/tournaments">
          <Badge variant="outline">Admin</Badge>
        </Link>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Starts At</TableHead>
            <TableHead>Status</TableHead>
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
                  {locked ? (
                    <Badge variant="destructive">Locked</Badge>
                  ) : (
                    <Badge variant="secondary">Unlocked</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/tournaments/${tournament.id}`}
                    className="text-sm underline hover:text-primary"
                  >
                    View
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
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                No tournaments found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
