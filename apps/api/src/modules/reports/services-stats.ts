import { db } from '../../db/index.js';

export async function getStudentStats(studentId: number) {
  const reports = await db.all<{ status: string; grade: number | null; feedback: string | null; feedback_seen: number }[]>(
    `SELECT status, grade, feedback, feedback_seen FROM experiment_reports WHERE student_id = ?`,
    studentId,
  );
  const total = reports.length;
  const graded = reports.filter((r) => r.status === 'graded');
  // دلالياً: pending = مُرسل/مُعاد إرساله فقط — المسودة حقل منفصل (كانت تُحتسب خطأً ضمن pending)
  const pending = reports.filter((r) => r.status === 'submitted' || r.status === 'resubmitted').length;
  const draft = reports.filter((r) => r.status === 'draft').length;
  const avg = graded.length > 0
    ? Math.round(graded.reduce((s, r) => s + (r.grade || 0), 0) / graded.length)
    : 0;
  const best = graded.reduce((m, r) => (r.grade != null && r.grade > m ? r.grade : m), 0);
  const newFeedback = graded.filter((r) => r.feedback && !r.feedback_seen).length;
  return {
    total,
    graded: graded.length,
    pending,
    draft,
    average: avg,
    best_grade: best,
    new_feedback: newFeedback,
  };
}

export interface TeacherLiveStats {
  pending: number;
  unopened: number;
  overdue: number;
  submitted_today: number;
  graded_today: number;
}

/** عدّادات دقيقة على مستوى كل فصول المعلم — بغض النظر عن حجم قوائم التقارير المقتطعة */
export async function getTeacherStats(teacherId: number): Promise<TeacherLiveStats> {
  const row = await db.get<{
    pending: number | null;
    unopened: number | null;
    overdue: number | null;
    submitted_today: number | null;
    graded_today: number | null;
  }>(
    `SELECT
       SUM(CASE WHEN r.status IN ('submitted','resubmitted') THEN 1 ELSE 0 END) as pending,
       SUM(CASE WHEN r.teacher_seen = 0 AND r.status != 'draft' THEN 1 ELSE 0 END) as unopened,
       SUM(CASE WHEN r.status IN ('submitted','resubmitted') AND r.submitted_at IS NOT NULL
                AND julianday('now') - julianday(r.submitted_at) >= 2 THEN 1 ELSE 0 END) as overdue,
       SUM(CASE WHEN date(r.submitted_at) = date('now', 'localtime') THEN 1 ELSE 0 END) as submitted_today,
       SUM(CASE WHEN r.graded_at IS NOT NULL AND date(r.graded_at) = date('now', 'localtime') THEN 1 ELSE 0 END) as graded_today
     FROM experiment_reports r
     JOIN classes c ON r.class_id = c.id
     WHERE c.teacher_id = ?`,
    teacherId,
  );
  return {
    pending: row?.pending ?? 0,
    unopened: row?.unopened ?? 0,
    overdue: row?.overdue ?? 0,
    submitted_today: row?.submitted_today ?? 0,
    graded_today: row?.graded_today ?? 0,
  };
}

export async function getClassStats(classId: string) {
  const reports = await db.all(
    `SELECT r.id, r.student_id, r.experiment_name, r.status, r.grade, r.submitted_at,
            u.name as student_name
     FROM experiment_reports r
     JOIN users u ON r.student_id = u.id WHERE r.class_id = ?`, classId);

  const total = reports.length;
  const graded = reports.filter((r) => r.status === 'graded');
  const gradedCount = graded.length;
  const avg = gradedCount > 0
    ? Math.round(graded.reduce((s, r) => s + (r.grade || 0), 0) / gradedCount)
    : 0;

  // Per-experiment stats
  const expMap = new Map<string, { count: number; grades: number[] }>();
  for (const r of reports) {
    const name = r.experiment_name;
    const cur = expMap.get(name) || { count: 0, grades: [] as number[] };
    cur.count++;
    if (r.grade !== undefined && r.grade !== null) cur.grades.push(r.grade as number);
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
    const cur = studentMap.get(sid) || { name: r.student_name, reports: 0, grades: [] as number[], last_submitted: r.submitted_at };
    cur.reports++;
    if (r.grade !== undefined && r.grade !== null) cur.grades.push(r.grade as number);
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

  return { total, graded: gradedCount, pending: total - gradedCount, average: avg, experiments, students, distribution };
}

export async function getClassReportsForExport(classId: string) {
  return db.all(
    `SELECT r.*, u.name as student_name FROM experiment_reports r
     JOIN users u ON r.student_id = u.id WHERE r.class_id = ? ORDER BY r.submitted_at DESC`, classId);
}

export async function markFeedbackSeen(id: number) {
  const report = await db.get<{ student_id: number; feedback_seen: number }>(
    `SELECT student_id, feedback_seen FROM experiment_reports WHERE id = ?`, id,
  );
  if (!report) return { success: false };
  if (report.feedback_seen === 0) {
    await db.run(`UPDATE experiment_reports SET feedback_seen = 1 WHERE id = ?`, id);
  }
  return { success: true };
}

export async function deleteReport(id: number, requester?: { role: string; id: number }) {
  const report = await db.get('SELECT student_id, class_id, status FROM experiment_reports WHERE id = ?', id);
  if (!report) return { success: false, message: 'التقرير غير موجود' };

  if (requester?.role === 'student') {
    if (report.student_id !== requester.id) return { success: false, message: 'غير مصرح' };
    if (report.status !== 'draft') return { success: false, message: 'لا يمكن حذف تقرير مُرسل' };
  } else if (requester?.role === 'teacher') {
    const cls = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', report.class_id);
    if (!cls || cls.teacher_id !== requester.id) return { success: false, message: 'غير مصرح' };
  } else if (requester?.role === 'school') {
    const cls = await db.get<{ school_id: number | null }>(
      'SELECT u.school_id FROM classes c JOIN users u ON c.teacher_id = u.id WHERE c.id = ?',
      report.class_id,
    );
    if (!cls || cls.school_id !== requester.id) return { success: false, message: 'غير مصرح' };
  }
  await db.run('DELETE FROM report_comments WHERE report_id = ?', id);
  await db.run('DELETE FROM grade_history WHERE report_id = ?', id);
  await db.run('DELETE FROM experiment_reports WHERE id = ?', id);
  return { success: true };
}
