import type { Team, Round, Tournament } from "@/lib/db/schema";

export type Score = number & { readonly __brand: "Score" };

export function createScore(value: number): Score {
  return value as Score;
}

export function calculatePickScore(
  team: Pick<Team, "roundId" | "seed" | "tournamentId">,
  rounds: Pick<Round, "id" | "points">[],
  tournaments?: Array<Pick<Tournament, "id" | "isNeutralSite">>
): Score {
  const round = rounds.find((r) => r.id === team.roundId);
  if (!round) return createScore(0);

  const baseScore = round.points;

  // +7 bonus: team won championship + not a top-2 seed + neutral site tournament
  const championRound = rounds.reduce(
    (max, r) => (r.points > max.points ? r : max),
    rounds[0]
  );
  if (
    round.id === championRound.id &&
    championRound.points > 0 &&
    team.seed != null &&
    team.seed > 2
  ) {
    const tournament = tournaments?.find((t) => t.id === team.tournamentId);
    if (tournament?.isNeutralSite) {
      return createScore(7);
    }
  }

  return createScore(baseScore);
}

export function calculateEntryScore(
  picks: Array<{ teamId: number }>,
  teams: Array<Pick<Team, "id" | "roundId" | "seed" | "tournamentId">>,
  rounds: Array<Pick<Round, "id" | "points">>,
  tournaments?: Array<Pick<Tournament, "id" | "isNeutralSite">>
): Score {
  let total = 0;
  for (const pick of picks) {
    const team = teams.find((t) => t.id === pick.teamId);
    if (!team) continue;
    total += calculatePickScore(team, rounds, tournaments);
  }
  return createScore(total);
}
