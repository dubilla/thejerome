import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ") && process.env.ADMIN_API_KEY) {
    return authHeader.slice(7) === process.env.ADMIN_API_KEY;
  }
  const user = await getCurrentUser();
  return !!user?.isAdmin;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAuthorized(request))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const teamId = parseInt(id);
    if (isNaN(teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    const { roundId, isEliminated, seed } = await request.json();

    const updateData: { roundId?: number; isEliminated?: boolean; seed?: number | null } = {};
    if (roundId !== undefined) updateData.roundId = roundId;
    if (isEliminated !== undefined) updateData.isEliminated = isEliminated;
    if (seed !== undefined) updateData.seed = seed;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
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
    console.error("PATCH /api/admin/teams/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update team", details: String(error) },
      { status: 500 }
    );
  }
}
