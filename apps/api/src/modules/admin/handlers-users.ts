import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Hono } from 'hono';
import { hashPassword } from '../../modules/auth/crypto.js';
import { updatePassword } from '../../modules/auth/services.js';
import { passwordComplexity } from '../auth/schemas.js';
import * as svc from './services.js';
import * as detailSvc from './user-detail-service.js';
import { createNotification } from '../notifications/services.js';
import type { User } from '@my-modern-app/shared-types';

const updateRoleSchema = z.object({
  role: z.enum(['student', 'teacher', 'admin']),
});

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: passwordComplexity,
  role: z.enum(['student', 'teacher', 'admin']),
});

const adminResetPasswordSchema = z.object({
  password: passwordComplexity,
});

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
});

function validId(idStr: string): number | null {
  const n = Number(idStr);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function registerUserRoutes(app: Hono<{ Variables: { user: User } }>): void {
  app.get('/users', async (c) => {
    try {
      const page = Math.max(1, Number(c.req.query('page') || '1'));
      const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') || '50')));
      const search = c.req.query('search') || undefined;
      const role = c.req.query('role') || undefined;
      const result = await svc.getAllUsers(page, limit, search, role);
      return c.json({ success: true, ...result });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin getUsers error:', err);
      return c.json({ success: false, message: 'Failed to load users' }, 500);
    }
  });

  app.delete('/users/:id', async (c) => {
    const id = validId(c.req.param('id'));
    if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
    const admin = c.get('user');
    if (id === admin.id) {
      return c.json({ success: false, message: 'لا يمكن حذف حسابك الخاص' }, 400);
    }
    try {
      const result = await svc.deleteUser(id);
      return c.json(result);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('deleteUser error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to delete user — foreign key constraint';
      return c.json({ success: false, message: msg }, 500);
    }
  });

  app.patch('/users/:id/role', zValidator('json', updateRoleSchema), async (c) => {
    const id = validId(c.req.param('id'));
    if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
    const { role } = c.req.valid('json');
    try {
      const result = await svc.updateUserRole(id, role);
      return c.json(result);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin updateRole error:', err);
      return c.json({ success: false, message: 'Failed to update role' }, 500);
    }
  });

  app.post('/users', zValidator('json', createUserSchema), async (c) => {
    const { name, email, password, role } = c.req.valid('json');
    try {
      const passwordHash = await hashPassword(password);
      const result = await svc.createUser(name, email, passwordHash, role);
      return c.json(result, 201);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin createUser error:', err);
      return c.json({ success: false, message: 'Failed to create user' }, 500);
    }
  });

  app.get('/users/:id/full', async (c) => {
    const id = validId(c.req.param('id'));
    if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
    try {
      const profile = await detailSvc.getUserFullProfile(id);
      if (!profile) return c.json({ success: false, message: 'User not found' }, 404);
      return c.json({ success: true, ...profile });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin getUserFullProfile error:', err);
      return c.json({ success: false, message: 'Failed to load user profile' }, 500);
    }
  });

  app.post('/users/:id/ban', zValidator('json', z.object({ reason: z.string().optional() })), async (c) => {
    const id = validId(c.req.param('id'));
    if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
    const { reason } = c.req.valid('json');
    const result = await detailSvc.banUser(id, reason || '');
    if (result.success) {
      await createNotification({
        user_id: id,
        type: 'banned',
        title: '🚫 تم حظر حسابك',
        message: `تم حظر حسابك من قبل الإدارة. السبب: ${reason || 'غير محدد'}`,
      });
    }
    return c.json(result);
  });

  app.post('/users/:id/unban', async (c) => {
    const id = validId(c.req.param('id'));
    if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
    const result = await detailSvc.unbanUser(id);
    if (result.success) {
      await createNotification({
        user_id: id,
        type: 'unbanned',
        title: '✅ تم رفع الحظر عن حسابك',
        message: 'تم رفع الحظر عن حسابك. يمكنك استخدام المنصة بشكل طبيعي.',
      });
    }
    return c.json(result);
  });

  app.post('/users/:id/reset-password', zValidator('json', adminResetPasswordSchema), async (c) => {
    const id = validId(c.req.param('id'));
    if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
    const { password } = c.req.valid('json');
    try {
      const result = await updatePassword(id, password);
      if (!result.success) return c.json({ success: false, message: result.message || 'Update failed' }, 500);
      return c.json({ success: true });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin resetPassword error:', err);
      return c.json({ success: false, message: 'Failed to reset password' }, 500);
    }
  });

  app.patch('/users/:id', zValidator('json', updateUserSchema), async (c) => {
    const id = validId(c.req.param('id'));
    if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
    const { name, email } = c.req.valid('json');
    try {
      const result = await svc.updateUserForAdmin(id, { name, email });
      if (!result.success) return c.json(result, 400);
      return c.json(result);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin updateUser error:', err);
      return c.json({ success: false, message: 'Failed to update user' }, 500);
    }
  });

  app.get('/teachers', async (c) => {
    try {
      const list = await svc.getAllTeachers();
      return c.json({ success: true, teachers: list });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin getTeachers error:', err);
      return c.json({ success: false, message: 'Failed to load teachers' }, 500);
    }
  });
}
