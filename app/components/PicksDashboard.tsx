"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PicksDashboardData,
  TournamentData,
  PickEntry,
  DesktopGrid,
  MobileGrid,
  StatusBadge,
  formatDateET,
} from "./PicksGrid";

// ─── Tournament Section ───────────────────────────────────────────────────────

function TournamentSection({
  tournament,
  entries,
  myEntryId,
}: {
  tournament: TournamentData;
  entries: PickEntry[];
  myEntryId: number | null;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/tournaments/${tournament.id}`}
          className="font-display text-lg tracking-wide text-secondary hover:underline"
        >
          {tournament.name}
        </Link>
        <span className="text-sm text-muted-foreground">
          {formatDateET(tournament.startsAt)}
        </span>
        <StatusBadge status={tournament.status} />
      </div>

      <div className="hidden md:block">
        <DesktopGrid
          tournament={tournament}
          entries={entries}
          myEntryId={myEntryId}
        />
      </div>

      <div className="md:hidden">
        <MobileGrid
          tournament={tournament}
          entries={entries}
          myEntryId={myEntryId}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PicksDashboard() {
  const [data, setData] = useState<PicksDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/picks")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load picks");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(String(err));
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-muted-foreground">Loading picks...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-destructive">Failed to load picks dashboard.</p>
      </div>
    );
  }

  if (data.tournaments.length === 0) {
    return (
      <div className="flex justify-center py-16 text-center">
        <div className="space-y-2">
          <p className="text-lg font-medium text-muted-foreground">
            No tournaments are locked yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Check back once games begin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {data.tournaments.map((tournament) => (
        <TournamentSection
          key={tournament.id}
          tournament={tournament}
          entries={data.entries}
          myEntryId={data.myEntryId}
        />
      ))}
    </div>
  );
}
