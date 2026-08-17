import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { loginSchema, registerSchema, passwordUpdateSchema, profileUpdateSchema, deleteAccountSchema, nameRequestSchema, verifyEmailSchema } from './schemas.js';
import { z } from 'zod';
import { login, register, refreshAccessToken, logout, logoutSchool, updatePassword, updateProfileName, deleteAccount, createNameRequest, verifyEmailCode, resendVerificationCode, requestPasswordReset, resetPassword, getUserById } from './services.js';
import { createEmailChangeRequest } from '../school/services.js';
import * as activitySvc from '../activity/service.js';
import * as sessionSvc from '../sessions/service.js';
import { setRefreshCookie, getRefreshCookie, clearRefreshCookie, setAccessCookie, getAccessCookie, clearAccessCookie } from './cookies.js';
import { verifyAccessToken } from './jwt.js';
import { authMiddleware } from './middleware.js';
import { loginRateLimit, passwordResetRateLimit, verifyEmailRateLimit } from '../../shared/middleware/rate-limit.js';
import { db } from '../../db/index.js';
import { getSystemSetting, getSystemSettingBool } from '../../shared/system-settings.js';
import type { User } from '@my-modern-app/shared-types';

const authRoutes = new Hono<{ Variables: { user: User } }>();

// Public system status (no auth required)
authRoutes.get('/system-status', async (c) => {
  const rows = await db.all(`SELECT key, value FROM system_settings WHERE key IN ('stop_registration', 'maintenance_mode', 'freeze_all_classes', 'registration_enabled', 'chat_enabled', 'experiment_physics_enabled', 'experiment_chemistry_enabled', 'experiment_biology_enabled', 'experiment_math_enabled')`);
  const settings: Record<string, boolean> = {};
  for (const r of rows) settings[r.key] = r.value === 'true';
  return c.json({
    success: true,
    stop_registration: settings.stop_registration || false,
    maintenance_mode: settings.maintenance_mode || false,
    freeze_all_classes: settings.freeze_all_classes || false,
    registration_enabled: settings.registration_enabled !== false,
    chat_enabled: settings.chat_enabled !== false,
    experiment_physics_enabled: settings.experiment_physics_enabled !== false,
    experiment_chemistry_enabled: settings.experiment_chemistry_enabled !== false,
    experiment_biology_enabled: settings.experiment_biology_enabled !== false,
    experiment_math_enabled: settings.experiment_math_enabled !== false,
  });
});

authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  if (await getSystemSettingBool('stop_registration')) {
    return c.json({ success: false, message: 'تم إيقاف التسجيل مؤقتاً بواسطة الإدارة. يرجى المحاولة لاحقاً.' }, 403);
  }
  const regEnabled = await getSystemSetting('registration_enabled');
  if (regEnabled === 'false') {
    return c.json({ success: false, message: 'تم إيقاف التسجيل مؤقتاً بواسطة الإدارة. يرجى المحاولة لاحقاً.' }, 403);
  }
  const body = c.req.valid('json');
  const creds = { ...body, school_code: body.school_code || undefined };
  const result = await register(creds);
  if (!result.success) {
    const msg = result.message || 'فشل التسجيل';
    if (msg === 'البريد الإلكتروني مسجل بالفعل') return c.json({ success: false, message: msg }, 409);
    if (msg.startsWith('المدرسة') || msg.startsWith('رمز المدرسة')) return c.json({ success: false, message: msg }, 403);
    if (msg === 'فشل التسجيل') return c.json({ success: false, message: msg }, 500);
    return c.json({ success: false, message: msg }, 400);
  }
  return c.json({ success: true, user: result.user }, 201);
});

authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json');
  const clientIp = c.req.header('X-Forwarded-For') || c.req.header('x-real-ip') || c.req.header('x-client-ip') || 'unknown';
  const result = await login(body.email, body.password, clientIp);
  if (!result.success) {
    return c.json({ success: false, message: result.message }, 401);
  }
  if (result.token) {
    setAccessCookie(c, result.token);
  }
  if (result.refreshToken) {
    setRefreshCookie(c, result.refreshToken);
  }
  // Log activity + session for regular users
  if (result.user) {
    await sessionSvc.logLogin(result.user.id, c.req.header('X-Forwarded-For') || c.req.header('x-real-ip') || 'unknown', c.req.header('user-agent'));
    await activitySvc.logActivity(result.user.id, result.user.name, result.user.role, 'login');
  }
  // Return school info if it's a school login
  if (result.school) {
    return c.json({ success: true, school: result.school, accessToken: result.token, refreshToken: result.refreshToken });
  }
  return c.json({ success: true, user: result.user, accessToken: result.token, refreshToken: result.refreshToken });
});

authRoutes.post('/refresh', async (c) => {
  const refreshToken = getRefreshCookie(c) || (c.req.header('Authorization')?.startsWith('Bearer ') ? c.req.header('Authorization')!.slice(7) : undefined);
  if (!refreshToken) {
    return c.json({ success: false, message: 'لا يوجد رمز تحديث' }, 401);
  }
  const result = await refreshAccessToken(refreshToken);
  if (!result.success) {
    clearRefreshCookie(c);
    return c.json({ success: false, message: result.message }, 401);
  }
  if (result.token) {
    setAccessCookie(c, result.token);
  }
  if (result.refreshToken) {
    setRefreshCookie(c, result.refreshToken);
  }
  return c.json({ success: true, accessToken: result.token, refreshToken: result.refreshToken });
});

authRoutes.post('/logout', async (c) => {
  const accessToken = getAccessCookie(c) || (c.req.header('Authorization')?.startsWith('Bearer ') ? c.req.header('Authorization')!.slice(7) : undefined);
  if (accessToken) {
    try {
      const payload = await verifyAccessToken(accessToken);
      if (payload.role === 'school') {
        await logoutSchool(Number(payload.sub));
      } else {
        const userId = Number(payload.sub);
        const u = await getUserById(userId);
        await logout(userId);
        await sessionSvc.logLogout(userId);
        await activitySvc.logActivity(userId, u?.name || payload.email, u?.role || payload.role, 'logout');
      }
    } catch {
      // ignore invalid token on logout
    }
  }
  clearAccessCookie(c);
  clearRefreshCookie(c);
  return c.json({ success: true });
});

authRoutes.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  return c.json({ success: true, user });
});

authRoutes.post('/verify-email', verifyEmailRateLimit, zValidator('json', verifyEmailSchema), async (c) => {
  const body = c.req.valid('json');
  const result = await verifyEmailCode(body.email, body.code);
  if (!result.success) {
    return c.json({ success: false, message: result.message || 'رمز غير صالح' }, 400);
  }
  if (result.token) {
    setAccessCookie(c, result.token);
  }
  if (result.refreshToken) {
    setRefreshCookie(c, result.refreshToken);
  }
  return c.json({ success: true, user: result.user });
});

authRoutes.patch('/password', authMiddleware, zValidator('json', passwordUpdateSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  const userId = body.user_id;
  if (user.id !== userId && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const isAdminChangingOther = user.role === 'admin' && user.id !== userId;
  const currentPassword = isAdminChangingOther ? undefined : body.current_password;
  if (!isAdminChangingOther && !currentPassword) {
    return c.json({ success: false, message: 'كلمة المرور الحالية مطلوبة' }, 400);
  }
  const result = await updatePassword(userId, body.new_password, currentPassword);
  if (!result.success) {
    const status = result.message === 'المستخدم غير موجود' ? 404 : 400;
    return c.json({ success: false, message: result.message }, status);
  }
  if (isAdminChangingOther) {
    const target = await db.get<{ name: string; email: string }>('SELECT name, email FROM users WHERE id = ?', userId);
    await activitySvc.logActivity(
      user.id, user.name, user.role,
      'admin_password_change', 'user', String(userId),
      `Admin changed password for ${target?.name || 'unknown'} (${target?.email || 'unknown'})`,
    );
  }
  return c.json({ success: true });
});

authRoutes.patch('/profile', authMiddleware, zValidator('json', profileUpdateSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'فقط المعلمون يمكنهم تحديث الاسم مباشرة' }, 403);
  }
  const result = await updateProfileName(user.id, body.name);
  if (!result.success) {
    return c.json({ success: false, message: result.message }, 400);
  }
  if (result.user) {
    await activitySvc.logActivity(result.user.id, result.user.name, result.user.role, 'update_profile');
  }
  return c.json({ success: true, user: result.user });
});

authRoutes.post('/name-request', authMiddleware, zValidator('json', nameRequestSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  const result = await createNameRequest(user.id, body.requested_name);
  if (!result.success) {
    return c.json({ success: false, message: result.message }, 400);
  }
  return c.json({ success: true });
});

authRoutes.delete('/account', authMiddleware, zValidator('json', deleteAccountSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  const result = await deleteAccount(user.id, body.password);
  if (!result.success) {
    const status = result.message === 'كلمة المرور غير صحيحة' ? 403 : 400;
    return c.json({ success: false, message: result.message }, status);
  }
  await activitySvc.logActivity(user.id, user.name, user.role, 'delete_account');
  clearAccessCookie(c);
  clearRefreshCookie(c);
  return c.json({ success: true });
});

authRoutes.post('/email-change-request', authMiddleware, zValidator('json', z.object({ requested_email: z.string().email() })), async (c) => {
  const user = c.get('user');
  const { requested_email } = c.req.valid('json');
  const result = await createEmailChangeRequest('user', user.id, user.email, requested_email);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

authRoutes.post('/resend-verification', verifyEmailRateLimit, zValidator('json', z.object({ email: z.string().email() })), async (c) => {
  const { email } = c.req.valid('json');
  const result = await resendVerificationCode(email);
  if (!result.success) {
    return c.json({ success: false, message: result.message }, 400);
  }
  return c.json({ success: true });
});

// ─── Forgot Password ───
authRoutes.post('/forgot-password', passwordResetRateLimit, zValidator('json', z.object({ email: z.string().email() })), async (c) => {
  const { email } = c.req.valid('json');
  const result = await requestPasswordReset(email);
  return c.json({ success: true });
});

authRoutes.post('/reset-password', passwordResetRateLimit, zValidator('json', z.object({
  email: z.string().email(),
  code: z.string().min(4).max(16),
  new_password: z.string().min(8).max(128),
})), async (c) => {
  const { email, code, new_password } = c.req.valid('json');
  const result = await resetPassword(email, code, new_password);
  if (!result.success) {
    return c.json({ success: false, message: result.message }, 400);
  }
  return c.json({ success: true });
});

export { authRoutes };
