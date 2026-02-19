import type { Team, Round, Tournament } from "@/lib/db/schema";
import { createScore, type Score } from "./scoring";

export type PPR = number & { readonly __brand: "PPR" };

export function createPPR(value: number): PPR {
  return value as PPR;
}

/**
 * Calculate Points Possible Remaining for an entry.
 * PPR = current score + max possible points from non-eliminated picked teams.
 * Teams eligible for the +7 bonus (not top-2 seed + neutral site) have a max of 7.
 */
export function calculatePPR(
  currentScore: Score,
  picks: Array<{ teamId: number }>,
  teams: Array<Pick<Team, "id" | "isEliminated" | "seed" | "tournamentId">>,
  rounds: Array<Pick<Round, "id" | "points" | "order">>,
  tournaments?: Array<Pick<Tournament, "id" | "isNeutralSite">>
): PPR {
  const maxRound = rounds.reduce(
    (max, r) => (r.points > max.points ? r : max),
    rounds[0]
  );

  let maxRemaining = 0;
  for (const pick of picks) {
    const team = teams.find((t) => t.id === pick.teamId);
    if (!team || team.isEliminated) continue;

    // Check if this team could earn the +7 bonus
    const tournament = tournaments?.find((t) => t.id === team.tournamentId);
    const canGetBonus =
      team.seed != null &&
      team.seed > 2 &&
      tournament?.isNeutralSite === true;

    maxRemaining += canGetBonus ? 7 : maxRound.points;
  }

  return createPPR(currentScore + maxRemaining);
}
