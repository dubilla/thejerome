import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tournaments } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { parseDateAsET, validateBracketUrl } from "@/lib/utils/tournament";

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
    const tournamentId = parseInt(id);
    if (isNaN(tournamentId)) {
      return NextResponse.json({ error: "Invalid tournament ID" }, { status: 400 });
    }

    const { startsAt, endsAt, isNeutralSite, bracketUrl } = await request.json();

    const updateData: { startsAt?: Date; endsAt?: Date; isNeutralSite?: boolean; bracketUrl?: string | null } = {};
    if (startsAt !== undefined) updateData.startsAt = parseDateAsET(startsAt);
    if (endsAt !== undefined) updateData.endsAt = parseDateAsET(endsAt);
    if (isNeutralSite !== undefined) updateData.isNeutralSite = isNeutralSite;
    if (bracketUrl !== undefined) {
      if (bracketUrl) {
        const urlResult = validateBracketUrl(bracketUrl);
        if (!urlResult.ok) {
          return NextResponse.json({ error: urlResult.error }, { status: 400 });
        }
        updateData.bracketUrl = urlResult.url;
      } else {
        updateData.bracketUrl = null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const [updated] = await db
      .update(tournaments)
      .set(updateData)
      .where(eq(tournaments.id, tournamentId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({ tournament: updated });
  } catch (error) {
    console.error("PATCH /api/admin/tournaments/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update tournament", details: String(error) },
      { status: 500 }
    );
  }
}
