import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import type { User } from '@my-modern-app/shared-types';
import {
  createComplaint, getComplaintsForUser, getComplaintStats,
  updateComplaintStatus, getComplaintLog, getAvailableTargets,
  validateTargetForUser, validateComplaintAccess, validateComplaintIsTarget,
} from './service.js';
import { sendComplaintAlert, sendComplaintToTarget } from '../../shared/email.js';
import { getUserEmail, getSchoolEmail } from '../notifications/dispatch-helpers.js';

type Variables = { user: User };
const app = new Hono<{ Variables: Variables }>();

app.use(authMiddleware);

// GET /api/complaints — list complaints for current user
app.get('/', async (c) => {
  const user = c.get('user');
  const rows = await getComplaintsForUser(user.id, user.role, user.school_id ?? null);
  return c.json({ success: true, complaints: rows });
});

// GET /api/complaints/stats — stats for Home dashboard
app.get('/stats', async (c) => {
  const user = c.get('user');
  const stats = await getComplaintStats(user.id, user.role, user.school_id ?? null);
  return c.json({ success: true, stats });
});

// GET /api/complaints/targets — available targets for current user
app.get('/targets', async (c) => {
  const user = c.get('user');
  const targets = await getAvailableTargets(user.id, user.role);
  return c.json({ success: true, targets });
});

// GET /api/complaints/:id/log — status change log (access controlled)
app.get('/:id/log', async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const hasAccess = await validateComplaintAccess(id, user.id, user.role);
  if (!hasAccess) return c.json({ success: false, message: 'غير مصرح' }, 403);
  const log = await getComplaintLog(id);
  return c.json({ success: true, log });
});

const createSchema = z.object({
  targetRole: z.enum(['teacher', 'school', 'admin']),
  targetId: z.number().int().nullable().optional(),
  category: z.enum(['technical', 'academic', 'behavioral', 'other']),
  subject: z.string().min(2).max(200),
  body: z.string().min(5).max(5000),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
});

// POST /api/complaints — create complaint
app.post('/', zValidator('json', createSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');

  // Prevent self-complaints
  if (data.targetId === user.id) {
    return c.json({ success: false, message: 'لا يمكنك إرسال شكوى لنفسك' }, 400);
  }

  // Validate that the target is allowed for this user
  const targetOk = await validateTargetForUser(user.id, user.role, data.targetRole, data.targetId ?? null);
  if (!targetOk) {
    return c.json({ success: false, message: 'الجهة المستهدفة غير متاحة' }, 403);
  }

  const { id } = await createComplaint({
    fromUserId: user.id,
    fromRole: user.role,
    fromName: user.name,
    targetRole: data.targetRole,
    targetId: data.targetId ?? null,
    category: data.category,
    subject: data.subject,
    body: data.body,
    priority: data.priority,
    schoolId: user.school_id ?? null,
  });

  // Always alert admin via telegram + email
  sendComplaintAlert({
    id,
    fromName: user.name,
    fromRole: user.role,
    category: data.category,
    subject: data.subject,
    body: data.body,
    priority: data.priority || 'normal',
  }).catch((err: any) => { console.error('[complaints] alert failed:', err); });

  // Also email the target if it's a teacher/school and has an email
  if (data.targetRole === 'teacher' && data.targetId) {
    const targetEmail = await getUserEmail(data.targetId);
    const targetName = (await getAvailableTargets(user.id, user.role)).teachers?.find(t => t.id === data.targetId)?.name || 'مدرس';
    if (targetEmail) {
      sendComplaintToTarget({
        id, fromName: user.name, fromRole: user.role,
        targetName, targetEmail,
        category: data.category, subject: data.subject, body: data.body,
        priority: data.priority || 'normal',
      }).catch((err: any) => { console.error('[complaints] alert failed:', err); });
    }
  } else if (data.targetRole === 'school' && data.targetId) {
    const targetEmail = await getSchoolEmail(data.targetId);
    if (targetEmail) {
      sendComplaintToTarget({
        id, fromName: user.name, fromRole: user.role,
        targetName: 'إدارة المدرسة', targetEmail,
        category: data.category, subject: data.subject, body: data.body,
        priority: data.priority || 'normal',
      }).catch((err: any) => { console.error('[complaints] alert failed:', err); });
    }
  }

  return c.json({ success: true, id }, 201);
});

const updateSchema = z.object({
  status: z.enum(['open', 'in_review', 'resolved', 'dismissed']),
  note: z.string().max(2000).optional(),
});

// PATCH /api/complaints/:id — update status (only the target can update)
app.patch('/:id', zValidator('json', updateSchema), async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const { status, note } = c.req.valid('json');

  // Verify the user is the target of this complaint (or admin)
  const hasAccess = await validateComplaintAccess(id, user.id, user.role);
  if (!hasAccess) {
    return c.json({ success: false, message: 'غير مصرح بتحديث هذه الشكوى' }, 403);
  }

  // Only the target (not the sender) can update status
  const isTarget = await validateComplaintIsTarget(id, user.id, user.role);
  if (!isTarget) {
    return c.json({ success: false, message: 'فقط الجهة المستهدفة يمكنها تحديث الحالة' }, 403);
  }

  try {
    await updateComplaintStatus(id, status, user.id, user.name, note);
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ success: false, message: err?.message || 'فشل التحديث' }, 400);
  }
});

export { app as complaintRoutes };
