import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { getSystemSetting, getSystemSettingBool } from '../../shared/system-settings.js';
import { schoolRegisterSchema, schoolLoginSchema, passwordComplexity } from '../auth/schemas.js';
import {
  registerSchool, loginSchool, getSchoolById, getSchoolStats,
  getSchoolUsers, getSchoolClasses, removeSchoolUser, getSchoolReports,
  updateSchoolName, changeSchoolPassword, blockSchoolUser, unblockSchoolUser,
  getAllSchools, toggleSchoolActive, updateSchool, deleteSchool,
  createEmailChangeRequest,
} from './services.js';
import { adminSubRoutes } from './handlers-admin.js';
import { setRefreshCookie, setAccessCookie, clearRefreshCookie, clearAccessCookie, getAccessCookie } from '../auth/cookies.js';
import { schoolAuthMiddleware, adminAuthMiddleware } from '../auth/middleware.js';
import { verifyAccessToken } from '../auth/jwt.js';
import { logoutSchool } from '../auth/services.js';
import type { School } from '@my-modern-app/shared-types';
import type { User } from '@my-modern-app/shared-types';

type Vars = { school: School; user: User };
const schoolRoutes = new Hono<{ Variables: Vars }>();

function validId(idStr: string): number | null {
  const n = Number(idStr);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const schoolAuth = schoolAuthMiddleware;
const adminAuth = adminAuthMiddleware;

// ─── Schemas ───
const updateNameSchema = z.object({ name: z.string().min(2).max(200) });
const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: passwordComplexity,
});
const emailChangeSchema = z.object({ requested_email: z.string().email() });

// ─── Auth ───
schoolRoutes.post('/register', zValidator('json', schoolRegisterSchema), async (c) => {
  if (await getSystemSettingBool('stop_registration')) {
    return c.json({ success: false, message: 'تم إيقاف التسجيل مؤقتاً بواسطة الإدارة. يرجى المحاولة لاحقاً.' }, 403);
  }
  const regEnabled = await getSystemSetting('registration_enabled');
  if (regEnabled === 'false') {
    return c.json({ success: false, message: 'تم إيقاف التسجيل مؤقتاً بواسطة الإدارة. يرجى المحاولة لاحقاً.' }, 403);
  }
  const body = c.req.valid('json');
  const result = await registerSchool(body.name, body.email, body.password, body.max_students, body.max_teachers);
  if (!result.success) return c.json({ success: false, message: result.message }, 409);
  return c.json({ success: true, school: result.school, code: result.code }, 201);
});

schoolRoutes.post('/login', zValidator('json', schoolLoginSchema), async (c) => {
  const body = c.req.valid('json');
  const clientIp = c.req.header('X-Forwarded-For') || c.req.header('x-real-ip') || c.req.header('x-client-ip') || 'unknown';
  const result = await loginSchool(body.email, body.password, clientIp);
  if (!result.success) return c.json({ success: false, message: result.message }, 401);
  if (result.token) setAccessCookie(c, result.token);
  if (result.refreshToken) setRefreshCookie(c, result.refreshToken);
  return c.json({ success: true, school: result.school });
});

schoolRoutes.post('/logout', async (c) => {
  const accessToken = getAccessCookie(c);
  if (accessToken) {
    try {
      const payload = await verifyAccessToken(accessToken);
      if (payload.role === 'school') {
        await logoutSchool(Number(payload.sub));
      }
    } catch { /* ignore invalid token on logout */ }
  }
  clearAccessCookie(c);
  clearRefreshCookie(c);
  return c.json({ success: true });
});

// ─── School Profile ───
schoolRoutes.get('/me', schoolAuth, async (c) => {
  return c.json({ success: true, school: c.get('school') as School });
});

schoolRoutes.patch('/me', schoolAuth, zValidator('json', updateNameSchema), async (c) => {
  const school = c.get('school') as School;
  const { name } = c.req.valid('json');
  const result = await updateSchoolName(school.id, name);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  const updated = await getSchoolById(school.id);
  return c.json({ success: true, school: updated });
});

schoolRoutes.post('/password', schoolAuth, zValidator('json', changePasswordSchema), async (c) => {
  const school = c.get('school') as School;
  const { current_password, new_password } = c.req.valid('json');
  const result = await changeSchoolPassword(school.id, current_password, new_password);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

// ─── School Data ───
schoolRoutes.get('/stats', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  try {
    const stats = await getSchoolStats(school.id);
    return c.json({ success: true, stats, school });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('school stats error:', err);
    return c.json({ success: false, message: 'Failed to load stats' }, 500);
  }
});

schoolRoutes.get('/users', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  try {
    const page = Math.max(1, Number(c.req.query('page') || '1'));
    const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') || '50')));
    const result = await getSchoolUsers(school.id, page, limit);
    return c.json({ success: true, ...result });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('school users error:', err);
    return c.json({ success: false, message: 'Failed to load users' }, 500);
  }
});

schoolRoutes.get('/classes', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  try {
    const classes = await getSchoolClasses(school.id);
    return c.json({ success: true, classes });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('school classes error:', err);
    return c.json({ success: false, message: 'Failed to load classes' }, 500);
  }
});

schoolRoutes.get('/reports', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  try {
    const page = Math.max(1, Number(c.req.query('page') || '1'));
    const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') || '50')));
    const result = await getSchoolReports(school.id, page, limit);
    return c.json({ success: true, ...result });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('school reports error:', err);
    return c.json({ success: false, message: 'Failed to load reports' }, 500);
  }
});

// ─── School User Management ───
schoolRoutes.delete('/users/:userId', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const userId = Number(c.req.param('userId'));
  if (!Number.isFinite(userId) || userId <= 0) return c.json({ success: false, message: 'Invalid user ID' }, 400);
  try {
    const result = await removeSchoolUser(school.id, userId);
    if (!result.success) return c.json({ success: false, message: result.message }, 400);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('removeSchoolUser error:', err);
    return c.json({ success: false, message: 'Failed to remove user' }, 500);
  }
});

schoolRoutes.patch('/users/:userId/block', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const userId = validId(c.req.param('userId'));
  if (!userId) return c.json({ success: false, message: 'Invalid user ID' }, 400);
  try {
    const result = await blockSchoolUser(school.id, userId);
    if (!result.success) return c.json({ success: false, message: result.message }, 400);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('blockSchoolUser error:', err);
    return c.json({ success: false, message: 'Failed to block user' }, 500);
  }
});

schoolRoutes.patch('/users/:userId/unblock', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const userId = validId(c.req.param('userId'));
  if (!userId) return c.json({ success: false, message: 'Invalid user ID' }, 400);
  try {
    const result = await unblockSchoolUser(school.id, userId);
    if (!result.success) return c.json({ success: false, message: result.message }, 400);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('unblockSchoolUser error:', err);
    return c.json({ success: false, message: 'Failed to unblock user' }, 500);
  }
});

// ─── Email Change Request ───
schoolRoutes.post('/email-change-request', schoolAuth, zValidator('json', emailChangeSchema), async (c) => {
  const school = c.get('school') as School;
  const { requested_email } = c.req.valid('json');
  const result = await createEmailChangeRequest('school', school.id, school.email, requested_email);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

// ─── Admin: School List ───
schoolRoutes.get('/admin/all', adminAuth, async (c) => {
  try {
    return c.json({ success: true, schools: await getAllSchools() });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin getAllSchools error:', err);
    return c.json({ success: false, message: 'Failed to load schools' }, 500);
  }
});

// ─── Admin: School Detail ───
schoolRoutes.get('/admin/:id', adminAuth, async (c) => {
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'Invalid school ID' }, 400);
  try {
    const school = await getSchoolById(id);
    if (!school) return c.json({ success: false, message: 'School not found' }, 404);
    const stats = await getSchoolStats(id);
    return c.json({ success: true, school, stats });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin getSchoolById error:', err);
    return c.json({ success: false, message: 'Failed to load school' }, 500);
  }
});

const updateSchoolAdminSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  email: z.string().email().max(255).optional(),
  max_students: z.number().int().min(1).max(100000).optional(),
  max_teachers: z.number().int().min(1).max(1000).optional(),
});

schoolRoutes.patch('/admin/:id', adminAuth, zValidator('json', updateSchoolAdminSchema), async (c) => {
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'Invalid school ID' }, 400);
  const body = c.req.valid('json');
  const updates: { name?: string; email?: string; max_students?: number; max_teachers?: number } = {};
  if (body.name) updates.name = body.name.trim().slice(0, 200);
  if (body.email) updates.email = body.email.trim().slice(0, 255);
  if (body.max_students) updates.max_students = Math.floor(body.max_students);
  if (body.max_teachers) updates.max_teachers = Math.floor(body.max_teachers);
  const result = await updateSchool(id, updates);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

schoolRoutes.delete('/admin/:id', adminAuth, async (c) => {
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'Invalid school ID' }, 400);
  try {
    const result = await deleteSchool(id);
    if (!result.success) return c.json({ success: false, message: result.message }, 404);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin deleteSchool error:', err);
    return c.json({ success: false, message: 'Failed to delete school' }, 500);
  }
});

schoolRoutes.patch('/admin/:id/toggle', adminAuth, async (c) => {
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'Invalid school ID' }, 400);
  try {
    const result = await toggleSchoolActive(id);
    if (!result.success) return c.json({ success: false, message: result.message }, 404);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin toggleSchoolActive error:', err);
    return c.json({ success: false, message: 'Failed to toggle school' }, 500);
  }
});

// ─── Merge sub-routers ───
schoolRoutes.route('/', adminSubRoutes);

export { schoolRoutes as schoolBaseRoutes };
