import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { comparePassword } from '../auth/crypto.js';
import { authMiddleware } from '../auth/middleware.js';
import { db } from '../../db/index.js';
import { hashPassword } from '../../modules/auth/crypto.js';
import { updatePassword } from '../../modules/auth/services.js';
import { passwordComplexity } from '../auth/schemas.js';
import * as svc from './services.js';
import * as detailSvc from './user-detail-service.js';
import { verifyAdminPassword } from './admin-password.js';
import type { Hono } from 'hono';
import type { User } from '@my-modern-app/shared-types';

const updateRoleSchema = z.object({
  role: z.enum(['student', 'teacher', 'admin']),
  admin_password: z.string().min(1, 'كلمة مرور الإدمن مطلوبة'),
});

const deleteAllSchema = z.object({
  password: z.string().min(1),
});

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: passwordComplexity,
  role: z.enum(['student', 'teacher', 'admin']),
});

const adminResetPasswordSchema = z.object({
  password: passwordComplexity,
  admin_password: z.string().min(1, 'كلمة مرور الإدمن مطلوبة'),
});

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
});

const extendTrialSchema = z.object({
  days: z.number().int().positive(),
});

const changeSubscriptionSchema = z.object({
  status: z.enum(['TRIAL', 'ACTIVE', 'CANCELLED', 'EXPIRED']).optional(),
  plan_id: z.number().int().positive().nullable().optional(),
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

  app.post('/users/:id/delete', zValidator('json', z.object({ admin_password: z.string().min(1, 'كلمة مرور الإدمن مطلوبة') })), async (c) => {
    const id = validId(c.req.param('id'));
    if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
    const admin = c.get('user');
    const { admin_password } = c.req.valid('json');
    const pwCheck = await verifyAdminPassword(admin, admin_password);
    if (pwCheck) return c.json(pwCheck, 401);
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
    const { role, admin_password } = c.req.valid('json');
    const admin = c.get('user');
    const pwCheck = await verifyAdminPassword(admin, admin_password);
    if (pwCheck) return c.json(pwCheck, 401);
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

  app.post('/users/:id/ban', zValidator('json', z.object({ reason: z.string().optional(), admin_password: z.string().min(1, 'كلمة مرور الإدمن مطلوبة') })), async (c) => {
    const admin = c.get('user') as User;
    const id = validId(c.req.param('id'));
    if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
    const { reason, admin_password } = c.req.valid('json');
    const pwCheck = await verifyAdminPassword(admin, admin_password);
    if (pwCheck) return c.json(pwCheck, 401);
    const result = await detailSvc.banUser(id, reason || '', admin.id, admin.name);
    return c.json(result);
  });

  app.post('/users/:id/unban', zValidator('json', z.object({ admin_password: z.string().min(1, 'كلمة مرور الإدمن مطلوبة') })), async (c) => {
    const admin = c.get('user') as User;
    const id = validId(c.req.param('id'));
    if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
    const { admin_password } = c.req.valid('json');
    const pwCheck = await verifyAdminPassword(admin, admin_password);
    if (pwCheck) return c.json(pwCheck, 401);
    const result = await detailSvc.unbanUser(id, admin.id, admin.name);
    return c.json(result);
  });

  app.post('/users/:id/reset-password', zValidator('json', adminResetPasswordSchema), async (c) => {
    const id = validId(c.req.param('id'));
    if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
    const { password, admin_password } = c.req.valid('json');
    const admin = c.get('user');
    const pwCheck = await verifyAdminPassword(admin, admin_password);
    if (pwCheck) return c.json(pwCheck, 401);
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
      const schoolIdRaw = c.req.query('schoolId');
      const schoolId = schoolIdRaw ? Number(schoolIdRaw) : undefined;
      const list = await svc.getAllTeachers(schoolId && schoolId > 0 ? schoolId : undefined);
      return c.json({ success: true, teachers: list });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin getTeachers error:', err);
      return c.json({ success: false, message: 'Failed to load teachers' }, 500);
    }
  });

  app.post('/users/delete-non-admin', zValidator('json', deleteAllSchema), async (c) => {
    const admin = c.get('user') as User;
    const { password } = c.req.valid('json');
    const adminRow = await db.get<{ password_hash: string }>(`SELECT password_hash FROM users WHERE id = ?`, admin.id);
    if (!adminRow || !(await comparePassword(password, adminRow.password_hash))) {
      return c.json({ success: false, message: 'كلمة المرور غير صحيحة' }, 401);
    }
    try {
      const result = await svc.deleteAllNonAdminUsers();
      return c.json(result);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin deleteAllNonAdmin error:', err);
      return c.json({ success: false, message: 'فشل الحذف' }, 500);
    }
  });

  app.post('/users/:id/extend-trial', zValidator('json', extendTrialSchema), async (c) => {
    const admin = c.get('user') as User;
    const id = validId(c.req.param('id'));
    if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
    const { days } = c.req.valid('json');
    const result = await detailSvc.extendTrial(id, days, admin.id, admin.name);
    return c.json(result);
  });

  app.patch('/users/:id/subscription', zValidator('json', changeSubscriptionSchema), async (c) => {
    const id = validId(c.req.param('id'));
    if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
    const body = c.req.valid('json');
    const result = await detailSvc.changeSubscription(id, body);
    return c.json(result);
  });
}
