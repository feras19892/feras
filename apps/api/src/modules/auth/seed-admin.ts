import { db } from '../../db/index.js';
import { hashPassword } from './crypto.js';

export async function seedAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return;

  const existing = await db.all<{ id: number; role: string }[]>(
    'SELECT id, role FROM users WHERE email = ?',
    adminEmail
  );

  if (existing.length > 0) {
    if (existing[0].role !== 'admin') {
      await db.run('UPDATE users SET role = ? WHERE email = ?', 'admin', adminEmail);
      console.log(`Seed admin role corrected: ${adminEmail}`);
    }
    return;
  }

  const adminName = process.env.ADMIN_NAME || 'Admin';
  const passwordHash = await hashPassword(adminPassword);
  await db.run(
    'INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)',
    adminEmail,
    adminName,
    passwordHash,
    'admin'
  );
  console.log(`Seed admin created: ${adminEmail}`);
}

export async function seedEmergencyPassword() {
  const emergencyPwd = process.env.EMERGENCY_PASSWORD;
  if (!emergencyPwd) return;
  const existing = await db.get<{ value: string }>(
    'SELECT value FROM system_settings WHERE key = ?', 'emergency_password'
  );
  if (existing?.value) return;
  const hash = await hashPassword(emergencyPwd);
  await db.run(
    'INSERT OR IGNORE INTO system_settings (key, value) VALUES (?, ?)',
    'emergency_password', hash
  );
  console.log('[seed] Emergency password seeded from env');
}
