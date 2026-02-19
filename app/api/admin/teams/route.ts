import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
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

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { teamId, roundId, isEliminated, seed } = await request.json();

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    const updateData: { roundId?: number; isEliminated?: boolean; seed?: number | null } = {};
    if (roundId !== undefined) updateData.roundId = roundId;
    if (isEliminated !== undefined) updateData.isEliminated = isEliminated;
    if (seed !== undefined) updateData.seed = seed;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(teams)
      .set(updateData)
      .where(eq(teams.id, teamId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({ team: updated });
  } catch (error) {
    console.error("PATCH /api/admin/teams error:", error);
    return NextResponse.json(
      { error: "Failed to update team", details: String(error) },
      { status: 500 }
    );
  }
}
