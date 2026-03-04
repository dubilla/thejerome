"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  PicksDashboardData,
  TournamentData,
  DesktopGrid,
  MobileGrid,
  StatusBadge,
  formatDateET,
} from "@/app/components/PicksGrid";

export default function TournamentDetailPage() {
  const params = useParams();
  const tournamentId = parseInt(params.id as string);

  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [bracketUrl, setBracketUrl] = useState<string | null>(null);
  const [picksData, setPicksData] = useState<PicksDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [tournamentsRes, picksRes] = await Promise.all([
        fetch("/api/tournaments"),
        fetch("/api/picks"),
      ]);

      if (!tournamentsRes.ok) throw new Error("Failed to fetch tournaments");

      const tournamentsData = await tournamentsRes.json();
      const found = (tournamentsData.tournaments || []).find(
        (t: { id: number; locked: boolean }) => t.id === tournamentId
      );

      if (!found) {
        setError("Tournament not found");
        return;
      }

      if (!found.locked) {
        setError("Tournament hasn't started yet");
        return;
      }

      setBracketUrl(found.bracketUrl || null);

      if (!picksRes.ok) throw new Error("Failed to fetch picks");

      const picks: PicksDashboardData = await picksRes.json();
      setPicksData(picks);

      const tournamentPicks = picks.tournaments.find(
        (t) => t.id === tournamentId
      );

      if (tournamentPicks) {
        setTournament(tournamentPicks);
      } else {
        // Tournament is locked but has no picks data — show minimal info
        setTournament({
          id: found.id,
          name: found.name,
          startsAt: found.startsAt,
          endsAt: found.endsAt,
          isNeutralSite: found.isNeutralSite,
          status: "in-progress",
          picks: [],
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold md:text-2xl">{tournament.name}</h1>
        <span className="text-sm text-muted-foreground">
          {formatDateET(tournament.startsAt)}
        </span>
        <StatusBadge status={tournament.status} />
        {bracketUrl && (
          <a
            href={bracketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Bracket
          </a>
        )}
      </div>

      {/* Picks grid */}
      {picksData && picksData.entries.length > 0 ? (
        <>
          <div className="hidden md:block">
            <DesktopGrid
              tournament={tournament}
              entries={picksData.entries}
              myEntryId={picksData.myEntryId}
            />
          </div>
          <div className="md:hidden">
            <MobileGrid
              tournament={tournament}
              entries={picksData.entries}
              myEntryId={picksData.myEntryId}
            />
          </div>
        </>
      ) : (
        <p className="text-muted-foreground py-8 text-center">
          No picks to display.
        </p>
      )}
    </div>
  );
}
