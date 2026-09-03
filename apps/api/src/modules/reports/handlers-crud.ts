import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createReportSchema, gradeReportSchema, addCommentSchema } from './schemas.js';
import * as svc from './services.js';
import { authMiddleware } from '../auth/middleware.js';
import { db } from '../../db/index.js';
import { reportExtraRoutes } from './handlers-extra.js';
import type { User } from '@my-modern-app/shared-types';

type Variables = { user: User };

const app = new Hono<{ Variables: Variables }>();

app.use(authMiddleware);

function validId(idStr: string): number | null {
  const n = Number(idStr);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function getReportsByClassIds(classIds: string[], query: { status?: string; student_id?: string; search?: string; page?: string; limit?: string }) {
  if (classIds.length === 0) return { reports: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  const placeholders = classIds.map(() => '?').join(',');
  let sql = `SELECT r.*, u.name as student_name, u.email as student_email
             FROM experiment_reports r JOIN users u ON r.student_id = u.id
             WHERE r.class_id IN (${placeholders})`;
  const params: (string | number)[] = [...classIds];
  if (query.status) { sql += ' AND r.status = ?'; params.push(query.status); }
  if (query.student_id) { sql += ' AND r.student_id = ?'; params.push(Number(query.student_id)); }
  if (query.search) {
    sql += ' AND (r.experiment_name LIKE ? OR u.name LIKE ?)';
    params.push(`%${query.search}%`, `%${query.search}%`);
  }
  sql += ' ORDER BY r.submitted_at DESC';
  const page = Number(query.page) || 1;
  const limit = Math.min(100, Number(query.limit) || 50);
  const offset = (page - 1) * limit;
  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);
  const rows = await db.all(sql, ...params);

  let countSql = `SELECT COUNT(*) as count FROM experiment_reports r JOIN users u ON r.student_id = u.id WHERE r.class_id IN (${placeholders})`;
  const countParams: (string | number)[] = [...classIds];
  if (query.status) { countSql += ' AND r.status = ?'; countParams.push(query.status); }
  if (query.student_id) { countSql += ' AND r.student_id = ?'; countParams.push(Number(query.student_id)); }
  if (query.search) {
    countSql += ' AND (r.experiment_name LIKE ? OR u.name LIKE ?)';
    countParams.push(`%${query.search}%`, `%${query.search}%`);
  }
  const total = await db.get<{ count: number }>(countSql, ...countParams);
  const totalCount = total?.count || 0;
  return { reports: rows, total: totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) };
}

async function verifySchoolOwnsClass(schoolId: number, classId: string): Promise<boolean> {
  const row = await db.get<{ school_id: number | null }>(
    'SELECT u.school_id FROM classes c JOIN users u ON c.teacher_id = u.id WHERE c.id = ?',
    classId,
  );
  return !!row && row.school_id === schoolId;
}

// POST / — إنشاء
app.post('/', zValidator('json', createReportSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  // Verify student is a member of the class
  if (user.role === 'student') {
    const member = await db.get('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?', body.class_id, user.id);
    if (!member) return c.json({ success: false, message: 'غير مصرح — أنت لست عضواً في هذا الفصل' }, 403);
  }
  // Block if class is frozen
  const cls = await db.get<{ is_frozen: number }>('SELECT is_frozen FROM classes WHERE id = ?', body.class_id);
  if (cls?.is_frozen) {
    return c.json({ success: false, message: 'هذا الفصل مُجمّد — لا يمكن إنشاء تقارير' }, 403);
  }
  const result = await svc.createReport({
    student_id: user.id,
    class_id: body.class_id,
    experiment_type: body.experiment_type,
    experiment_name: body.experiment_name,
    experiment_id: body.experiment_id,
    readings: body.readings,
    params: body.params,
    student_info: body.student_info,
    conclusion: body.conclusion,
    conclusion_errors: body.conclusion_errors,
    conclusion_improvements: body.conclusion_improvements,
    columns: body.columns,
    equations: body.equations,
    plots: body.plots,
    chart_snapshot: body.chart_snapshot,
    question_template_id: body.question_template_id,
  });
  if (result.error) {
    return c.json({ success: false, message: result.error }, 400);
  }
  return c.json({ success: true, report: result }, 201);
});

// POST /:id/resubmit — إعادة إرسال
app.post('/:id/resubmit', zValidator('json', createReportSchema), async (c) => {
  const user = c.get('user');
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
  const body = c.req.valid('json');
  // Verify student is a member of the class
  if (user.role === 'student') {
    const member = await db.get('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?', body.class_id, user.id);
    if (!member) return c.json({ success: false, message: 'غير مصرح — أنت لست عضواً في هذا الفصل' }, 403);
  }
  // Block if class is frozen
  const cls = await db.get<{ is_frozen: number }>('SELECT is_frozen FROM classes WHERE id = ?', body.class_id);
  if (cls?.is_frozen) {
    return c.json({ success: false, message: 'هذا الفصل مُجمّد — لا يمكن إعادة إرسال التقارير' }, 403);
  }
  const result = await svc.resubmitReport(id, {
    student_id: user.id,
    class_id: body.class_id,
    experiment_type: body.experiment_type,
    experiment_name: body.experiment_name,
    experiment_id: body.experiment_id,
    readings: body.readings,
    params: body.params,
    student_info: body.student_info,
    conclusion: body.conclusion,
    conclusion_errors: body.conclusion_errors,
    conclusion_improvements: body.conclusion_improvements,
    columns: body.columns,
    equations: body.equations,
    plots: body.plots,
    chart_snapshot: body.chart_snapshot,
  });
  if (!result.success) return c.json(result, 400);
  return c.json(result);
});

// GET / — قائمة
app.get('/', async (c) => {
  const user = c.get('user');
  const query = c.req.query();
  if (user.role === 'admin') {
    const result = await svc.getReports({
      class_id: query.class_id,
      student_id: query.student_id ? Number(query.student_id) : undefined,
      status: query.status,
      search: query.search,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 50,
    });
    return c.json({ success: true, ...result });
  }
  if (user.role === 'teacher') {
    const teacherClasses: { id: string }[] = await db.all('SELECT id FROM classes WHERE teacher_id = ?', user.id);
    let classIds = teacherClasses.map((cls) => cls.id);
    if (query.class_id) classIds = classIds.filter(id => id === query.class_id);
    const result = await getReportsByClassIds(classIds, query);
    return c.json({ success: true, ...result });
  }
  if (user.role === 'school') {
    const schoolClasses: { id: string }[] = await db.all(
      'SELECT c.id FROM classes c JOIN users u ON c.teacher_id = u.id WHERE u.school_id = ?',
      user.id,
    );
    let classIds = schoolClasses.map((cls) => cls.id);
    if (query.class_id) classIds = classIds.filter(id => id === query.class_id);
    const result = await getReportsByClassIds(classIds, query);
    return c.json({ success: true, ...result });
  }
  if (user.role === 'student') {
    const result = await svc.getReports({
      student_id: user.id,
      status: query.status,
      search: query.search,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 50,
    });
    return c.json({ success: true, ...result });
  }
  return c.json({ success: false, message: 'غير مصرح' }, 403);
});

// GET /:id — تفاصيل
app.get('/:id', async (c) => {
  const user = c.get('user');
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
  const report = await svc.getReportById(id);
  if (!report) return c.json({ success: false, message: 'التقرير غير موجود' }, 404);
  // Students can only see their own reports
  if (user.role === 'student' && report.student_id !== user.id) {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  // Teachers can only see reports in their classes
  if (user.role === 'teacher') {
    const classRow = await db.get<{ teacher_id: number }>(
      'SELECT teacher_id FROM classes WHERE id = ?', report.class_id
    );
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  }
  // School can only see reports in their school's classes
  if (user.role === 'school') {
    const owns = await verifySchoolOwnsClass(user.id, report.class_id);
    if (!owns) return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  return c.json({ success: true, report });
});

// PATCH /:id/seen — تحديد كمفتوح
app.patch('/:id/seen', async (c) => {
  const user = c.get('user');
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
  const report = await svc.getReportById(id);
  if (!report) return c.json({ success: false, message: 'التقرير غير موجود' }, 404);
  // Only the teacher of the class or admin can mark as seen
  if (user.role === 'teacher') {
    const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', report.class_id);
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  } else if (user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  await svc.markReportAsSeen(id);
  return c.json({ success: true });
});

// PATCH /:id/grade — تصحيح
app.patch('/:id/grade', zValidator('json', gradeReportSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'school') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
  const report = await svc.getReportById(id);
  if (!report) return c.json({ success: false, message: 'التقرير غير موجود' }, 404);
  // Verify teacher owns the class for this report
  if (user.role === 'teacher') {
    const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', report.class_id);
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  } else if (user.role === 'school') {
    const owns = await verifySchoolOwnsClass(user.id, report.class_id);
    if (!owns) return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const data = c.req.valid('json');
  // svc.gradeReport() already dispatches the report_graded notification once.
  const result = await svc.gradeReport(id, data, user.id, user.name, user.role);
  return c.json(result);
});

// POST /:id/comments — تعليق
app.post('/:id/comments', zValidator('json', addCommentSchema), async (c) => {
  const user = c.get('user');
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
  const report = await svc.getReportById(id);
  if (!report) return c.json({ success: false, message: 'التقرير غير موجود' }, 404);
  // Students can only comment on their own reports
  if (user.role === 'student' && report.student_id !== user.id) {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  // Teachers can only comment on reports in their classes
  if (user.role === 'teacher') {
    const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', report.class_id);
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  }
  // School can only comment on reports in their school's classes
  if (user.role === 'school') {
    const owns = await verifySchoolOwnsClass(user.id, report.class_id);
    if (!owns) return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const body = c.req.valid('json');
  const result = await svc.addComment(id, {
    author_id: user.id, author_name: user.name, author_role: user.role, content: body.content,
  });
  return c.json({ success: true, comment: result }, 201);
});

// ─── Merge sub-routers ───
app.route('/', reportExtraRoutes);

export { app as reportCrudRoutes };
