export type SeedUpdate = { teamId: number; seed: number | null };

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

export function validateBulkSeedUpdates(updates: unknown): ValidationResult {
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
    if (u.seed !== null) {
      if (typeof u.seed !== "number" || !Number.isInteger(u.seed) || u.seed < 1 || u.seed > 64)
        return { valid: false, error: `updates[${i}].seed must be integer 1-64 or null` };
    }
  }
  return { valid: true };
}
