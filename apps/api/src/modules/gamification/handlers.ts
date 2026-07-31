import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import { db } from '../../db/index.js';
import type { User } from '@my-modern-app/shared-types';
import * as svc from './services.js';

type Variables = { user: User };
const gameRoutes = new Hono<{ Variables: Variables }>();

gameRoutes.use(authMiddleware);

async function verifyTeacherOwnsStudent(teacherId: number, studentId: number): Promise<boolean> {
  const row = await db.get<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM class_students cs JOIN classes c ON c.id = cs.class_id WHERE cs.student_id = ? AND c.teacher_id = ?',
    studentId, teacherId,
  );
  return !!row && row.cnt > 0;
}

async function verifyClassAccess(userId: number, role: string, classId: string): Promise<boolean> {
  if (role === 'admin') return true;
  if (role === 'teacher') {
    const row = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', classId);
    return !!row && row.teacher_id === userId;
  }
  if (role === 'student') {
    const row = await db.get('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?', classId, userId);
    return !!row;
  }
  if (role === 'school') {
    const row = await db.get<{ school_id: number | null }>('SELECT c.school_id FROM classes c WHERE c.id = ?', classId);
    return !!row && row.school_id === userId;
  }
  return false;
}

// ─── Badges ───
const createBadgeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().default(''),
  icon: z.string().max(10).default('🏆'),
  type: z.enum(['manual', 'auto']).default('manual'),
  criteria: z.string().optional(),
});

const awardBadgeSchema = z.object({
  student_id: z.number().int(),
  badge_id: z.number().int(),
  note: z.string().max(500).optional(),
});

gameRoutes.get('/badges', async (c) => {
  const badges = await svc.getAllBadges();
  return c.json({ success: true, badges });
});

gameRoutes.post('/badges', zValidator('json', createBadgeSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'Admin only' }, 403);
  const body = c.req.valid('json');
  const badge = await svc.createBadge(body.name, body.description, body.icon, body.type, body.criteria || null);
  return c.json({ success: true, badge }, 201);
});

gameRoutes.delete('/badges/:id', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'Admin only' }, 403);
  await svc.deleteBadge(Number(c.req.param('id')));
  return c.json({ success: true });
});

gameRoutes.post('/badges/award', zValidator('json', awardBadgeSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'school') {
    return c.json({ success: false, message: 'Not authorized' }, 403);
  }
  const { student_id, badge_id, note } = c.req.valid('json');
  // Teachers can only award badges to students in their classes
  if (user.role === 'teacher') {
    const owns = await verifyTeacherOwnsStudent(user.id, student_id);
    if (!owns) return c.json({ success: false, message: 'غير مصرح — هذا الطالب ليس في فصولك' }, 403);
  }
  const ok = await svc.awardBadge(student_id, badge_id, user.id, user.role, note || null);
  if (!ok) return c.json({ success: false, message: 'Already awarded' }, 409);
  return c.json({ success: true });
});

gameRoutes.delete('/badges/award', zValidator('json', awardBadgeSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin' && user.role !== 'teacher') {
    return c.json({ success: false, message: 'Not authorized' }, 403);
  }
  const { student_id, badge_id } = c.req.valid('json');
  // Teachers can only remove badges from students in their classes
  if (user.role === 'teacher') {
    const owns = await verifyTeacherOwnsStudent(user.id, student_id);
    if (!owns) return c.json({ success: false, message: 'غير مصرح — هذا الطالب ليس في فصولك' }, 403);
  }
  await svc.removeBadge(student_id, badge_id);
  return c.json({ success: true });
});

gameRoutes.get('/badges/my', async (c) => {
  const user = c.get('user');
  if (user.role !== 'student') return c.json({ success: false, message: 'Students only' }, 403);
  const badges = await svc.getStudentBadges(user.id);
  return c.json({ success: true, badges });
});

gameRoutes.get('/badges/student/:id', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'school') {
    return c.json({ success: false, message: 'Not authorized' }, 403);
  }
  const studentId = Number(c.req.param('id'));
  // Teachers can only see badges for students in their classes
  if (user.role === 'teacher') {
    const owns = await verifyTeacherOwnsStudent(user.id, studentId);
    if (!owns) return c.json({ success: false, message: 'غير مصرح — هذا الطالب ليس في فصولك' }, 403);
  }
  const badges = await svc.getStudentBadges(studentId);
  return c.json({ success: true, badges });
});

// ─── Leaderboard ───
gameRoutes.get('/leaderboard/:classId', async (c) => {
  const user = c.get('user');
  const classId = c.req.param('classId');
  // Verify user has access to this class
  const hasAccess = await verifyClassAccess(user.id, user.role, classId);
  if (!hasAccess) return c.json({ success: false, message: 'غير مصرح' }, 403);
  const leaderboard = await svc.getClassLeaderboard(classId);
  const myRank = leaderboard.findIndex((e: any) => e.id === user.id);
  return c.json({ success: true, leaderboard, myRank: myRank >= 0 ? myRank + 1 : null });
});

export { gameRoutes };
