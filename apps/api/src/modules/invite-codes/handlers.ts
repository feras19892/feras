import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import type { User } from '@my-modern-app/shared-types';
import * as svc from './services.js';
import * as subSvc from '../subscriptions/services.js';

const app = new Hono<{ Variables: { user: User } }>();
app.use(authMiddleware);

const createSchema = z.object({
  role: z.enum(['student', 'teacher']).optional().default('student'),
  max_uses: z.number().int().min(1).nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
});

const batchCreateSchema = z.object({
  role: z.enum(['student', 'teacher']).optional().default('student'),
  quantity: z.number().int().min(1).max(100).default(1),
  max_uses: z.number().int().min(1).nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
});

// Create an invite code for a teacher or school
app.post('/', zValidator('json', createSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');

  const ownerType = user.role === 'school' ? 'school' : 'teacher';
  const sub = await subSvc.getActiveSubscription(user.id, ownerType === 'school' ? 'school' : 'user');
  if (!sub) {
    return c.json({ success: false, message: 'لا يوجد اشتراك نشط لإنشاء كود دعوة' }, 403);
  }

  const targetRole = body.role ?? 'student';
  const maxField = targetRole === 'teacher' ? sub.max_teachers : sub.max_students;
  if (maxField !== null && maxField !== undefined) {
    const existing = await svc.countInviteCodesByOwnerAndRole(user.id, ownerType, targetRole);
    if (existing >= maxField) {
      return c.json({ success: false, message: `تم الوصول للحد الأقصى لأكواد ${targetRole === 'teacher' ? 'المعلمين' : 'الطلاب'}` }, 403);
    }
  }

  const code = await svc.createInviteCode({
    owner_id: user.id,
    owner_type: ownerType,
    role: targetRole,
    subscription_id: sub.id,
    max_uses: body.max_uses ?? null,
    expires_at: body.expires_at ?? null,
  });

  return c.json({ success: true, invite: code }, 201);
});

// Create multiple invite codes for a teacher or school
app.post('/batch', zValidator('json', batchCreateSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');

  const ownerType = user.role === 'school' ? 'school' : 'teacher';
  const sub = await subSvc.getActiveSubscription(user.id, ownerType === 'school' ? 'school' : 'user');
  if (!sub) {
    return c.json({ success: false, message: 'لا يوجد اشتراك نشط لإنشاء أكواد دعوة' }, 403);
  }

  const targetRole = body.role ?? 'student';
  const maxField = targetRole === 'teacher' ? sub.max_teachers : sub.max_students;
  if (maxField !== null && maxField !== undefined) {
    const existing = await svc.countInviteCodesByOwnerAndRole(user.id, ownerType, targetRole);
    if (existing + body.quantity > maxField) {
      return c.json({ success: false, message: `لا يمكن إنشاء أكثر من ${maxField} كود ${targetRole === 'teacher' ? 'معلم' : 'طالب'}` }, 403);
    }
  }

  const codes: Awaited<ReturnType<typeof svc.createInviteCode>>[] = [];
  for (let i = 0; i < body.quantity; i++) {
    const code = await svc.createInviteCode({
      owner_id: user.id,
      owner_type: ownerType,
      role: targetRole,
      subscription_id: sub.id,
      max_uses: body.max_uses ?? null,
      expires_at: body.expires_at ?? null,
    });
    codes.push(code);
  }

  return c.json({ success: true, invites: codes }, 201);
});

// List my invite codes
app.get('/', async (c) => {
  const user = c.get('user');
  const ownerType = user.role === 'school' ? 'school' : 'teacher';
  const codes = await svc.getInviteCodesByOwner(user.id, ownerType);
  return c.json({ success: true, invite_codes: codes });
});

// Validate a code (public but requires auth)
app.get('/:code/validate', async (c) => {
  const code = c.req.param('code');
  const result = await svc.validateInviteCode(code);
  if (!result.ok) {
    return c.json({ success: false, message: result.message }, 400);
  }
  return c.json({ success: true, invite: result.invite });
});

// Join with an invite code
app.post('/:code/join', async (c) => {
  const user = c.get('user');
  const code = c.req.param('code');
  if (user.role === 'school') {
    return c.json({ success: false, message: 'المدرسة لا تنضم لكود دعوة' }, 403);
  }
  const result = await svc.useInviteCode({ member_id: user.id, code });
  if (!result.success) {
    return c.json({ success: false, message: result.message }, 400);
  }
  return c.json({ success: true, membership: result.membership });
});

// List members of a teacher/school
app.get('/members', async (c) => {
  const user = c.get('user');
  const ownerType = user.role === 'school' ? 'school' : 'teacher';
  const members = await svc.getTenantMembers(user.id, ownerType);
  return c.json({ success: true, members });
});

// Suspend a member
app.post('/members/:memberId/suspend', async (c) => {
  const user = c.get('user');
  const memberId = Number(c.req.param('memberId'));
  const ownerType = user.role === 'school' ? 'school' : 'teacher';
  await svc.updateTenantMembershipStatus(memberId, user.id, ownerType, 'suspended');
  return c.json({ success: true });
});

// Activate a member
app.post('/members/:memberId/activate', async (c) => {
  const user = c.get('user');
  const memberId = Number(c.req.param('memberId'));
  const ownerType = user.role === 'school' ? 'school' : 'teacher';
  await svc.updateTenantMembershipStatus(memberId, user.id, ownerType, 'active');
  return c.json({ success: true });
});

// Remove a member
app.delete('/members/:memberId', async (c) => {
  const user = c.get('user');
  const memberId = Number(c.req.param('memberId'));
  const ownerType = user.role === 'school' ? 'school' : 'teacher';
  await svc.removeTenantMember(memberId, user.id, ownerType);
  return c.json({ success: true });
});

export { app as inviteCodeRoutes };
