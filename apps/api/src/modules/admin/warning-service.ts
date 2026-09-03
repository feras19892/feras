import { db } from '../../db/index.js';
import { dispatchEvent } from '../notifications/dispatch.js';

export async function createWarning(adminId: number, userId: number, title: string, message: string, severity = 'normal') {
  const result = await db.run(
    `INSERT INTO warnings (admin_id, user_id, title, message, severity) VALUES (?, ?, ?, ?, ?)`,
    adminId, userId, title, message, severity
  );

  const [admin, user] = await Promise.all([
    db.get<{ name: string }>('SELECT name FROM users WHERE id = ?', adminId),
    db.get<{ school_id: number | null }>('SELECT school_id FROM users WHERE id = ?', userId),
  ]);

  await dispatchEvent({
    type: 'warning_sent',
    actorId: adminId,
    actorName: admin?.name || 'الإدارة',
    actorRole: 'admin',
    payload: { studentId: userId, schoolId: user?.school_id || undefined, message: `${title}: ${message}` },
  });

  return { success: true, id: result.lastID };
}

export async function getWarningsForUser(userId: number) {
  return db.all(
    `SELECT w.*, a.name as admin_name, s.name as school_name
     FROM warnings w
     LEFT JOIN users a ON w.admin_id = a.id
     LEFT JOIN schools s ON w.school_id = s.id
     WHERE w.user_id = ?
     ORDER BY w.created_at DESC`,
    userId,
  );
}

export async function getUnreadWarningsCount(userId: number) {
  const row = await db.get(
    `SELECT COUNT(*) as count FROM warnings WHERE user_id = ? AND is_read = 0`,
    userId
  );
  return row?.count || 0;
}

export async function markWarningRead(warningId: number) {
  await db.run(
    `UPDATE warnings SET is_read = 1, read_at = datetime('now') WHERE id = ?`,
    warningId
  );
  return { success: true };
}

export async function deleteWarning(warningId: number) {
  await db.run(`DELETE FROM warnings WHERE id = ?`, warningId);
  return { success: true };
}

export async function getAllWarnings(limit = 200) {
  return db.all(
    `SELECT w.*, u.name as user_name, a.name as admin_name FROM warnings w
     JOIN users u ON w.user_id = u.id
     LEFT JOIN users a ON w.admin_id = a.id
     ORDER BY w.created_at DESC LIMIT ?`,
    limit
  );
}
