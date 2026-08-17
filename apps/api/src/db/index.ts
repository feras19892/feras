import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const db = await open({
  filename: process.env.DB_PATH || './data/app.db',
  driver: sqlite3.Database,
});

await db.run('PRAGMA journal_mode = WAL');
await db.run('PRAGMA foreign_keys = ON');
await db.run('PRAGMA busy_timeout = 15000');
await db.run('PRAGMA cache_size = -64000'); // 64MB cache
await db.run('PRAGMA mmap_size = 268435456'); // 256MB mmap
await db.run('PRAGMA synchronous = NORMAL'); // Safe with WAL, faster than FULL

export { db };

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 200;

function isBusyError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('SQLITE_BUSY') || msg.includes('database is locked');
}

export async function dbRun(sql: string, ...params: unknown[]): Promise<{ lastID?: number; changes?: number }> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await db.run(sql, ...params);
    } catch (err) {
      if (isBusyError(err) && attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, RETRY_BASE_MS * 2 ** attempt));
        continue;
      }
      throw err;
    }
  }
  return {};
}

export async function dbGet<T = unknown>(sql: string, ...params: unknown[]): Promise<T | undefined> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await db.get<T>(sql, ...params);
    } catch (err) {
      if (isBusyError(err) && attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, RETRY_BASE_MS * 2 ** attempt));
        continue;
      }
      throw err;
    }
  }
  return undefined;
}

export async function dbAll<T = unknown>(sql: string, ...params: unknown[]): Promise<T[]> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await db.all<T>(sql, ...params);
      return result as T[];
    } catch (err) {
      if (isBusyError(err) && attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, RETRY_BASE_MS * 2 ** attempt));
        continue;
      }
      throw err;
    }
  }
  return [];
}

export async function dbExec(sql: string): Promise<void> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await db.exec(sql);
      return;
    } catch (err) {
      if (isBusyError(err) && attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, RETRY_BASE_MS * 2 ** attempt));
        continue;
      }
      throw err;
    }
  }
}

export async function runMigrations() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS __migrations (
      name TEXT PRIMARY KEY,
      run_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const migrationsDir = join(__dirname, 'migrations');
  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  await db.run('PRAGMA foreign_keys = OFF');
  for (const file of files) {
    const exists = await db.get('SELECT 1 FROM __migrations WHERE name = ?', file);
    if (!exists) {
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');
      try {
        await db.exec('BEGIN');
        await db.exec(sql);
        await db.run('INSERT INTO __migrations (name) VALUES (?)', file);
        await db.exec('COMMIT');
        console.log(`Migration applied: ${file}`);
      } catch (err) {
        await db.exec('ROLLBACK').catch(() => {});
        console.error(`Migration failed: ${file}`, err);
        throw err;
      }
    }
  }
  await db.run('PRAGMA foreign_keys = ON');
}
