import { db } from '../../db/index.js';

export async function getUserFullProfile(userId: number) {
  const user = await db.get(`SELECT id, name, email, role, email_verified_at, created_at, blocked_at, block_reason FROM users WHERE id = ?`, userId);
  if (!user) return null;

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

  return { user, classes, joinedClasses, reports, activity, warnings, notes };
}

export async function banUser(userId: number, reason: string) {
  await db.run(`UPDATE users SET blocked_at = datetime('now'), block_reason = ? WHERE id = ?`, reason, userId);
  return { success: true };
}

export async function unbanUser(userId: number) {
  await db.run(`UPDATE users SET blocked_at = NULL, block_reason = NULL WHERE id = ?`, userId);
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
