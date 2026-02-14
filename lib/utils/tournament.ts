import type { Tournament } from "@/lib/db/schema";

export function isTournamentLocked(startsAt: Date): boolean {
  return startsAt < new Date();
}

export function groupTournamentsByLockStatus<
  T extends Pick<Tournament, "startsAt">,
>(tournaments: T[]): { locked: T[]; unlocked: T[] } {
  const locked: T[] = [];
  const unlocked: T[] = [];

  for (const tournament of tournaments) {
    if (isTournamentLocked(tournament.startsAt)) {
      locked.push(tournament);
    } else {
      unlocked.push(tournament);
    }
  }

  return { locked, unlocked };
}
