import { db, runMigrations } from '../db/index.js'

const DB_PATH = process.env.DB_PATH || './data/app.db'
console.log(`Resetting database: ${DB_PATH}`)

await runMigrations()

const adminRows = (await db.all('SELECT id, email, name, role FROM users WHERE role = ?', 'admin')) as any[]
if (adminRows.length === 0) {
  console.error('No admin user found. Aborting to avoid lockout.')
  process.exit(1)
}

console.log(`Keeping ${adminRows.length} admin(s): ${adminRows.map((u: any) => `${u.name} <${u.email}>`).join(', ')}`)

const protectedTables = new Set([
  '__migrations',
  'sqlite_sequence',
  'sqlite_stat1',
  'sqlite_stat2',
  'plans',
  'plan_packages',
  'subscription_controls',
  'notification_templates',
])

const tables = (await db.all(`
  SELECT name FROM sqlite_master
  WHERE type = 'table'
    AND name NOT LIKE 'sqlite_%'
    AND name NOT LIKE '%_new'
    AND name NOT LIKE '%_old'
`)) as { name: string }[]

const tableNames = tables.map((t: { name: string }) => t.name).filter((n: string) => !protectedTables.has(n))

try {
  await db.run('PRAGMA foreign_keys = OFF')
  await db.run('BEGIN')

  for (const name of tableNames) {
    if (name === 'users') {
      const before = await db.get<{ n: number }>('SELECT COUNT(*) as n FROM users')
      await db.run('DELETE FROM users WHERE role != ?', 'admin')
      const after = await db.get<{ n: number }>('SELECT COUNT(*) as n FROM users')
      console.log(`  users: deleted ${Number(before?.n ?? 0) - Number(after?.n ?? 0)} rows`)
    } else {
      await db.run(`DELETE FROM \`${name}\``)
      console.log(`  ${name}: cleared`)
    }
    await db.run('DELETE FROM sqlite_sequence WHERE name = ?', name).catch(() => {})
  }

  await db.run('COMMIT')
  await db.run('PRAGMA foreign_keys = ON')
  await db.run('PRAGMA wal_checkpoint(TRUNCATE)')
  await db.run('VACUUM')
  await db.run('ANALYZE')

  const finalUsers = await db.get<{ n: number }>('SELECT COUNT(*) as n FROM users')
  console.log(`Done. Remaining users: ${finalUsers?.n ?? 0}`)
} catch (err) {
  await db.run('ROLLBACK').catch(() => {})
  console.error('Reset failed:', err)
  process.exit(1)
}

await db.close()
