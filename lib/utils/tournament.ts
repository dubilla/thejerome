import type { Tournament } from "@/lib/db/schema";

// Interpret a datetime-local string (e.g. "2026-03-02T00:00") as ET.
// datetime-local inputs have no timezone info, so without this the server
// (running UTC) would store midnight UTC, which displays as the prior day in ET.
export function parseDateAsET(value: string): Date {
  const [datePart, timePart = "00:00"] = value.split("T");
  const [y, mo, d] = datePart.split("-").map(Number);
  const [h, mi] = (timePart + ":00").split(":").map(Number);

  // Treat the raw components as UTC to get a reference timestamp
  const utcRef = new Date(Date.UTC(y, mo - 1, d, h, mi));

  // Find what wall-clock time ET shows for utcRef, then measure the offset
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(utcRef);
  const p = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const etAsUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);

  // Shift utcRef by the offset so the stored UTC represents the correct ET wall-clock time
  return new Date(utcRef.getTime() + (utcRef.getTime() - etAsUTC));
}

export type CreateTournamentInput = {
  name?: unknown;
  startsAt?: unknown;
  endsAt?: unknown;
  isNeutralSite?: unknown;
  bracketUrl?: unknown;
};

export type CreateTournamentValidated = {
  name: string;
  startsAt: Date;
  endsAt: Date;
  isNeutralSite: boolean;
  bracketUrl?: string;
};

export type ValidationResult =
  | { ok: true; data: CreateTournamentValidated }
  | { ok: false; error: string };

export function validateCreateTournamentInput(
  input: CreateTournamentInput
): ValidationResult {
  const { name, startsAt, endsAt, isNeutralSite, bracketUrl } = input;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return { ok: false, error: "Name is required" };
  }

  if (!startsAt || typeof startsAt !== "string") {
    return { ok: false, error: "startsAt is required" };
  }

  if (!endsAt || typeof endsAt !== "string") {
    return { ok: false, error: "endsAt is required" };
  }

  if (isNaN(new Date(startsAt).getTime())) {
    return { ok: false, error: "startsAt is not a valid date" };
  }

  if (isNaN(new Date(endsAt).getTime())) {
    return { ok: false, error: "endsAt is not a valid date" };
  }

  const startsAtDate = parseDateAsET(startsAt);
  const endsAtDate = parseDateAsET(endsAt);

  if (endsAtDate <= startsAtDate) {
    return { ok: false, error: "endsAt must be after startsAt" };
  }

  const validated: CreateTournamentValidated = {
    name: name.trim(),
    startsAt: startsAtDate,
    endsAt: endsAtDate,
    isNeutralSite: isNeutralSite === true,
  };

  if (typeof bracketUrl === "string" && bracketUrl.trim() !== "") {
    validated.bracketUrl = bracketUrl.trim();
  }

  return { ok: true, data: validated };
}

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
