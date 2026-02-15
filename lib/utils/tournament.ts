import type { Tournament } from "@/lib/db/schema";

export type TournamentStatus = "in-progress" | "upcoming" | "completed";

export function isTournamentLocked(startsAt: Date): boolean {
  return startsAt < new Date();
}

export function getTournamentStatus(
  startsAt: Date,
  endsAt: Date
): TournamentStatus {
  const now = new Date();
  if (now < startsAt) {
    return "upcoming";
  } else if (now >= endsAt) {
    return "completed";
  } else {
    return "in-progress";
  }
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

export function sortTournamentsByStatusAndStartDate<
  T extends Pick<Tournament, "startsAt" | "endsAt">,
>(tournaments: T[]): T[] {
  const statusOrder: Record<TournamentStatus, number> = {
    "in-progress": 0,
    upcoming: 1,
    completed: 2,
  };

  return [...tournaments].sort((a, b) => {
    const statusA = getTournamentStatus(a.startsAt, a.endsAt);
    const statusB = getTournamentStatus(b.startsAt, b.endsAt);

    // Primary sort: by status
    const statusDiff = statusOrder[statusA] - statusOrder[statusB];
    if (statusDiff !== 0) {
      return statusDiff;
    }

    // Secondary sort: by start date (ascending)
    return a.startsAt.getTime() - b.startsAt.getTime();
  });
}
