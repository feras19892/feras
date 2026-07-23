import { db } from '../../db/index.js';
export async function createWarning(adminId, userId, title, message, severity = 'normal') {
    const result = await db.run(`INSERT INTO warnings (admin_id, user_id, title, message, severity) VALUES (?, ?, ?, ?, ?)`, adminId, userId, title, message, severity);
    return { success: true, id: result.lastID };
}
export async function getWarningsForUser(userId) {
    return db.all(`SELECT w.*, a.name as admin_name FROM warnings w LEFT JOIN users a ON w.admin_id = a.id WHERE w.user_id = ? ORDER BY w.created_at DESC`, userId);
}
export async function getUnreadWarningsCount(userId) {
    const row = await db.get(`SELECT COUNT(*) as count FROM warnings WHERE user_id = ? AND is_read = 0`, userId);
    return row?.count || 0;
}
export async function markWarningRead(warningId) {
    await db.run(`UPDATE warnings SET is_read = 1, read_at = datetime('now') WHERE id = ?`, warningId);
    return { success: true };
}
export async function deleteWarning(warningId) {
    await db.run(`DELETE FROM warnings WHERE id = ?`, warningId);
    return { success: true };
}
export async function getAllWarnings(limit = 200) {
    return db.all(`SELECT w.*, u.name as user_name, a.name as admin_name FROM warnings w
     JOIN users u ON w.user_id = u.id
     LEFT JOIN users a ON w.admin_id = a.id
     ORDER BY w.created_at DESC LIMIT ?`, limit);
}
