import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { createReportSchema, gradeReportSchema, addCommentSchema } from './schemas.js';
import * as svc from './services.js';
import { authMiddleware } from '../auth/middleware.js';
import { db } from '../../db/index.js';
import type { User } from '@my-modern-app/shared-types';

type Variables = { user: User };

const app = new Hono<{ Variables: Variables }>();

app.use(authMiddleware);

// POST / — إنشاء
app.post('/', zValidator('json', createReportSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  // Verify student is a member of the class
  if (user.role === 'student') {
    const member = await db.get('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?', body.class_id, user.id);
    if (!member) return c.json({ success: false, message: 'غير مصرح — أنت لست عضواً في هذا الفصل' }, 403);
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
  });
  if (result.error) {
    return c.json({ success: false, message: result.error }, 400);
  }
  return c.json({ success: true, report: result }, 201);
});

// POST /:id/resubmit — إعادة إرسال
app.post('/:id/resubmit', zValidator('json', createReportSchema), async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const body = c.req.valid('json');
  // Verify student is a member of the class
  if (user.role === 'student') {
    const member = await db.get('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?', body.class_id, user.id);
    if (!member) return c.json({ success: false, message: 'غير مصرح — أنت لست عضواً في هذا الفصل' }, 403);
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
    const list = await svc.getReports({
      class_id: query.class_id,
      student_id: query.student_id ? Number(query.student_id) : undefined,
      status: query.status,
    });
    return c.json({ success: true, reports: list });
  }
  if (user.role === 'teacher') {
    // Teachers can only see reports from their own classes
    const teacherClasses: { id: string }[] = await db.all('SELECT id FROM classes WHERE teacher_id = ?', user.id);
    const classIds = teacherClasses.map((c) => c.id);
    if (classIds.length === 0) return c.json({ success: true, reports: [] });
    const placeholders = classIds.map(() => '?').join(',');
    let sql = `SELECT r.*, u.name as student_name, u.email as student_email
               FROM experiment_reports r JOIN users u ON r.student_id = u.id
               WHERE r.class_id IN (${placeholders})`;
    const params: (string | number)[] = [...classIds];
    if (query.status) { sql += ' AND r.status = ?'; params.push(query.status); }
    if (query.student_id) { sql += ' AND r.student_id = ?'; params.push(Number(query.student_id)); }
    sql += ' ORDER BY r.submitted_at DESC';
    const filtered = await db.all(sql, ...params);
    return c.json({ success: true, reports: filtered });
  }
  const list = await svc.getReports({ student_id: user.id, status: query.status });
  return c.json({ success: true, reports: list });
});

// GET /:id — تفاصيل
app.get('/:id', async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
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
  return c.json({ success: true, report });
});

// PATCH /:id/seen — تحديد كمفتوح
app.patch('/:id/seen', async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
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
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const id = Number(c.req.param('id'));
  // Verify teacher owns the class for this report
  if (user.role === 'teacher') {
    const report = await svc.getReportById(id);
    if (!report) return c.json({ success: false, message: 'التقرير غير موجود' }, 404);
    const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', report.class_id);
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  }
  const data = c.req.valid('json');
  const result = await svc.gradeReport(id, data, user.id, user.name);
  return c.json(result);
});

// POST /:id/comments — تعليق
app.post('/:id/comments', zValidator('json', addCommentSchema), async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
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
  const body = c.req.valid('json');
  const result = await svc.addComment(id, {
    author_id: user.id, author_name: user.name, author_role: user.role, content: body.content,
  });
  return c.json({ success: true, comment: result }, 201);
});

// GET /:id/comments — قائمة تعليقات
app.get('/:id/comments', async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const report = await svc.getReportById(id);
  if (!report) return c.json({ success: false, message: 'التقرير غير موجود' }, 404);
  // Students can only see comments on their own reports
  if (user.role === 'student' && report.student_id !== user.id) {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  // Teachers can only see comments on reports in their classes
  if (user.role === 'teacher') {
    const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', report.class_id);
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  }
  const list = await svc.getComments(id);
  return c.json({ success: true, comments: list });
});

// GET /:id/history — سجل تصحيح
app.get('/:id/history', async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const report = await svc.getReportById(id);
  if (!report) return c.json({ success: false, message: 'التقرير غير موجود' }, 404);
  if (user.role === 'student') {
    if (report.student_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  } else if (user.role === 'teacher') {
    const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', report.class_id);
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  } else if (user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const list = await svc.getGradeHistory(id);
  return c.json({ success: true, history: list });
});

// GET /student/:student_id/stats — إحصائيات الطالب
app.get('/student/:student_id/stats', async (c) => {
  const user = c.get('user');
  const studentId = Number(c.req.param('student_id'));
  if (user.role === 'student' && user.id !== studentId) {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  // Teachers can only see stats for students in their classes
  if (user.role === 'teacher') {
    const member = await db.get<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM class_students cs JOIN classes c ON c.id = cs.class_id WHERE cs.student_id = ? AND c.teacher_id = ?',
      studentId, user.id,
    );
    if (!member || member.cnt === 0) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  }
  const stats = await svc.getStudentStats(studentId);
  return c.json({ success: true, stats });
});

// GET /class/:class_id/stats — إحصائيات الفصل
app.get('/class/:class_id/stats', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const classId = c.req.param('class_id');
  // Verify teacher owns this class
  if (user.role === 'teacher') {
    const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', classId);
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  }
  const stats = await svc.getClassStats(classId);
  return c.json({ success: true, stats });
});

// GET /class/:class_id/export — تصدير كل التقارير
app.get('/class/:class_id/export', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const classId = c.req.param('class_id');
  // Verify teacher owns this class
  if (user.role === 'teacher') {
    const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', classId);
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  }
  const reports = await svc.getClassReportsForExport(classId);
  return c.json({ success: true, reports });
});

// DELETE /:id
app.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const result = await svc.deleteReport(id, { role: user.role, id: user.id });
  if (!result.success) return c.json(result, result.message === 'غير مصرح' ? 403 : 400);
  return c.json(result);
});

// POST /bulk-grade — bulk grading (teacher/admin)
app.post('/bulk-grade', zValidator('json', z.object({
  grades: z.array(z.object({
    report_id: z.number(),
    grade: z.number().min(0).max(100),
    feedback: z.string().optional(),
  })),
})), async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const body = c.req.valid('json');
  const results: { report_id: number; success: boolean; message?: string }[] = [];
  for (const g of body.grades) {
    try {
      // Verify teacher owns the class for this report
      if (user.role === 'teacher') {
        const report = await svc.getReportById(g.report_id);
        if (!report) { results.push({ report_id: g.report_id, success: false, message: 'التقرير غير موجود' }); continue; }
        const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', report.class_id);
        if (!classRow || classRow.teacher_id !== user.id) {
          results.push({ report_id: g.report_id, success: false, message: 'غير مصرح' }); continue;
        }
      }
      await svc.gradeReport(g.report_id, { grade: g.grade, feedback: g.feedback }, user.id, user.name);
      results.push({ report_id: g.report_id, success: true });
    } catch (err) {
      results.push({ report_id: g.report_id, success: false, message: err instanceof Error ? err.message : 'Unknown error' });
    }
  }
  return c.json({ success: true, results });
});

export { app as reportRoutes };
