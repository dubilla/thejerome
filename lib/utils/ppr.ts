import type { Team, Round } from "@/lib/db/schema";
import { createScore, type Score } from "./scoring";

export type PPR = number & { readonly __brand: "PPR" };

export function createPPR(value: number): PPR {
  return value as PPR;
}

/**
 * Calculate Points Possible Remaining for an entry.
 * PPR = current score + max possible points from non-eliminated picked teams.
 */
export function calculatePPR(
  currentScore: Score,
  picks: Array<{ teamId: number }>,
  teams: Array<Pick<Team, "id" | "isEliminated">>,
  rounds: Array<Pick<Round, "id" | "points" | "order">>
): PPR {
  const maxRound = rounds.reduce(
    (max, r) => (r.points > max.points ? r : max),
    rounds[0]
  );

  let maxRemaining = 0;
  for (const pick of picks) {
    const team = teams.find((t) => t.id === pick.teamId);
    if (!team || team.isEliminated) continue;
    // Non-eliminated team could still reach the highest-scoring round
    maxRemaining += maxRound.points;
  }

  return createPPR(currentScore + maxRemaining);
}
