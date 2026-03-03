import { describe, it, expect } from "vitest";
import { isTournamentLocked, getTournamentStatus } from "./tournament";

const past = new Date(Date.now() - 1000 * 60 * 60 * 24);    // 1 day ago
const future = new Date(Date.now() + 1000 * 60 * 60 * 24);  // 1 day from now
const farFuture = new Date(Date.now() + 1000 * 60 * 60 * 48); // 2 days from now

describe("isTournamentLocked", () => {
  it("returns true when startsAt is in the past", () => {
    expect(isTournamentLocked(past)).toBe(true);
  });

  it("returns false when startsAt is in the future", () => {
    expect(isTournamentLocked(future)).toBe(false);
  });
});

describe("getTournamentStatus", () => {
  it("returns 'upcoming' when start is in the future", () => {
    expect(getTournamentStatus(future, farFuture)).toBe("upcoming");
  });

  it("returns 'in-progress' when started but not yet ended", () => {
    expect(getTournamentStatus(past, future)).toBe("in-progress");
  });

  it("returns 'completed' when both start and end are in the past", () => {
    const earlierPast = new Date(Date.now() - 1000 * 60 * 60 * 48);
    expect(getTournamentStatus(earlierPast, past)).toBe("completed");
  });
});
