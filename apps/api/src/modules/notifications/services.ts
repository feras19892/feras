import { db } from '../../db/index.js';
import { pushToUser, pushToSchool } from './sse.js';

export async function createNotification(data: {
  user_id: number; type: string; title: string; message?: string; report_id?: number; class_id?: string;
}) {
  const result = await db.run(
    `INSERT INTO notifications (user_id, type, title, message, report_id, class_id) VALUES (?, ?, ?, ?, ?, ?)`,
    data.user_id, data.type, data.title, data.message || null, data.report_id || null, data.class_id || null
  );
  const notification = { id: Number(result.lastID), ...data };

  // Push real-time SSE event
  pushToUser(data.user_id, 'notification', notification);

  return notification;
}

export async function createSchoolNotification(data: {
  school_id: number; type: string; title: string; message?: string;
}) {
  const result = await db.run(
    `INSERT INTO school_notifications (school_id, type, title, message) VALUES (?, ?, ?, ?)`,
    data.school_id, data.type, data.title, data.message || null
  );
  const notification = { id: Number(result.lastID), ...data };

  pushToSchool(data.school_id, 'notification', notification);

  return notification;
}

export async function getSchoolNotifications(schoolId: number, limit = 50) {
  return db.all(`SELECT * FROM school_notifications WHERE school_id = ? ORDER BY created_at DESC LIMIT ?`, schoolId, limit);
}

export async function getSchoolUnreadCount(schoolId: number) {
  const row = await db.get(`SELECT COUNT(*) as count FROM school_notifications WHERE school_id = ? AND is_read = 0`, schoolId);
  return row?.count || 0;
}

export async function markSchoolNotificationAsRead(id: number, schoolId: number) {
  await db.run(`UPDATE school_notifications SET is_read = 1 WHERE id = ? AND school_id = ?`, id, schoolId);
  return { success: true };
}

export async function markAllSchoolNotificationsAsRead(schoolId: number) {
  await db.run(`UPDATE school_notifications SET is_read = 1 WHERE school_id = ?`, schoolId);
  return { success: true };
}

export async function deleteSchoolNotification(id: number, schoolId: number) {
  await db.run(`DELETE FROM school_notifications WHERE id = ? AND school_id = ?`, id, schoolId);
  return { success: true };
}

export async function getUserNotifications(userId: number, limit = 50) {
  return db.all(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`, userId, limit);
}

export async function getUnreadCount(userId: number) {
  const row = await db.get(`SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`, userId);
  return row?.count || 0;
}

export async function markAsRead(id: number, userId: number) {
  await db.run(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, id, userId);
  return { success: true };
}

export async function markAllAsRead(userId: number) {
  await db.run(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, userId);
  return { success: true };
}

export async function deleteNotification(id: number, userId: number) {
  await db.run(`DELETE FROM notifications WHERE id = ? AND user_id = ?`, id, userId);
  return { success: true };
}
