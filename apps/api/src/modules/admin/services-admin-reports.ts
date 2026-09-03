import { db } from '../../db/index.js';

export interface ReportFilters {
  search?: string;
  status?: string;
  schoolId?: number;
  adminSchoolId?: number;
  classId?: string;
  teacherId?: number;
  experiment?: string;
  from?: string;
  to?: string;
  gradeMin?: number;
  gradeMax?: number;
}

export async function getAllReportsWithDetails(page = 1, limit = 50, filters: ReportFilters = {}) {
  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const values: (string | number)[] = [];
  const { search, status, schoolId, adminSchoolId, classId, teacherId, experiment, from, to, gradeMin, gradeMax } = filters;

  if (status) { conditions.push(`r.status = ?`); values.push(status); }
  if (search) { conditions.push(`(r.experiment_name LIKE ? OR u.name LIKE ?)`); values.push(`%${search}%`, `%${search}%`); }
  if (adminSchoolId) { conditions.push(`c.school_id = ?`); values.push(adminSchoolId); }
  else if (schoolId) { conditions.push(`c.school_id = ?`); values.push(schoolId); }
  if (classId) { conditions.push(`r.class_id = ?`); values.push(classId); }
  if (teacherId) { conditions.push(`c.teacher_id = ?`); values.push(teacherId); }
  if (experiment) { conditions.push(`r.experiment_name = ?`); values.push(experiment); }
  if (from) { conditions.push(`r.submitted_at >= ?`); values.push(from); }
  if (to) { conditions.push(`r.submitted_at <= ?`); values.push(to); }
  if (gradeMin !== undefined) { conditions.push(`r.grade >= ?`); values.push(gradeMin); }
  if (gradeMax !== undefined) { conditions.push(`r.grade <= ?`); values.push(gradeMax); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await db.all(
    `SELECT r.*, u.name as student_name, u.email as student_email,
     c.name as class_name, t.id as teacher_id, c.school_id as school_id
     FROM experiment_reports r
     JOIN users u ON r.student_id = u.id
     JOIN classes c ON r.class_id = c.id
     JOIN users t ON c.teacher_id = t.id
     ${where}
     ORDER BY r.submitted_at DESC LIMIT ? OFFSET ?`,
    ...values, limit, offset,
  );
  const total = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM experiment_reports r
     JOIN users u ON r.student_id = u.id
     JOIN classes c ON r.class_id = c.id
     ${where}`,
    ...values,
  );
  return { reports: rows, total: total?.count || 0, page, limit, totalPages: Math.ceil((total?.count || 0) / limit) };
}

export async function getReportFilterOptions(adminSchoolId?: number) {
  const schoolWhere = adminSchoolId ? 'WHERE id = ?' : '';
  const classWhere = adminSchoolId ? 'WHERE school_id = ?' : '';
  const teacherWhere = adminSchoolId ? 'WHERE school_id = ? AND role = \'teacher\'' : 'WHERE role = \'teacher\'';
  const experimentWhere = adminSchoolId ? 'JOIN classes c ON r.class_id = c.id WHERE c.school_id = ?' : '';
  const schools = await db.all<{ id: number; name: string }[]>(`SELECT id, name FROM schools ${schoolWhere} ORDER BY name`, ...(adminSchoolId ? [adminSchoolId] : []));
  const classes = await db.all<{ id: string; name: string }[]>(`SELECT id, name FROM classes ${classWhere} ORDER BY name`, ...(adminSchoolId ? [adminSchoolId] : []));
  const teachers = await db.all<{ id: number; name: string }[]>(`SELECT id, name FROM users ${teacherWhere} ORDER BY name`, ...(adminSchoolId ? [adminSchoolId] : []));
  const experiments = await db.all<{ name: string }[]>(`SELECT DISTINCT experiment_name as name FROM experiment_reports r ${experimentWhere} ORDER BY experiment_name`, ...(adminSchoolId ? [adminSchoolId] : []));
  return { schools, classes, teachers, experiments };
}

export async function getReportsForExport(ids?: number[], adminSchoolId?: number) {
  const conditions: string[] = [];
  const values: (string | number)[] = [];
  if (ids?.length) {
    conditions.push(`r.id IN (${ids.map(() => '?').join(',')})`);
    values.push(...ids);
  }
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
  return rows;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeCsvValue(v: unknown): string {
  if (v === null || v === undefined) return '';
  let s = String(v).replace(/"/g, '""');
  // CSV injection guard: prepend apostrophe to dangerous formula triggers
  if (/^[=+\-@\t\r]/.test(s)) {
    s = `\'${s}`;
  }
  if (s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return `"${s}"`;
  }
  return s;
}

export async function toExcelHtml(rows: any[]) {
  const columns = ['id', 'student_name', 'experiment_name', 'class_name', 'teacher_name', 'status', 'grade', 'submitted_at', 'graded_at'];
  const header = columns.map(c => `<th>${escapeHtml(c)}</th>`).join('');
  const body = rows.map(row => `<tr>${columns.map(c => `<td>${escapeHtml(String(row[c] ?? ''))}</td>`).join('')}</tr>`).join('');
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"/><title>Reports</title></head><body><table border="1"><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></body></html>`;
}

export async function toCsv(rows: any[]) {
  const columns = ['id', 'student_name', 'experiment_name', 'class_name', 'teacher_name', 'status', 'grade', 'submitted_at', 'graded_at'];
  if (!rows.length) return columns.join(',') + '\n';
  const lines = [columns.join(',')];
  for (const row of rows) {
    const vals = columns.map(c => escapeCsvValue(row[c]));
    lines.push(vals.join(','));
  }
  return lines.join('\n');
}

export async function createScheduledReport(adminId: number, data: { name: string; frequency: string; format?: string; filters?: string }) {
  const { name, frequency, format = 'csv', filters = '{}' } = data;
  await db.run(
    `INSERT INTO scheduled_reports (admin_id, name, frequency, format, filters) VALUES (?, ?, ?, ?, ?)`,
    adminId, name, frequency, format, filters,
  );
  return { success: true };
}

export async function getScheduledReports(adminId: number) {
  return db.all<{ id: number; name: string; frequency: string; format: string; filters: string; created_at: string }[]>(
    `SELECT id, name, frequency, format, filters, created_at FROM scheduled_reports WHERE admin_id = ? ORDER BY created_at DESC`,
    adminId,
  );
}

export async function deleteScheduledReport(adminId: number, id: number) {
  const res = await db.run(`DELETE FROM scheduled_reports WHERE id = ? AND admin_id = ?`, id, adminId);
  return { success: res.changes ? true : false };
}

export async function getReportsAnalytics(adminSchoolId?: number) {
  const classFilter = adminSchoolId ? 'AND class_id IN (SELECT id FROM classes WHERE school_id = ?)' : '';
  const statusRows = await db.all<{ status: string; count: number }[]>(`SELECT status, COUNT(*) as count FROM experiment_reports WHERE 1=1 ${classFilter} GROUP BY status`, ...(adminSchoolId ? [adminSchoolId] : []));
  const avg = await db.get<{ average: number }>(`SELECT AVG(grade) as average FROM experiment_reports WHERE grade IS NOT NULL ${classFilter}`, ...(adminSchoolId ? [adminSchoolId] : []));
  const overdue = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM experiment_reports WHERE status IN ('submitted', 'resubmitted') AND submitted_at < datetime('now', '-3 days') ${classFilter}`, ...(adminSchoolId ? [adminSchoolId] : []));
  const graded = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'graded' ${classFilter}`, ...(adminSchoolId ? [adminSchoolId] : []));
  const total = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM experiment_reports WHERE 1=1 ${classFilter}`, ...(adminSchoolId ? [adminSchoolId] : []));
  const gradeDist = await db.all<{ range: string; count: number }[]>(`
    SELECT CASE
      WHEN grade >= 90 THEN '90-100'
      WHEN grade >= 80 THEN '80-89'
      WHEN grade >= 70 THEN '70-79'
      WHEN grade >= 60 THEN '60-69'
      WHEN grade >= 50 THEN '50-59'
      ELSE '0-49'
    END as range, COUNT(*) as count
    FROM experiment_reports WHERE grade IS NOT NULL ${classFilter} GROUP BY range
  `, ...(adminSchoolId ? [adminSchoolId] : []));
  const statusCounts: Record<string, number> = {};
  for (const row of statusRows) statusCounts[row.status] = row.count;
  return {
    total: total?.count || 0,
    graded: graded?.count || 0,
    average: Math.round((avg?.average || 0) * 10) / 10,
    overdue: overdue?.count || 0,
    statusCounts,
    gradeDistribution: gradeDist,
  };
}

export async function deleteReportForAdmin(reportId: number, adminSchoolId?: number) {
  const report = adminSchoolId
    ? await db.get<{ id: number }>(`SELECT r.id FROM experiment_reports r JOIN classes c ON r.class_id = c.id WHERE r.id = ? AND c.school_id = ?`, reportId, adminSchoolId)
    : await db.get<{ id: number }>(`SELECT id FROM experiment_reports WHERE id = ?`, reportId);
  if (!report) return { success: false, message: 'التقرير غير موجود أو غير مصرح' };
  await db.run('BEGIN IMMEDIATE');
  try {
    await db.run(`DELETE FROM report_comments WHERE report_id = ?`, reportId);
    await db.run(`DELETE FROM grade_history WHERE report_id = ?`, reportId);
    await db.run(`DELETE FROM experiment_reports WHERE id = ?`, reportId);
    await db.run('COMMIT');
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }
  return { success: true };
}

export async function deleteReportsForAdmin(ids: number[], adminSchoolId?: number) {
  await db.run('BEGIN IMMEDIATE');
  try {
    for (const id of ids) {
      const report = adminSchoolId
        ? await db.get<{ id: number }>(`SELECT r.id FROM experiment_reports r JOIN classes c ON r.class_id = c.id WHERE r.id = ? AND c.school_id = ?`, id, adminSchoolId)
        : await db.get<{ id: number }>(`SELECT id FROM experiment_reports WHERE id = ?`, id);
      if (!report) throw new Error(`Report ${id} not found or not authorized`);
      await db.run(`DELETE FROM report_comments WHERE report_id = ?`, id);
      await db.run(`DELETE FROM grade_history WHERE report_id = ?`, id);
      await db.run(`DELETE FROM experiment_reports WHERE id = ?`, id);
    }
    await db.run('COMMIT');
    return { success: true };
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }
}

export async function updateReportGradeForAdmin(reportId: number, grade: number, feedback: string | undefined, adminId: number, adminName: string, adminSchoolId?: number) {
  const report = adminSchoolId
    ? await db.get<{ id: number; grade: number | null; feedback: string | null }>(`SELECT r.id, r.grade, r.feedback FROM experiment_reports r JOIN classes c ON r.class_id = c.id WHERE r.id = ? AND c.school_id = ?`, reportId, adminSchoolId)
    : await db.get<{ id: number; grade: number | null; feedback: string | null }>(`SELECT id, grade, feedback FROM experiment_reports WHERE id = ?`, reportId);
  if (!report) return { success: false, message: 'التقرير غير موجود أو غير مصرح' };
  if (grade < 0 || grade > 100) return { success: false, message: 'الدرجة يجب أن تكون بين 0 و 100' };

  await db.run('BEGIN IMMEDIATE');
  try {
    await db.run(
      `INSERT INTO grade_history (report_id, teacher_id, teacher_name, old_grade, new_grade, old_feedback, new_feedback)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      reportId, adminId, adminName, report.grade ?? null, grade, report.feedback ?? null, feedback || null,
    );
    await db.run(
      `UPDATE experiment_reports SET grade = ?, status = 'graded', graded_at = datetime('now'), feedback = ?, admin_graded_by = ? WHERE id = ?`,
      grade, feedback || null, adminId, reportId,
    );
    await db.run('COMMIT');
    return { success: true };
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }
}
