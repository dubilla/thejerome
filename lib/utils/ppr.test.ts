import { describe, it, expect } from "vitest";
import { calculatePPR } from "./ppr";
import { createScore } from "./scoring";

const rounds = [
  { id: 1, order: 1, points: 0 },
  { id: 2, order: 2, points: 0 },
  { id: 5, order: 5, points: 2 },
  { id: 6, order: 6, points: 5 },
];

const neutralTournament = { id: 1, isNeutralSite: true };
const nonNeutralTournament = { id: 2, isNeutralSite: false };

describe("calculatePPR", () => {
  it("adds max round points for each active pick", () => {
    const teams = [{ id: 1, isEliminated: false, seed: 1, tournamentId: 1 }];
    const ppr = calculatePPR(createScore(0), [{ teamId: 1 }], teams, rounds, [neutralTournament]);
    expect(ppr).toBe(5); // current 0 + max 5
  });

  it("adds 7 for an active upset-eligible pick at neutral site", () => {
    const teams = [{ id: 1, isEliminated: false, seed: 3, tournamentId: 1 }];
    const ppr = calculatePPR(createScore(0), [{ teamId: 1 }], teams, rounds, [neutralTournament]);
    expect(ppr).toBe(7); // seed > 2 + neutral site → bonus eligible
  });

  it("does not add max for eliminated picks", () => {
    const teams = [{ id: 1, isEliminated: true, seed: 1, tournamentId: 1 }];
    const ppr = calculatePPR(createScore(2), [{ teamId: 1 }], teams, rounds, [neutralTournament]);
    expect(ppr).toBe(2); // no remaining points, just current score
  });

  it("includes current score in result", () => {
    const teams = [{ id: 1, isEliminated: false, seed: 1, tournamentId: 1 }];
    const ppr = calculatePPR(createScore(2), [{ teamId: 1 }], teams, rounds, [neutralTournament]);
    expect(ppr).toBe(7); // 2 current + 5 max
  });

  it("does not apply bonus at non-neutral site", () => {
    const teams = [{ id: 1, isEliminated: false, seed: 3, tournamentId: 2 }];
    const ppr = calculatePPR(createScore(0), [{ teamId: 1 }], teams, rounds, [nonNeutralTournament]);
    expect(ppr).toBe(5); // no bonus, just max round points
  });

  it("returns current score when there are no picks", () => {
    const ppr = calculatePPR(createScore(3), [], [], rounds);
    expect(ppr).toBe(3);
  });
});
