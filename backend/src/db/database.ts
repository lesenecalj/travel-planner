import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import * as schema from "./schema";

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), "travel.db");
const MIGRATIONS_PATH = path.join(__dirname, "../../drizzle");

let _sqlite: Database.Database;
let _db: ReturnType<typeof drizzle<typeof schema>>;

export function getDb() {
  if (!_db) {
    _sqlite = new Database(DB_PATH);
    _sqlite.pragma("journal_mode = WAL");
    _sqlite.pragma("foreign_keys = ON");
    _db = drizzle(_sqlite, { schema });
    migrate(_db, { migrationsFolder: MIGRATIONS_PATH });
  }
  return _db;
}

export function closeDb(): void {
  _sqlite?.close();
}
