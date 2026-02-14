import { describe, it, expect } from "vitest";
import { calculatePPR } from "@/lib/utils/ppr";
import { createScore } from "@/lib/utils/scoring";

const rounds = [
  { id: 1, name: "Round 1", order: 1, points: 0 },
  { id: 2, name: "Round 2", order: 2, points: 0 },
  { id: 5, name: "Finals", order: 5, points: 2 },
  { id: 6, name: "Champion", order: 6, points: 5 },
];

describe("calculatePPR", () => {
  it("returns current score when all teams are eliminated", () => {
    const teams = [
      { id: 1, isEliminated: true },
      { id: 2, isEliminated: true },
    ];
    const picks = [{ teamId: 1 }, { teamId: 2 }];

    expect(calculatePPR(createScore(7), picks, teams, rounds)).toBe(7);
  });

  it("adds max round points for each non-eliminated team", () => {
    const teams = [
      { id: 1, isEliminated: false },
      { id: 2, isEliminated: false },
    ];
    const picks = [{ teamId: 1 }, { teamId: 2 }];

    // Each non-eliminated team could reach Champion (5 pts)
    // PPR = 0 + 5 + 5 = 10
    expect(calculatePPR(createScore(0), picks, teams, rounds)).toBe(10);
  });

  it("handles mix of eliminated and non-eliminated teams", () => {
    const teams = [
      { id: 1, isEliminated: false },
      { id: 2, isEliminated: true },
      { id: 3, isEliminated: false },
    ];
    const picks = [{ teamId: 1 }, { teamId: 2 }, { teamId: 3 }];

    // PPR = 2 (current) + 5 (team 1) + 0 (team 2 eliminated) + 5 (team 3) = 12
    expect(calculatePPR(createScore(2), picks, teams, rounds)).toBe(12);
  });

  it("returns 0 when no picks and no score", () => {
    expect(calculatePPR(createScore(0), [], [], rounds)).toBe(0);
  });

  it("handles picks for teams not in the teams array", () => {
    const teams = [{ id: 1, isEliminated: false }];
    const picks = [{ teamId: 1 }, { teamId: 999 }];

    // Only team 1 is found, team 999 is skipped
    expect(calculatePPR(createScore(0), picks, teams, rounds)).toBe(5);
  });
});
