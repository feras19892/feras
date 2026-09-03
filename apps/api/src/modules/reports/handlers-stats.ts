import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import * as svc from './services.js';
import { authMiddleware } from '../auth/middleware.js';
import { db } from '../../db/index.js';
import type { User } from '@my-modern-app/shared-types';

type Variables = { user: User };

const app = new Hono<{ Variables: Variables }>();

app.use(authMiddleware);

function validId(idStr: string): number | null {
  const n = Number(idStr);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// نفس نمط admin/export-service.ts — حماية من CSV Injection (=, +, -, @) والفواصل/الأسطر
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
  // Schools can only see stats for their own students
  if (user.role === 'school') {
    const student = await db.get<{ school_id: number | null }>(
      'SELECT school_id FROM users WHERE id = ?', studentId,
    );
    if (!student || student.school_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  }
  // Reject any role other than student (self), teacher, school, admin
  if (user.role !== 'student' && user.role !== 'teacher' && user.role !== 'school' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const stats = await svc.getStudentStats(studentId);
  return c.json({ success: true, stats });
});

// GET /teacher/stats — عدّادات حية دقيقة لمعلم (خارج نطاق القوائم المقتطعة)
app.get('/teacher/stats', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const stats = await svc.getTeacherStats(user.id);
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
  if (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'school') {
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
  if (user.role === 'school') {
    const classRow = await db.get<{ school_id: number | null }>(
      'SELECT u.school_id FROM classes c JOIN users u ON c.teacher_id = u.id WHERE c.id = ?',
      classId,
    );
    if (!classRow || classRow.school_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  }
  const reports = await svc.getClassReportsForExport(classId);
  return c.json({ success: true, reports });
});

// GET /class/:class_id/gradebook.csv — تصدير دفتر الدرجات
app.get('/class/:class_id/gradebook.csv', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'school') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const classId = c.req.param('class_id');
  if (user.role === 'teacher') {
    const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', classId);
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  }
  if (user.role === 'school') {
    const classRow = await db.get<{ school_id: number | null }>(
      'SELECT u.school_id FROM classes c JOIN users u ON c.teacher_id = u.id WHERE c.id = ?',
      classId,
    );
    if (!classRow || classRow.school_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  }

  const students = await db.all<{ id: number; name: string }[]>(
    'SELECT u.id, u.name FROM class_students cs JOIN users u ON cs.student_id = u.id WHERE cs.class_id = ? ORDER BY u.name',
    classId,
  );
  const reports = await db.all<{ student_id: number; experiment_name: string; grade: number | null; status: string }[]>(
    'SELECT student_id, experiment_name, grade, status FROM experiment_reports WHERE class_id = ? ORDER BY submitted_at DESC',
    classId,
  );

  const experiments = [...new Set(reports.map((r) => r.experiment_name))];
  const gradeMap = new Map<string, number | null>();
  const statusMap = new Map<string, string>();
  for (const r of reports) {
    const key = `${r.student_id}|${r.experiment_name}`;
    gradeMap.set(key, r.grade);
    statusMap.set(key, r.status);
  }

  const header = ['Student', ...experiments, 'Average'];
  const lines = [header.map(escapeCsvValue).join(',')];
  for (const s of students) {
    const vals: string[] = [escapeCsvValue(s.name)];
    let sum = 0, count = 0;
    for (const exp of experiments) {
      const key = `${s.id}|${exp}`;
      const grade = gradeMap.get(key);
      if (grade !== null && grade !== undefined) {
        vals.push(String(grade));
        sum += grade;
        count++;
      } else {
        const status = statusMap.get(key);
        vals.push(status === 'draft' ? 'draft' : '-');
      }
    }
    vals.push(count > 0 ? String(Math.round(sum / count * 100) / 100) : '-');
    lines.push(vals.join(','));
  }

  c.header('Content-Type', 'text/csv; charset=utf-8');
  c.header('Content-Disposition', `attachment; filename="gradebook_${classId}.csv"`);
  return c.body(lines.join('\n'));
});

// PATCH /:id/feedback-seen — student marks feedback as seen
app.patch('/:id/feedback-seen', async (c) => {
  const user = c.get('user');
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
  const report = await svc.getReportById(id);
  if (!report) return c.json({ success: false, message: 'التقرير غير موجود' }, 404);
  if (user.role === 'student' && report.student_id !== user.id) {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  await svc.markFeedbackSeen(id);
  return c.json({ success: true });
});

// DELETE /:id
app.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
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
      await svc.gradeReport(g.report_id, { grade: g.grade, feedback: g.feedback }, user.id, user.name, user.role);
      results.push({ report_id: g.report_id, success: true });
    } catch (err) {
      results.push({ report_id: g.report_id, success: false, message: err instanceof Error ? err.message : 'Unknown error' });
    }
  }
  return c.json({ success: true, results });
});

export { app as reportStatsRoutes };
