-- Add ends_at column as nullable first
ALTER TABLE "tournaments" ADD COLUMN "ends_at" timestamp;

-- Set default value for existing rows (start + 7 days)
UPDATE "tournaments" SET "ends_at" = "starts_at" + INTERVAL '7 days' WHERE "ends_at" IS NULL;

-- Make the column NOT NULL after setting values
ALTER TABLE "tournaments" ALTER COLUMN "ends_at" SET NOT NULL;