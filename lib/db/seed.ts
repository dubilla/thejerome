import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { hash } from "bcryptjs";
import { rounds, years, users } from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(client);

async function main() {
  console.log("Seeding database...");

  // Seed rounds
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
  console.log("  Rounds seeded");

  // Seed default year
  await db
    .insert(years)
    .values({ name: "2026", isActive: true })
    .onConflictDoNothing({ target: years.name });
  console.log("  Year seeded");

  // Seed admin user
  const passwordHash = await hash("admin123", 10);
  await db
    .insert(users)
    .values({
      email: "admin@thejerome.com",
      passwordHash,
      isAdmin: true,
    })
    .onConflictDoNothing({ target: users.email });
  console.log("  Admin user seeded");

  console.log("Seeding complete!");
  await client.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
