import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { db } from '../../db/index.js';
import { broadcastEvent } from '../sse/event-bus.js';
import { getSystemSetting, getSystemSettingBool } from '../../shared/system-settings.js';
import { schoolRegisterSchema, schoolLoginSchema, passwordComplexity } from '../auth/schemas.js';
import {
  registerSchool, loginSchool, getSchoolById, getSchoolStats,
  getSchoolUsers, getSchoolClasses, removeSchoolUser, getSchoolReports,
  updateSchoolName, changeSchoolPassword, blockSchoolUser, unblockSchoolUser,
  getAllSchools, toggleSchoolActive, updateSchool, deleteSchool,
  createEmailChangeRequest,
} from './services.js';
import { hashPassword } from '../auth/crypto.js';
import { adminSubRoutes } from './handlers-admin.js';
import { verifyAdminPassword } from '../admin/admin-password.js';
import { setRefreshCookie, setAccessCookie, clearRefreshCookie, clearAccessCookie, getAccessCookie } from '../auth/cookies.js';
import { schoolAuthMiddleware, adminAuthMiddleware } from '../auth/middleware.js';
import { verifyAccessToken } from '../auth/jwt.js';
import { dispatchEvent } from '../notifications/dispatch.js';
import { logoutSchool } from '../auth/services.js';
import type { School } from '@my-modern-app/shared-types';
import type { User } from '@my-modern-app/shared-types';

type Vars = { school: School; user: User };
const schoolRoutes = new Hono<{ Variables: Vars }>();

function validId(idStr: string): number | null {
  const n = Number(idStr);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function secureRandomString(chars: string, length: number): string {
  const bytes = randomBytes(length);
  const charLen = chars.length;
  return Array.from({ length }, (_, i) => chars[bytes[i] % charLen]).join('');
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
const adminPasswordSchema = z.object({ admin_password: z.string().min(1, 'كلمة مرور الإدمن مطلوبة') });

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
  const clientIp = c.req.header('X-Forwarded-For') || c.req.header('x-real-ip') || c.req.header('x-client-ip') || 'unknown';
  const userAgent = c.req.header('user-agent') || '';
  const result = await registerSchool(body.name, body.email, body.password, body.max_students, body.max_teachers, clientIp, userAgent, (body as any).fingerprint);
  if (!result.success) return c.json({ success: false, message: result.message }, 409);
  return c.json({ success: true, school: result.school, code: result.code }, 201);
});

schoolRoutes.post('/login', zValidator('json', schoolLoginSchema), async (c) => {
  const body = c.req.valid('json');
  const clientIp = c.req.header('X-Forwarded-For') || c.req.header('x-real-ip') || c.req.header('x-client-ip') || 'unknown';
  const userAgent = c.req.header('user-agent') || '';
  const result = await loginSchool(body.email, body.password, clientIp, userAgent, (body as any).fingerprint);
  if (!result.success) return c.json({ success: false, message: result.message }, 401);
  if (result.token) setAccessCookie(c, result.token);
  if (result.refreshToken) setRefreshCookie(c, result.refreshToken);
  return c.json({ success: true, school: result.school, accessToken: result.token, refreshToken: result.refreshToken });
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

schoolRoutes.post('/classes', schoolAuth, zValidator('json', z.object({
  name: z.string().min(2).max(100),
  teacher_id: z.number().int().positive().optional(),
  description: z.string().max(500).optional(),
})), async (c) => {
  const school = c.get('school') as School;
  const { name, teacher_id, description } = c.req.valid('json');
  try {
    if (teacher_id) {
      const teacher = await db.get<{ id: number; school_id: number }>(
        'SELECT id, school_id FROM users WHERE id = ? AND role = \'teacher\' AND school_id = ?',
        teacher_id, school.id,
      );
      if (!teacher) return c.json({ success: false, message: 'Teacher not found in this school' }, 404);
    }
    const classCode = secureRandomString('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
    const classId = `cls_${Date.now()}`;
    const isActive = teacher_id ? 1 : 0;
    await db.run(
      'INSERT INTO classes (id, name, code, teacher_id, school_id, description, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      classId, name, classCode, teacher_id ?? null, school.id, description ?? null, isActive,
    );
    // تحديث حي: أبلغ المعلم المعيّن فوراً عبر SSE
    if (teacher_id) {
      broadcastEvent({ type: 'class_created', payload: { class_id: classId, name }, targetUserId: teacher_id });
    }
    return c.json({ success: true, id: classId, code: classCode, teacher_id: teacher_id ?? null, is_active: isActive }, 201);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('school createClass error:', err);
    return c.json({ success: false, message: 'Failed to create class' }, 500);
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
schoolRoutes.post('/users', schoolAuth, zValidator('json', z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: passwordComplexity,
  role: z.enum(['student', 'teacher']),
})), async (c) => {
  const school = c.get('school') as School;
  const { name, email, password, role } = c.req.valid('json');
  try {
    const existing = await db.get<{ id: number }>('SELECT id FROM users WHERE email = ?', email);
    if (existing) return c.json({ success: false, message: 'Email already registered' }, 409);
    const passwordHash = await hashPassword(password);
    await db.run(
      'INSERT INTO users (name, email, password_hash, role, school_id, email_verified_at) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))',
      name, email, passwordHash, role, school.id,
    );
    return c.json({ success: true }, 201);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('school createUser error:', err);
    return c.json({ success: false, message: 'Failed to create user' }, 500);
  }
});

schoolRoutes.delete('/classes/:classId', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const classId = c.req.param('classId');
  try {
    const cls = await db.get<{ id: string }>(
      'SELECT id FROM classes WHERE id = ? AND school_id = ?',
      classId, school.id,
    );
    if (!cls) return c.json({ success: false, message: 'Class not found' }, 404);
    await db.run('DELETE FROM class_students WHERE class_id = ?', classId);
    await db.run('DELETE FROM classes WHERE id = ?', classId);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('school deleteClass error:', err);
    return c.json({ success: false, message: 'Failed to delete class' }, 500);
  }
});

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
    const body = await c.req.json().catch(() => ({})) as { days?: number; reason?: string };
    const days = Number(body?.days) || 0;
    const reason = typeof body?.reason === 'string' ? body.reason.trim() : 'بدون سبب';
    const result = await blockSchoolUser(school.id, userId, reason, days);
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
    if (!result.success) return c.json(result, 400);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('school unblockUser error:', err);
    return c.json({ success: false, message: 'Failed to unblock user' }, 500);
  }
});

schoolRoutes.post('/alerts', schoolAuth, zValidator('json', z.object({
  title: z.string().max(200).optional(),
  message: z.string().min(1).max(2000),
  targetRole: z.enum(['teacher', 'student', 'all']).optional().default('teacher'),
  classId: z.string().min(1).optional(),
})), async (c) => {
  const school = c.get('school') as School;
  const { title, message, targetRole, classId } = c.req.valid('json');
  const payload: any = { schoolId: school.id, targetRole, message: title ? `${title}: ${message}` : message };
  if (classId) {
    const cls = await db.get<{ school_id: number | null }>('SELECT school_id FROM classes WHERE id = ?', classId);
    if (!cls || cls.school_id !== school.id) return c.json({ success: false, message: 'الفصل غير موجود' }, 404);
    payload.classId = classId;
    delete payload.schoolId;
  }
  await dispatchEvent({
    type: 'alert_sent',
    actorId: school.id,
    actorName: school.name,
    actorRole: 'school',
    payload,
  });
  return c.json({ success: true });
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

// ─── Admin: Create School ───
const adminCreateSchoolSchema = z.object({
  name: z.string().min(2).max(200),
  code: z.string().min(2).max(50).optional(),
  max_students: z.number().int().min(1).max(100000).default(100),
  max_teachers: z.number().int().min(1).max(1000).default(10),
});

schoolRoutes.post('/admin/create', adminAuth, zValidator('json', adminCreateSchoolSchema), async (c) => {
  const { name, code, max_students, max_teachers } = c.req.valid('json');
  try {
    const generatedCode = code || secureRandomString('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);
    const email = `${generatedCode.toLowerCase()}@school.admin`;
    const existing = await db.get<{ id: number }>('SELECT id FROM schools WHERE email = ? OR code = ?', email, generatedCode);
    if (existing) return c.json({ success: false, message: 'School with this code already exists' }, 409);
    const randomPwd = secureRandomString('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 16);
    const passwordHash = await hashPassword(randomPwd);
    const result = await db.run(
      'INSERT INTO schools (name, email, password_hash, code, max_students, max_teachers) VALUES (?, ?, ?, ?, ?, ?)',
      name, email, passwordHash, generatedCode, max_students, max_teachers,
    );
    return c.json({ success: true, school: { id: Number(result.lastID), name, email, code: generatedCode, max_students, max_teachers, is_active: true }, code: generatedCode }, 201);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin createSchool error:', err);
    return c.json({ success: false, message: 'Failed to create school' }, 500);
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

schoolRoutes.patch('/admin/:id', adminAuth, zValidator('json', updateSchoolAdminSchema.extend({ admin_password: z.string().min(1, 'كلمة مرور الإدمن مطلوبة') })), async (c) => {
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'Invalid school ID' }, 400);
  const { admin_password, ...body } = c.req.valid('json');
  const admin = c.get('user');
  const pwCheck = await verifyAdminPassword(admin, admin_password);
  if (pwCheck) return c.json(pwCheck, 401);
  const updates: { name?: string; email?: string; max_students?: number; max_teachers?: number } = {};
  if (body.name) updates.name = body.name.trim().slice(0, 200);
  if (body.email) updates.email = body.email.trim().slice(0, 255);
  if (body.max_students) updates.max_students = Math.floor(body.max_students);
  if (body.max_teachers) updates.max_teachers = Math.floor(body.max_teachers);
  const result = await updateSchool(id, updates);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

schoolRoutes.post('/admin/:id/delete', adminAuth, zValidator('json', adminPasswordSchema), async (c) => {
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'Invalid school ID' }, 400);
  const { admin_password } = c.req.valid('json');
  const admin = c.get('user');
  const pwCheck = await verifyAdminPassword(admin, admin_password);
  if (pwCheck) return c.json(pwCheck, 401);
  try {
    const result = await deleteSchool(id);
    if (!result.success) return c.json({ success: false, message: result.message }, 404);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin deleteSchool error:', err);
    return c.json({ success: false, message: 'Failed to delete school' }, 500);
  }
});

schoolRoutes.patch('/admin/:id/toggle', adminAuth, zValidator('json', adminPasswordSchema), async (c) => {
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'Invalid school ID' }, 400);
  const { admin_password } = c.req.valid('json');
  const admin = c.get('user');
  const pwCheck = await verifyAdminPassword(admin, admin_password);
  if (pwCheck) return c.json(pwCheck, 401);
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
