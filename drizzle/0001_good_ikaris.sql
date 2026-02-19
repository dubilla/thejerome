ALTER TABLE "teams" ADD COLUMN "seed" integer;--> statement-breakpoint
ALTER TABLE "tournaments" ADD COLUMN "is_neutral_site" boolean DEFAULT false NOT NULL;