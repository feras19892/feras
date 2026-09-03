import { db } from '../../db/index.js';
import { pushToUser } from '../notifications/sse.js';

export interface AdminNotificationInput {
  admin_id: number;
  target_type: 'all' | 'role' | 'school' | 'class' | 'user';
  target_value?: string;
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'immediate';
}

export interface AdminNotificationLog {
  id: number;
  admin_id: number;
  target_type: string;
  target_value: string | null;
  title: string;
  message: string;
  priority: string;
  recipient_count: number;
  status: string;
  created_at: string;
}

async function resolveUserIds(input: AdminNotificationInput): Promise<number[]> {
  const { target_type, target_value } = input;

  if (target_type === 'all') {
    const rows = await db.all<{ id: number }[]>(`SELECT id FROM users WHERE blocked_at IS NULL`);
    return rows.map((r: any) => r.id);
  }

  if (target_type === 'role') {
    const rows = await db.all<{ id: number }[]>(`SELECT id FROM users WHERE role = ? AND blocked_at IS NULL`, target_value);
    return rows.map((r: any) => r.id);
  }

  if (target_type === 'school') {
    const rows = await db.all<{ id: number }[]>(`SELECT id FROM users WHERE school_id = ? AND blocked_at IS NULL`, Number(target_value));
    return rows.map((r: any) => r.id);
  }

  if (target_type === 'class') {
    const rows = await db.all<{ student_id: number }[]>(
      `SELECT student_id FROM class_students WHERE class_id = ?`,
      target_value,
    );
    return rows.map((r: any) => r.student_id);
  }

  if (target_type === 'user') {
    const user = await db.get<{ id: number }>(`SELECT id FROM users WHERE id = ? AND blocked_at IS NULL`, Number(target_value));
    return user ? [user.id] : [];
  }

  return [];
}

export async function sendAdminNotification(input: AdminNotificationInput): Promise<{ success: boolean; id?: number; recipient_count?: number; message?: string }> {
  const userIds = await resolveUserIds(input);
  if (userIds.length === 0) {
    return { success: false, message: 'لا يوجد مستلمون مطابقون' };
  }

  const priority = input.priority || 'normal';

  const logResult = await db.run(
    `INSERT INTO admin_notification_logs (admin_id, target_type, target_value, title, message, priority, recipient_count, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    input.admin_id,
    input.target_type,
    input.target_value || null,
    input.title,
    input.message,
    priority,
    userIds.length,
    'sent',
  );

  const logId = Number(logResult.lastID);

  await db.run('BEGIN IMMEDIATE');
  try {
    for (const userId of userIds) {
      await db.run(
        `INSERT INTO notifications (user_id, type, title, message, priority, admin_batch_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        userId,
        'admin_notification',
        input.title,
        input.message,
        priority,
        logId,
      );
      if (priority === 'immediate') {
        try { pushToUser(userId, 'notification', { title: input.title, message: input.message, priority, admin_batch_id: logId }); } catch {}
      }
    }
    await db.run('COMMIT');
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }

  return { success: true, id: logId, recipient_count: userIds.length };
}

export async function getAdminNotificationLogs(adminId: number, page = 1, limit = 20): Promise<{ logs: AdminNotificationLog[]; total: number }> {
  const offset = (page - 1) * limit;
  const logs = await db.all<AdminNotificationLog[]>(
    `SELECT * FROM admin_notification_logs WHERE admin_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    adminId,
    limit,
    offset,
  );
  const totalRow = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM admin_notification_logs WHERE admin_id = ?`, adminId);
  return { logs, total: totalRow?.count || 0 };
}

export async function getAdminNotificationStats(logId: number): Promise<{ read_count: number; total: number }> {
  const totalRow = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM notifications WHERE admin_batch_id = ?`, logId);
  const readRow = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM notifications WHERE admin_batch_id = ? AND is_read = 1`, logId);
  return { read_count: readRow?.count || 0, total: totalRow?.count || 0 };
}

export async function deleteAdminNotificationLog(adminId: number, logId: number): Promise<{ success: boolean; message?: string }> {
  const log = await db.get<{ admin_id: number; status: string }>(`SELECT admin_id, status FROM admin_notification_logs WHERE id = ?`, logId);
  if (!log) return { success: false, message: 'السجل غير موجود' };
  if (log.admin_id !== adminId) return { success: false, message: 'غير مصرح' };

  await db.run('BEGIN IMMEDIATE');
  try {
    await db.run(`DELETE FROM notifications WHERE admin_batch_id = ?`, logId);
    await db.run(`DELETE FROM admin_notification_logs WHERE id = ?`, logId);
    await db.run('COMMIT');
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }

  return { success: true };
}
