import type { Tournament } from "@/lib/db/schema";

export type TournamentStatus = "in-progress" | "upcoming" | "completed";

export type CreateTournamentInput = {
  name?: unknown;
  startsAt?: unknown;
  endsAt?: unknown;
  isNeutralSite?: unknown;
};

export type CreateTournamentValidated = {
  name: string;
  startsAt: Date;
  endsAt: Date;
  isNeutralSite: boolean;
};

export type ValidationResult =
  | { ok: true; data: CreateTournamentValidated }
  | { ok: false; error: string };

export function validateCreateTournamentInput(
  input: CreateTournamentInput
): ValidationResult {
  const { name, startsAt, endsAt, isNeutralSite } = input;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return { ok: false, error: "Name is required" };
  }

  if (!startsAt || typeof startsAt !== "string") {
    return { ok: false, error: "startsAt is required" };
  }

  if (!endsAt || typeof endsAt !== "string") {
    return { ok: false, error: "endsAt is required" };
  }

  const startsAtDate = new Date(startsAt);
  const endsAtDate = new Date(endsAt);

  if (isNaN(startsAtDate.getTime())) {
    return { ok: false, error: "startsAt is not a valid date" };
  }

  if (isNaN(endsAtDate.getTime())) {
    return { ok: false, error: "endsAt is not a valid date" };
  }

  if (endsAtDate <= startsAtDate) {
    return { ok: false, error: "endsAt must be after startsAt" };
  }

  return {
    ok: true,
    data: {
      name: name.trim(),
      startsAt: startsAtDate,
      endsAt: endsAtDate,
      isNeutralSite: isNeutralSite === true,
    },
  };
}

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
