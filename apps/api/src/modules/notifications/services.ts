import { db } from '../../db/index.js';
import { pushToUser, pushToSchool } from './sse.js';

export async function createNotification(data: {
  user_id: number; type: string; title: string; message?: string; report_id?: number; class_id?: string; priority?: string; quiz_id?: number;
}) {
  const priority = data.priority || 'immediate';
  const result = await db.run(
    `INSERT INTO notifications (user_id, type, title, message, report_id, class_id, quiz_id, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    data.user_id, data.type, data.title, data.message || null, data.report_id || null, data.class_id || null, data.quiz_id || null, priority
  );
  const notification = { id: Number(result.lastID), ...data, priority };

  // Push real-time SSE event only for immediate notifications
  if (priority === 'immediate') pushToUser(data.user_id, 'notification', notification);

  return notification;
}

export async function createSchoolNotification(data: {
  school_id: number; type: string; title: string; message?: string; priority?: string;
}) {
  const priority = data.priority || 'immediate';
  const result = await db.run(
    `INSERT INTO school_notifications (school_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)`,
    data.school_id, data.type, data.title, data.message || null, priority
  );
  const notification = { id: Number(result.lastID), ...data, priority };

  if (priority === 'immediate') pushToSchool(data.school_id, 'notification', notification);

  return notification;
}

export async function getSchoolNotifications(schoolId: number, limit = 50) {
  return db.all(`SELECT * FROM school_notifications WHERE school_id = ? ORDER BY is_pinned DESC, is_read ASC, created_at DESC LIMIT ?`, schoolId, limit);
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
  await db.run(`UPDATE school_notifications SET is_read = 1 WHERE school_id = ? AND is_read = 0`, schoolId);
  return { success: true };
}

export async function deleteSchoolNotification(id: number, schoolId: number) {
  await db.run(`DELETE FROM school_notifications WHERE id = ? AND school_id = ?`, id, schoolId);
  return { success: true };
}

export async function togglePinSchoolNotification(id: number, schoolId: number) {
  const notif = await db.get<{ is_pinned: number }>(`SELECT is_pinned FROM school_notifications WHERE id = ? AND school_id = ?`, id, schoolId);
  if (!notif) return { success: false, message: 'Not found' };
  const newVal = notif.is_pinned ? 0 : 1;
  await db.run(`UPDATE school_notifications SET is_pinned = ? WHERE id = ? AND school_id = ?`, newVal, id, schoolId);
  return { success: true, is_pinned: newVal };
}

export async function getUserNotifications(userId: number, limit = 50) {
  return db.all(`SELECT * FROM notifications WHERE user_id = ? ORDER BY is_pinned DESC, is_read ASC, created_at DESC LIMIT ?`, userId, limit);
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
  await db.run(`UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`, userId);
  return { success: true };
}

export async function deleteNotification(id: number, userId: number) {
  await db.run(`DELETE FROM notifications WHERE id = ? AND user_id = ?`, id, userId);
  return { success: true };
}

export async function togglePinNotification(id: number, userId: number) {
  const notif = await db.get<{ is_pinned: number }>(`SELECT is_pinned FROM notifications WHERE id = ? AND user_id = ?`, id, userId);
  if (!notif) return { success: false, message: 'Not found' };
  const newVal = notif.is_pinned ? 0 : 1;
  await db.run(`UPDATE notifications SET is_pinned = ? WHERE id = ? AND user_id = ?`, newVal, id, userId);
  return { success: true, is_pinned: newVal };
}
