import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  entries,
  picks,
  years,
  tournaments,
  teams,
} from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { isTournamentLocked } from "@/lib/utils/tournament";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get active year
    const [activeYear] = await db
      .select()
      .from(years)
      .where(eq(years.isActive, true))
      .limit(1);

    if (!activeYear) {
      return NextResponse.json({ error: "No active year" }, { status: 404 });
    }

    // Get user's entry for active year
    const [entry] = await db
      .select()
      .from(entries)
      .where(
        and(eq(entries.userId, user.id), eq(entries.yearId, activeYear.id))
      )
      .limit(1);

    if (!entry) {
      return NextResponse.json({ entry: null });
    }

    // Get picks for this entry
    const entryPicks = await db
      .select()
      .from(picks)
      .where(eq(picks.entryId, entry.id));

    return NextResponse.json({ entry, picks: entryPicks });
  } catch (error) {
    console.error("GET /api/entries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch entry", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, picks: pickData } = await request.json();

    if (!name || !pickData || !Array.isArray(pickData)) {
      return NextResponse.json(
        { error: "Name and picks are required" },
        { status: 400 }
      );
    }

    // Get active year
    const [activeYear] = await db
      .select()
      .from(years)
      .where(eq(years.isActive, true))
      .limit(1);

    if (!activeYear) {
      return NextResponse.json({ error: "No active year" }, { status: 404 });
    }

    // Check one entry per user per year
    const [existingEntry] = await db
      .select()
      .from(entries)
      .where(
        and(eq(entries.userId, user.id), eq(entries.yearId, activeYear.id))
      )
      .limit(1);

    if (existingEntry) {
      return NextResponse.json(
        { error: "You already have an entry for this year" },
        { status: 409 }
      );
    }

    // Validate all tournaments are unlocked
    const allTournaments = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.yearId, activeYear.id));

    for (const pick of pickData) {
      const tournament = allTournaments.find(
        (t) => t.id === pick.tournamentId
      );
      if (!tournament) {
        return NextResponse.json(
          { error: `Tournament ${pick.tournamentId} not found` },
          { status: 400 }
        );
      }
      if (isTournamentLocked(tournament.startsAt)) {
        return NextResponse.json(
          { error: `Tournament "${tournament.name}" is locked` },
          { status: 400 }
        );
      }
    }

    // Validate teams belong to their tournaments
    const allTeams = await db.select().from(teams);
    for (const pick of pickData) {
      const team = allTeams.find((t) => t.id === pick.teamId);
      if (!team || team.tournamentId !== pick.tournamentId) {
        return NextResponse.json(
          { error: `Invalid team for tournament` },
          { status: 400 }
        );
      }
    }

    // Create entry and picks in transaction
    const result = await db.transaction(async (tx) => {
      const [newEntry] = await tx
        .insert(entries)
        .values({
          name,
          userId: user.id,
          yearId: activeYear.id,
        })
        .returning();

      const newPicks = await tx
        .insert(picks)
        .values(
          pickData.map(
            (p: { tournamentId: number; teamId: number }) => ({
              entryId: newEntry.id,
              tournamentId: p.tournamentId,
              teamId: p.teamId,
            })
          )
        )
        .returning();

      return { entry: newEntry, picks: newPicks };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/entries error:", error);
    return NextResponse.json(
      { error: "Failed to create entry", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { entryId, name, picks: pickData } = await request.json();

    if (!entryId) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const [entry] = await db
      .select()
      .from(entries)
      .where(eq(entries.id, entryId))
      .limit(1);

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    if (entry.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await db.transaction(async (tx) => {
      // Update entry name if provided
      if (name) {
        await tx
          .update(entries)
          .set({ name })
          .where(eq(entries.id, entryId));
      }

      // Update picks if provided
      if (pickData && Array.isArray(pickData)) {
        // Get tournaments to check lock status
        const allTournaments = await tx.select().from(tournaments);
        const allTeams = await tx.select().from(teams);

        for (const pick of pickData) {
          const tournament = allTournaments.find(
            (t) => t.id === pick.tournamentId
          );
          if (!tournament) continue;

          if (isTournamentLocked(tournament.startsAt)) {
            continue; // Skip locked tournaments
          }

          // Validate team belongs to tournament
          const team = allTeams.find((t) => t.id === pick.teamId);
          if (!team || team.tournamentId !== pick.tournamentId) continue;

          // Upsert pick
          const [existingPick] = await tx
            .select()
            .from(picks)
            .where(
              and(
                eq(picks.entryId, entryId),
                eq(picks.tournamentId, pick.tournamentId)
              )
            )
            .limit(1);

          if (existingPick) {
            await tx
              .update(picks)
              .set({ teamId: pick.teamId })
              .where(eq(picks.id, existingPick.id));
          } else {
            await tx.insert(picks).values({
              entryId,
              tournamentId: pick.tournamentId,
              teamId: pick.teamId,
            });
          }
        }
      }

      // Fetch updated entry with picks
      const [updatedEntry] = await tx
        .select()
        .from(entries)
        .where(eq(entries.id, entryId));

      const updatedPicks = await tx
        .select()
        .from(picks)
        .where(eq(picks.entryId, entryId));

      return { entry: updatedEntry, picks: updatedPicks };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("PATCH /api/entries error:", error);
    return NextResponse.json(
      { error: "Failed to update entry", details: String(error) },
      { status: 500 }
    );
  }
}
