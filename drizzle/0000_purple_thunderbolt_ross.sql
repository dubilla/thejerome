CREATE TABLE "entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"user_id" integer NOT NULL,
	"year_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "entries_user_year_unique" UNIQUE("user_id","year_id")
);
--> statement-breakpoint
CREATE TABLE "picks" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" integer NOT NULL,
	"tournament_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"score_cache" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "picks_entry_tournament_unique" UNIQUE("entry_id","tournament_id")
);
--> statement-breakpoint
CREATE TABLE "rounds" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"order" integer NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rounds_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"tournament_id" integer NOT NULL,
	"round_id" integer NOT NULL,
	"is_eliminated" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournaments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"starts_at" timestamp NOT NULL,
	"year_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "years" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	CONSTRAINT "years_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_year_id_years_id_fk" FOREIGN KEY ("year_id") REFERENCES "public"."years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "picks" ADD CONSTRAINT "picks_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "picks" ADD CONSTRAINT "picks_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "picks" ADD CONSTRAINT "picks_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_year_id_years_id_fk" FOREIGN KEY ("year_id") REFERENCES "public"."years"("id") ON DELETE no action ON UPDATE no action;