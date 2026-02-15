import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { years, tournaments, teams, rounds } from "@/lib/db/schema";
import {
  isTournamentLocked,
  sortTournamentsByStatusAndStartDate,
} from "@/lib/utils/tournament";

export async function GET() {
  try {
    // Get active year
    const [activeYear] = await db
      .select()
      .from(years)
      .where(eq(years.isActive, true))
      .limit(1);

    if (!activeYear) {
      return NextResponse.json({ error: "No active year" }, { status: 404 });
    }

    // Fetch all tournaments for the active year
    const allTournaments = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.yearId, activeYear.id));

    // Fetch all teams and rounds
    const allTeams = await db.select().from(teams);
    const allRounds = await db.select().from(rounds);

    // Group teams by tournament
    const teamsByTournament = new Map<number, typeof allTeams>();
    for (const team of allTeams) {
      if (!teamsByTournament.has(team.tournamentId)) {
        teamsByTournament.set(team.tournamentId, []);
      }
      teamsByTournament.get(team.tournamentId)!.push(team);
    }

    // Build round lookup
    const roundsById = new Map(allRounds.map((r) => [r.id, r]));

    // Build response
    const data = allTournaments.map((tournament) => ({
      ...tournament,
      locked: isTournamentLocked(tournament.startsAt),
      teams: (teamsByTournament.get(tournament.id) || []).map((team) => ({
        ...team,
        round: roundsById.get(team.roundId) || null,
      })),
    }));

    // Sort tournaments by status (in-progress → upcoming → completed) then by start date
    const sortedData = sortTournamentsByStatusAndStartDate(data);

    return NextResponse.json({ tournaments: sortedData, year: activeYear });
  } catch (error) {
    console.error("GET /api/tournaments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tournaments", details: String(error) },
      { status: 500 }
    );
  }
}
