import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PickEntry = {
  id: number;
  name: string;
  userEmail: string;
  rank: number;
  score: number;
  ppr: number;
};

export type TournamentPick = {
  entryId: number;
  teamId: number;
  teamName: string;
  teamSeed: number | null;
  teamIsEliminated: boolean;
  score: number;
  isMyPick: boolean;
};

export type TournamentData = {
  id: number;
  name: string;
  startsAt: string;
  endsAt: string;
  isNeutralSite: boolean;
  status: "in-progress" | "completed";
  picks: TournamentPick[];
};

export type PicksDashboardData = {
  myEntryId: number | null;
  entries: PickEntry[];
  tournaments: TournamentData[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatDateET(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function StatusBadge({ status }: { status: "in-progress" | "completed" }) {
  if (status === "in-progress") {
    return (
      <Badge className="bg-green-600 text-white text-xs uppercase tracking-wide">
        In Progress
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs uppercase tracking-wide">
      Final
    </Badge>
  );
}

// ─── TeamCell ────────────────────────────────────────────────────────────────

export function TeamCell({ pick }: { pick: TournamentPick | undefined }) {
  if (!pick) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  const seedLabel = pick.teamSeed != null ? `(${pick.teamSeed})` : "";

  if (pick.teamIsEliminated) {
    return (
      <div className="space-y-0.5">
        <div className="flex items-center gap-1">
          <span className="text-destructive font-semibold text-sm">×</span>
          <span className="line-through text-muted-foreground text-sm">
            {pick.teamName} {seedLabel}
          </span>
        </div>
        <div className="scoreboard-number text-xs text-muted-foreground">
          {pick.score} pts
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
        <span className="text-sm font-medium">
          {pick.teamName} {seedLabel}
        </span>
      </div>
      <div className="scoreboard-number text-xs text-muted-foreground">
        {pick.score} pts
      </div>
    </div>
  );
}

// ─── Desktop Table ────────────────────────────────────────────────────────────

export function DesktopGrid({
  tournament,
  entries,
  myEntryId,
}: {
  tournament: TournamentData;
  entries: PickEntry[];
  myEntryId: number | null;
}) {
  const sortedEntries = [...entries].sort((a, b) => a.rank - b.rank);
  const pickByEntry = new Map(tournament.picks.map((p) => [p.entryId, p]));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-background border border-border px-3 py-2 text-left font-semibold text-muted-foreground min-w-[100px]">
              Entry
            </th>
            {sortedEntries.map((entry) => (
              <th
                key={entry.id}
                className={`border border-border px-3 py-2 text-center font-semibold min-w-[140px] ${
                  entry.id === myEntryId
                    ? "bg-primary/5 border-l-2 border-l-primary"
                    : ""
                }`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs text-muted-foreground">
                    #{entry.rank}
                  </span>
                  <span className="truncate max-w-[120px]">{entry.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="sticky left-0 z-10 bg-background border border-border px-3 py-2 font-medium text-muted-foreground">
              Pick
            </td>
            {sortedEntries.map((entry) => (
              <td
                key={entry.id}
                className={`border border-border px-3 py-2 ${
                  entry.id === myEntryId
                    ? "bg-primary/5 border-l-2 border-l-primary"
                    : ""
                }`}
              >
                <TeamCell pick={pickByEntry.get(entry.id)} />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Mobile Stacked ───────────────────────────────────────────────────────────

export function MobileGrid({
  tournament,
  entries,
  myEntryId,
}: {
  tournament: TournamentData;
  entries: PickEntry[];
  myEntryId: number | null;
}) {
  const sortedEntries = [...entries].sort((a, b) => a.rank - b.rank);
  const pickByEntry = new Map(tournament.picks.map((p) => [p.entryId, p]));

  return (
    <div className="space-y-2">
      {sortedEntries.map((entry) => {
        const pick = pickByEntry.get(entry.id);
        const isMe = entry.id === myEntryId;

        return (
          <div
            key={entry.id}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
              isMe ? "border-primary bg-primary/5 border-l-4" : "border-border"
            }`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-bold">
              #{entry.rank}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate text-sm">{entry.name}</div>
              {pick && <TeamCell pick={pick} />}
            </div>
            {pick && (
              <div className="text-right shrink-0">
                <div className="scoreboard-number text-sm font-semibold">
                  {pick.score}
                </div>
                <div className="text-xs text-muted-foreground">pts</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
