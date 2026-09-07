import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getCookie } from 'hono/cookie';
import { verifyAccessToken } from '../auth/jwt.js';
import { authMiddleware as centralAuthMiddleware, adminAuthMiddleware } from '../auth/middleware.js';
import { schoolCreateRoutes } from './handlers-school.js';
import { db } from '../../db/index.js';
import {
  createApprovalRequest, getApprovalsForUser, getPendingApprovals,
  approveRequest, rejectRequest, escalateRequest, getApprovalById, getAllApprovals,
} from './services.js';

const approvalRoutes = new Hono<{ Variables: { user: { id: number; email: string; role: string }; schoolId: number } }>();

// Auth middleware — use centralized version
const authMiddleware = centralAuthMiddleware;

// School auth middleware (sets schoolId for school-scoped routes)
const schoolAuth = async (c: any, next: any) => {
  const token = getCookie(c, 'access_token') || (c.req.header('Authorization')?.startsWith('Bearer ') ? c.req.header('Authorization')!.slice(7) : undefined);
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
  type: z.enum([
    'penalty', 'grade_change', 'student_removal', 'grade_appeal',
    'class_creation', 'class_deletion', 'class_edit',
    'user_creation', 'user_edit', 'report_deletion',
  ]),
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
  metadata: z.string().optional(),
});

approvalRoutes.post('/', authMiddleware, zValidator('json', createSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');

  // Enforce hierarchical escalation
  const payload = { ...body };

  // Students → teacher first (or school if no teacher context)
  // Teachers → school first
  // School → admin
  // Nobody below school can send directly to admin
  if (user.role === 'student' || user.role === 'teacher') {
    if (payload.approver_type === 'admin') {
      return c.json({ success: false, message: 'لا يمكنك إرسال طلب مباشرة للأدمن. يجب أن يمر عبر المدرسة أولاً. إذا رفضت المدرسة طلبك، يمكنك التصعيد للأدمن.' }, 403);
    }
    // Students must go to teacher first (if class context) or school
    if (user.role === 'student' && payload.approver_type === 'school' && payload.class_id) {
      // Redirect to teacher instead
      payload.approver_type = 'teacher';
      const cls = await db.get<{ teacher_id: number }>(
        'SELECT teacher_id FROM classes WHERE id = ?', payload.class_id,
      );
      if (cls) payload.approver_id = cls.teacher_id;
    }
  }

  // Resolve tenant context server-side — never trust client-supplied scope
  const requester = await db.get<{ name: string; school_id: number | null }>(
    'SELECT name, school_id FROM users WHERE id = ?', user.id,
  );
  if (user.role === 'school') {
    payload.school_id = user.id;
  } else {
    payload.school_id = requester?.school_id ?? undefined;
  }

  const targetUser = await db.get<{ school_id: number | null }>(
    'SELECT school_id FROM users WHERE id = ?', payload.target_user_id,
  );
  if (!targetUser) {
    return c.json({ success: false, message: 'المستخدم المستهدف غير موجود' }, 400);
  }
  if (payload.school_id && targetUser.school_id && targetUser.school_id !== payload.school_id) {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  if (!payload.school_id && targetUser.school_id) payload.school_id = targetUser.school_id;

  // The teacher approver is always derived from the class — a client-provided
  // approver_id is only honored for school/admin requesters.
  if (payload.approver_type === 'teacher' && payload.class_id) {
    const cls = await db.get<{ teacher_id: number }>(
      'SELECT teacher_id FROM classes WHERE id = ?', payload.class_id,
    );
    payload.approver_id = cls?.teacher_id;
  } else if (user.role === 'student' || user.role === 'teacher') {
    payload.approver_id = undefined;
  }

  const result = await createApprovalRequest({
    ...payload,
    requester_type: user.role as any,
    requester_id: user.id,
    requester_name: '',
    school_id: payload.school_id,
    metadata: payload.metadata,
  });

  if (requester?.name) {
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
  const user = c.get('user');
  const approval = await getApprovalById(id) as {
    requester_id: number; target_user_id: number; approver_type: string;
    approver_id: number | null; school_id: number | null;
  } | null;
  if (!approval) return c.json({ success: false, message: 'Not found' }, 404);

  const isOwner = approval.requester_id === user.id || approval.target_user_id === user.id;
  const isApprover = approval.approver_type === user.role &&
    (approval.approver_id === user.id || approval.approver_id == null);
  const isSchoolOwner = user.role === 'school' && approval.school_id === user.id;

  if (!isOwner && !isApprover && !isSchoolOwner && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }

  return c.json({ success: true, approval });
});

// ─── Approve Request ───
const approveSchema = z.object({
  response: z.string().max(1000).optional(),
});

approvalRoutes.post('/:id/approve', authMiddleware, zValidator('json', approveSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const user = c.get('user');
  const { response } = c.req.valid('json');

  const requester = await db.get<{ name: string }>('SELECT name FROM users WHERE id = ?', user.id);
  const approverName = requester?.name || user.email;

  const result = await approveRequest(id, user.id, approverName, user.role, response ?? '');
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

  const result = await rejectRequest(id, user.id, approverName, user.role, response ?? '');
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

// ─── Escalate Request ───
const escalateSchema = z.object({
  reason: z.string().min(1).max(1000),
});

approvalRoutes.post('/:id/escalate', authMiddleware, zValidator('json', escalateSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const user = c.get('user');
  const { reason } = c.req.valid('json');

  const approval = await getApprovalById(id) as {
    requester_id: number; status: string;
  } | null;
  if (!approval) return c.json({ success: false, message: 'Not found' }, 404);
  if (approval.requester_id !== user.id) {
    return c.json({ success: false, message: 'غير مصرح — يمكنك تصعيد طلباتك فقط' }, 403);
  }

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
  const approval = await getApprovalById(id) as { school_id: number | null } | null;
  if (!approval) return c.json({ success: false, message: 'Not found' }, 404);
  if (approval.school_id !== schoolId) {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const result = await approveRequest(id, schoolId, school?.name || 'School', 'school', response ?? '');
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true, action: result.action });
});

// ─── School: Reject ───
approvalRoutes.post('/school/:id/reject', schoolAuth, zValidator('json', approveSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const schoolId = c.get('schoolId');
  const { response } = c.req.valid('json');

  const school = await db.get<{ name: string }>('SELECT name FROM schools WHERE id = ?', schoolId);
  const approval = await getApprovalById(id) as { school_id: number | null } | null;
  if (!approval) return c.json({ success: false, message: 'Not found' }, 404);
  if (approval.school_id !== schoolId) {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const result = await rejectRequest(id, schoolId, school?.name || 'School', 'school', response ?? '');
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

// ─── Admin: Get All Approvals ───
const adminAuth = adminAuthMiddleware;

type AdminUser = { id: number; name: string; email: string; role: string; school_id?: number | null };

approvalRoutes.get('/', adminAuth, async (c) => {
  const admin = c.get('user') as AdminUser;
  const approvals = await getAllApprovals(200, admin.school_id ?? undefined);
  const requests = approvals.map((a: any) => ({
    id: a.id,
    type: a.type,
    status: a.status,
    user_name: a.requester_name || '—',
    user_email: '',
    user_role: a.requester_type || '',
    created_at: a.created_at,
    data: a.description ? { description: a.description } : undefined,
  }));
  return c.json({ success: true, requests, total: requests.length });
});

approvalRoutes.get('/admin/all', adminAuth, async (c) => {
  const admin = c.get('user') as AdminUser;
  const approvals = await getAllApprovals(200, admin.school_id ?? undefined);
  return c.json({ success: true, approvals });
});

async function adminCanActOn(user: AdminUser, requestId: number): Promise<boolean> {
  if (!user.school_id) return true;
  const approval = await getApprovalById(requestId) as { school_id: number | null } | null;
  return !!approval && approval.school_id === user.school_id;
}

approvalRoutes.post('/admin/:id/approve', adminAuth, zValidator('json', approveSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const user = c.get('user') as AdminUser;
  const { response } = c.req.valid('json');

  if (!(await adminCanActOn(user, id))) {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const result = await approveRequest(id, user.id, user.name, 'admin', response ?? '');
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true, action: result.action });
});

approvalRoutes.post('/admin/:id/reject', adminAuth, zValidator('json', approveSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const user = c.get('user') as AdminUser;
  const { response } = c.req.valid('json');

  if (!(await adminCanActOn(user, id))) {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const result = await rejectRequest(id, user.id, user.name, 'admin', response ?? '');
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

// ─── Merge sub-routers ───
approvalRoutes.route('/', schoolCreateRoutes);

export { approvalRoutes };
