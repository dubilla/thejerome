import type { Team, Round } from "@/lib/db/schema";

export type Score = number & { readonly __brand: "Score" };

export function createScore(value: number): Score {
  return value as Score;
}

export function calculatePickScore(
  team: Pick<Team, "roundId">,
  rounds: Pick<Round, "id" | "points">[]
): Score {
  const round = rounds.find((r) => r.id === team.roundId);
  if (!round) return createScore(0);
  return createScore(round.points);
}

export function calculateEntryScore(
  picks: Array<{ teamId: number }>,
  teams: Array<Pick<Team, "id" | "roundId">>,
  rounds: Array<Pick<Round, "id" | "points">>
): Score {
  let total = 0;
  for (const pick of picks) {
    const team = teams.find((t) => t.id === pick.teamId);
    if (!team) continue;
    total += calculatePickScore(team, rounds);
  }
  return createScore(total);
}
