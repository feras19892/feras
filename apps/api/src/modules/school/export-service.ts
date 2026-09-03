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

export async function exportSchoolUsers(schoolId: number) {
  const rows = await db.all(
    `SELECT id, name, email, role, created_at, blocked_at FROM users WHERE school_id = ? ORDER BY created_at DESC`,
    schoolId,
  );
  return toCsv(rows, ['id', 'name', 'email', 'role', 'created_at', 'blocked_at']);
}

export async function exportSchoolClasses(schoolId: number) {
  const rows = await db.all(
    `SELECT c.id, c.name, c.code, u.name as teacher_name, c.created_at, c.is_frozen,
     (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as student_count
     FROM classes c JOIN users u ON c.teacher_id = u.id
     WHERE u.school_id = ? ORDER BY c.created_at DESC`,
    schoolId,
  );
  return toCsv(rows, ['id', 'name', 'code', 'teacher_name', 'student_count', 'is_frozen', 'created_at']);
}

export async function exportSchoolReports(schoolId: number) {
  const rows = await db.all(
    `SELECT r.id, u.name as student_name, r.experiment_name, c.name as class_name,
     u2.name as teacher_name, r.status, r.grade, r.submitted_at, r.graded_at
     FROM experiment_reports r
     JOIN users u ON r.student_id = u.id
     LEFT JOIN classes c ON r.class_id = c.id
     LEFT JOIN users u2 ON c.teacher_id = u2.id
     WHERE u.school_id = ? ORDER BY r.submitted_at DESC`,
    schoolId,
  );
  return toCsv(rows, ['id', 'student_name', 'experiment_name', 'class_name', 'teacher_name', 'status', 'grade', 'submitted_at', 'graded_at']);
}

export async function exportSchoolActivity(schoolId: number) {
  const rows = await db.all(
    `SELECT a.id, a.actor_name, a.actor_role, a.action, a.target_type, a.target_id, a.details, a.created_at
     FROM activity_log a WHERE a.actor_id = ? OR a.target_id = ?
     ORDER BY a.created_at DESC LIMIT 5000`,
    schoolId, schoolId,
  );
  return toCsv(rows, ['id', 'actor_name', 'actor_role', 'action', 'target_type', 'target_id', 'details', 'created_at']);
}
