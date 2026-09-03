import { db } from '../../db/index.js';

function escapeCsvValue(v: unknown): string {
  if (v === null || v === undefined) return '';
  let s = String(v).replace(/"/g, '""');
  if (/^[=+\-@\t\r]/.test(s)) {
    s = `\'${s}`;
  }
  if (s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return `"${s}"`;
  }
  return s;
}

function toCsv(rows: any[], columns: string[]) {
  if (!rows.length) return columns.join(',') + '\n';
  const lines = [columns.join(',')];
  for (const row of rows) {
    const vals = columns.map((c) => escapeCsvValue(row[c]));
    lines.push(vals.join(','));
  }
  return lines.join('\n');
}

export async function exportUsers() {
  const rows = await db.all(`SELECT id, name, email, role, created_at, email_verified_at FROM users ORDER BY id`);
  return toCsv(rows, ['id', 'name', 'email', 'role', 'created_at', 'email_verified_at']);
}

export async function exportReports(adminSchoolId?: number) {
  const conditions: string[] = [];
  const values: (string | number)[] = [];
  if (adminSchoolId) {
    conditions.push(`c.school_id = ?`);
    values.push(adminSchoolId);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await db.all(
    `SELECT r.id, u.name as student_name, r.experiment_name, c.name as class_name, t.name as teacher_name, r.status, r.grade, r.submitted_at, r.graded_at
     FROM experiment_reports r
     JOIN users u ON r.student_id = u.id
     JOIN classes c ON r.class_id = c.id
     LEFT JOIN users t ON c.teacher_id = t.id
     ${where}
     ORDER BY r.submitted_at DESC`,
    ...values,
  );
  return toCsv(rows, ['id', 'student_name', 'experiment_name', 'class_name', 'teacher_name', 'status', 'grade', 'submitted_at', 'graded_at']);
}

export async function exportClasses() {
  const rows = await db.all(
    `SELECT c.id, c.name, c.code, u.name as teacher_name, c.created_at,
     (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as student_count
     FROM classes c JOIN users u ON c.teacher_id = u.id ORDER BY c.created_at DESC`
  );
  return toCsv(rows, ['id', 'name', 'code', 'teacher_name', 'student_count', 'created_at']);
}

export async function exportFeedback() {
  const rows = await db.all(`SELECT id, user_name, type, experiment_name, rating, message, status, created_at FROM feedback ORDER BY created_at DESC`);
  return toCsv(rows, ['id', 'user_name', 'type', 'experiment_name', 'rating', 'message', 'status', 'created_at']);
}

export async function exportActivity() {
  const rows = await db.all(`SELECT id, actor_name, actor_role, action, target_type, target_id, details, created_at FROM activity_log ORDER BY created_at DESC LIMIT 5000`);
  return toCsv(rows, ['id', 'actor_name', 'actor_role', 'action', 'target_type', 'target_id', 'details', 'created_at']);
}
