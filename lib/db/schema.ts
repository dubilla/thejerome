import {
  pgTable,
  serial,
  varchar,
  boolean,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Users ───────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  entries: many(entries),
}));

// ─── Years ───────────────────────────────────────────────────────────

export const years = pgTable("years", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(false),
});

export const yearsRelations = relations(years, ({ many }) => ({
  tournaments: many(tournaments),
  entries: many(entries),
}));

// ─── Rounds ──────────────────────────────────────────────────────────

export const rounds = pgTable("rounds", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  order: integer("order").notNull(),
  points: integer("points").notNull().default(0),
});

export const roundsRelations = relations(rounds, ({ many }) => ({
  teams: many(teams),
}));

// ─── Tournaments ─────────────────────────────────────────────────────

export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  startsAt: timestamp("starts_at", { mode: "date" }).notNull(),
  yearId: integer("year_id")
    .notNull()
    .references(() => years.id),
});

export const tournamentsRelations = relations(tournaments, ({ one, many }) => ({
  year: one(years, { fields: [tournaments.yearId], references: [years.id] }),
  teams: many(teams),
  picks: many(picks),
}));

// ─── Teams ───────────────────────────────────────────────────────────

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  tournamentId: integer("tournament_id")
    .notNull()
    .references(() => tournaments.id),
  roundId: integer("round_id")
    .notNull()
    .references(() => rounds.id),
  isEliminated: boolean("is_eliminated").notNull().default(false),
});

export const teamsRelations = relations(teams, ({ one, many }) => ({
  tournament: one(tournaments, {
    fields: [teams.tournamentId],
    references: [tournaments.id],
  }),
  round: one(rounds, { fields: [teams.roundId], references: [rounds.id] }),
  picks: many(picks),
}));

// ─── Entries ─────────────────────────────────────────────────────────

export const entries = pgTable(
  "entries",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    yearId: integer("year_id")
      .notNull()
      .references(() => years.id),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [unique("entries_user_year_unique").on(table.userId, table.yearId)]
);

export const entriesRelations = relations(entries, ({ one, many }) => ({
  user: one(users, { fields: [entries.userId], references: [users.id] }),
  year: one(years, { fields: [entries.yearId], references: [years.id] }),
  picks: many(picks),
}));

// ─── Picks ───────────────────────────────────────────────────────────

export const picks = pgTable(
  "picks",
  {
    id: serial("id").primaryKey(),
    entryId: integer("entry_id")
      .notNull()
      .references(() => entries.id),
    tournamentId: integer("tournament_id")
      .notNull()
      .references(() => tournaments.id),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id),
    scoreCache: integer("score_cache").notNull().default(0),
  },
  (table) => [
    unique("picks_entry_tournament_unique").on(
      table.entryId,
      table.tournamentId
    ),
  ]
);

export const picksRelations = relations(picks, ({ one }) => ({
  entry: one(entries, { fields: [picks.entryId], references: [entries.id] }),
  tournament: one(tournaments, {
    fields: [picks.tournamentId],
    references: [tournaments.id],
  }),
  team: one(teams, { fields: [picks.teamId], references: [teams.id] }),
}));

// ─── Inferred Types ─────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Year = typeof years.$inferSelect;
export type NewYear = typeof years.$inferInsert;

export type Round = typeof rounds.$inferSelect;
export type NewRound = typeof rounds.$inferInsert;

export type Tournament = typeof tournaments.$inferSelect;
export type NewTournament = typeof tournaments.$inferInsert;

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;

export type Pick = typeof picks.$inferSelect;
export type NewPick = typeof picks.$inferInsert;
