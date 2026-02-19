import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// Load from .env.local if it exists (won't override existing env vars)
dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  console.error("Checked:", process.env.DATABASE_URL ? "set" : "not set");
  throw new Error("DATABASE_URL environment variable is not set");
}

const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });

async function main() {
  console.log("Running migrations...");
  await migrate(drizzle(migrationClient), { migrationsFolder: "./drizzle" });
  console.log("Migrations complete!");
  await migrationClient.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
