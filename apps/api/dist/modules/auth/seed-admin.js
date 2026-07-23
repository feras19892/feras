import { db } from '../../db/index.js';
import { hashPassword } from './crypto.js';
export async function seedAdminUser() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword)
        return;
    const passwordHash = await hashPassword(adminPassword);
    const existing = await db.all('SELECT id, role FROM users WHERE email = ?', adminEmail);
    if (existing.length > 0) {
        await db.run('UPDATE users SET password_hash = ?, role = ? WHERE email = ?', passwordHash, 'admin', adminEmail);
        console.log(`Seed admin updated: ${adminEmail}`);
        return;
    }
    await db.run('INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)', adminEmail, 'Admin', passwordHash, 'admin');
    console.log(`Seed admin created: ${adminEmail}`);
}
