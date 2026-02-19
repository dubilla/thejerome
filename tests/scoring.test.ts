import { describe, it, expect } from "vitest";
import {
  calculatePickScore,
  calculateEntryScore,
  createScore,
} from "@/lib/utils/scoring";

const rounds = [
  { id: 1, name: "Round 1", order: 1, points: 0 },
  { id: 2, name: "Round 2", order: 2, points: 0 },
  { id: 3, name: "Round 3", order: 3, points: 0 },
  { id: 4, name: "Round 4", order: 4, points: 0 },
  { id: 5, name: "Finals", order: 5, points: 2 },
  { id: 6, name: "Champion", order: 6, points: 5 },
];

describe("calculatePickScore", () => {
  it("returns 0 for early round teams", () => {
    expect(calculatePickScore({ roundId: 1, seed: null, tournamentId: 1 }, rounds)).toBe(0);
    expect(calculatePickScore({ roundId: 2, seed: null, tournamentId: 1 }, rounds)).toBe(0);
    expect(calculatePickScore({ roundId: 3, seed: null, tournamentId: 1 }, rounds)).toBe(0);
    expect(calculatePickScore({ roundId: 4, seed: null, tournamentId: 1 }, rounds)).toBe(0);
  });

  it("returns 2 for finals teams", () => {
    expect(calculatePickScore({ roundId: 5, seed: null, tournamentId: 1 }, rounds)).toBe(2);
  });

  it("returns 5 for champion teams", () => {
    expect(calculatePickScore({ roundId: 6, seed: null, tournamentId: 1 }, rounds)).toBe(5);
  });

  it("returns 0 for unknown round", () => {
    expect(calculatePickScore({ roundId: 99, seed: null, tournamentId: 1 }, rounds)).toBe(0);
  });

  it("returns 7 for champion team that is not top-2 seed at neutral site", () => {
    const tournaments = [{ id: 1, isNeutralSite: true }];
    expect(
      calculatePickScore({ roundId: 6, seed: 3, tournamentId: 1 }, rounds, tournaments)
    ).toBe(7);
  });

  it("returns 7 for champion team with high seed number at neutral site", () => {
    const tournaments = [{ id: 1, isNeutralSite: true }];
    expect(
      calculatePickScore({ roundId: 6, seed: 10, tournamentId: 1 }, rounds, tournaments)
    ).toBe(7);
  });

  it("returns 5 for champion team that is a top-2 seed at neutral site", () => {
    const tournaments = [{ id: 1, isNeutralSite: true }];
    expect(
      calculatePickScore({ roundId: 6, seed: 1, tournamentId: 1 }, rounds, tournaments)
    ).toBe(5);
    expect(
      calculatePickScore({ roundId: 6, seed: 2, tournamentId: 1 }, rounds, tournaments)
    ).toBe(5);
  });

  it("returns 5 for champion team not at neutral site regardless of seed", () => {
    const tournaments = [{ id: 1, isNeutralSite: false }];
    expect(
      calculatePickScore({ roundId: 6, seed: 5, tournamentId: 1 }, rounds, tournaments)
    ).toBe(5);
  });

  it("returns 5 for champion team with no seed set at neutral site", () => {
    const tournaments = [{ id: 1, isNeutralSite: true }];
    expect(
      calculatePickScore({ roundId: 6, seed: null, tournamentId: 1 }, rounds, tournaments)
    ).toBe(5);
  });

  it("returns 5 for champion team when no tournaments provided", () => {
    expect(
      calculatePickScore({ roundId: 6, seed: 5, tournamentId: 1 }, rounds)
    ).toBe(5);
  });

  it("does not apply +7 bonus to non-champion rounds", () => {
    const tournaments = [{ id: 1, isNeutralSite: true }];
    expect(
      calculatePickScore({ roundId: 5, seed: 5, tournamentId: 1 }, rounds, tournaments)
    ).toBe(2);
  });
});

describe("calculateEntryScore", () => {
  const teams = [
    { id: 1, roundId: 6, seed: null, tournamentId: 1 }, // Champion = 5
    { id: 2, roundId: 5, seed: null, tournamentId: 1 }, // Finals = 2
    { id: 3, roundId: 1, seed: null, tournamentId: 1 }, // Round 1 = 0
    { id: 4, roundId: 3, seed: null, tournamentId: 1 }, // Round 3 = 0
  ];

  it("calculates total score across all picks", () => {
    const picks = [{ teamId: 1 }, { teamId: 2 }, { teamId: 3 }];
    expect(calculateEntryScore(picks, teams, rounds)).toBe(7); // 5 + 2 + 0
  });

  it("returns 0 when no picks", () => {
    expect(calculateEntryScore([], teams, rounds)).toBe(0);
  });

  it("returns 0 when all picks are early rounds", () => {
    const picks = [{ teamId: 3 }, { teamId: 4 }];
    expect(calculateEntryScore(picks, teams, rounds)).toBe(0);
  });

  it("handles picks for non-existent teams gracefully", () => {
    const picks = [{ teamId: 1 }, { teamId: 999 }];
    expect(calculateEntryScore(picks, teams, rounds)).toBe(5);
  });

  it("correctly sums multiple champion picks", () => {
    const multiChampionTeams = [
      { id: 1, roundId: 6, seed: null, tournamentId: 1 },
      { id: 2, roundId: 6, seed: null, tournamentId: 2 },
    ];
    const picks = [{ teamId: 1 }, { teamId: 2 }];
    expect(calculateEntryScore(picks, multiChampionTeams, rounds)).toBe(10);
  });

  it("applies +7 bonus in entry score calculation", () => {
    const bonusTeams = [
      { id: 1, roundId: 6, seed: 5, tournamentId: 1 }, // Champion, seed 5, neutral = 7
      { id: 2, roundId: 6, seed: 1, tournamentId: 1 }, // Champion, seed 1, neutral = 5
      { id: 3, roundId: 5, seed: 3, tournamentId: 1 }, // Finals = 2
    ];
    const tournaments = [{ id: 1, isNeutralSite: true }];
    const picks = [{ teamId: 1 }, { teamId: 2 }, { teamId: 3 }];
    expect(calculateEntryScore(picks, bonusTeams, rounds, tournaments)).toBe(14); // 7 + 5 + 2
  });
});
