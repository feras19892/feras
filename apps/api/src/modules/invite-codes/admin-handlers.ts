import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { adminAuthMiddleware } from '../auth/middleware.js';
import type { User } from '@my-modern-app/shared-types';
import * as svc from './admin-services.js';

const app = new Hono<{ Variables: { user: User } }>();
app.use(adminAuthMiddleware);

const createSchema = z.object({
  owner_id: z.number().int().positive(),
  owner_type: z.enum(['teacher', 'school']),
  role: z.enum(['student', 'teacher']).optional().default('student'),
  max_uses: z.number().int().min(1).nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
});

const updateSchema = z.object({
  is_active: z.number().int().min(0).max(1).optional(),
  max_uses: z.number().int().min(1).nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
});

// List all subscriber accounts with code and usage stats
app.get('/accounts', async (c) => {
  const accounts = await svc.getSubscriberAccounts();
  return c.json({ success: true, accounts });
});

// List all invite codes
app.get('/codes', async (c) => {
  const ownerId = c.req.query('owner_id') ? Number(c.req.query('owner_id')) : undefined;
  const ownerType = c.req.query('owner_type') as 'teacher' | 'school' | undefined;
  if (ownerId !== undefined && ownerType) {
    const codes = await svc.getInviteCodesByOwner(ownerId, ownerType);
    return c.json({ success: true, invite_codes: codes });
  }
  const codes = await svc.getAllInviteCodes();
  return c.json({ success: true, invite_codes: codes });
});

// Create an invite code as admin
app.post('/codes', zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json');
  const code = await svc.createAdminInviteCode(body);
  return c.json({ success: true, invite: code }, 201);
});

// Update an invite code
app.patch('/codes/:id', zValidator('json', updateSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const body = c.req.valid('json');
  const code = await svc.updateInviteCode(id, body);
  if (!code) return c.json({ success: false, message: 'الكود غير موجود' }, 404);
  return c.json({ success: true, invite: code });
});

// Delete an invite code
app.delete('/codes/:id', async (c) => {
  const id = Number(c.req.param('id'));
  await svc.deleteInviteCode(id);
  return c.json({ success: true });
});

export { app as adminInviteCodeRoutes };
