import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { hash } from "bcryptjs";
import { rounds, years, users, tournaments, teams, entries, picks } from "./schema";
import { eq } from "drizzle-orm";

// Load from .env.local if it exists (won't override existing env vars)
dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  throw new Error("DATABASE_URL environment variable is not set");
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(client);

async function main() {
  console.log("Seeding database...");

  // Check if database is already seeded
  const existingYears = await db.select().from(years);
  if (existingYears.length > 0) {
    console.log("Database already seeded, skipping...");
    await client.end();
    return;
  }

  // ─── Seed Rounds ─────────────────────────────────────────────────────
  const roundData = [
    { name: "Round 1", order: 1, points: 0 },
    { name: "Round 2", order: 2, points: 0 },
    { name: "Round 3", order: 3, points: 0 },
    { name: "Round 4", order: 4, points: 0 },
    { name: "Finals", order: 5, points: 2 },
    { name: "Champion", order: 6, points: 5 },
  ];

  for (const round of roundData) {
    await db
      .insert(rounds)
      .values(round)
      .onConflictDoNothing({ target: rounds.name });
  }
  console.log("  ✓ Rounds seeded");

  // Get round IDs for later use
  const [round1] = await db
    .select()
    .from(rounds)
    .where(eq(rounds.name, "Round 1"));

  // ─── Seed Year ───────────────────────────────────────────────────────
  await db
    .insert(years)
    .values({ name: "2026", isActive: true })
    .onConflictDoNothing({ target: years.name });
  console.log("  ✓ Year seeded");

  const [year2026] = await db.select().from(years).where(eq(years.name, "2026"));

  // ─── Seed Users ──────────────────────────────────────────────────────
  const passwordHash = await hash("password123", 10);
  const userData = [
    { email: "admin@thejerome.com", passwordHash, isAdmin: true },
    { email: "user1@test.com", passwordHash, isAdmin: false },
    { email: "user2@test.com", passwordHash, isAdmin: false },
    { email: "user3@test.com", passwordHash, isAdmin: false },
    { email: "user4@test.com", passwordHash, isAdmin: false },
    { email: "user5@test.com", passwordHash, isAdmin: false },
    { email: "user6@test.com", passwordHash, isAdmin: false },
  ];

  for (const user of userData) {
    await db
      .insert(users)
      .values(user)
      .onConflictDoNothing({ target: users.email });
  }
  console.log("  ✓ Users seeded");

  // ─── Seed Tournaments ────────────────────────────────────────────────
  const tournamentData = [
    { name: "ACC Tournament", startsAt: new Date("2026-03-11"), endsAt: new Date("2026-03-14"), yearId: year2026.id },
    { name: "Big Ten Tournament", startsAt: new Date("2026-03-12"), endsAt: new Date("2026-03-15"), yearId: year2026.id },
    { name: "SEC Tournament", startsAt: new Date("2026-03-11"), endsAt: new Date("2026-03-14"), yearId: year2026.id },
    { name: "Big 12 Tournament", startsAt: new Date("2026-03-13"), endsAt: new Date("2026-03-16"), yearId: year2026.id },
  ];

  for (const tournament of tournamentData) {
    await db
      .insert(tournaments)
      .values(tournament)
      .onConflictDoNothing({ target: [tournaments.name, tournaments.yearId] });
  }
  console.log("  ✓ Tournaments seeded");

  // Get tournament IDs
  const allTournaments = await db.select().from(tournaments).where(eq(tournaments.yearId, year2026.id));
  const accTournament = allTournaments.find((t) => t.name === "ACC Tournament")!;
  const bigTenTournament = allTournaments.find((t) => t.name === "Big Ten Tournament")!;
  const secTournament = allTournaments.find((t) => t.name === "SEC Tournament")!;
  const big12Tournament = allTournaments.find((t) => t.name === "Big 12 Tournament")!;

  // ─── Seed Teams ──────────────────────────────────────────────────────
  const teamData = [
    // ACC Teams
    { name: "Duke", tournamentId: accTournament.id, roundId: round1.id, isEliminated: false },
    { name: "North Carolina", tournamentId: accTournament.id, roundId: round1.id, isEliminated: false },
    { name: "Virginia", tournamentId: accTournament.id, roundId: round1.id, isEliminated: false },
    { name: "Miami", tournamentId: accTournament.id, roundId: round1.id, isEliminated: false },
    { name: "NC State", tournamentId: accTournament.id, roundId: round1.id, isEliminated: false },

    // Big Ten Teams
    { name: "Michigan", tournamentId: bigTenTournament.id, roundId: round1.id, isEliminated: false },
    { name: "Ohio State", tournamentId: bigTenTournament.id, roundId: round1.id, isEliminated: false },
    { name: "Indiana", tournamentId: bigTenTournament.id, roundId: round1.id, isEliminated: false },
    { name: "Illinois", tournamentId: bigTenTournament.id, roundId: round1.id, isEliminated: false },
    { name: "Purdue", tournamentId: bigTenTournament.id, roundId: round1.id, isEliminated: false },

    // SEC Teams
    { name: "Kentucky", tournamentId: secTournament.id, roundId: round1.id, isEliminated: false },
    { name: "Tennessee", tournamentId: secTournament.id, roundId: round1.id, isEliminated: false },
    { name: "Auburn", tournamentId: secTournament.id, roundId: round1.id, isEliminated: false },
    { name: "Alabama", tournamentId: secTournament.id, roundId: round1.id, isEliminated: false },
    { name: "Florida", tournamentId: secTournament.id, roundId: round1.id, isEliminated: false },

    // Big 12 Teams
    { name: "Kansas", tournamentId: big12Tournament.id, roundId: round1.id, isEliminated: false },
    { name: "Baylor", tournamentId: big12Tournament.id, roundId: round1.id, isEliminated: false },
    { name: "Texas Tech", tournamentId: big12Tournament.id, roundId: round1.id, isEliminated: false },
    { name: "TCU", tournamentId: big12Tournament.id, roundId: round1.id, isEliminated: false },
    { name: "Iowa State", tournamentId: big12Tournament.id, roundId: round1.id, isEliminated: false },
  ];

  for (const team of teamData) {
    await db
      .insert(teams)
      .values(team)
      .onConflictDoNothing({ target: [teams.name, teams.tournamentId] });
  }
  console.log("  ✓ Teams seeded");

  // ─── Seed Test Entries & Picks ───────────────────────────────────────
  // Get all users
  const allUsers = await db.select().from(users);
  const adminUser = allUsers.find((u) => u.email === "admin@thejerome.com")!;
  const user1 = allUsers.find((u) => u.email === "user1@test.com")!;
  const user2 = allUsers.find((u) => u.email === "user2@test.com")!;
  const user3 = allUsers.find((u) => u.email === "user3@test.com")!;
  const user4 = allUsers.find((u) => u.email === "user4@test.com")!;
  const user5 = allUsers.find((u) => u.email === "user5@test.com")!;
  const user6 = allUsers.find((u) => u.email === "user6@test.com")!;

  // Get all teams for picks
  const allTeams = await db.select().from(teams);
  const getDuke = allTeams.find((t) => t.name === "Duke")!;
  const getUNC = allTeams.find((t) => t.name === "North Carolina")!;
  const getVirginia = allTeams.find((t) => t.name === "Virginia")!;
  const getMiami = allTeams.find((t) => t.name === "Miami")!;
  const getMichigan = allTeams.find((t) => t.name === "Michigan")!;
  const getOhioState = allTeams.find((t) => t.name === "Ohio State")!;
  const getIndiana = allTeams.find((t) => t.name === "Indiana")!;
  const getPurdue = allTeams.find((t) => t.name === "Purdue")!;
  const getKentucky = allTeams.find((t) => t.name === "Kentucky")!;
  const getTennessee = allTeams.find((t) => t.name === "Tennessee")!;
  const getAuburn = allTeams.find((t) => t.name === "Auburn")!;
  const getAlabama = allTeams.find((t) => t.name === "Alabama")!;
  const getKansas = allTeams.find((t) => t.name === "Kansas")!;
  const getBaylor = allTeams.find((t) => t.name === "Baylor")!;
  const getTexasTech = allTeams.find((t) => t.name === "Texas Tech")!;
  const getIowaState = allTeams.find((t) => t.name === "Iowa State")!;

  // Create entries with varying scores to make leaderboard interesting
  const entryData = [
    { name: "Bracket Buster Supreme", userId: adminUser.id, yearId: year2026.id },
    { name: "March Madness Master", userId: user1.id, yearId: year2026.id },
    { name: "Cinderella Story", userId: user2.id, yearId: year2026.id },
    { name: "Chalk City", userId: user3.id, yearId: year2026.id },
    { name: "The Upset Special", userId: user4.id, yearId: year2026.id },
    { name: "Buzzer Beater", userId: user5.id, yearId: year2026.id },
    { name: "Sweet Sixteen Dreams", userId: user6.id, yearId: year2026.id },
  ];

  for (const entry of entryData) {
    await db
      .insert(entries)
      .values(entry)
      .onConflictDoNothing();
  }
  console.log("  ✓ Entries seeded");

  // Get entries
  const allEntries = await db.select().from(entries).where(eq(entries.yearId, year2026.id));
  const adminEntry = allEntries.find((e) => e.userId === adminUser.id)!;
  const user1Entry = allEntries.find((e) => e.userId === user1.id)!;
  const user2Entry = allEntries.find((e) => e.userId === user2.id)!;
  const user3Entry = allEntries.find((e) => e.userId === user3.id)!;
  const user4Entry = allEntries.find((e) => e.userId === user4.id)!;
  const user5Entry = allEntries.find((e) => e.userId === user5.id)!;
  const user6Entry = allEntries.find((e) => e.userId === user6.id)!;

  // Create picks with realistic scores (simulating some progress in tournaments)
  const pickData = [
    // Admin picks - High scorer (145 points)
    { entryId: adminEntry.id, tournamentId: accTournament.id, teamId: getDuke.id, scoreCache: 42 },
    { entryId: adminEntry.id, tournamentId: bigTenTournament.id, teamId: getPurdue.id, scoreCache: 38 },
    { entryId: adminEntry.id, tournamentId: secTournament.id, teamId: getKentucky.id, scoreCache: 35 },
    { entryId: adminEntry.id, tournamentId: big12Tournament.id, teamId: getKansas.id, scoreCache: 30 },

    // User1 picks - Second place (132 points)
    { entryId: user1Entry.id, tournamentId: accTournament.id, teamId: getUNC.id, scoreCache: 38 },
    { entryId: user1Entry.id, tournamentId: bigTenTournament.id, teamId: getMichigan.id, scoreCache: 32 },
    { entryId: user1Entry.id, tournamentId: secTournament.id, teamId: getTennessee.id, scoreCache: 35 },
    { entryId: user1Entry.id, tournamentId: big12Tournament.id, teamId: getBaylor.id, scoreCache: 27 },

    // User2 picks - Third place (118 points)
    { entryId: user2Entry.id, tournamentId: accTournament.id, teamId: getVirginia.id, scoreCache: 28 },
    { entryId: user2Entry.id, tournamentId: bigTenTournament.id, teamId: getOhioState.id, scoreCache: 30 },
    { entryId: user2Entry.id, tournamentId: secTournament.id, teamId: getAuburn.id, scoreCache: 32 },
    { entryId: user2Entry.id, tournamentId: big12Tournament.id, teamId: getKansas.id, scoreCache: 28 },

    // User3 picks - Mid-pack (95 points)
    { entryId: user3Entry.id, tournamentId: accTournament.id, teamId: getDuke.id, scoreCache: 25 },
    { entryId: user3Entry.id, tournamentId: bigTenTournament.id, teamId: getIndiana.id, scoreCache: 22 },
    { entryId: user3Entry.id, tournamentId: secTournament.id, teamId: getAlabama.id, scoreCache: 24 },
    { entryId: user3Entry.id, tournamentId: big12Tournament.id, teamId: getTexasTech.id, scoreCache: 24 },

    // User4 picks - Mid-pack (88 points)
    { entryId: user4Entry.id, tournamentId: accTournament.id, teamId: getMiami.id, scoreCache: 20 },
    { entryId: user4Entry.id, tournamentId: bigTenTournament.id, teamId: getPurdue.id, scoreCache: 23 },
    { entryId: user4Entry.id, tournamentId: secTournament.id, teamId: getKentucky.id, scoreCache: 22 },
    { entryId: user4Entry.id, tournamentId: big12Tournament.id, teamId: getIowaState.id, scoreCache: 23 },

    // User5 picks - Lower (72 points)
    { entryId: user5Entry.id, tournamentId: accTournament.id, teamId: getUNC.id, scoreCache: 18 },
    { entryId: user5Entry.id, tournamentId: bigTenTournament.id, teamId: getMichigan.id, scoreCache: 18 },
    { entryId: user5Entry.id, tournamentId: secTournament.id, teamId: getTennessee.id, scoreCache: 18 },
    { entryId: user5Entry.id, tournamentId: big12Tournament.id, teamId: getBaylor.id, scoreCache: 18 },

    // User6 picks - Last place (54 points)
    { entryId: user6Entry.id, tournamentId: accTournament.id, teamId: getVirginia.id, scoreCache: 12 },
    { entryId: user6Entry.id, tournamentId: bigTenTournament.id, teamId: getOhioState.id, scoreCache: 14 },
    { entryId: user6Entry.id, tournamentId: secTournament.id, teamId: getAuburn.id, scoreCache: 15 },
    { entryId: user6Entry.id, tournamentId: big12Tournament.id, teamId: getTexasTech.id, scoreCache: 13 },
  ];

  for (const pick of pickData) {
    await db.insert(picks).values(pick).onConflictDoNothing();
  }
  console.log("  ✓ Picks seeded");

  console.log("\n✓ Seeding complete!");
  console.log("\nTest credentials:");
  console.log("  admin@thejerome.com / password123");
  console.log("  user1@test.com / password123");
  console.log("  user2@test.com / password123");
  console.log("  user3@test.com / password123");
  console.log("  user4@test.com / password123");
  console.log("  user5@test.com / password123");
  console.log("  user6@test.com / password123");

  await client.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
