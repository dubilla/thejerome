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
      { id: 1, isEliminated: true, seed: null, tournamentId: 1 },
      { id: 2, isEliminated: true, seed: null, tournamentId: 1 },
    ];
    const picks = [{ teamId: 1 }, { teamId: 2 }];

    expect(calculatePPR(createScore(7), picks, teams, rounds)).toBe(7);
  });

  it("adds max round points for each non-eliminated team", () => {
    const teams = [
      { id: 1, isEliminated: false, seed: null, tournamentId: 1 },
      { id: 2, isEliminated: false, seed: null, tournamentId: 1 },
    ];
    const picks = [{ teamId: 1 }, { teamId: 2 }];

    // Each non-eliminated team could reach Champion (5 pts)
    // PPR = 0 + 5 + 5 = 10
    expect(calculatePPR(createScore(0), picks, teams, rounds)).toBe(10);
  });

  it("handles mix of eliminated and non-eliminated teams", () => {
    const teams = [
      { id: 1, isEliminated: false, seed: null, tournamentId: 1 },
      { id: 2, isEliminated: true, seed: null, tournamentId: 1 },
      { id: 3, isEliminated: false, seed: null, tournamentId: 1 },
    ];
    const picks = [{ teamId: 1 }, { teamId: 2 }, { teamId: 3 }];

    // PPR = 2 (current) + 5 (team 1) + 0 (team 2 eliminated) + 5 (team 3) = 12
    expect(calculatePPR(createScore(2), picks, teams, rounds)).toBe(12);
  });

  it("returns 0 when no picks and no score", () => {
    expect(calculatePPR(createScore(0), [], [], rounds)).toBe(0);
  });

  it("handles picks for teams not in the teams array", () => {
    const teams = [{ id: 1, isEliminated: false, seed: null, tournamentId: 1 }];
    const picks = [{ teamId: 1 }, { teamId: 999 }];

    // Only team 1 is found, team 999 is skipped
    expect(calculatePPR(createScore(0), picks, teams, rounds)).toBe(5);
  });

  it("uses 7 as max possible for bonus-eligible teams", () => {
    const teams = [
      { id: 1, isEliminated: false, seed: 5, tournamentId: 1 }, // Not top-2, neutral = max 7
      { id: 2, isEliminated: false, seed: 1, tournamentId: 1 }, // Top-2 seed = max 5
    ];
    const tournaments = [{ id: 1, isNeutralSite: true }];
    const picks = [{ teamId: 1 }, { teamId: 2 }];

    // PPR = 0 + 7 (team 1 eligible for bonus) + 5 (team 2 top seed) = 12
    expect(calculatePPR(createScore(0), picks, teams, rounds, tournaments)).toBe(12);
  });

  it("uses 5 as max when tournament is not neutral site", () => {
    const teams = [
      { id: 1, isEliminated: false, seed: 5, tournamentId: 1 },
      { id: 2, isEliminated: false, seed: 8, tournamentId: 1 },
    ];
    const tournaments = [{ id: 1, isNeutralSite: false }];
    const picks = [{ teamId: 1 }, { teamId: 2 }];

    // PPR = 0 + 5 + 5 = 10 (no bonus possible at non-neutral site)
    expect(calculatePPR(createScore(0), picks, teams, rounds, tournaments)).toBe(10);
  });

  it("uses 5 as max when seed is null even at neutral site", () => {
    const teams = [
      { id: 1, isEliminated: false, seed: null, tournamentId: 1 },
    ];
    const tournaments = [{ id: 1, isNeutralSite: true }];
    const picks = [{ teamId: 1 }];

    expect(calculatePPR(createScore(0), picks, teams, rounds, tournaments)).toBe(5);
  });
});
