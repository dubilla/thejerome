import { describe, it, expect } from "vitest";
import { validateBulkResultUpdates } from "./results";

describe("validateBulkResultUpdates", () => {
  it("accepts roundId only", () => {
    expect(validateBulkResultUpdates([{ teamId: 1, roundId: 6 }])).toEqual({ valid: true });
  });

  it("accepts isEliminated only", () => {
    expect(validateBulkResultUpdates([{ teamId: 1, isEliminated: true }])).toEqual({ valid: true });
  });

  it("accepts both roundId and isEliminated", () => {
    expect(validateBulkResultUpdates([{ teamId: 1, roundId: 5, isEliminated: false }])).toEqual({ valid: true });
  });

  it("accepts empty array", () => {
    expect(validateBulkResultUpdates([])).toEqual({ valid: true });
  });

  it("rejects non-array input", () => {
    expect(validateBulkResultUpdates({ teamId: 1, roundId: 1 })).toEqual({
      valid: false,
      error: "updates must be an array",
    });
  });

  it("rejects array exceeding 500 items", () => {
    const updates = Array.from({ length: 501 }, (_, i) => ({ teamId: i + 1, roundId: 1 }));
    expect(validateBulkResultUpdates(updates)).toEqual({
      valid: false,
      error: "max 500 updates per request",
    });
  });

  it("rejects missing teamId", () => {
    const result = validateBulkResultUpdates([{ roundId: 1 }]);
    expect(result).toMatchObject({ valid: false });
    expect((result as { valid: false; error: string }).error).toContain("teamId");
  });

  it("rejects non-integer teamId", () => {
    const result = validateBulkResultUpdates([{ teamId: 1.5, roundId: 1 }]);
    expect(result).toMatchObject({ valid: false });
    expect((result as { valid: false; error: string }).error).toContain("teamId");
  });

  it("rejects duplicate teamIds", () => {
    const result = validateBulkResultUpdates([
      { teamId: 1, roundId: 5 },
      { teamId: 1, isEliminated: true },
    ]);
    expect(result).toEqual({ valid: false, error: "duplicate teamId 1" });
  });

  it("rejects update with neither roundId nor isEliminated", () => {
    const result = validateBulkResultUpdates([{ teamId: 1 }]);
    expect(result).toMatchObject({ valid: false });
    expect((result as { valid: false; error: string }).error).toContain("roundId or isEliminated");
  });

  it("rejects non-integer roundId", () => {
    const result = validateBulkResultUpdates([{ teamId: 1, roundId: 1.5 }]);
    expect(result).toMatchObject({ valid: false });
    expect((result as { valid: false; error: string }).error).toContain("roundId");
  });

  it("rejects roundId of 0", () => {
    const result = validateBulkResultUpdates([{ teamId: 1, roundId: 0 }]);
    expect(result).toMatchObject({ valid: false });
    expect((result as { valid: false; error: string }).error).toContain("roundId");
  });

  it("rejects non-boolean isEliminated", () => {
    const result = validateBulkResultUpdates([{ teamId: 1, isEliminated: 1 }]);
    expect(result).toMatchObject({ valid: false });
    expect((result as { valid: false; error: string }).error).toContain("isEliminated");
  });
});
