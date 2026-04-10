import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "../db/database";
import { trips, TripRow } from "../db/schema";
import { StoredTrip, TripInput, TripPlan } from "../types/trip";

export class TripRepository {
  create(input: TripInput, plan: TripPlan): StoredTrip {
    const row: TripRow = {
      id: crypto.randomUUID(),
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      input,
      plan,
    };
    getDb().insert(trips).values(row).run();
    return toStoredTrip(row);
  }

  update(id: string, input: TripInput, plan: TripPlan): StoredTrip {
    const [updated] = getDb()
      .update(trips)
      .set({ version: sql`${trips.version} + 1`, input, plan, updatedAt: new Date().toISOString() })
      .where(eq(trips.id, id))
      .returning()
      .all();
    return toStoredTrip(updated);
  }

  findById(id: string): StoredTrip | null {
    const [row] = getDb().select().from(trips).where(eq(trips.id, id)).all();
    return row ? toStoredTrip(row) : null;
  }

  list(): StoredTrip[] {
    return getDb().select().from(trips).orderBy(desc(trips.createdAt)).all().map(toStoredTrip);
  }

  delete(id: string): StoredTrip | null {
    const [deleted] = getDb().delete(trips).where(eq(trips.id, id)).returning().all();
    return deleted ? toStoredTrip(deleted) : null;
  }
}

function toStoredTrip(row: TripRow): StoredTrip {
  return {
    id: row.id,
    version: row.version,
    createdAt: row.createdAt,
    ...(row.updatedAt ? { updatedAt: row.updatedAt } : {}),
    input: row.input,
    plan: row.plan,
  };
}
