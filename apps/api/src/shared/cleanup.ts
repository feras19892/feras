import { db } from '../db/index.js';

export async function runCleanup() {
  try {
    await db.run("DELETE FROM refresh_tokens WHERE expires_at < datetime('now')");
    await db.run("DELETE FROM school_refresh_tokens WHERE expires_at < datetime('now')");
    await db.run("DELETE FROM email_verification_codes WHERE expires_at < datetime('now') AND used_at IS NULL");
    await db.run("DELETE FROM password_reset_codes WHERE expires_at < datetime('now')");
    await db.run("DELETE FROM login_attempts WHERE created_at < datetime('now', '-24 hours')");
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('[cleanup] Error:', err);
  }
}

const CLEANUP_INTERVAL = 60 * 60 * 1000;

export function startCleanupInterval() {
  runCleanup();
  setInterval(runCleanup, CLEANUP_INTERVAL);
}
