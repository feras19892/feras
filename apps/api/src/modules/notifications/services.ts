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
  // Show pinned + unread; read non-pinned are auto-deleted
  return db.all(`SELECT * FROM school_notifications WHERE school_id = ? AND (is_pinned = 1 OR is_read = 0) ORDER BY is_pinned DESC, created_at DESC LIMIT ?`, schoolId, limit);
}

export async function getSchoolUnreadCount(schoolId: number) {
  const row = await db.get(`SELECT COUNT(*) as count FROM school_notifications WHERE school_id = ? AND is_read = 0`, schoolId);
  return row?.count || 0;
}

export async function markSchoolNotificationAsRead(id: number, schoolId: number) {
  // If pinned, just mark as read. If not pinned, delete it (auto-disappear after reading)
  const notif = await db.get<{ is_pinned: number }>(`SELECT is_pinned FROM school_notifications WHERE id = ? AND school_id = ?`, id, schoolId);
  if (!notif) return { success: true };
  if (notif.is_pinned) {
    await db.run(`UPDATE school_notifications SET is_read = 1 WHERE id = ? AND school_id = ?`, id, schoolId);
  } else {
    await db.run(`DELETE FROM school_notifications WHERE id = ? AND school_id = ?`, id, schoolId);
  }
  return { success: true };
}

export async function markAllSchoolNotificationsAsRead(schoolId: number) {
  // Delete all non-pinned, mark pinned as read
  await db.run('BEGIN IMMEDIATE');
  try {
    await db.run(`DELETE FROM school_notifications WHERE school_id = ? AND is_pinned = 0`, schoolId);
    await db.run(`UPDATE school_notifications SET is_read = 1 WHERE school_id = ?`, schoolId);
    await db.run('COMMIT');
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }
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
  // Show pinned + unread; read non-pinned are auto-deleted so they won't appear
  return db.all(`SELECT * FROM notifications WHERE user_id = ? AND (is_pinned = 1 OR is_read = 0) ORDER BY is_pinned DESC, created_at DESC LIMIT ?`, userId, limit);
}

export async function getUnreadCount(userId: number) {
  const row = await db.get(`SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`, userId);
  return row?.count || 0;
}

export async function markAsRead(id: number, userId: number) {
  // If pinned, just mark as read. If not pinned, delete it (auto-disappear after reading)
  const notif = await db.get<{ is_pinned: number }>(`SELECT is_pinned FROM notifications WHERE id = ? AND user_id = ?`, id, userId);
  if (!notif) return { success: true };
  if (notif.is_pinned) {
    await db.run(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, id, userId);
  } else {
    await db.run(`DELETE FROM notifications WHERE id = ? AND user_id = ?`, id, userId);
  }
  return { success: true };
}

export async function markAllAsRead(userId: number) {
  // Delete all non-pinned, mark pinned as read
  await db.run('BEGIN IMMEDIATE');
  try {
    await db.run(`DELETE FROM notifications WHERE user_id = ? AND is_pinned = 0`, userId);
    await db.run(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, userId);
    await db.run('COMMIT');
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }
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
