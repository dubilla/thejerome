export type ResultUpdate = {
  teamId: number;
  roundId?: number;
  isEliminated?: boolean;
};

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

export function validateBulkResultUpdates(updates: unknown): ValidationResult {
  if (!Array.isArray(updates)) return { valid: false, error: "updates must be an array" };
  if (updates.length === 0) return { valid: true };
  if (updates.length > 500) return { valid: false, error: "max 500 updates per request" };

  const seenIds = new Set<number>();
  for (let i = 0; i < updates.length; i++) {
    const u = updates[i];
    if (typeof u.teamId !== "number" || !Number.isInteger(u.teamId) || u.teamId < 1)
      return { valid: false, error: `updates[${i}].teamId must be a positive integer` };
    if (seenIds.has(u.teamId))
      return { valid: false, error: `duplicate teamId ${u.teamId}` };
    seenIds.add(u.teamId);

    const hasRoundId = u.roundId !== undefined;
    const hasEliminated = u.isEliminated !== undefined;
    if (!hasRoundId && !hasEliminated)
      return { valid: false, error: `updates[${i}] must include roundId or isEliminated` };

    if (hasRoundId) {
      if (typeof u.roundId !== "number" || !Number.isInteger(u.roundId) || u.roundId < 1)
        return { valid: false, error: `updates[${i}].roundId must be a positive integer` };
    }
    if (hasEliminated) {
      if (typeof u.isEliminated !== "boolean")
        return { valid: false, error: `updates[${i}].isEliminated must be a boolean` };
    }
  }
  return { valid: true };
}
