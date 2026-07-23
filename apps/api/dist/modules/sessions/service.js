import { db } from '../../db/index.js';
export async function logLogin(userId, ip, userAgent) {
    return db.run(`INSERT INTO session_log (user_id, ip, user_agent) VALUES (?, ?, ?)`, userId, ip || null, userAgent || null);
}
export async function logLogout(userId) {
    await db.run(`UPDATE session_log SET logout_at = datetime('now')
     WHERE id = (
       SELECT id FROM session_log
       WHERE user_id = ? AND logout_at IS NULL
       ORDER BY login_at DESC
       LIMIT 1
     )`, userId);
}
export async function getActiveSessions() {
    return db.all(`SELECT s.*, u.name, u.email, u.role FROM session_log s JOIN users u ON s.user_id = u.id WHERE s.logout_at IS NULL ORDER BY s.login_at DESC LIMIT 100`);
}
export async function getUserSessions(userId) {
    return db.all(`SELECT * FROM session_log WHERE user_id = ? ORDER BY login_at DESC LIMIT 50`, userId);
}
