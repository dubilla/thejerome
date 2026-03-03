import { describe, it, expect } from "vitest";
import { calculatePickScore, calculateEntryScore } from "./scoring";

const rounds = [
  { id: 1, order: 1, points: 0 },  // Round 1
  { id: 2, order: 2, points: 0 },  // Round 2
  { id: 3, order: 3, points: 0 },  // Round 3
  { id: 4, order: 4, points: 0 },  // Round 4
  { id: 5, order: 5, points: 2 },  // Finals
  { id: 6, order: 6, points: 5 },  // Champion
];

const neutralTournament = { id: 1, isNeutralSite: true };
const nonNeutralTournament = { id: 2, isNeutralSite: false };

describe("calculatePickScore", () => {
  it("returns 0 for teams that did not reach a scoring round", () => {
    const team = { roundId: 1, seed: 1, tournamentId: 1 };
    expect(calculatePickScore(team, rounds, [neutralTournament])).toBe(0);
  });

  it("returns 2 for a finalist", () => {
    const team = { roundId: 5, seed: 1, tournamentId: 1 };
    expect(calculatePickScore(team, rounds, [neutralTournament])).toBe(2);
  });

  it("returns 5 for a champion (top-2 seed, neutral site)", () => {
    const team = { roundId: 6, seed: 1, tournamentId: 1 };
    expect(calculatePickScore(team, rounds, [neutralTournament])).toBe(5);
  });

  it("returns 7 for an upset champion (seed > 2, neutral site)", () => {
    const team = { roundId: 6, seed: 3, tournamentId: 1 };
    expect(calculatePickScore(team, rounds, [neutralTournament])).toBe(7);
  });

  it("returns 5 (no bonus) for upset champion at non-neutral site", () => {
    const team = { roundId: 6, seed: 3, tournamentId: 2 };
    expect(calculatePickScore(team, rounds, [nonNeutralTournament])).toBe(5);
  });

  it("returns 5 (no bonus) for upset champion with no tournaments passed", () => {
    const team = { roundId: 6, seed: 3, tournamentId: 1 };
    expect(calculatePickScore(team, rounds)).toBe(5);
  });

  it("returns 0 for unknown round", () => {
    const team = { roundId: 999, seed: 1, tournamentId: 1 };
    expect(calculatePickScore(team, rounds, [neutralTournament])).toBe(0);
  });
});

describe("calculateEntryScore", () => {
  const teams = [
    { id: 1, roundId: 6, seed: 1, tournamentId: 1 },  // champion, top seed → 5
    { id: 2, roundId: 5, seed: 4, tournamentId: 1 },  // finalist → 2
    { id: 3, roundId: 1, seed: 8, tournamentId: 1 },  // first round out → 0
  ];

  it("sums scores across all picks", () => {
    const picks = [{ teamId: 1 }, { teamId: 2 }, { teamId: 3 }];
    expect(calculateEntryScore(picks, teams, rounds, [neutralTournament])).toBe(7);
  });

  it("returns 0 for no picks", () => {
    expect(calculateEntryScore([], teams, rounds, [neutralTournament])).toBe(0);
  });

  it("skips picks for unknown teams", () => {
    const picks = [{ teamId: 999 }];
    expect(calculateEntryScore(picks, teams, rounds, [neutralTournament])).toBe(0);
  });

  it("counts the bonus for an upset champion", () => {
    const upsetTeams = [{ id: 1, roundId: 6, seed: 5, tournamentId: 1 }];
    const picks = [{ teamId: 1 }];
    expect(calculateEntryScore(picks, upsetTeams, rounds, [neutralTournament])).toBe(7);
  });
});
