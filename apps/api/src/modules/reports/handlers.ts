import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createReportSchema, gradeReportSchema, addCommentSchema } from './schemas.js';
import * as svc from './services.js';
import { authMiddleware } from '../auth/middleware.js';
import type { User } from '@my-modern-app/shared-types';

type Variables = { user: User };

const app = new Hono<{ Variables: Variables }>();

app.use(authMiddleware);

// POST / — إنشاء
app.post('/', zValidator('json', createReportSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
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
  return c.json({ success: true, report: result }, 201);
});

// POST /:id/resubmit — إعادة إرسال
app.post('/:id/resubmit', zValidator('json', createReportSchema), async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const body = c.req.valid('json');
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
  return c.json(result);
});

// GET / — قائمة
app.get('/', async (c) => {
  const user = c.get('user');
  const query = c.req.query();
  if (user.role === 'teacher' || user.role === 'admin') {
    const list = await svc.getReports({
      class_id: query.class_id,
      student_id: query.student_id ? Number(query.student_id) : undefined,
      status: query.status,
    });
    return c.json({ success: true, reports: list });
  }
  const list = await svc.getReports({ student_id: user.id, status: query.status });
  return c.json({ success: true, reports: list });
});

// GET /:id — تفاصيل
app.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const report = await svc.getReportById(id);
  if (!report) return c.json({ success: false, message: 'التقرير غير موجود' }, 404);
  return c.json({ success: true, report });
});

// PATCH /:id/seen — تحديد كمفتوح
app.patch('/:id/seen', async (c) => {
  const id = Number(c.req.param('id'));
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
  const data = c.req.valid('json');
  const result = await svc.gradeReport(id, data, user.id, user.name);
  return c.json(result);
});

// POST /:id/comments — تعليق
app.post('/:id/comments', zValidator('json', addCommentSchema), async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const body = c.req.valid('json');
  const result = await svc.addComment(id, {
    author_id: user.id, author_name: user.name, author_role: user.role, content: body.content,
  });
  return c.json({ success: true, comment: result }, 201);
});

// GET /:id/comments — قائمة تعليقات
app.get('/:id/comments', async (c) => {
  const id = Number(c.req.param('id'));
  const list = await svc.getComments(id);
  return c.json({ success: true, comments: list });
});

// GET /:id/history — سجل تصحيح
app.get('/:id/history', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const id = Number(c.req.param('id'));
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
  const reports = await svc.getClassReportsForExport(classId);
  return c.json({ success: true, reports });
});

// DELETE /:id
app.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const result = await svc.deleteReport(id, user.role === 'student' ? user.id : undefined);
  if (!result.success) return c.json(result, result.message === 'غير مصرح' ? 403 : 400);
  return c.json(result);
});

export { app as reportRoutes };
