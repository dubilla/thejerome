import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tournaments, years } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [activeYear] = await db
      .select()
      .from(years)
      .where(eq(years.isActive, true))
      .limit(1);

    if (!activeYear) {
      return NextResponse.json({ error: "No active year" }, { status: 404 });
    }

    const allTournaments = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.yearId, activeYear.id));

    return NextResponse.json({ tournaments: allTournaments, year: activeYear });
  } catch (error) {
    console.error("GET /api/admin/tournaments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tournaments", details: String(error) },
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

    const { tournamentId, startsAt, endsAt, isNeutralSite } = await request.json();

    if (!tournamentId) {
      return NextResponse.json(
        { error: "Tournament ID is required" },
        { status: 400 }
      );
    }

    const updateData: { startsAt?: Date; endsAt?: Date; isNeutralSite?: boolean } = {};
    if (startsAt !== undefined) updateData.startsAt = new Date(startsAt);
    if (endsAt !== undefined) updateData.endsAt = new Date(endsAt);
    if (isNeutralSite !== undefined) updateData.isNeutralSite = isNeutralSite;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(tournaments)
      .set(updateData)
      .where(eq(tournaments.id, tournamentId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ tournament: updated });
  } catch (error) {
    console.error("PATCH /api/admin/tournaments error:", error);
    return NextResponse.json(
      { error: "Failed to update tournament", details: String(error) },
      { status: 500 }
    );
  }
}
