import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createClassSchema, joinClassSchema, leaveClassSchema, updateClassSchema } from './schemas.js';

import * as svc from './services.js';
import { authMiddleware } from '../auth/middleware.js';
import { writeRateLimit } from '../../shared/middleware/rate-limit.js';
import { db } from '../../db/index.js';
import { createNotification } from '../notifications/services.js';
import type { User } from '@my-modern-app/shared-types';

type Variables = { user: User };

const app = new Hono<{ Variables: Variables }>();

app.use(authMiddleware);

app.post('/', zValidator('json', createClassSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const { name } = c.req.valid('json');
  const result = await svc.createClass(user.id, name);
  return c.json({ success: true, class: result });
});

app.get('/', async (c) => {
  const user = c.get('user');
  if (user.role === 'teacher' || user.role === 'admin') {
    const list = await svc.getTeacherClasses(user.id);
    return c.json({ success: true, classes: list });
  }
  const list = await svc.getStudentClasses(user.id);
  return c.json({ success: true, classes: list });
});

// GET /batch-data — all classes stats + students in one call (teacher)
app.get('/batch-data', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const classes = await svc.getTeacherClasses(user.id);
  const results = await Promise.all(
    classes.map(async (cls: any) => {
      const [stats, students] = await Promise.all([
        svc.getClassStats(cls.id),
        svc.getClassStudents(cls.id),
      ]);
      return { id: cls.id, stats, students };
    }),
  );
  const statsMap: Record<string, any> = {};
  const studentsMap: Record<string, any> = {};
  for (const r of results) {
    statsMap[r.id] = r.stats;
    studentsMap[r.id] = r.students;
  }
  return c.json({ success: true, statsMap, studentsMap });
});

// GET /batch-student-data — all class students in one call (student)
app.get('/batch-student-data', async (c) => {
  const user = c.get('user');
  if (user.role !== 'student') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const classes = await svc.getStudentClasses(user.id);
  const studentsMap: Record<string, any> = {};
  await Promise.all(
    classes.map(async (cls: any) => {
      const students = await svc.getClassStudents(cls.id);
      studentsMap[cls.id] = students.map((s: any) => ({ ...s, email: s.email ? s.email.split('@')[0].slice(0, 2) + '•••' : '' }));
    }),
  );
  return c.json({ success: true, studentsMap });
});

app.get('/stats/pending', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const result = await svc.getPendingReportsCount(user.id);
  return c.json({ success: true, pendingCount: result?.count || 0 });
});

app.get('/:id', async (c) => {
  const user = c.get('user');
  const classId = c.req.param('id');
  const cls = await svc.getClassById(classId);
  if (!cls) return c.json({ success: false, message: 'الفصل غير موجود' }, 404);
  if (user.role === 'student') {
    const isMember = await svc.isClassMember(classId, user.id);
    if (!isMember) return c.json({ success: false, message: 'غير مصرح' }, 403);
  } else if (cls.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const students = await svc.getClassStudents(classId);
  if (user.role === 'student') {
    const masked = students.map((s: any) => ({ ...s, email: s.email ? s.email.split('@')[0].slice(0, 2) + '•••' : '' }));
    return c.json({ success: true, class: cls, students: masked });
  }
  return c.json({ success: true, class: cls, students });
});

app.post('/join', zValidator('json', joinClassSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'student') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const { code } = c.req.valid('json');
  const result = await svc.joinClassByCode(user.id, code);
  if (!result.success) return c.json(result, 400);
  return c.json(result);
});

app.post('/leave', zValidator('json', leaveClassSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'student') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const { class_id } = c.req.valid('json');
  const result = await svc.leaveClass(class_id, user.id);
  if (!result.success) return c.json(result, 400);
  return c.json(result);
});

app.patch('/:id', zValidator('json', updateClassSchema), async (c) => {
  const user = c.get('user');
  const classId = c.req.param('id');
  const data = c.req.valid('json');
  try {
    const result = await svc.updateClass(classId, user.id, data);
    if (!result.success) return c.json(result, result.message === 'غير مصرح' ? 403 : 404);
    return c.json(result);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('updateClass error:', err);
    return c.json({ success: false, message: 'فشل تحديث الفصل' }, 500);
  }
});

// GET /:id/stats — إحصائيات الفصل
app.get('/:id/stats', async (c) => {
  const user = c.get('user');
  const classId = c.req.param('id');
  const cls = await svc.getClassById(classId);
  if (!cls) return c.json({ success: false, message: 'الفصل غير موجود' }, 404);
  if (cls.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const stats = await svc.getClassStats(classId);
  return c.json({ success: true, stats });
});

app.delete('/:id/students/:studentId', async (c) => {
  const user = c.get('user');
  const classId = c.req.param('id');
  const studentId = Number(c.req.param('studentId'));
  if (!Number.isFinite(studentId) || studentId <= 0) return c.json({ success: false, message: 'معرّف الطالب غير صالح' }, 400);
  const cls = await svc.getClassById(classId);
  if (!cls) return c.json({ success: false, message: 'الفصل غير موجود' }, 404);
  if (cls.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const member = await db.get('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?', classId, studentId);
  if (!member) return c.json({ success: false, message: 'الطالب ليس عضواً في هذا الفصل' }, 404);
  const result = await svc.removeStudentFromClass(classId, user.id, studentId);
  if (!result.success) return c.json(result, 400);
  return c.json({ success: true });
});

// PATCH /:id/students/:studentId/freeze — تجميد/إلغاء تجميد طالب
app.patch('/:id/students/:studentId/freeze', async (c) => {
  const user = c.get('user');
  const classId = c.req.param('id');
  const studentId = Number(c.req.param('studentId'));
  if (!Number.isFinite(studentId) || studentId <= 0) return c.json({ success: false, message: 'معرّف الطالب غير صالح' }, 400);
  const cls = await svc.getClassById(classId);
  if (!cls) return c.json({ success: false, message: 'الفصل غير موجود' }, 404);
  if (cls.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  try {
    const member = await db.get('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?', classId, studentId);
    if (!member) return c.json({ success: false, message: 'الطالب ليس عضواً في هذا الفصل' }, 404);
    const student = await db.get<{ blocked_at: string | null; name: string }>('SELECT blocked_at, name FROM users WHERE id = ?', studentId);
    if (!student) return c.json({ success: false, message: 'الطالب غير موجود' }, 404);
    if (student.blocked_at) {
      await db.run('UPDATE users SET blocked_at = NULL, block_reason = NULL WHERE id = ?', studentId);
      return c.json({ success: true, frozen: false, message: 'تم إلغاء تجميد الطالب' });
    } else {
      await db.run('UPDATE users SET blocked_at = datetime("now"), block_reason = ? WHERE id = ?', `تجميد من المدرس ${user.name}`, studentId);
      return c.json({ success: true, frozen: true, message: 'تم تجميد الطالب' });
    }
  } catch (err: any) {
    console.error('[freeze student] error:', err?.message || err);
    return c.json({ success: false, message: 'فشل تجميد الطالب' }, 500);
  }
});

app.delete('/:id', async (c) => {
  const user = c.get('user');
  const classId = c.req.param('id');
  const result = await svc.deleteClass(classId, user.id);
  if (!result.success) return c.json(result, result.message === 'غير مصرح' ? 403 : 404);
  return c.json(result);
});

app.get('/:id/students/:studentId/profile', async (c) => {
  const user = c.get('user');
  const classId = c.req.param('id');
  const studentId = Number(c.req.param('studentId'));
  if (!Number.isFinite(studentId) || studentId <= 0) return c.json({ success: false, message: 'معرّف الطالب غير صالح' }, 400);

  const cls = await svc.getClassById(classId);
  if (!cls) return c.json({ success: false, message: 'الفصل غير موجود' }, 404);
  if (cls.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }

  const member = await db.get('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?', classId, studentId);
  if (!member) return c.json({ success: false, message: 'الطالب ليس عضواً في هذا الفصل' }, 404);

  const student = await db.get<{ id: number; name: string; email: string; avatar_url: string | null; created_at: string; school_id: number | null; blocked_at: string | null }>(
    'SELECT id, name, email, avatar_url, created_at, school_id, blocked_at FROM users WHERE id = ?', studentId
  );
  if (!student) return c.json({ success: false, message: 'الطالب غير موجود' }, 404);

  const membership = await db.get<{ joined_at: string }>(
    'SELECT joined_at FROM class_students WHERE class_id = ? AND student_id = ?', classId, studentId
  );

  const reports = await db.all<{ id: number; experiment_name: string; status: string; grade: number | null; submitted_at: string }[]>(
    'SELECT id, experiment_name, status, grade, submitted_at FROM experiment_reports WHERE class_id = ? AND student_id = ? ORDER BY submitted_at DESC',
    classId, studentId
  );
  const totalReports = reports.length;
  const gradedReports = reports.filter(r => r.status === 'graded');
  const avgGrade = gradedReports.length > 0 ? Math.round(gradedReports.reduce((s, r) => s + (r.grade || 0), 0) / gradedReports.length) : 0;
  const pendingReports = totalReports - gradedReports.length;

  const quizzes = await db.all<{ id: number; title: string; score: number | null; submitted_at: string | null }[]>(
    `SELECT q.id, q.title, qs.score, qs.submitted_at FROM quizzes q
     LEFT JOIN quiz_submissions qs ON qs.quiz_id = q.id AND qs.student_id = ?
     WHERE q.class_id = ? ORDER BY q.created_at DESC`,
    studentId, classId
  );
  const totalQuizzes = quizzes.length;
  const completedQuizzes = quizzes.filter(q => q.score !== null).length;
  const quizAvg = completedQuizzes > 0 ? Math.round(quizzes.filter(q => q.score !== null).reduce((s, q) => s + (q.score || 0), 0) / completedQuizzes) : 0;

  const badges = await db.all<{ id: number; name: string; icon: string; type: string }[]>(
    `SELECT sb.id, b.name, b.icon, b.type FROM student_badges sb
     JOIN badges b ON sb.badge_id = b.id WHERE sb.student_id = ?`,
    studentId
  );

  const penalties = await db.all<{ id: number; type: string; reason: string; points: number; created_at: string }[]>(
    'SELECT id, type, reason, points, created_at FROM penalties WHERE student_id = ? AND class_id = ? ORDER BY created_at DESC',
    studentId, classId
  );
  const totalPenaltyPoints = penalties.reduce((s, p) => s + p.points, 0);

  const sessions = await db.all<{ login_at: string; logout_at: string | null }[]>(
    'SELECT login_at, logout_at FROM session_log WHERE user_id = ? ORDER BY login_at DESC LIMIT 10',
    studentId
  );
  const lastLogin = sessions.length > 0 ? sessions[0].login_at : null;
  const totalLogins = sessions.length;

  const activity = await db.all<{ action: string; details: string; created_at: string }[]>(
    'SELECT action, details, created_at FROM activity_log WHERE actor_id = ? ORDER BY created_at DESC LIMIT 10',
    studentId
  );

  const totalPoints = totalReports * 10 + (completedQuizzes > 0 ? quizzes.filter(q => q.score !== null).reduce((s, q) => s + (q.score || 0), 0) : 0) - totalPenaltyPoints;

  return c.json({
    success: true,
    profile: {
      student,
      membership,
      className: cls.name,
      stats: {
        totalReports, gradedReports: gradedReports.length, pendingReports, avgGrade,
        totalQuizzes, completedQuizzes, quizAvg,
        badges: badges.length, penaltyPoints: totalPenaltyPoints,
        totalPoints, lastLogin, totalLogins,
      },
      reports,
      quizzes,
      badges,
      penalties,
      sessions,
      activity,
    },
  });
});

app.get('/:id/frozen-status', async (c) => {
  const user = c.get('user');
  const classId = c.req.param('id');
  const cls = await db.get<{ is_frozen: number; teacher_id: number }>('SELECT is_frozen, teacher_id FROM classes WHERE id = ?', classId);
  if (!cls) return c.json({ success: false, message: 'الفصل غير موجود' }, 404);
  if (user.role === 'admin') {
    return c.json({ success: true, is_frozen: cls.is_frozen });
  }
  if (user.role === 'school') {
    return c.json({ success: true, is_frozen: cls.is_frozen });
  }
  if (user.role === 'student') {
    const isMember = await svc.isClassMember(classId, user.id);
    if (!isMember) return c.json({ success: false, message: 'غير مصرح' }, 403);
  } else if (user.role === 'teacher' && cls.teacher_id !== user.id) {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  return c.json({ success: true, is_frozen: cls.is_frozen });
});

// PATCH /:id/regenerate-code — توليد كود جديد للفصل
app.patch('/:id/regenerate-code', async (c) => {
  const user = c.get('user');
  const classId = c.req.param('id');
  const cls = await svc.getClassById(classId);
  if (!cls) return c.json({ success: false, message: 'الفصل غير موجود' }, 404);
  if (cls.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  try {
    const result = await svc.regenerateClassCode(classId);
    return c.json(result);
  } catch (err: any) {
    return c.json({ success: false, message: 'فشل توليد كود جديد' }, 500);
  }
});

// POST /broadcast — بث جماعي لكل طلاب الفصول أو فصل محدد
const broadcastSchema = z.object({
  target: z.enum(['all', 'class']),
  class_id: z.string().nullable().optional(),
  type: z.enum(['info', 'warning', 'success', 'urgent']),
  message: z.string().min(1),
});

app.post('/broadcast', writeRateLimit, zValidator('json', broadcastSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const body = c.req.valid('json');
  const typeMap: Record<string, string> = { info: '📢 إعلان', warning: '⚠️ تنبيه', success: '✅ إشعار إيجابي', urgent: '🚨 عاجل' };
  const title = typeMap[body.type] || '📢 إعلان';

  try {
    let classIds: string[] = [];
    if (body.target === 'all') {
      // Admin broadcasts to every class; teachers only to their own classes.
      const classes = user.role === 'admin'
        ? await db.all<{ id: string }[]>(`SELECT id FROM classes`)
        : await db.all<{ id: string }[]>(`SELECT id FROM classes WHERE teacher_id = ?`, user.id);
      classIds = classes.map(cl => cl.id);
    } else if (body.class_id) {
      const cls = await svc.getClassById(body.class_id);
      if (!cls) return c.json({ success: false, message: 'الفصل غير موجود' }, 404);
      if (cls.teacher_id !== user.id && user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
      classIds = [body.class_id];
    }

    let sent = 0;
    for (const cid of classIds) {
      const students = await db.all<{ student_id: number }[]>(`SELECT student_id FROM class_students WHERE class_id = ?`, cid);
      for (const s of students) {
        await createNotification({
          user_id: s.student_id,
          type: `broadcast_${body.type}`,
          title,
          message: body.message,
          class_id: cid,
          priority: body.type === 'urgent' ? 'immediate' : 'immediate',
        });
        sent++;
      }
    }
    return c.json({ success: true, sent });
  } catch (err: any) {
    console.error('[broadcast] error:', err?.message || err);
    return c.json({ success: false, message: 'فشل إرسال البث' }, 500);
  }
});

export { app as classRoutes };
