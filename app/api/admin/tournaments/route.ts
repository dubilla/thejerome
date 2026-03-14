import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tournaments, years } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { validateCreateTournamentInput } from "@/lib/utils/tournament";


export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const bearerAuthed = authHeader?.startsWith("Bearer ") && process.env.ADMIN_API_KEY
      && authHeader.slice(7) === process.env.ADMIN_API_KEY;
    if (!bearerAuthed) {
      const user = await getCurrentUser();
      if (!user?.isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
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

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const result = validateCreateTournamentInput(body);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const [created] = await db
      .insert(tournaments)
      .values({ ...result.data, yearId: activeYear.id })
      .returning();

    return NextResponse.json({ tournament: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/tournaments error:", error);
    return NextResponse.json(
      { error: "Failed to create tournament", details: String(error) },
      { status: 500 }
    );
  }
}

