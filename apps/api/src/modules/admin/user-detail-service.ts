import { db } from '../../db/index.js';
import { dispatchEvent } from '../notifications/dispatch.js';
import { scheduleForSubscription, purgePendingForSubscription } from '../notifications/queue.js';
import { getActiveSubscription, getSubscriptionById } from '../subscriptions/services.js';

export async function getUserFullProfile(userId: number) {
  const user = await db.get(`SELECT id, name, email, role, email_verified_at, created_at, blocked_at, block_reason, school_id FROM users WHERE id = ?`, userId);
  if (!user) return null;

  const school = user.school_id ? await db.get<{ id: number; name: string }>(`SELECT id, name FROM schools WHERE id = ?`, user.school_id) : null;
  const lastLogin = await db.get<{ login_at: string }>(`SELECT login_at FROM session_log WHERE user_id = ? ORDER BY login_at DESC LIMIT 1`, userId);
  const sessions = await db.all(`SELECT id, login_at, ip as ip_address, user_agent FROM session_log WHERE user_id = ? AND logout_at IS NULL ORDER BY login_at DESC LIMIT 20`, userId);

  const classes = await db.all(
    `SELECT c.id, c.name, c.code, c.created_at, (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as student_count
     FROM classes c WHERE c.teacher_id = ? ORDER BY c.created_at DESC`,
    userId
  );

  const joinedClasses = await db.all(
    `SELECT c.id, c.name, c.code, c.created_at FROM class_students cs JOIN classes c ON cs.class_id = c.id WHERE cs.student_id = ?`,
    userId
  );

  const reports = await db.all(
    `SELECT r.id, r.experiment_name, r.status, r.grade, r.submitted_at, r.graded_at, c.name as class_name
     FROM experiment_reports r LEFT JOIN classes c ON r.class_id = c.id WHERE r.student_id = ? ORDER BY r.submitted_at DESC`,
    userId
  );

  const activity = await db.all(
    `SELECT action, details, created_at FROM activity_log WHERE actor_id = ? ORDER BY created_at DESC LIMIT 50`,
    userId
  );

  const warnings = await db.all(
    `SELECT id, title, severity, is_read, created_at FROM warnings WHERE user_id = ? ORDER BY created_at DESC`,
    userId
  );

  const notes = await db.all(
    `SELECT n.id, n.note, n.created_at, a.name as admin_name FROM admin_notes n LEFT JOIN users a ON n.admin_id = a.id WHERE n.user_id = ? ORDER BY n.created_at DESC`,
    userId
  );

  const subscription = await getActiveSubscription(userId, 'user');

  const notifications = await db.all(
    `SELECT id, type, title, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
    userId
  );

  const notificationQueue = await db.all(
    `SELECT id, event, event_date, scheduled_at, status, title, sent_at, created_at
     FROM subscription_notification_queue
     WHERE user_id = ?
     ORDER BY scheduled_at DESC LIMIT 30`,
    userId
  );

  return { user: { ...user, school }, classes, joinedClasses, reports, activity, warnings, notes, sessions, lastLogin: lastLogin?.login_at || null, subscription, notifications, notificationQueue };
}

export async function banUser(userId: number, reason: string, adminId: number, adminName: string) {
  await db.run(`UPDATE users SET blocked_at = datetime('now'), block_reason = ? WHERE id = ?`, reason, userId);
  await dispatchEvent({
    type: 'user_banned_admin',
    actorId: adminId,
    actorName: adminName,
    actorRole: 'admin',
    payload: { userId, reason },
  });
  return { success: true };
}

export async function unbanUser(userId: number, adminId: number, adminName: string) {
  await db.run(`UPDATE users SET blocked_at = NULL, block_reason = NULL WHERE id = ?`, userId);
  await dispatchEvent({
    type: 'user_unblocked',
    actorId: adminId,
    actorName: adminName,
    actorRole: 'admin',
    payload: { userId },
  });
  return { success: true };
}

export async function addNote(adminId: number, userId: number, note: string) {
  const result = await db.run(
    `INSERT INTO admin_notes (admin_id, user_id, note) VALUES (?, ?, ?)`,
    adminId, userId, note
  );
  return { success: true, id: result.lastID };
}

export async function deleteNote(noteId: number) {
  await db.run(`DELETE FROM admin_notes WHERE id = ?`, noteId);
  return { success: true };
}

export async function extendTrial(userId: number, days: number, adminId: number, adminName: string) {
  const sub = await getActiveSubscription(userId, 'user');
  if (!sub) return { success: false, message: 'لا يوجد اشتراك نشط' };
  const now = new Date().toISOString();
  const currentExpiry = sub.expires_at ? new Date(sub.expires_at) : new Date();
  const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
  await db.run(
    `UPDATE subscriptions SET expires_at = ?, next_billing_at = ?, updated_at = ? WHERE id = ?`,
    newExpiry,
    newExpiry,
    now,
    sub.id,
  );
  await dispatchEvent({
    type: 'subscription_updated',
    actorId: adminId,
    actorName: adminName,
    actorRole: 'admin',
    payload: { userId, message: `مددت التجربة ${days} أيام` },
  });
  const refreshed = await getActiveSubscription(userId, 'user');
  if (refreshed) void scheduleForSubscription(refreshed).catch(() => {});
  return { success: true, expires_at: newExpiry };
}

export async function changeSubscription(userId: number, data: { status?: string; plan_id?: number | null }) {
  const sub = await getActiveSubscription(userId, 'user');
  if (!sub) return { success: false, message: 'لا يوجد اشتراك نشط' };
  const fields: string[] = [];
  const values: any[] = [];
  if (data.status) { fields.push('status = ?'); values.push(data.status); }
  if (data.plan_id !== undefined) { fields.push('plan_id = ?'); values.push(data.plan_id); }
  if (!fields.length) return { success: false, message: 'لا توجد بيانات' };
  values.push(sub.id);
  await db.run(`UPDATE subscriptions SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`, ...values);
  const updated = await getSubscriptionById(sub.id);
  if (updated) {
    if (updated.status === 'TRIAL' || updated.status === 'ACTIVE') {
      void scheduleForSubscription(updated).catch(() => {});
    } else {
      void purgePendingForSubscription(updated.owner_id, updated.owner_type).catch(() => {});
    }
  }
  return { success: true };
}
