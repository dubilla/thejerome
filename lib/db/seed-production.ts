/**
 * Production seed script — populates conferences, tournaments, and teams.
 * Safe to run against a live DB: uses onConflictDoNothing throughout.
 * Does NOT touch existing users.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx lib/db/seed-production.ts
 */

import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { rounds, years, tournaments, teams } from "./schema";
import { parseDateAsET } from "../utils/tournament";

// Convert a date string to midnight ET (avoids UTC-midnight ≠ ET-midnight bug)
const etDate = (s: string): Date => parseDateAsET(s + "T00:00");
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(client);

// ─── Conference data ──────────────────────────────────────────────────────────

const conferenceData: Array<{
  name: string;
  startsAt: Date;
  endsAt: Date;
  isNeutralSite: boolean;
  teams: string[];
}> = [
  // ── Power conferences ──────────────────────────────────────────────────────
  {
    name: "ACC Tournament",
    startsAt: new Date("2026-03-10"),
    endsAt: new Date("2026-03-14"),
    isNeutralSite: true,
    teams: [
      "Boston College", "California", "Clemson", "Duke", "Florida State",
      "Georgia Tech", "Louisville", "Miami (FL)", "NC State", "North Carolina",
      "Notre Dame", "Pittsburgh", "SMU", "Stanford", "Syracuse",
      "Virginia", "Virginia Tech", "Wake Forest",
    ],
  },
  {
    name: "Big Ten Tournament",
    startsAt: new Date("2026-03-10"),
    endsAt: new Date("2026-03-15"),
    isNeutralSite: true,
    teams: [
      "Illinois", "Indiana", "Iowa", "Maryland", "Michigan",
      "Michigan State", "Minnesota", "Nebraska", "Northwestern", "Ohio State",
      "Oregon", "Penn State", "Purdue", "Rutgers", "UCLA",
      "USC", "Washington", "Wisconsin",
    ],
  },
  {
    name: "SEC Tournament",
    startsAt: new Date("2026-03-11"),
    endsAt: new Date("2026-03-15"),
    isNeutralSite: true,
    teams: [
      "Alabama", "Arkansas", "Auburn", "Florida", "Georgia",
      "Kentucky", "LSU", "Mississippi State", "Missouri", "Oklahoma",
      "Ole Miss", "South Carolina", "Tennessee", "Texas", "Texas A&M",
      "Vanderbilt",
    ],
  },
  {
    name: "Big 12 Tournament",
    startsAt: new Date("2026-03-10"),
    endsAt: new Date("2026-03-14"),
    isNeutralSite: true,
    teams: [
      "Arizona", "Arizona State", "Baylor", "BYU", "Cincinnati",
      "Colorado", "Houston", "Iowa State", "Kansas", "Kansas State",
      "Oklahoma State", "TCU", "Texas Tech", "UCF", "Utah",
      "West Virginia",
    ],
  },
  {
    name: "Big East Tournament",
    startsAt: new Date("2026-03-11"),
    endsAt: new Date("2026-03-14"),
    isNeutralSite: true,
    teams: [
      "Butler", "Creighton", "DePaul", "Georgetown", "Marquette",
      "Providence", "Seton Hall", "St. John's", "UConn", "Villanova",
      "Xavier",
    ],
  },

  // ── Mid-major conferences ──────────────────────────────────────────────────
  {
    name: "Atlantic 10 Tournament",
    startsAt: new Date("2026-03-11"),
    endsAt: new Date("2026-03-15"),
    isNeutralSite: true,
    teams: [
      "Davidson", "Dayton", "Duquesne", "Fordham", "George Mason",
      "George Washington", "La Salle", "Loyola Chicago", "Rhode Island",
      "Richmond", "Saint Joseph's", "Saint Louis", "St. Bonaventure", "VCU",
    ],
  },
  {
    name: "Mountain West Tournament",
    startsAt: new Date("2026-03-11"),
    endsAt: new Date("2026-03-14"),
    isNeutralSite: true,
    teams: [
      "Air Force", "Boise State", "Colorado State", "Fresno State",
      "Grand Canyon", "Nevada", "New Mexico", "San Diego State",
      "San Jose State", "UNLV", "Utah State", "Wyoming",
    ],
  },
  {
    name: "American Athletic Tournament",
    startsAt: new Date("2026-03-10"),
    endsAt: new Date("2026-03-15"),
    isNeutralSite: true,
    teams: [
      "Charlotte", "East Carolina", "Florida Atlantic", "Memphis",
      "North Texas", "Rice", "South Florida", "Temple", "Tulane",
      "Tulsa", "UAB", "UTSA", "Wichita State",
    ],
  },
  {
    name: "West Coast Conference Tournament",
    startsAt: new Date("2026-03-05"),
    endsAt: new Date("2026-03-10"),
    isNeutralSite: true,
    teams: [
      "Gonzaga", "LMU", "Oregon State", "Pacific", "Pepperdine",
      "Portland", "Saint Mary's", "San Diego", "San Francisco",
      "Santa Clara", "Seattle", "Washington State",
    ],
  },
  {
    name: "Missouri Valley Tournament",
    startsAt: new Date("2026-03-05"),
    endsAt: new Date("2026-03-08"),
    isNeutralSite: true,
    teams: [
      "Belmont", "Bradley", "Drake", "Evansville", "Illinois State",
      "Indiana State", "Murray State", "Northern Iowa", "Southern Illinois",
      "UIC", "Valparaiso",
    ],
  },
  {
    name: "Horizon League Tournament",
    startsAt: new Date("2026-03-02"),
    endsAt: new Date("2026-03-10"),
    isNeutralSite: false,
    teams: [
      "Cleveland State", "Detroit Mercy", "Green Bay", "IU Indianapolis",
      "Milwaukee", "Northern Kentucky", "Oakland", "Purdue Fort Wayne",
      "Robert Morris", "Wright State", "Youngstown State",
    ],
  },
  {
    name: "Summit League Tournament",
    startsAt: new Date("2026-03-04"),
    endsAt: new Date("2026-03-08"),
    isNeutralSite: true,
    teams: [
      "Denver", "Kansas City", "North Dakota", "North Dakota State",
      "Oral Roberts", "Omaha", "South Dakota", "South Dakota State",
      "St. Thomas",
    ],
  },
  {
    name: "Coastal Athletic Tournament",
    startsAt: new Date("2026-03-06"),
    endsAt: new Date("2026-03-10"),
    isNeutralSite: true,
    teams: [
      "Campbell", "Charleston", "Drexel", "Elon", "Hampton",
      "Hofstra", "Monmouth", "North Carolina A&T", "Northeastern",
      "Stony Brook", "Towson", "UNCW", "William & Mary",
    ],
  },
  {
    name: "MAAC Tournament",
    startsAt: new Date("2026-03-05"),
    endsAt: new Date("2026-03-10"),
    isNeutralSite: true,
    teams: [
      "Canisius", "Fairfield", "Iona", "Manhattan", "Marist",
      "Merrimack", "Mount St. Mary's", "Niagara", "Quinnipiac",
      "Rider", "Sacred Heart", "Saint Peter's", "Siena",
    ],
  },
  {
    name: "MAC Tournament",
    startsAt: new Date("2026-03-10"),
    endsAt: new Date("2026-03-14"),
    isNeutralSite: true,
    teams: [
      "Akron", "Ball State", "Bowling Green", "Buffalo", "Central Michigan",
      "Eastern Michigan", "Kent State", "Miami (OH)", "Northern Illinois",
      "Ohio", "Toledo", "UMass", "Western Michigan",
    ],
  },
  {
    name: "Big Sky Tournament",
    startsAt: new Date("2026-03-07"),
    endsAt: new Date("2026-03-11"),
    isNeutralSite: true,
    teams: [
      "Eastern Washington", "Idaho", "Idaho State", "Montana",
      "Montana State", "Northern Arizona", "Northern Colorado",
      "Portland State", "Sacramento State", "Weber State",
    ],
  },
  {
    name: "Big South Tournament",
    startsAt: new Date("2026-03-04"),
    endsAt: new Date("2026-03-08"),
    isNeutralSite: false,
    teams: [
      "Charleston Southern", "Gardner-Webb", "High Point", "Longwood",
      "Presbyterian", "Radford", "UNC Asheville", "USC Upstate", "Winthrop",
    ],
  },
  {
    name: "ASUN Tournament",
    startsAt: new Date("2026-03-04"),
    endsAt: new Date("2026-03-08"),
    isNeutralSite: false,
    teams: [
      "Austin Peay", "Bellarmine", "Central Arkansas", "Eastern Kentucky",
      "Florida Gulf Coast", "Jacksonville", "Lipscomb", "North Alabama",
      "North Florida", "Queens", "Stetson", "West Georgia",
    ],
  },
  {
    name: "Ohio Valley Tournament",
    startsAt: new Date("2026-03-04"),
    endsAt: new Date("2026-03-07"),
    isNeutralSite: true,
    teams: [
      "Eastern Illinois", "Lindenwood", "Little Rock", "Morehead State",
      "Southeast Missouri", "SIUE", "Southern Indiana", "Tennessee State",
      "Tennessee Tech", "UT Martin", "Western Illinois",
    ],
  },
  {
    name: "Patriot League Tournament",
    startsAt: new Date("2026-03-03"),
    endsAt: new Date("2026-03-11"),
    isNeutralSite: false,
    teams: [
      "American", "Army West Point", "Boston University", "Bucknell",
      "Colgate", "Holy Cross", "Lafayette", "Lehigh",
      "Loyola Maryland", "Navy",
    ],
  },
  {
    name: "Southern Conference Tournament",
    startsAt: new Date("2026-03-06"),
    endsAt: new Date("2026-03-09"),
    isNeutralSite: true,
    teams: [
      "Chattanooga", "East Tennessee State", "Furman", "Mercer",
      "Samford", "The Citadel", "UNCG", "VMI", "Western Carolina", "Wofford",
    ],
  },
  {
    name: "Sun Belt Tournament",
    startsAt: new Date("2026-03-03"),
    endsAt: new Date("2026-03-09"),
    isNeutralSite: true,
    teams: [
      "Appalachian State", "Arkansas State", "Coastal Carolina",
      "Georgia Southern", "Georgia State", "James Madison", "Louisiana",
      "Marshall", "Old Dominion", "South Alabama", "Southern Mississippi",
      "Texas State", "Troy", "ULM",
    ],
  },
  {
    name: "Southland Tournament",
    startsAt: new Date("2026-03-08"),
    endsAt: new Date("2026-03-11"),
    isNeutralSite: true,
    teams: [
      "East Texas A&M", "Houston Christian", "Incarnate Word", "Lamar",
      "McNeese", "New Orleans", "Nicholls", "Northwestern State",
      "Southeastern Louisiana", "Stephen F. Austin", "Texas A&M-Corpus Christi",
      "UTRGV",
    ],
  },
  {
    name: "WAC Tournament",
    startsAt: new Date("2026-03-10"),
    endsAt: new Date("2026-03-14"),
    isNeutralSite: true,
    teams: [
      "Abilene Christian", "California Baptist", "Southern Utah",
      "Tarleton State", "UT Arlington", "Utah Tech", "Utah Valley",
    ],
  },
  {
    name: "Big West Tournament",
    startsAt: new Date("2026-03-10"),
    endsAt: new Date("2026-03-14"),
    isNeutralSite: true,
    teams: [
      "Cal Poly", "Cal State Bakersfield", "Cal State Fullerton", "CSUN",
      "Hawai'i", "Long Beach State", "UC Davis", "UC Irvine",
      "UC Riverside", "UC San Diego", "UC Santa Barbara",
    ],
  },
  {
    name: "Ivy League Tournament",
    startsAt: new Date("2026-03-14"),
    endsAt: new Date("2026-03-15"),
    isNeutralSite: true,
    teams: [
      "Brown", "Columbia", "Cornell", "Dartmouth",
      "Harvard", "Penn", "Princeton", "Yale",
    ],
  },
  {
    name: "Conference USA Tournament",
    startsAt: new Date("2026-03-10"),
    endsAt: new Date("2026-03-14"),
    isNeutralSite: true,
    teams: [
      "Delaware", "FIU", "Jacksonville State", "Kennesaw State", "Liberty",
      "Louisiana Tech", "Middle Tennessee", "Missouri State",
      "New Mexico State", "Sam Houston", "UTEP", "Western Kentucky",
    ],
  },
  {
    name: "MEAC Tournament",
    startsAt: new Date("2026-03-10"),
    endsAt: new Date("2026-03-14"),
    isNeutralSite: true,
    teams: [
      "Coppin State", "Delaware State", "Howard", "Maryland Eastern Shore",
      "Morgan State", "Norfolk State", "North Carolina Central",
      "South Carolina State",
    ],
  },
  {
    name: "SWAC Tournament",
    startsAt: new Date("2026-03-10"),
    endsAt: new Date("2026-03-14"),
    isNeutralSite: true,
    teams: [
      "Alabama A&M", "Alabama State", "Alcorn State", "Arkansas-Pine Bluff",
      "Bethune-Cookman", "Florida A&M", "Grambling State", "Jackson State",
      "Mississippi Valley State", "Prairie View A&M", "Southern University",
      "Texas Southern",
    ],
  },
  {
    name: "America East Tournament",
    startsAt: new Date("2026-03-14"),
    endsAt: new Date("2026-03-15"),
    isNeutralSite: false,
    teams: [
      "Albany", "Binghamton", "Bryant", "Maine",
      "New Hampshire", "NJIT", "UMass Lowell", "Vermont",
    ],
  },
  {
    name: "NEC Tournament",
    startsAt: new Date("2026-03-04"),
    endsAt: new Date("2026-03-10"),
    isNeutralSite: false,
    teams: [
      "Central Connecticut", "Chicago State", "Fairleigh Dickinson",
      "Le Moyne", "LIU", "Mercyhurst", "New Haven", "Saint Francis",
      "Stonehill", "Wagner",
    ],
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding production data (conferences & teams)...\n");

  // ── Rounds ────────────────────────────────────────────────────────────────
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
  console.log("✓ Rounds ready");

  const [round1] = await db
    .select()
    .from(rounds)
    .where(eq(rounds.name, "Round 1"));

  // ── Year ──────────────────────────────────────────────────────────────────
  await db
    .insert(years)
    .values({ name: "2026", isActive: true })
    .onConflictDoNothing({ target: years.name });
  console.log("✓ Year 2026 ready");

  const [year2026] = await db
    .select()
    .from(years)
    .where(eq(years.name, "2026"));

  // ── Tournaments & Teams ───────────────────────────────────────────────────
  let totalTeams = 0;
  for (const conf of conferenceData) {
    await db
      .insert(tournaments)
      .values({
        name: conf.name,
        startsAt: conf.startsAt,
        endsAt: conf.endsAt,
        isNeutralSite: conf.isNeutralSite,
        yearId: year2026.id,
      })
      .onConflictDoNothing({ target: [tournaments.name, tournaments.yearId] });

    const [tournament] = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.name, conf.name));

    for (const teamName of conf.teams) {
      await db
        .insert(teams)
        .values({
          name: teamName,
          tournamentId: tournament.id,
          roundId: round1.id,
          isEliminated: false,
        })
        .onConflictDoNothing({ target: [teams.name, teams.tournamentId] });
    }

    console.log(`  ✓ ${conf.name} — ${conf.teams.length} teams`);
    totalTeams += conf.teams.length;
  }

  console.log(`\n✓ Done! Seeded ${conferenceData.length} tournaments and ${totalTeams} teams.`);
  await client.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  client.end();
  process.exit(1);
});
