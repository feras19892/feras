import { db } from '../../db/index.js';
import { createNotification } from '../notifications/services.js';

async function getTeacherId(classId: string): Promise<number | null> {
  const row = await db.get('SELECT teacher_id FROM classes WHERE id = ?', classId);
  return row?.teacher_id ?? null;
}

interface CreateReportData {
  student_id: number; class_id: string; experiment_type: string; experiment_name: string;
  readings: string; params?: string;
  student_info?: string; conclusion?: string; conclusion_errors?: string;
  conclusion_improvements?: string; columns?: string; equations?: string;
  plots?: string; chart_snapshot?: string;
}

export async function createReport(data: CreateReportData) {
  const result = await db.run(
    `INSERT INTO experiment_reports
     (student_id, class_id, experiment_type, experiment_name, readings, params,
      student_info, conclusion, conclusion_errors, conclusion_improvements,
      columns, equations, plots, chart_snapshot, status, submitted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', CURRENT_TIMESTAMP)`,
    data.student_id, data.class_id, data.experiment_type, data.experiment_name,
    data.readings, data.params || null,
    data.student_info || null, data.conclusion || null,
    data.conclusion_errors || null, data.conclusion_improvements || null,
    data.columns || null, data.equations || null,
    data.plots || null, data.chart_snapshot || null
  );
  const reportId = Number(result.lastID);

  // إشعار للمدرس
  const teacherId = await getTeacherId(data.class_id);
  if (teacherId) {
    await createNotification({
      user_id: teacherId,
      type: 'report_submitted',
      title: `تقرير جديد: ${data.experiment_name}`,
      message: `أرسل طالب تقريرًا جديدًا للتجربة "${data.experiment_name}"`,
      report_id: reportId,
      class_id: data.class_id,
    });
  }

  return { id: reportId, ...data };
}

export async function resubmitReport(reportId: number, data: CreateReportData) {
  const old = await getReportById(reportId);
  if (!old) return { success: false, message: 'التقرير غير موجود' };
  const result = await db.run(
    `INSERT INTO experiment_reports
     (student_id, class_id, experiment_type, experiment_name, readings, params,
      student_info, conclusion, conclusion_errors, conclusion_improvements,
      columns, equations, plots, chart_snapshot, status, submitted_at, parent_id, version)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'resubmitted', CURRENT_TIMESTAMP, ?, ?)`,
    data.student_id, data.class_id, data.experiment_type, data.experiment_name,
    data.readings, data.params || null,
    data.student_info || null, data.conclusion || null,
    data.conclusion_errors || null, data.conclusion_improvements || null,
    data.columns || null, data.equations || null,
    data.plots || null, data.chart_snapshot || null,
    reportId, (old.version || 1) + 1
  );
  const newId = Number(result.lastID);

  // إشعار للمدرس
  const teacherId = await getTeacherId(data.class_id);
  if (teacherId) {
    await createNotification({
      user_id: teacherId,
      type: 'report_resubmitted',
      title: `إعادة إرسال: ${data.experiment_name}`,
      message: `أعاد طالب إرسال تقرير "${data.experiment_name}"`,
      report_id: newId,
      class_id: data.class_id,
    });
  }

  return { success: true, id: newId };
}

export async function getReports(filters: { class_id?: string; student_id?: number; status?: string }) {
  let sql = `SELECT r.*, u.name as student_name, u.email as student_email
             FROM experiment_reports r JOIN users u ON r.student_id = u.id WHERE 1=1`;
  const params: any[] = [];
  if (filters.class_id) { sql += ' AND r.class_id = ?'; params.push(filters.class_id); }
  if (filters.student_id) { sql += ' AND r.student_id = ?'; params.push(filters.student_id); }
  if (filters.status) { sql += ' AND r.status = ?'; params.push(filters.status); }
  sql += ' ORDER BY r.submitted_at DESC';
  return db.all(sql, ...params);
}

export async function getReportById(id: number) {
  return db.get(`SELECT r.*, u.name as student_name FROM experiment_reports r JOIN users u ON r.student_id = u.id WHERE r.id = ?`, id);
}

export async function markReportAsSeen(id: number) {
  await db.run(`UPDATE experiment_reports SET teacher_seen = 1 WHERE id = ?`, id);
  return { success: true };
}

export async function gradeReport(id: number, data: { grade: number; feedback?: string }, teacherId: number, teacherName: string) {
  const old = await getReportById(id);
  if (old) {
    await db.run(
      `INSERT INTO grade_history (report_id, teacher_id, teacher_name, old_grade, new_grade, old_feedback, new_feedback)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id, teacherId, teacherName, old.grade, data.grade, old.feedback, data.feedback || null
    );
  }
  await db.run(
    `UPDATE experiment_reports SET grade=?, feedback=?, status='graded', graded_at=CURRENT_TIMESTAMP, graded_by=?, graded_by_name=? WHERE id=?`,
    data.grade, data.feedback || null, teacherId, teacherName, id
  );

  // إشعار للطالب
  if (old?.student_id) {
    await createNotification({
      user_id: old.student_id,
      type: 'report_graded',
      title: `تم تصحيح التقرير: ${old.experiment_name}`,
      message: `حصلت على ${data.grade}/100 في "${old.experiment_name}"`,
      report_id: id,
      class_id: old.class_id,
    });
  }

  return { success: true };
}

export async function addComment(reportId: number, data: { author_id: number; author_name: string; author_role: string; content: string }) {
  const result = await db.run(
    `INSERT INTO report_comments (report_id, author_id, author_name, author_role, content) VALUES (?, ?, ?, ?, ?)`,
    reportId, data.author_id, data.author_name, data.author_role, data.content
  );

  // إشعار للطرف الآخر
  const report = await getReportById(reportId);
  if (report) {
    const targetId = data.author_role === 'student' ? await getTeacherId(report.class_id) : report.student_id;
    if (targetId) {
      await createNotification({
        user_id: targetId,
        type: 'comment_added',
        title: `تعليق جديد على "${report.experiment_name}"`,
        message: `${data.author_name}: ${data.content.slice(0, 100)}`,
        report_id: reportId,
        class_id: report.class_id,
      });
    }
  }

  return { id: Number(result.lastID), ...data };
}

export async function getComments(reportId: number) {
  return db.all(`SELECT * FROM report_comments WHERE report_id = ? ORDER BY created_at ASC`, reportId);
}

export async function getGradeHistory(reportId: number) {
  return db.all(`SELECT * FROM grade_history WHERE report_id = ? ORDER BY created_at DESC`, reportId);
}

export async function getStudentStats(studentId: number) {
  const reports = await db.all(`SELECT status, grade FROM experiment_reports WHERE student_id = ?`, studentId);
  const total = reports.length;
  const graded = reports.filter((r: any) => r.status === 'graded');
  const avg = graded.length > 0
    ? Math.round(graded.reduce((s: number, r: any) => s + (r.grade || 0), 0) / graded.length)
    : 0;
  return { total, graded: graded.length, pending: total - graded.length, average: avg };
}

export async function getClassStats(classId: string) {
  const reports = await db.all(
    `SELECT r.*, u.name as student_name FROM experiment_reports r
     JOIN users u ON r.student_id = u.id WHERE r.class_id = ?`, classId);

  const total = reports.length;
  const graded = reports.filter((r: any) => r.status === 'graded');
  const avg = graded.length > 0
    ? Math.round(graded.reduce((s: number, r: any) => s + (r.grade || 0), 0) / graded.length)
    : 0;

  // Per-experiment stats
  const expMap = new Map<string, { count: number; grades: number[] }>();
  for (const r of reports) {
    const name = r.experiment_name;
    const cur = expMap.get(name) || { count: 0, grades: [] };
    cur.count++;
    if (r.grade !== undefined && r.grade !== null) cur.grades.push(r.grade);
    expMap.set(name, cur);
  }
  const experiments = Array.from(expMap.entries()).map(([name, data]) => ({
    name,
    count: data.count,
    avg: data.grades.length > 0 ? Math.round(data.grades.reduce((a: number, b: number) => a + b, 0) / data.grades.length) : 0,
    highest: data.grades.length > 0 ? Math.max(...data.grades) : 0,
    lowest: data.grades.length > 0 ? Math.min(...data.grades) : 0,
  }));

  // Per-student stats
  const studentMap = new Map<number, { name: string; reports: number; grades: number[]; last_submitted?: string }>();
  for (const r of reports) {
    const sid = r.student_id;
    const cur = studentMap.get(sid) || { name: r.student_name, reports: 0, grades: [], last_submitted: r.submitted_at };
    cur.reports++;
    if (r.grade !== undefined && r.grade !== null) cur.grades.push(r.grade);
    if (r.submitted_at && (!cur.last_submitted || r.submitted_at > cur.last_submitted)) cur.last_submitted = r.submitted_at;
    studentMap.set(sid, cur);
  }
  const students = Array.from(studentMap.entries()).map(([id, data]) => ({
    id, name: data.name, reports: data.reports,
    avg: data.grades.length > 0 ? Math.round(data.grades.reduce((a: number, b: number) => a + b, 0) / data.grades.length) : 0,
    lastSubmitted: data.last_submitted,
  })).sort((a, b) => b.avg - a.avg);

  // Grade distribution
  const distribution: Record<string, number> = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
  for (const g of graded) {
    const grade = g.grade || 0;
    if (grade <= 20) distribution['0-20']++;
    else if (grade <= 40) distribution['21-40']++;
    else if (grade <= 60) distribution['41-60']++;
    else if (grade <= 80) distribution['61-80']++;
    else distribution['81-100']++;
  }

  return { total, graded: graded.length, pending: total - graded.length, average: avg, experiments, students, distribution };
}

export async function getClassReportsForExport(classId: string) {
  return db.all(
    `SELECT r.*, u.name as student_name FROM experiment_reports r
     JOIN users u ON r.student_id = u.id WHERE r.class_id = ? ORDER BY r.submitted_at DESC`, classId);
}

export async function deleteReport(id: number, studentId?: number) {
  if (studentId !== undefined) {
    const report = await db.get('SELECT student_id, status FROM experiment_reports WHERE id = ?', id);
    if (!report) return { success: false, message: 'التقرير غير موجود' };
    if (report.student_id !== studentId) return { success: false, message: 'غير مصرح' };
    if (report.status !== 'draft') return { success: false, message: 'لا يمكن حذف تقرير مُرسل' };
  }
  await db.run('DELETE FROM experiment_reports WHERE id = ?', id);
  return { success: true };
}
