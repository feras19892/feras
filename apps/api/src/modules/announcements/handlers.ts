import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import * as svc from './services.js';
import { db } from '../../db/index.js';
import type { User } from '@my-modern-app/shared-types';

type Variables = { user: User };
const app = new Hono<{ Variables: Variables }>();
app.use(authMiddleware);

const createSchema = z.object({
  scope: z.enum(['class', 'school', 'global']),
  class_id: z.string().optional(),
  school_id: z.number().optional(),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(2000),
  is_pinned: z.boolean().optional(),
  expires_at: z.string().optional(),
});

// Create announcement
app.post('/', zValidator('json', createSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');

  // Role-based scope restrictions
  if (body.scope === 'global' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح — الإعلانات العامة للأدمن فقط' }, 403);
  }
  if (body.scope === 'school' && user.role !== 'admin' && user.role !== 'school') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  if (body.scope === 'class' && user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'school') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }

  // Verify teacher owns the class for class-scoped announcements
  if (body.scope === 'class' && user.role === 'teacher' && body.class_id) {
    const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', body.class_id);
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح — لا يمكنك إنشاء إعلان لفصل لا تملكه' }, 403);
    }
  }

  // Verify school owns the class for class-scoped announcements
  if (body.scope === 'class' && user.role === 'school' && body.class_id) {
    const classRow = await db.get<{ school_id: number | null }>(
      'SELECT u.school_id FROM classes c JOIN users u ON c.teacher_id = u.id WHERE c.id = ?',
      body.class_id,
    );
    if (!classRow || classRow.school_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح — لا يمكنك إنشاء إعلان لفصل لا ينتمي لمدرستك' }, 403);
    }
  }

  // Force school_id to user.id for school role
  let schoolId = body.school_id;
  if (user.role === 'school' && body.scope === 'school') {
    schoolId = user.id;
  }

  const announcement = await svc.createAnnouncement({
    author_type: user.role as 'teacher' | 'school' | 'admin',
    author_id: user.id,
    author_name: user.name,
    scope: body.scope,
    class_id: body.class_id,
    school_id: schoolId,
    title: body.title,
    content: body.content,
    is_pinned: body.is_pinned,
    expires_at: body.expires_at,
  });

  return c.json({ success: true, announcement }, 201);
});

// Get announcements for current user
app.get('/', async (c) => {
  const user = c.get('user');

  if (user.role === 'student') {
    const list = await svc.getStudentAnnouncements(user.id);
    return c.json({ success: true, announcements: list });
  }

  if (user.role === 'teacher') {
    const classId = c.req.query('class_id');
    if (classId) {
      const list = await svc.getClassAnnouncements(classId);
      return c.json({ success: true, announcements: list });
    }
    const teacherClasses = await db.all<{ id: string }[]>(
      `SELECT id FROM classes WHERE teacher_id = ?`, user.id,
    );
    const teacher = await db.get<{ school_id: number | null }>(`SELECT school_id FROM users WHERE id = ?`, user.id);

    const parts: string[] = [];
    const params: (string | number)[] = [];
    if (teacherClasses.length > 0) {
      const placeholders = teacherClasses.map(() => '?').join(',');
      parts.push(`(scope = 'class' AND class_id IN (${placeholders}))`);
      params.push(...teacherClasses.map(c => c.id));
    }
    if (teacher?.school_id) {
      parts.push(`(scope = 'school' AND school_id = ?)`);
      params.push(teacher.school_id);
    }
    parts.push(`scope = 'global'`);

    const results = await db.all(
      `SELECT * FROM announcements WHERE (${parts.join(' OR ')}) AND (expires_at IS NULL OR expires_at > datetime('now')) ORDER BY is_pinned DESC, created_at DESC`,
      ...params,
    );
    return c.json({ success: true, announcements: results });
  }

  if (user.role === 'school') {
    const list = await svc.getSchoolAnnouncements(user.id);
    const global = await svc.getGlobalAnnouncements();
    return c.json({ success: true, announcements: [...list, ...global] });
  }

  // Admin sees all
  const all = await svc.getAllAnnouncements();
  return c.json({ success: true, announcements: all });
});

// Get class announcements
app.get('/class/:classId', async (c) => {
  const user = c.get('user');
  const classId = c.req.param('classId');
  // Verify access: teacher must own the class, student must be a member
  if (user.role === 'teacher') {
    const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', classId);
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  } else if (user.role === 'student') {
    const member = await db.get('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?', classId, user.id);
    if (!member) return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const list = await svc.getClassAnnouncements(classId);
  return c.json({ success: true, announcements: list });
});

// Delete announcement
app.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const result = await svc.deleteAnnouncement(id, user.id, user.role);
  if (!result.success) return c.json(result, result.message === 'غير مصرح' ? 403 : 404);
  return c.json(result);
});

export { app as announcementRoutes };
