-- Add ends_at column only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tournaments' AND column_name = 'ends_at'
  ) THEN
    ALTER TABLE "tournaments" ADD COLUMN "ends_at" timestamp;
    UPDATE "tournaments" SET "ends_at" = "starts_at" + INTERVAL '7 days' WHERE "ends_at" IS NULL;
    ALTER TABLE "tournaments" ALTER COLUMN "ends_at" SET NOT NULL;
  ELSE
    -- Column already exists, just ensure existing rows have values
    UPDATE "tournaments" SET "ends_at" = "starts_at" + INTERVAL '7 days' WHERE "ends_at" IS NULL;
    -- Ensure it's NOT NULL
    ALTER TABLE "tournaments" ALTER COLUMN "ends_at" SET NOT NULL;
  END IF;
END $$;--> statement-breakpoint
-- Add unique constraints
ALTER TABLE "teams" ADD CONSTRAINT "teams_name_tournament_unique" UNIQUE("name","tournament_id");--> statement-breakpoint
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_name_year_unique" UNIQUE("name","year_id");