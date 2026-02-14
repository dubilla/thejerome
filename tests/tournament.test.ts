import { describe, it, expect } from "vitest";
import {
  isTournamentLocked,
  groupTournamentsByLockStatus,
} from "@/lib/utils/tournament";

describe("isTournamentLocked", () => {
  it("returns true when startsAt is in the past", () => {
    const pastDate = new Date("2020-01-01");
    expect(isTournamentLocked(pastDate)).toBe(true);
  });

  it("returns false when startsAt is in the future", () => {
    const futureDate = new Date("2099-01-01");
    expect(isTournamentLocked(futureDate)).toBe(false);
  });
});

describe("groupTournamentsByLockStatus", () => {
  it("correctly groups tournaments by lock status", () => {
    const tournaments = [
      { id: 1, name: "Past", startsAt: new Date("2020-01-01") },
      { id: 2, name: "Future", startsAt: new Date("2099-01-01") },
      { id: 3, name: "Also Past", startsAt: new Date("2021-06-15") },
    ];

    const result = groupTournamentsByLockStatus(tournaments);

    expect(result.locked).toHaveLength(2);
    expect(result.unlocked).toHaveLength(1);
    expect(result.locked.map((t) => t.id)).toEqual([1, 3]);
    expect(result.unlocked.map((t) => t.id)).toEqual([2]);
  });

  it("returns empty arrays when no tournaments", () => {
    const result = groupTournamentsByLockStatus([]);
    expect(result.locked).toHaveLength(0);
    expect(result.unlocked).toHaveLength(0);
  });

  it("handles all locked tournaments", () => {
    const tournaments = [
      { id: 1, name: "A", startsAt: new Date("2020-01-01") },
      { id: 2, name: "B", startsAt: new Date("2021-01-01") },
    ];

    const result = groupTournamentsByLockStatus(tournaments);
    expect(result.locked).toHaveLength(2);
    expect(result.unlocked).toHaveLength(0);
  });

  it("handles all unlocked tournaments", () => {
    const tournaments = [
      { id: 1, name: "A", startsAt: new Date("2099-01-01") },
      { id: 2, name: "B", startsAt: new Date("2099-06-01") },
    ];

    const result = groupTournamentsByLockStatus(tournaments);
    expect(result.locked).toHaveLength(0);
    expect(result.unlocked).toHaveLength(2);
  });
});
