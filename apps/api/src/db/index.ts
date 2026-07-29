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
await db.run('PRAGMA busy_timeout = 5000');

export { db };

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
      await db.exec(sql);
      await db.run('INSERT INTO __migrations (name) VALUES (?)', file);
      console.log(`Migration applied: ${file}`);
    }
  }
  await db.run('PRAGMA foreign_keys = ON');
}
