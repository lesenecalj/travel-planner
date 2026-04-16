import { desc, eq } from "drizzle-orm";
import { getDb } from "../db/database";
import { users, UserRow } from "../db/schema";
import { StoredUser, UserInput } from "../types/user";

export class UserRepository {
  create(input: UserInput): StoredUser {
    const row: UserRow = {
      id: crypto.randomUUID(),
      email: input.email,
      name: input.name,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    getDb().insert(users).values(row).run();
    return toStoredUser(row);
  }

  update(id: string, input: Partial<UserInput>): StoredUser {
    const [updated] = getDb()
      .update(users)
      .set({ ...input, updatedAt: new Date().toISOString() })
      .where(eq(users.id, id))
      .returning()
      .all();
    return toStoredUser(updated);
  }

  findById(id: string): StoredUser | null {
    const [row] = getDb().select().from(users).where(eq(users.id, id)).all();
    return row ? toStoredUser(row) : null;
  }

  findByEmail(email: string): StoredUser | null {
    const [row] = getDb().select().from(users).where(eq(users.email, email)).all();
    return row ? toStoredUser(row) : null;
  }

  list(): StoredUser[] {
    return getDb().select().from(users).orderBy(desc(users.createdAt)).all().map(toStoredUser);
  }

  delete(id: string): StoredUser | null {
    const [deleted] = getDb().delete(users).where(eq(users.id, id)).returning().all();
    return deleted ? toStoredUser(deleted) : null;
  }
}

function toStoredUser(row: UserRow): StoredUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.createdAt,
    ...(row.updatedAt ? { updatedAt: row.updatedAt } : {}),
  };
}
