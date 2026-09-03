import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import { db } from '../../db/index.js';
import type { User } from '@my-modern-app/shared-types';
import * as svc from './services.js';
import { dispatchEvent } from '../notifications/dispatch.js';
import { sendComplaintAlert } from '../../shared/email.js';

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
  type: z.enum(['penalty', 'reward', 'warning', 'late', 'misbehavior', 'cheating', 'absence', 'other']),
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
  try {
    const penalty = await svc.createPenalty(body.student_id, user.id, body.class_id || null, body.type, body.reason, body.points);
    await dispatchEvent({
      type: 'penalty_created',
      actorId: user.id, actorName: user.name, actorRole: user.role as any,
      payload: { studentId: body.student_id, classId: body.class_id, reason: body.reason, message: body.reason },
    }).catch(() => {});
    return c.json({ success: true, penalty }, 201);
  } catch (err: any) {
    console.error('[penalties] create error:', err?.message || err);
    return c.json({ success: false, message: err?.message || 'فشل تسجيل العقوبة' }, 500);
  }
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
  target_id: z.string().min(1).or(z.number().int()).pipe(z.coerce.string()),
  target_type: z.enum(['teacher', 'school', 'student', 'class', 'project']),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

enhRoutes.post('/ratings', zValidator('json', ratingSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  if (String(body.target_id) === String(user.id) && body.target_type !== 'class') {
    return c.json({ success: false, message: 'لا يمكنك تقييم نفسك' }, 400);
  }
  if (user.role === 'student' && body.target_type !== 'teacher' && body.target_type !== 'class' && body.target_type !== 'project') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  // المعلم يقيم فقط طلاب/فصول مدرسته الخاصة داخل نطاق فصوله
  if (user.role === 'teacher') {
    if (body.target_type === 'student') {
      const inClass = await db.get<{ cnt: number }>(
        'SELECT COUNT(*) as cnt FROM class_students cs JOIN classes c ON c.id = cs.class_id WHERE cs.student_id = ? AND c.teacher_id = ?',
        body.target_id, user.id,
      );
      if (!inClass || inClass.cnt === 0) return c.json({ success: false, message: 'غير مصرح — تقييم الطلاب خارج فصولك مرفوض' }, 403);
    } else if (body.target_type === 'class') {
      const cls = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', String(body.target_id));
      if (!cls || cls.teacher_id !== user.id) return c.json({ success: false, message: 'غير مصرح — الفصل ليس من فصولك' }, 403);
    }
  }
  const ok = await svc.createRating(body.target_id, body.target_type, user.id, user.role, body.rating, body.comment || null);
  if (!ok) return c.json({ success: false, message: 'Failed to rate' }, 400);
  if (body.target_type === 'student') {
    await dispatchEvent({
      type: 'rating_given',
      actorId: user.id, actorName: user.name, actorRole: user.role as any,
      payload: { studentId: Number(body.target_id), message: `تقييم ${body.rating}/5${body.comment ? ' — ' + body.comment : ''}` },
    }).catch(() => {});
  }
  // Send alert for negative ratings (1-2 stars) to admin via telegram + email
  if (body.rating <= 2) {
    sendComplaintAlert({
      id: 0,
      fromName: user.name,
      fromRole: user.role,
      category: 'تقييم سلبي',
      subject: `تقييم ${body.rating}/5 لـ ${body.target_type}#${body.target_id}`,
      body: body.comment || 'بدون تعليق',
      priority: 'high',
    }).catch((err: any) => { console.error('[ratings] negative rating alert failed:', err); });
  }
  return c.json({ success: true });
});

enhRoutes.get('/ratings/my', async (c) => {
  const user = c.get('user');
  const result = await svc.getMyRatings(user.id, user.role);
  return c.json({ success: true, ...result });
});

enhRoutes.get('/ratings/stats', async (c) => {
  const user = c.get('user');
  const stats = await svc.getRatingStats(user.id, user.role);
  return c.json({ success: true, stats });
});

enhRoutes.get('/rating-targets', async (c) => {
  const user = c.get('user');
  const targets = await svc.getRatingTargets(user.id, user.role);
  return c.json({ success: true, targets });
});

enhRoutes.get('/ratings/:targetType/:targetId', async (c) => {
  const user = c.get('user');
  const targetType = c.req.param('targetType');
  const targetId = c.req.param('targetId');
  if (!targetId) return c.json({ success: false, message: 'معرّف غير صالح' }, 400);
  // المدرّس يقرأ تقييمات الطلاب/الفصول ضمن فصوله فقط
  if (user.role === 'teacher') {
    if (targetType === 'student') {
      const inClass = await db.get<{ cnt: number }>(
        'SELECT COUNT(*) as cnt FROM class_students cs JOIN classes c ON c.id = cs.class_id WHERE cs.student_id = ? AND c.teacher_id = ?',
        targetId, user.id,
      );
      if (!inClass || inClass.cnt === 0) return c.json({ success: false, message: 'غير مصرح' }, 403);
    } else if (targetType === 'class') {
      const cls = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', String(targetId));
      if (!cls || cls.teacher_id !== user.id) return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  }
  // الطالب يقرأ تقييمات معلميه/فصوله الخاصة فقط
  if (user.role === 'student') {
    if (targetType === 'class') {
      const isMember = await db.get('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?', String(targetId), user.id);
      if (!isMember) return c.json({ success: false, message: 'غير مصرح' }, 403);
    } else if (targetType === 'teacher') {
      const isTeacher = await db.get(
        'SELECT 1 FROM class_students cs JOIN classes c ON c.id = cs.class_id WHERE cs.student_id = ? AND c.teacher_id = ?',
        user.id, targetId,
      );
      if (!isTeacher) return c.json({ success: false, message: 'غير مصرح' }, 403);
    } else {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  }
  const result = await svc.getRatings(targetId, targetType);
  return c.json({ success: true, ...result });
});

enhRoutes.get('/ratings/all', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'Admin only' }, 403);
  const ratings = await svc.getAllRatings();
  return c.json({ success: true, ratings });
});

enhRoutes.get('/teacher/recent-actions', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') return c.json({ success: false, message: 'Not authorized' }, 403);
  const actions = await svc.getTeacherRecentActions(user.id);
  return c.json({ success: true, actions });
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

// ─── User Warnings (from school/admin) ───
enhRoutes.get('/my-warnings', async (c) => {
  const user = c.get('user');
  const warnings = await db.all(
    `SELECT w.*,
      a.name as admin_issuer_name,
      s.name as school_issuer_name
     FROM warnings w
     LEFT JOIN users a ON w.admin_id = a.id
     LEFT JOIN schools s ON w.school_id = s.id
     WHERE w.user_id = ?
     ORDER BY w.created_at DESC`,
    user.id,
  );
  const unread = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM warnings WHERE user_id = ? AND is_read = 0`,
    user.id,
  );
  return c.json({ success: true, warnings, unreadCount: unread?.count || 0 });
});

enhRoutes.patch('/my-warnings/:id/read', async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
  await db.run(
    `UPDATE warnings SET is_read = 1, read_at = datetime('now') WHERE id = ? AND user_id = ?`,
    id, user.id,
  );
  return c.json({ success: true });
});

enhRoutes.patch('/my-warnings/read-all', async (c) => {
  const user = c.get('user');
  await db.run(
    `UPDATE warnings SET is_read = 1, read_at = datetime('now') WHERE user_id = ? AND is_read = 0`,
    user.id,
  );
  return c.json({ success: true });
});

export { enhRoutes };
