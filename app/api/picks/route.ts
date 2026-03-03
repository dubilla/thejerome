import { NextResponse } from "next/server";
import { eq, lt, asc, and } from "drizzle-orm";
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
import { calculateEntryScore, calculatePickScore } from "@/lib/utils/scoring";
import { calculatePPR } from "@/lib/utils/ppr";
import { getCurrentUser } from "@/lib/auth/session";
import { getTournamentStatus } from "@/lib/utils/tournament";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    // Get active year
    const [activeYear] = await db
      .select()
      .from(years)
      .where(eq(years.isActive, true))
      .limit(1);

    if (!activeYear) {
      return NextResponse.json({ error: "No active year" }, { status: 404 });
    }

    // Fetch all data
    const allEntries = await db
      .select()
      .from(entries)
      .where(eq(entries.yearId, activeYear.id));

    const allUsers = await db.select().from(users);
    const allPicks = await db.select().from(picks);
    const allTeams = await db.select().from(teams);
    const allRounds = await db.select().from(rounds);
    const allTournaments = await db.select().from(tournaments);

    // Locked tournaments only: startsAt < NOW() for active year, sorted oldest first
    const lockedTournaments = await db
      .select()
      .from(tournaments)
      .where(
        and(
          eq(tournaments.yearId, activeYear.id),
          lt(tournaments.startsAt, new Date())
        )
      )
      .orderBy(asc(tournaments.startsAt));

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
    const entryScores = allEntries.map((entry) => {
      const entryPicks = picksByEntry.get(entry.id) || [];
      const score = calculateEntryScore(entryPicks, allTeams, allRounds, allTournaments);
      const ppr = calculatePPR(score, entryPicks, allTeams, allRounds, allTournaments);
      const user = usersById.get(entry.userId);

      return {
        id: entry.id,
        name: entry.name,
        userEmail: user?.email || "Unknown",
        score,
        ppr,
        userId: entry.userId,
      };
    });

    // Sort by score DESC, ppr DESC, add rank
    entryScores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.ppr - a.ppr;
    });

    const rankedEntries = entryScores.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // Find my entry
    const myEntry = currentUser
      ? rankedEntries.find((e) => {
          const user = allUsers.find((u) => u.email === currentUser.email);
          return user && e.userId === user.id;
        })
      : null;
    const myEntryId = myEntry?.id ?? null;

    // Build tournament data
    const tournamentData = lockedTournaments.map((tournament) => {
      const status = getTournamentStatus(tournament.startsAt, tournament.endsAt);

      const tournamentPicks = allPicks.filter(
        (p) => p.tournamentId === tournament.id
      );


      const picksForTournament = tournamentPicks.map((pick) => {
        const team = allTeams.find((t) => t.id === pick.teamId);
        const score = team
          ? calculatePickScore(team, allRounds, allTournaments)
          : 0;

        return {
          entryId: pick.entryId,
          teamId: pick.teamId,
          teamName: team?.name ?? "Unknown",
          teamSeed: team?.seed ?? null,
          teamIsEliminated: team?.isEliminated ?? false,
          score,
          isMyPick: pick.entryId === myEntryId,
        };
      });

      return {
        id: tournament.id,
        name: tournament.name,
        startsAt: tournament.startsAt,
        endsAt: tournament.endsAt,
        isNeutralSite: tournament.isNeutralSite,
        status,
        picks: picksForTournament,
      };
    });

    return NextResponse.json({
      myEntryId,
      entries: rankedEntries.map(({ id, name, userEmail, rank, score, ppr }) => ({
        id,
        name,
        userEmail,
        rank,
        score,
        ppr,
      })),
      tournaments: tournamentData,
    });
  } catch (error) {
    console.error("GET /api/picks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch picks dashboard", details: String(error) },
      { status: 500 }
    );
  }
}
