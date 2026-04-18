import { desc, eq } from "drizzle-orm";
import { getDb } from "../db/database";
import { users, UserRow } from "../db/schema";
import { UserRecord, UserUpdateInput, CreateUserRecord } from "../types/user";

export class UserRepository {
  create(data: CreateUserRecord): UserRecord {
    const row: UserRow = {
      id: crypto.randomUUID(),
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    getDb().insert(users).values(row).run();
    return toUserRecord(row);
  }

  update(id: string, input: UserUpdateInput): UserRecord {
    const [updated] = getDb()
      .update(users)
      .set({ ...input, updatedAt: new Date().toISOString() })
      .where(eq(users.id, id))
      .returning()
      .all();
    return toUserRecord(updated);
  }

  findById(id: string): UserRecord | null {
    const [row] = getDb().select().from(users).where(eq(users.id, id)).all();
    return row ? toUserRecord(row) : null;
  }

  findByEmail(email: string): UserRecord | null {
    const [row] = getDb().select().from(users).where(eq(users.email, email)).all();
    return row ? toUserRecord(row) : null;
  }

  list(): UserRecord[] {
    return getDb().select().from(users).orderBy(desc(users.createdAt)).all().map(toUserRecord);
  }

  delete(id: string): UserRecord | null {
    const [deleted] = getDb().delete(users).where(eq(users.id, id)).returning().all();
    return deleted ? toUserRecord(deleted) : null;
  }
}

function toUserRecord(row: UserRow): UserRecord {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt,
    ...(row.updatedAt ? { updatedAt: row.updatedAt } : {}),
  };
}
