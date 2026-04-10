import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { TripInput, TripPlan } from "../types/trip";

export const trips = sqliteTable("trips", {
  id:        text("id").primaryKey(),
  version:   integer("version").notNull().default(1),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
  input:     text("input", { mode: "json" }).$type<TripInput>().notNull(),
  plan:      text("plan",  { mode: "json" }).$type<TripPlan>().notNull(),
});

export type TripRow = typeof trips.$inferSelect;
