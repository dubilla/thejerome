import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { validateBulkResultUpdates } from "@/lib/utils/results";

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ") && process.env.ADMIN_API_KEY) {
    return authHeader.slice(7) === process.env.ADMIN_API_KEY;
  }
  const user = await getCurrentUser();
  return !!user?.isAdmin;
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthorized(request))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { updates } = body;

    const validation = validateBulkResultUpdates(updates);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const results = await db.transaction(async (tx) => {
      const updated = [];
      for (const { teamId, roundId, isEliminated } of updates) {
        const patch: { roundId?: number; isEliminated?: boolean } = {};
        if (roundId !== undefined) patch.roundId = roundId;
        if (isEliminated !== undefined) patch.isEliminated = isEliminated;

        const [team] = await tx
          .update(teams)
          .set(patch)
          .where(eq(teams.id, teamId))
          .returning();
        if (team) updated.push({
          teamId: team.id,
          name: team.name,
          roundId: team.roundId,
          isEliminated: team.isEliminated,
        });
      }
      return updated;
    });

    return NextResponse.json({ updated: results.length, results });
  } catch (error) {
    console.error("POST /api/admin/results/bulk error:", error);
    return NextResponse.json(
      { error: "Failed to update results", details: String(error) },
      { status: 500 }
    );
  }
}
