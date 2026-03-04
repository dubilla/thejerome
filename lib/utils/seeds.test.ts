import { describe, it, expect } from "vitest";
import { validateBulkSeedUpdates } from "./seeds";

describe("validateBulkSeedUpdates", () => {
  it("accepts valid updates", () => {
    const result = validateBulkSeedUpdates([
      { teamId: 1, seed: 1 },
      { teamId: 2, seed: 16 },
      { teamId: 3, seed: 64 },
    ]);
    expect(result).toEqual({ valid: true });
  });

  it("accepts empty array", () => {
    expect(validateBulkSeedUpdates([])).toEqual({ valid: true });
  });

  it("rejects non-array input", () => {
    const result = validateBulkSeedUpdates({ teamId: 1, seed: 1 });
    expect(result).toEqual({ valid: false, error: "updates must be an array" });
  });

  it("rejects array exceeding 500 items", () => {
    const updates = Array.from({ length: 501 }, (_, i) => ({ teamId: i + 1, seed: 1 }));
    const result = validateBulkSeedUpdates(updates);
    expect(result).toEqual({ valid: false, error: "max 500 updates per request" });
  });

  it("rejects missing teamId", () => {
    const result = validateBulkSeedUpdates([{ seed: 1 }]);
    expect(result).toMatchObject({ valid: false });
    expect((result as { valid: false; error: string }).error).toContain("teamId");
  });

  it("rejects non-integer teamId", () => {
    const result = validateBulkSeedUpdates([{ teamId: 1.5, seed: 1 }]);
    expect(result).toMatchObject({ valid: false });
    expect((result as { valid: false; error: string }).error).toContain("teamId");
  });

  it("rejects duplicate teamIds", () => {
    const result = validateBulkSeedUpdates([
      { teamId: 1, seed: 1 },
      { teamId: 1, seed: 2 },
    ]);
    expect(result).toEqual({ valid: false, error: "duplicate teamId 1" });
  });

  it("rejects seed of 0", () => {
    const result = validateBulkSeedUpdates([{ teamId: 1, seed: 0 }]);
    expect(result).toMatchObject({ valid: false });
    expect((result as { valid: false; error: string }).error).toContain("seed");
  });

  it("rejects seed of 65", () => {
    const result = validateBulkSeedUpdates([{ teamId: 1, seed: 65 }]);
    expect(result).toMatchObject({ valid: false });
    expect((result as { valid: false; error: string }).error).toContain("seed");
  });

  it("rejects non-integer seed", () => {
    const result = validateBulkSeedUpdates([{ teamId: 1, seed: 1.5 }]);
    expect(result).toMatchObject({ valid: false });
    expect((result as { valid: false; error: string }).error).toContain("seed");
  });

  it("accepts null seed (clearing a seed)", () => {
    const result = validateBulkSeedUpdates([{ teamId: 1, seed: null }]);
    expect(result).toEqual({ valid: true });
  });
});
