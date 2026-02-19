import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  years,
  entries,
  picks,
  teams,
  rounds,
  users,
  tournaments,
} from "@/lib/db/schema";
import { calculateEntryScore } from "@/lib/utils/scoring";
import { calculatePPR } from "@/lib/utils/ppr";

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

    // Fetch all data upfront
    const allEntries = await db
      .select()
      .from(entries)
      .where(eq(entries.yearId, activeYear.id));

    const allPicks = await db.select().from(picks);
    const allTeams = await db.select().from(teams);
    const allRounds = await db.select().from(rounds);
    const allUsers = await db.select().from(users);
    const allTournaments = await db.select().from(tournaments);

    // Build lookups
    const usersById = new Map(allUsers.map((u) => [u.id, u]));
    const picksByEntry = new Map<number, typeof allPicks>();
    for (const pick of allPicks) {
      if (!picksByEntry.has(pick.entryId)) {
        picksByEntry.set(pick.entryId, []);
      }
      picksByEntry.get(pick.entryId)!.push(pick);
    }

    // Calculate scores and PPR for each entry
    const leaderboard = allEntries.map((entry) => {
      const entryPicks = picksByEntry.get(entry.id) || [];
      const score = calculateEntryScore(entryPicks, allTeams, allRounds, allTournaments);
      const ppr = calculatePPR(score, entryPicks, allTeams, allRounds, allTournaments);
      const user = usersById.get(entry.userId);

      return {
        entryId: entry.id,
        entryName: entry.name,
        userEmail: user?.email || "Unknown",
        score,
        ppr,
      };
    });

    // Sort by score DESC, then PPR DESC
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.ppr - a.ppr;
    });

    // Add ranks
    const ranked = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    return NextResponse.json({ leaders: ranked, year: activeYear });
  } catch (error) {
    console.error("GET /api/leaders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard", details: String(error) },
      { status: 500 }
    );
  }
}
