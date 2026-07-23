import { db } from '../../db/index.js';
export async function createNotification(data) {
    const result = await db.run(`INSERT INTO notifications (user_id, type, title, message, report_id, class_id) VALUES (?, ?, ?, ?, ?, ?)`, data.user_id, data.type, data.title, data.message || null, data.report_id || null, data.class_id || null);
    return { id: Number(result.lastID), ...data };
}
export async function getUserNotifications(userId, limit = 50) {
    return db.all(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`, userId, limit);
}
export async function getUnreadCount(userId) {
    const row = await db.get(`SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`, userId);
    return row?.count || 0;
}
export async function markAsRead(id, userId) {
    await db.run(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, id, userId);
    return { success: true };
}
export async function markAllAsRead(userId) {
    await db.run(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, userId);
    return { success: true };
}
export async function deleteNotification(id, userId) {
    await db.run(`DELETE FROM notifications WHERE id = ? AND user_id = ?`, id, userId);
    return { success: true };
}
