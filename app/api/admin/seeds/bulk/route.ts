import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { validateBulkSeedUpdates } from "@/lib/utils/seeds";

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

    const validation = validateBulkSeedUpdates(updates);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const results = await db.transaction(async (tx) => {
      const updated = [];
      for (const { teamId, seed } of updates) {
        const [team] = await tx
          .update(teams)
          .set({ seed })
          .where(eq(teams.id, teamId))
          .returning();
        if (team) updated.push({ teamId: team.id, seed: team.seed, name: team.name });
      }
      return updated;
    });

    return NextResponse.json({ updated: results.length, results });
  } catch (error) {
    console.error("POST /api/admin/seeds/bulk error:", error);
    return NextResponse.json(
      { error: "Failed to update seeds", details: String(error) },
      { status: 500 }
    );
  }
}
