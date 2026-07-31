import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getCookie } from 'hono/cookie';
import { verifyAccessToken } from '../auth/jwt.js';
import { db } from '../../db/index.js';
import {
  createApprovalRequest, getApprovalsForUser, getPendingApprovals,
  approveRequest, rejectRequest, escalateRequest, getApprovalById, getAllApprovals,
} from './services.js';

const approvalRoutes = new Hono<{ Variables: { user: { id: number; email: string; role: string }; schoolId: number } }>();

// Auth middleware
const authMiddleware = async (c: any, next: any) => {
  const token = getCookie(c, 'access_token');
  if (!token) return c.json({ success: false, message: 'Unauthorized' }, 401);
  try {
    const payload = await verifyAccessToken(token);
    c.set('user', { id: Number(payload.sub), email: payload.email, role: payload.role });
    await next();
  } catch {
    return c.json({ success: false, message: 'Invalid token' }, 401);
  }
};

// School auth middleware
const schoolAuth = async (c: any, next: any) => {
  const token = getCookie(c, 'access_token');
  if (!token) return c.json({ success: false, message: 'Unauthorized' }, 401);
  try {
    const payload = await verifyAccessToken(token);
    if (payload.role !== 'school') return c.json({ success: false, message: 'School access required' }, 403);
    c.set('schoolId', Number(payload.sub));
    await next();
  } catch {
    return c.json({ success: false, message: 'Invalid token' }, 401);
  }
};

// ─── Create Approval Request ───
const createSchema = z.object({
  type: z.enum(['penalty', 'grade_change', 'student_removal', 'grade_appeal']),
  approver_type: z.enum(['teacher', 'school', 'admin']),
  approver_id: z.number().int().optional(),
  target_user_id: z.number().int(),
  target_user_name: z.string().min(1),
  class_id: z.string().optional(),
  report_id: z.number().int().optional(),
  school_id: z.number().int().optional(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  proposed_grade: z.number().int().min(0).max(100).optional(),
  severity: z.enum(['low', 'normal', 'high', 'critical']).optional(),
});

approvalRoutes.post('/', authMiddleware, zValidator('json', createSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');

  // ─── Enforce hierarchical escalation ───
  // Students → teacher first (or school if no teacher context)
  // Teachers → school first
  // School → admin
  // Nobody below school can send directly to admin
  if (user.role === 'student' || user.role === 'teacher') {
    if (body.approver_type === 'admin') {
      return c.json({ success: false, message: 'لا يمكنك إرسال طلب مباشرة للأدمن. يجب أن يمر عبر المدرسة أولاً. إذا رفضت المدرسة طلبك، يمكنك التصعيد للأدمن.' }, 403);
    }
    // Students must go to teacher first (if class context) or school
    if (user.role === 'student' && body.approver_type === 'school' && body.class_id) {
      // Redirect to teacher instead
      body.approver_type = 'teacher';
      const cls = await db.get<{ teacher_id: number }>(
        'SELECT teacher_id FROM classes WHERE id = ?', body.class_id,
      );
      if (cls) body.approver_id = cls.teacher_id;
    }
  }

  // Auto-fill school_id from target user if not provided
  if (!body.school_id) {
    const targetUser = await db.get<{ school_id: number | null }>(
      'SELECT school_id FROM users WHERE id = ?', body.target_user_id,
    );
    if (targetUser?.school_id) body.school_id = targetUser.school_id;
  }

  // Auto-fill approver_id for teacher approver
  if (body.approver_type === 'teacher' && !body.approver_id && body.class_id) {
    const cls = await db.get<{ teacher_id: number }>(
      'SELECT teacher_id FROM classes WHERE id = ?', body.class_id,
    );
    if (cls) body.approver_id = cls.teacher_id;
  }

  const result = await createApprovalRequest({
    ...body,
    requester_type: user.role as any,
    requester_id: user.id,
    requester_name: '',
    school_id: body.school_id,
  });

  // Get requester name
  const requester = await db.get<{ name: string }>('SELECT name FROM users WHERE id = ?', user.id);
  if (requester) {
    await db.run('UPDATE approval_requests SET requester_name = ? WHERE id = ?', requester.name, result.id);
  }

  return c.json({ success: true, id: result.id });
});

// ─── Get All Approvals for Current User ───
approvalRoutes.get('/mine', authMiddleware, async (c) => {
  const user = c.get('user');
  let schoolId: number | undefined;

  if (user.role === 'school') {
    schoolId = user.id;
  } else {
    const u = await db.get<{ school_id: number | null }>('SELECT school_id FROM users WHERE id = ?', user.id);
    schoolId = u?.school_id || undefined;
  }

  const approvals = await getApprovalsForUser(user.id, user.role, schoolId);
  return c.json({ success: true, approvals });
});

// ─── Get Pending Approvals (for current user's role) ───
approvalRoutes.get('/pending', authMiddleware, async (c) => {
  const user = c.get('user');
  let schoolId: number | undefined;

  if (user.role === 'school') {
    schoolId = user.id;
  }

  const pending = await getPendingApprovals(user.role, user.id, schoolId);
  return c.json({ success: true, pending });
});

// ─── Get Approval by ID ───
approvalRoutes.get('/:id', authMiddleware, async (c) => {
  const id = Number(c.req.param('id'));
  const approval = await getApprovalById(id);
  if (!approval) return c.json({ success: false, message: 'Not found' }, 404);
  return c.json({ success: true, approval });
});

// ─── Approve Request ───
const approveSchema = z.object({
  response: z.string().min(1).max(1000),
});

approvalRoutes.post('/:id/approve', authMiddleware, zValidator('json', approveSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const user = c.get('user');
  const { response } = c.req.valid('json');

  const requester = await db.get<{ name: string }>('SELECT name FROM users WHERE id = ?', user.id);
  const approverName = requester?.name || user.email;

  const result = await approveRequest(id, user.id, approverName, user.role, response);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true, action: result.action });
});

// ─── Reject Request ───
approvalRoutes.post('/:id/reject', authMiddleware, zValidator('json', approveSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const user = c.get('user');
  const { response } = c.req.valid('json');

  const requester = await db.get<{ name: string }>('SELECT name FROM users WHERE id = ?', user.id);
  const approverName = requester?.name || user.email;

  const result = await rejectRequest(id, user.id, approverName, user.role, response);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

// ─── Escalate Request ───
const escalateSchema = z.object({
  reason: z.string().min(1).max(1000),
});

approvalRoutes.post('/:id/escalate', authMiddleware, zValidator('json', escalateSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const { reason } = c.req.valid('json');
  const result = await escalateRequest(id, reason);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

// ─── School: Get Pending Approvals ───
approvalRoutes.get('/school/pending', schoolAuth, async (c) => {
  const schoolId = c.get('schoolId');
  const pending = await getPendingApprovals('school', 0, schoolId);
  return c.json({ success: true, pending });
});

// ─── School: Approve ───
approvalRoutes.post('/school/:id/approve', schoolAuth, zValidator('json', approveSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const schoolId = c.get('schoolId');
  const { response } = c.req.valid('json');

  const school = await db.get<{ name: string }>('SELECT name FROM schools WHERE id = ?', schoolId);
  const result = await approveRequest(id, schoolId, school?.name || 'School', 'school', response);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true, action: result.action });
});

// ─── School: Reject ───
approvalRoutes.post('/school/:id/reject', schoolAuth, zValidator('json', approveSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const schoolId = c.get('schoolId');
  const { response } = c.req.valid('json');

  const school = await db.get<{ name: string }>('SELECT name FROM schools WHERE id = ?', schoolId);
  const result = await rejectRequest(id, schoolId, school?.name || 'School', 'school', response);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

// ─── Admin: Get All Approvals ───
const adminAuth = async (c: any, next: any) => {
  const token = getCookie(c, 'access_token');
  if (!token) return c.json({ success: false, message: 'Unauthorized' }, 401);
  try {
    const payload = await verifyAccessToken(token);
    if (payload.role !== 'admin') return c.json({ success: false, message: 'Admin access required' }, 403);
    await next();
  } catch {
    return c.json({ success: false, message: 'Invalid token' }, 401);
  }
};

approvalRoutes.get('/admin/all', adminAuth, async (c) => {
  const approvals = await getAllApprovals();
  return c.json({ success: true, approvals });
});

approvalRoutes.post('/admin/:id/approve', adminAuth, zValidator('json', approveSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const user = c.get('user') || { id: 0, name: 'Admin' };
  const { response } = c.req.valid('json');

  const admin = await db.get<{ name: string }>('SELECT name FROM users WHERE id = ?', user.id);
  const result = await approveRequest(id, user.id, admin?.name || 'Admin', 'admin', response);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true, action: result.action });
});

approvalRoutes.post('/admin/:id/reject', adminAuth, zValidator('json', approveSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const user = c.get('user') || { id: 0, name: 'Admin' };
  const { response } = c.req.valid('json');

  const admin = await db.get<{ name: string }>('SELECT name FROM users WHERE id = ?', user.id);
  const result = await rejectRequest(id, user.id, admin?.name || 'Admin', 'admin', response);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

export { approvalRoutes };
