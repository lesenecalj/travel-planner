import { desc, eq } from "drizzle-orm";
import { getDb } from "../db/database";
import { trips, TripRow } from "../db/schema";
import { StoredTrip, TripInput, TripPlan } from "../types/trip";

export class TripRepository {
  create(input: TripInput, plan: TripPlan, label?: string): StoredTrip {
    const row: TripRow = {
      id: crypto.randomUUID(),
      version: 1,
      createdAt: new Date().toISOString(),
      input,
      plan,
      label: label ?? null,
    };
    getDb().insert(trips).values(row).run();
    return toStoredTrip(row);
  }

  update(id: string, input: TripInput, plan: TripPlan, label?: string): StoredTrip {
    const [existing] = getDb().select({ version: trips.version }).from(trips).where(eq(trips.id, id)).all();
    if (!existing) throw new Error(`Trip not found: ${id}`);
    const createdAt = new Date().toISOString();
    const version = existing.version + 1;
    getDb().update(trips).set({ version, input, plan, label: label ?? null, createdAt }).where(eq(trips.id, id)).run();
    return toStoredTrip({ id, version, createdAt, input, plan, label: label ?? null });
  }

  findById(id: string): StoredTrip | null {
    const [row] = getDb().select().from(trips).where(eq(trips.id, id)).all();
    return row ? toStoredTrip(row) : null;
  }

  list(): StoredTrip[] {
    return getDb().select().from(trips).orderBy(desc(trips.createdAt)).all().map(toStoredTrip);
  }
}

function toStoredTrip(row: TripRow): StoredTrip {
  return {
    id: row.id,
    version: row.version,
    createdAt: row.createdAt,
    input: row.input,
    plan: row.plan,
    label: row.label ?? undefined,
  };
}
