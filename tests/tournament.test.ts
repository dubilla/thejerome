import { describe, it, expect } from "vitest";
import {
  isTournamentLocked,
  groupTournamentsByLockStatus,
  validateCreateTournamentInput,
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

describe("validateCreateTournamentInput", () => {
  const valid = {
    name: "Frozen Four",
    startsAt: "2099-04-10T12:00",
    endsAt: "2099-04-12T18:00",
    isNeutralSite: false,
  };

  it("returns ok with parsed data for valid input", () => {
    const result = validateCreateTournamentInput(valid);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Frozen Four");
      expect(result.data.startsAt).toBeInstanceOf(Date);
      expect(result.data.endsAt).toBeInstanceOf(Date);
      expect(result.data.isNeutralSite).toBe(false);
    }
  });

  it("trims whitespace from name", () => {
    const result = validateCreateTournamentInput({ ...valid, name: "  Frozen Four  " });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Frozen Four");
    }
  });

  it("sets isNeutralSite to true when passed true", () => {
    const result = validateCreateTournamentInput({ ...valid, isNeutralSite: true });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.isNeutralSite).toBe(true);
    }
  });

  it("defaults isNeutralSite to false for non-true values", () => {
    for (const val of [undefined, null, "true", 1]) {
      const result = validateCreateTournamentInput({ ...valid, isNeutralSite: val });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.isNeutralSite).toBe(false);
      }
    }
  });

  it("fails when name is missing", () => {
    const result = validateCreateTournamentInput({ ...valid, name: undefined });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Name is required");
  });

  it("fails when name is empty string", () => {
    const result = validateCreateTournamentInput({ ...valid, name: "   " });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Name is required");
  });

  it("fails when name is not a string", () => {
    const result = validateCreateTournamentInput({ ...valid, name: 42 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Name is required");
  });

  it("fails when startsAt is missing", () => {
    const result = validateCreateTournamentInput({ ...valid, startsAt: undefined });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("startsAt is required");
  });

  it("fails when startsAt is not a string", () => {
    const result = validateCreateTournamentInput({ ...valid, startsAt: 12345 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("startsAt is required");
  });

  it("fails when startsAt is an invalid date string", () => {
    const result = validateCreateTournamentInput({ ...valid, startsAt: "not-a-date" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("startsAt is not a valid date");
  });

  it("fails when endsAt is missing", () => {
    const result = validateCreateTournamentInput({ ...valid, endsAt: undefined });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("endsAt is required");
  });

  it("fails when endsAt is an invalid date string", () => {
    const result = validateCreateTournamentInput({ ...valid, endsAt: "bad-date" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("endsAt is not a valid date");
  });

  it("fails when endsAt is before startsAt", () => {
    const result = validateCreateTournamentInput({
      ...valid,
      startsAt: "2099-04-12T18:00",
      endsAt: "2099-04-10T12:00",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("endsAt must be after startsAt");
  });

  it("fails when endsAt equals startsAt", () => {
    const result = validateCreateTournamentInput({
      ...valid,
      startsAt: "2099-04-10T12:00",
      endsAt: "2099-04-10T12:00",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("endsAt must be after startsAt");
  });
});
