import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "../db/database";
import { trips, TripRow } from "../db/schema";
import { TripRecord, TripInput, TripPlan } from "../types/trip";

export class TripRepository {
  create(input: TripInput, plan: TripPlan, userId: string): TripRecord {
    const row: TripRow = {
      id: crypto.randomUUID(),
      userId,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      input,
      plan,
    };
    getDb().insert(trips).values(row).run();
    return toTripRecord(row);
  }

  update(id: string, input: TripInput, plan: TripPlan): TripRecord {
    const [updated] = getDb()
      .update(trips)
      .set({ version: sql`${trips.version} + 1`, input, plan, updatedAt: new Date().toISOString() })
      .where(eq(trips.id, id))
      .returning()
      .all();
    return toTripRecord(updated);
  }

  findById(id: string): TripRecord | null {
    const [row] = getDb().select().from(trips).where(eq(trips.id, id)).all();
    return row ? toTripRecord(row) : null;
  }

  list(): TripRecord[] {
    return getDb().select().from(trips).orderBy(desc(trips.createdAt)).all().map(toTripRecord);
  }

  listByUser(userId: string): TripRecord[] {
    return getDb().select().from(trips).where(eq(trips.userId, userId)).orderBy(desc(trips.createdAt)).all().map(toTripRecord);
  }

  delete(id: string): TripRecord | null {
    const [deleted] = getDb().delete(trips).where(eq(trips.id, id)).returning().all();
    return deleted ? toTripRecord(deleted) : null;
  }
}

function toTripRecord(row: TripRow): TripRecord {
  return {
    id: row.id,
    userId: row.userId,
    version: row.version,
    createdAt: row.createdAt,
    ...(row.updatedAt ? { updatedAt: row.updatedAt } : {}),
    input: row.input,
    plan: row.plan,
  };
}
