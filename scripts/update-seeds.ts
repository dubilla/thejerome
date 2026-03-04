#!/usr/bin/env tsx
/**
 * Bulk seed update script
 *
 * Export mode:
 *   BASE_URL=https://yoursite.com ADMIN_API_KEY=xxx \
 *     npx tsx scripts/update-seeds.ts export > seeds.json
 *
 * Apply mode (dry run):
 *   BASE_URL=https://yoursite.com ADMIN_API_KEY=xxx \
 *     npx tsx scripts/update-seeds.ts apply seeds.json --dry-run
 *
 * Apply mode (real):
 *   BASE_URL=https://yoursite.com ADMIN_API_KEY=xxx \
 *     npx tsx scripts/update-seeds.ts apply seeds.json
 */

import { readFileSync } from "fs";

const BASE_URL = process.env.BASE_URL;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

function requireEnv() {
  if (!BASE_URL) {
    console.error("Error: BASE_URL environment variable is required");
    process.exit(1);
  }
  if (!ADMIN_API_KEY) {
    console.error("Error: ADMIN_API_KEY environment variable is required");
    process.exit(1);
  }
}

async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_API_KEY}`,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

async function runExport() {
  requireEnv();

  const { teams } = await fetchWithAuth("/api/admin/teams");
  const { tournaments: tournamentList } = await fetchWithAuth("/api/admin/tournaments");

  const tournamentsById = new Map(
    tournamentList.map((t: { id: number; name: string; startsAt: string | null; bracketUrl: string | null }) => [t.id, t])
  );

  // Group teams by tournament
  const tournamentsMap = new Map<
    number,
    { id: number; name: string; startsAt: string | null; bracketUrl: string | null; teams: { id: number; name: string; seed: number | null }[] }
  >();

  for (const team of teams) {
    const tournament = team.tournament;
    if (!tournament) continue;

    if (!tournamentsMap.has(tournament.id)) {
      const t = tournamentsById.get(tournament.id);
      tournamentsMap.set(tournament.id, {
        id: tournament.id,
        name: tournament.name,
        startsAt: t?.startsAt ?? null,
        bracketUrl: t?.bracketUrl ?? null,
        teams: [],
      });
    }

    tournamentsMap.get(tournament.id)!.teams.push({
      id: team.id,
      name: team.name,
      seed: team.seed ?? null,
    });
  }

  // Sort tournaments by startsAt, then teams by seed/name
  const tournaments = Array.from(tournamentsMap.values()).sort((a, b) => {
    if (a.startsAt && b.startsAt) return a.startsAt.localeCompare(b.startsAt);
    return a.name.localeCompare(b.name);
  });

  for (const t of tournaments) {
    t.teams.sort((a, b) => {
      if (a.seed !== null && b.seed !== null) return a.seed - b.seed;
      if (a.seed !== null) return -1;
      if (b.seed !== null) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  const output = { tournaments };
  process.stdout.write(JSON.stringify(output, null, 2) + "\n");
  process.stderr.write(`Exported ${teams.length} teams across ${tournaments.length} tournaments\n`);
}

async function runApply(filePath: string, dryRun: boolean) {
  requireEnv();

  let data: { tournaments: { id: number; name: string; bracketUrl?: string | null; teams: { id: number; name: string; seed: number | null }[] }[] };
  try {
    data = JSON.parse(readFileSync(filePath, "utf-8"));
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    process.exit(1);
  }

  // Collect seed updates where seed is set
  const seedUpdates: { teamId: number; seed: number; teamName: string; tournamentName: string }[] = [];
  // Collect bracket URL updates where bracketUrl is set
  const bracketUpdates: { tournamentId: number; bracketUrl: string; tournamentName: string }[] = [];

  for (const tournament of data.tournaments) {
    for (const team of tournament.teams) {
      if (team.seed !== null) {
        seedUpdates.push({
          teamId: team.id,
          seed: team.seed,
          teamName: team.name,
          tournamentName: tournament.name,
        });
      }
    }
    if (tournament.bracketUrl) {
      bracketUpdates.push({
        tournamentId: tournament.id,
        bracketUrl: tournament.bracketUrl,
        tournamentName: tournament.name,
      });
    }
  }

  if (seedUpdates.length === 0 && bracketUpdates.length === 0) {
    console.log("Nothing to apply.");
    return;
  }

  if (seedUpdates.length > 0) {
    console.log(`\nSeeds to apply (${seedUpdates.length} teams):\n`);
    console.log("Tournament".padEnd(40) + "Team".padEnd(30) + "Seed");
    console.log("-".repeat(75));
    for (const u of seedUpdates) {
      console.log(
        u.tournamentName.slice(0, 39).padEnd(40) +
          u.teamName.slice(0, 29).padEnd(30) +
          u.seed
      );
    }
  }

  if (bracketUpdates.length > 0) {
    console.log(`\nBracket URLs to apply (${bracketUpdates.length} tournaments):\n`);
    console.log("Tournament".padEnd(40) + "URL");
    console.log("-".repeat(80));
    for (const u of bracketUpdates) {
      console.log(u.tournamentName.slice(0, 39).padEnd(40) + u.bracketUrl);
    }
  }

  console.log();

  if (dryRun) {
    console.log("Dry run — no changes made.");
    return;
  }

  if (seedUpdates.length > 0) {
    const payload = seedUpdates.map(({ teamId, seed }) => ({ teamId, seed }));
    const result = await fetchWithAuth("/api/admin/seeds/bulk", {
      method: "POST",
      body: JSON.stringify({ updates: payload }),
    });
    console.log(`Seeds: updated ${result.updated} teams.`);
  }

  for (const { tournamentId, bracketUrl, tournamentName } of bracketUpdates) {
    await fetchWithAuth(`/api/admin/tournaments/${tournamentId}`, {
      method: "PATCH",
      body: JSON.stringify({ bracketUrl }),
    });
    console.log(`Bracket URL set for: ${tournamentName}`);
  }
}

async function main() {
  const [, , command, ...args] = process.argv;

  if (command === "export") {
    await runExport();
  } else if (command === "apply") {
    const filePath = args[0];
    if (!filePath) {
      console.error("Usage: update-seeds.ts apply <seeds.json> [--dry-run]");
      process.exit(1);
    }
    const dryRun = args.includes("--dry-run");
    await runApply(filePath, dryRun);
  } else {
    console.error("Usage: update-seeds.ts <export|apply> [args]");
    console.error("  export                         — export current seeds to JSON");
    console.error("  apply <seeds.json> [--dry-run] — apply seeds from JSON");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
