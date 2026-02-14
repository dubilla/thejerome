import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
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
