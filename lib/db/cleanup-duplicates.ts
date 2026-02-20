import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

// Load from .env.local if it exists
dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  throw new Error("DATABASE_URL environment variable is not set");
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(client);

async function main() {
  console.log("Cleaning up duplicate data...");

  // Clean up duplicate teams (keep first occurrence)
  const teamsResult = await db.execute(sql`
    DELETE FROM "teams" a USING "teams" b
    WHERE a.id > b.id
    AND a.name = b.name
    AND a.tournament_id = b.tournament_id
  `);
  console.log(`  ✓ Removed duplicate teams`);

  // Clean up duplicate tournaments (keep first occurrence)
  const tournamentsResult = await db.execute(sql`
    DELETE FROM "tournaments" a USING "tournaments" b
    WHERE a.id > b.id
    AND a.name = b.name
    AND a.year_id = b.year_id
  `);
  console.log(`  ✓ Removed duplicate tournaments`);

  console.log("\n✓ Cleanup complete!");

  await client.end();
}

main().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
