import { db } from '../db/index.js'

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@physicslab.edu'

  console.log('=== Cleanup users (dry run by default) ===')
  console.log(`Admin email to keep: ${adminEmail}`)

  const users = await db.all<{ id: number; email: string; role: string }[]>(
    'SELECT id, email, role FROM users ORDER BY id',
  )

  if (users.length === 0) {
    console.log('No users found in users table.')
    return
  }

  console.log('\nExisting users:')
  for (const u of users) {
    console.log(`- [${u.id}] ${u.email} (${u.role})`)
  }

  const others = users.filter((u) => u.email !== adminEmail)

  if (others.length === 0) {
    console.log('\nNothing to delete: only admin user exists.')
    return
  }

  console.log(`\nUsers that would be deleted (non-admin):`)
  for (const u of others) {
    console.log(`- [${u.id}] ${u.email} (${u.role})`)
  }

  if (!process.argv.includes('--apply')) {
    console.log('\nDry run only. To actually delete all non-admin users, rerun with the --apply flag.')
    console.log('Example: pnpm tsx src/scripts/cleanup-users.ts --apply')
    return
  }

  const result = await db.run('DELETE FROM users WHERE email <> ?', adminEmail)
  console.log(`\nDeleted ${result.changes ?? 0} users. Only ${adminEmail} should remain.`)
}

main().catch((err) => {
  console.error('cleanup-users failed:', err)
  process.exit(1)
})
