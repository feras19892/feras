import { db } from '../../db/index.js';
import { createNotification } from '../notifications/services.js';
import { broadcastEvent } from '../sse/event-bus.js';
import { checkAutoBadges } from '../gamification/services.js';

async function getTeacherId(classId: string): Promise<number | null> {
  const row = await db.get('SELECT teacher_id FROM classes WHERE id = ?', classId);
  return row?.teacher_id ?? null;
}

interface CreateReportData {
  student_id: number; class_id: string; experiment_type: string; experiment_name: string;
  experiment_id?: string;
  readings: string; params?: string;
  student_info?: string; conclusion?: string; conclusion_errors?: string;
  conclusion_improvements?: string; columns?: string; equations?: string;
  plots?: string; chart_snapshot?: string;
}

function validateReportData(data: CreateReportData): { valid: boolean; message?: string } {
  // Validate readings — at least 1 entry
  try {
    const readings = typeof data.readings === 'string' ? JSON.parse(data.readings) : data.readings;
    if (!Array.isArray(readings) || readings.length < 1) {
      return { valid: false, message: 'يجب إدخال قراءة واحدة على الأقل' };
    }
  } catch {
    return { valid: false, message: 'بيانات القراءات غير صالحة' };
  }

  return { valid: true };
}

async function checkDuplicateReport(studentId: number, classId: string, experimentName: string): Promise<boolean> {
  const existing = await db.get(
    `SELECT id FROM experiment_reports WHERE student_id = ? AND class_id = ? AND experiment_name = ? AND status IN ('submitted','graded','resubmitted') LIMIT 1`,
    studentId, classId, experimentName,
  );
  return !!existing;
}

export async function createReport(data: CreateReportData) {
  // Validate report content
  const validation = validateReportData(data);
  if (!validation.valid) {
    return { error: validation.message };
  }

  // Check for duplicate submission (same experiment + class + student)
  const isDuplicate = await checkDuplicateReport(data.student_id, data.class_id, data.experiment_name);
  if (isDuplicate) {
    return { error: 'لقد سلمت تقريراً لهذه التجربة في هذا الفصل بالفعل. استخدم إعادة الإرسال بدلاً من ذلك.' };
  }

  try {
    const result = await db.run(
      `INSERT INTO experiment_reports
       (student_id, class_id, experiment_type, experiment_name, experiment_id, readings, params,
        student_info, conclusion, conclusion_errors, conclusion_improvements,
        columns, equations, plots, chart_snapshot, status, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', CURRENT_TIMESTAMP)`,
      data.student_id, data.class_id, data.experiment_type, data.experiment_name, data.experiment_id || null,
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
      broadcastEvent({
        type: 'report_submitted',
        payload: { reportId, experimentName: data.experiment_name, classId: data.class_id },
        targetUserId: teacherId,
      });
    }

    return { id: reportId, ...data };
  } catch (err: unknown) {
    if (process.env.NODE_ENV !== 'production') console.error('[createReport] DB error:', err);
    return { error: 'فشل حفظ التقرير في قاعدة البيانات. تأكد من صحة البيانات وحاول مرة أخرى.' };
  }
  // Auto-check badges (non-blocking, after successful return)
  checkAutoBadges(data.student_id).catch(() => {});
}

export async function resubmitReport(reportId: number, data: CreateReportData) {
  const old = await getReportById(reportId);
  if (!old) return { success: false, message: 'التقرير غير موجود' };
  if (old.student_id !== data.student_id) return { success: false, message: 'غير مصرح — لا يمكنك إعادة إرسال تقرير لا يخصك' };
  try {
    const result = await db.run(
      `INSERT INTO experiment_reports
       (student_id, class_id, experiment_type, experiment_name, experiment_id, readings, params,
        student_info, conclusion, conclusion_errors, conclusion_improvements,
        columns, equations, plots, chart_snapshot, status, submitted_at, parent_id, version, teacher_seen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'resubmitted', CURRENT_TIMESTAMP, ?, ?, 0)`,
      data.student_id, data.class_id, data.experiment_type, data.experiment_name, data.experiment_id || null,
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
      broadcastEvent({
        type: 'report_resubmitted',
        payload: { reportId: newId, parentReportId: reportId, experimentName: data.experiment_name, classId: data.class_id },
        targetUserId: teacherId,
      });
    }

    return { success: true, id: newId };
  } catch (err: unknown) {
    if (process.env.NODE_ENV !== 'production') console.error('[resubmitReport] DB error:', err);
    return { success: false, message: 'فشل إعادة إرسال التقرير. تأكد من صحة البيانات وحاول مرة أخرى.' };
  }
}

export async function getReports(filters: { class_id?: string; student_id?: number; status?: string; search?: string; page?: number; limit?: number }) {
  let sql = `SELECT r.*, u.name as student_name, u.email as student_email
             FROM experiment_reports r JOIN users u ON r.student_id = u.id WHERE 1=1`;
  const params: (string | number)[] = [];
  if (filters.class_id) { sql += ' AND r.class_id = ?'; params.push(filters.class_id); }
  if (filters.student_id) { sql += ' AND r.student_id = ?'; params.push(filters.student_id); }
  if (filters.status) { sql += ' AND r.status = ?'; params.push(filters.status); }
  if (filters.search) {
    sql += ' AND (r.experiment_name LIKE ? OR u.name LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  sql += ' ORDER BY r.submitted_at DESC';
  const page = filters.page || 1;
  const limit = Math.min(100, filters.limit || 50);
  const offset = (page - 1) * limit;
  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);
  const rows = await db.all(sql, ...params);

  let countSql = `SELECT COUNT(*) as count FROM experiment_reports r JOIN users u ON r.student_id = u.id WHERE 1=1`;
  const countParams: (string | number)[] = [];
  if (filters.class_id) { countSql += ' AND r.class_id = ?'; countParams.push(filters.class_id); }
  if (filters.student_id) { countSql += ' AND r.student_id = ?'; countParams.push(filters.student_id); }
  if (filters.status) { countSql += ' AND r.status = ?'; countParams.push(filters.status); }
  if (filters.search) {
    countSql += ' AND (r.experiment_name LIKE ? OR u.name LIKE ?)';
    countParams.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  const total = await db.get<{ count: number }>(countSql, ...countParams);
  return { reports: rows, total: total?.count || 0, page, limit, totalPages: Math.ceil((total?.count || 0) / limit) };
}

export async function getReportById(id: number) {
  return db.get(`SELECT r.*, u.name as student_name, u.avatar_url as student_avatar_url FROM experiment_reports r JOIN users u ON r.student_id = u.id WHERE r.id = ?`, id);
}

export async function markReportAsSeen(id: number) {
  const report = await db.get<{ student_id: number; experiment_name: string; teacher_seen: number }>(
    `SELECT student_id, experiment_name, teacher_seen FROM experiment_reports WHERE id = ?`, id,
  );
  if (!report) return { success: false };

  // Only notify if this is the first time being seen
  if (report.teacher_seen === 0) {
    await db.run(`UPDATE experiment_reports SET teacher_seen = 1 WHERE id = ?`, id);
    await createNotification({
      user_id: report.student_id,
      type: 'report_opened',
      title: `المدرس يراجع تقريرك`,
      message: `تم فتح تقريرك "${report.experiment_name}" من قبل المدرس`,
      report_id: id,
    });
  }
  return { success: true };
}

export async function gradeReport(id: number, data: { grade: number; feedback?: string; grade_accuracy?: number; grade_presentation?: number; grade_conclusion?: number; grade_innovation?: number }, teacherId: number, teacherName: string) {
  let old = await db.get<{ student_id?: number; experiment_name?: string; class_id?: string; grade?: number; feedback?: string }>(`SELECT * FROM experiment_reports WHERE id = ?`, id);

  const dims = (data.grade_accuracy ?? 0) + (data.grade_presentation ?? 0) + (data.grade_conclusion ?? 0) + (data.grade_innovation ?? 0);
  const hasDims = data.grade_accuracy != null || data.grade_presentation != null || data.grade_conclusion != null || data.grade_innovation != null;
  const finalGrade = hasDims ? Math.min(100, dims) : data.grade;

  await db.run('BEGIN');
  try {
    if (old) {
      await db.run(
        `INSERT INTO grade_history (report_id, teacher_id, teacher_name, old_grade, new_grade, old_feedback, new_feedback)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        id, teacherId, teacherName, old.grade, finalGrade, old.feedback, data.feedback || null
      );
    }
    await db.run(
      `UPDATE experiment_reports SET grade=?, feedback=?, status='graded', graded_at=CURRENT_TIMESTAMP, graded_by=?, graded_by_name=?,
       grade_accuracy=?, grade_presentation=?, grade_conclusion=?, grade_innovation=?
       WHERE id=?`,
      finalGrade, data.feedback || null, teacherId, teacherName,
      data.grade_accuracy ?? null, data.grade_presentation ?? null, data.grade_conclusion ?? null, data.grade_innovation ?? null,
      id
    );
    await db.run('COMMIT');
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }

  // إشعار للطالب (خارج الـ transaction)
  if (old?.student_id) {
    await createNotification({
      user_id: old.student_id,
      type: 'report_graded',
      title: `تم تصحيح التقرير: ${old.experiment_name}`,
      message: `حصلت على ${data.grade}/100 في "${old.experiment_name}"`,
      report_id: id,
      class_id: old.class_id,
    });
    broadcastEvent({
      type: 'report_graded',
      payload: { reportId: id, grade: data.grade, experimentName: old.experiment_name, classId: old.class_id },
      targetUserId: old.student_id,
    });
  }

  // Auto-check badges after grading (non-blocking)
  if (old?.student_id) {
    checkAutoBadges(old.student_id).catch(() => {});
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

