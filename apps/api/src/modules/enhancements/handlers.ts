import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import { db } from '../../db/index.js';
import type { User } from '@my-modern-app/shared-types';
import * as svc from './services.js';

type Variables = { user: User };
const enhRoutes = new Hono<{ Variables: Variables }>();

enhRoutes.use(authMiddleware);

async function verifyTeacherOwnsStudent(teacherId: number, studentId: number): Promise<boolean> {
  const row = await db.get<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM class_students cs JOIN classes c ON c.id = cs.class_id WHERE cs.student_id = ? AND c.teacher_id = ?',
    studentId, teacherId,
  );
  return !!row && row.cnt > 0;
}

// ─── Penalties & Rewards ───
const penaltySchema = z.object({
  student_id: z.number().int(),
  class_id: z.string().optional(),
  type: z.enum(['penalty', 'reward']),
  reason: z.string().min(1).max(500),
  points: z.number().int().min(-100).max(100).default(0),
});

enhRoutes.post('/penalties', zValidator('json', penaltySchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'school') {
    return c.json({ success: false, message: 'Not authorized' }, 403);
  }
  const body = c.req.valid('json');
  if (user.role === 'teacher') {
    const owns = await verifyTeacherOwnsStudent(user.id, body.student_id);
    if (!owns) return c.json({ success: false, message: 'غير مصرح — هذا الطالب ليس في فصولك' }, 403);
  }
  const penalty = await svc.createPenalty(body.student_id, user.id, body.class_id || null, body.type, body.reason, body.points);
  return c.json({ success: true, penalty }, 201);
});

enhRoutes.get('/penalties/my', async (c) => {
  const user = c.get('user');
  if (user.role !== 'student') return c.json({ success: false, message: 'Students only' }, 403);
  const penalties = await svc.getStudentPenalties(user.id);
  return c.json({ success: true, penalties });
});

enhRoutes.get('/penalties/student/:id', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'school') {
    return c.json({ success: false, message: 'Not authorized' }, 403);
  }
  const studentId = Number(c.req.param('id'));
  if (user.role === 'teacher') {
    const owns = await verifyTeacherOwnsStudent(user.id, studentId);
    if (!owns) return c.json({ success: false, message: 'غير مصرح — هذا الطالب ليس في فصولك' }, 403);
  }
  const penalties = await svc.getStudentPenalties(studentId);
  return c.json({ success: true, penalties });
});

enhRoutes.get('/penalties/class/:classId', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'school') {
    return c.json({ success: false, message: 'Not authorized' }, 403);
  }
  const classId = c.req.param('classId');
  if (user.role === 'teacher') {
    const cls = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', classId);
    if (!cls || cls.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح — هذا الفصل ليس من فصولك' }, 403);
    }
  } else if (user.role === 'school') {
    const cls = await db.get<{ school_id: number | null }>(
      'SELECT u.school_id FROM classes c JOIN users u ON c.teacher_id = u.id WHERE c.id = ?', classId,
    );
    if (!cls || cls.school_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح — هذا الفصل لا ينتمي لمدرستك' }, 403);
    }
  }
  const penalties = await svc.getClassPenalties(classId);
  return c.json({ success: true, penalties });
});

enhRoutes.patch('/penalties/:id/dismiss', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'Admin only' }, 403);
  await svc.dismissPenalty(Number(c.req.param('id')));
  return c.json({ success: true });
});

enhRoutes.delete('/penalties/:id', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'Admin only' }, 403);
  await svc.deletePenalty(Number(c.req.param('id')));
  return c.json({ success: true });
});

enhRoutes.get('/penalties/all', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'Admin only' }, 403);
  const penalties = await svc.getAllPenalties();
  return c.json({ success: true, penalties });
});

// ─── Ratings ───
const ratingSchema = z.object({
  target_id: z.number().int(),
  target_type: z.enum(['teacher', 'school', 'student', 'class']),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

enhRoutes.post('/ratings', zValidator('json', ratingSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  if (body.target_id === user.id && body.target_type !== 'class') {
    return c.json({ success: false, message: 'لا يمكنك تقييم نفسك' }, 400);
  }
  if (user.role === 'student' && body.target_type !== 'teacher' && body.target_type !== 'class') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const ok = await svc.createRating(body.target_id, body.target_type, user.id, user.role, body.rating, body.comment || null);
  if (!ok) return c.json({ success: false, message: 'Failed to rate' }, 400);
  return c.json({ success: true });
});

enhRoutes.get('/ratings/:targetType/:targetId', async (c) => {
  const result = await svc.getRatings(Number(c.req.param('targetId')), c.req.param('targetType'));
  return c.json({ success: true, ...result });
});

enhRoutes.get('/ratings/all', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'Admin only' }, 403);
  const ratings = await svc.getAllRatings();
  return c.json({ success: true, ratings });
});

// ─── Avatar ───
const ALLOWED_AVATAR_HOSTS = [
  'localhost', '127.0.0.1',
  'i.pravatar.cc', 'api.dicebear.com', 'api.adorable.io',
  'ui-avatars.com', 'robohash.org',
];

const avatarSchema = z.object({
  avatar_url: z.string().min(1).max(2000).refine((url) => {
    if (url.startsWith('data:image/')) return true;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
      return ALLOWED_AVATAR_HOSTS.some(h => parsed.hostname === h || parsed.hostname.endsWith('.' + h));
    } catch {
      return false;
    }
  }, 'avatar_url must be a valid image URL from an allowed host'),
});

enhRoutes.post('/avatar', zValidator('json', avatarSchema), async (c) => {
  const user = c.get('user');
  const { avatar_url } = c.req.valid('json');
  await svc.updateAvatar(user.id, avatar_url);
  return c.json({ success: true });
});

export { enhRoutes };
