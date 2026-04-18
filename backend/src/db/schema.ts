import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { TripInput, TripPlan } from "../types/trip";

export const users = sqliteTable("users", {
  id:           text("id").primaryKey(),
  email:        text("email").notNull().unique(),
  name:         text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt:    text("created_at").notNull(),
  updatedAt:    text("updated_at"),
});

export type UserRow = typeof users.$inferSelect;

export const trips = sqliteTable("trips", {
  id:        text("id").primaryKey(),
  userId:    text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  version:   integer("version").notNull().default(1),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
  input:     text("input", { mode: "json" }).$type<TripInput>().notNull(),
  plan:      text("plan",  { mode: "json" }).$type<TripPlan>().notNull(),
});

export type TripRow = typeof trips.$inferSelect;
