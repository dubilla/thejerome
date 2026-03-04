import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams, rounds, tournaments } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allTeams = await db.select().from(teams);
    const allRounds = await db.select().from(rounds);
    const allTournaments = await db.select().from(tournaments);

    const roundsById = new Map(allRounds.map((r) => [r.id, r]));
    const tournamentsById = new Map(allTournaments.map((t) => [t.id, t]));

    const data = allTeams.map((team) => ({
      ...team,
      round: roundsById.get(team.roundId) || null,
      tournament: tournamentsById.get(team.tournamentId) || null,
    }));

    return NextResponse.json({
      teams: data,
      rounds: allRounds,
    });
  } catch (error) {
    console.error("GET /api/admin/teams error:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams", details: String(error) },
      { status: 500 }
    );
  }
}

