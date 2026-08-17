import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import * as svc from './services.js';
import * as dmSvc from './direct-message-service.js';
import { pushToUser, pushToSchool, getConnectedUserIds, getConnectedSchoolIds } from '../notifications/sse.js';
import { createAnnouncement } from '../announcements/services.js';
import { db } from '../../db/index.js';
import { hashPassword, comparePassword } from '../auth/crypto.js';
import { passwordComplexity } from '../auth/schemas.js';
import { adminMessageRoutes } from './handlers-messages.js';
import type { User } from '@my-modern-app/shared-types';

type Variables = { user: User };

const app = new Hono<{ Variables: Variables }>();

app.use(authMiddleware);
app.use(async (c, next) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح — يقتصر على الأدمن' }, 403);
  }
  await next();
});

// GET /settings — get all system settings
app.get('/settings', async (c) => {
  try {
    const settings = await svc.getSystemSettings();
    return c.json({ success: true, settings });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin getSettings error:', err);
    return c.json({ success: false, message: 'Failed to load settings' }, 500);
  }
});

// PATCH /settings — update a system setting
app.patch('/settings', zValidator('json', z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(5000),
})), async (c) => {
  const user = c.get('user') as User;
  const { key, value } = c.req.valid('json');
  try {
    const result = await svc.updateSystemSetting(key, value, user.id);
    return c.json(result);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin updateSetting error:', err);
    return c.json({ success: false, message: 'Failed to update setting' }, 500);
  }
});

// ─── System Alerts ───
app.get('/alerts', async (c) => {
  try {
    const list = await svc.getSystemAlerts();
    return c.json({ success: true, alerts: list });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin getAlerts error:', err);
    return c.json({ success: false, message: 'Failed to load alerts' }, 500);
  }
});

app.patch('/alerts/:id/resolve', async (c) => {
  const user = c.get('user') as User;
  const id = Number(c.req.param('id'));
  if (!Number.isFinite(id) || id <= 0) return c.json({ success: false, message: 'Invalid ID' }, 400);
  try {
    const result = await svc.resolveSystemAlert(id, user.id);
    if (!result.success) return c.json(result, 400);
    return c.json(result);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin resolveAlert error:', err);
    return c.json({ success: false, message: 'Failed to resolve alert' }, 500);
  }
});

// ─── Emergency Controls ───
async function getEmergencyPasswordHash(): Promise<string> {
  try {
    const row = await db.get<{ value: string }>('SELECT value FROM system_settings WHERE key = ?', 'emergency_password');
    if (row?.value) return row.value;
  } catch { /* ignore */ }
  return '';
}

async function verifyEmergencyPassword(c: any): Promise<boolean> {
  const hash = await getEmergencyPasswordHash();
  if (!hash) return false;
  const body = await c.req.json().catch(() => ({}));
  const provided = String(body.emergency_password || '');
  if (!provided) return false;
  try {
    return await comparePassword(provided, hash);
  } catch {
    return false;
  }
}

async function broadcastEmergency(user: User, title: string, content: string) {
  await createAnnouncement({
    author_type: 'admin',
    author_id: user.id,
    author_name: user.name,
    scope: 'global',
    title,
    content,
    is_pinned: true,
  });
  const shortContent = content.slice(0, 150);
  const notifTitle = `🚨 ${title}`;

  // Bulk insert notifications for all active users in one query
  await db.run(
    `INSERT INTO notifications (user_id, type, title, message)
     SELECT id, 'emergency', ?, ? FROM users WHERE blocked_at IS NULL`,
    notifTitle, shortContent,
  );

  // Bulk insert school notifications in one query
  await db.run(
    `INSERT INTO school_notifications (school_id, type, title, message)
     SELECT id, 'emergency', ?, ? FROM schools WHERE blocked_at IS NULL`,
    notifTitle, shortContent,
  );

  // Push SSE only to connected users and schools
  const connectedUsers = getConnectedUserIds();
  const CHUNK = 50;
  for (let i = 0; i < connectedUsers.length; i += CHUNK) {
    const chunk = connectedUsers.slice(i, i + CHUNK);
    await Promise.all(chunk.map(id =>
      pushToUser(id, 'notification', { type: 'emergency', title: notifTitle, message: shortContent })
    ));
  }
  const connectedSchools = getConnectedSchoolIds();
  for (let i = 0; i < connectedSchools.length; i += CHUNK) {
    const chunk = connectedSchools.slice(i, i + CHUNK);
    await Promise.all(chunk.map(id =>
      pushToSchool(id, 'notification', { type: 'emergency', title: notifTitle, message: shortContent })
    ));
  }
}

app.post('/emergency/stop-registration', async (c) => {
  if (!await verifyEmergencyPassword(c)) return c.json({ success: false, message: 'كلمة مرور الطوارئ غير صحيحة' }, 403);
  const user = c.get('user') as User;
  await svc.updateSystemSetting('stop_registration', 'true', user.id);
  await broadcastEmergency(user, 'إيقاف التسجيل', 'تم إيقاف تسجيل المستخدمين الجدد مؤقتاً بواسطة الإدارة. سيتم استئناف التسجيل قريباً.');
  return c.json({ success: true, message: 'تم إيقاف التسجيل وإرسال إشعار لجميع المستخدمين' });
});

app.post('/emergency/resume-registration', async (c) => {
  if (!await verifyEmergencyPassword(c)) return c.json({ success: false, message: 'كلمة مرور الطوارئ غير صحيحة' }, 403);
  const user = c.get('user') as User;
  await svc.updateSystemSetting('stop_registration', 'false', user.id);
  await broadcastEmergency(user, 'استئناف التسجيل', 'تم استئناف تسجيل المستخدمين الجدد. يمكنكم التسجيل الآن.');
  return c.json({ success: true, message: 'تم استئناف التسجيل وإرسال إشعار لجميع المستخدمين' });
});

app.post('/emergency/maintenance-on', async (c) => {
  if (!await verifyEmergencyPassword(c)) return c.json({ success: false, message: 'كلمة مرور الطوارئ غير صحيحة' }, 403);
  const user = c.get('user') as User;
  await svc.updateSystemSetting('maintenance_mode', 'true', user.id);
  await broadcastEmergency(user, 'وضع الصيانة', 'النظام في وضع الصيانة حالياً. قد تكون بعض الخدمات غير متاحة مؤقتاً. نعتذر عن الإزعاج.');
  return c.json({ success: true, message: 'تم تفعيل وضع الصيانة وإرسال إشعار لجميع المستخدمين' });
});

app.post('/emergency/maintenance-off', async (c) => {
  if (!await verifyEmergencyPassword(c)) return c.json({ success: false, message: 'كلمة مرور الطوارئ غير صحيحة' }, 403);
  const user = c.get('user') as User;
  await svc.updateSystemSetting('maintenance_mode', 'false', user.id);
  await broadcastEmergency(user, 'انتهاء الصيانة', 'تم إيقاف وضع الصيانة. جميع الخدمات متاحة الآن بشكل طبيعي.');
  return c.json({ success: true, message: 'تم إيقاف وضع الصيانة وإرسال إشعار لجميع المستخدمين' });
});

app.post('/emergency/freeze-all', async (c) => {
  if (!await verifyEmergencyPassword(c)) return c.json({ success: false, message: 'كلمة مرور الطوارئ غير صحيحة' }, 403);
  const user = c.get('user') as User;
  await svc.updateSystemSetting('freeze_all_classes', 'true', user.id);
  await svc.freezeAllClasses(user.id);
  await broadcastEmergency(user, 'تجميد الفصول', 'تم تجميد جميع الفصول مؤقتاً بواسطة الإدارة. لا يمكن إجراء تعديلات حتى إلغاء التجميد.');
  return c.json({ success: true, message: 'تم تجميد جميع الفصول وإرسال إشعار لجميع المستخدمين' });
});

app.post('/emergency/unfreeze-all', async (c) => {
  if (!await verifyEmergencyPassword(c)) return c.json({ success: false, message: 'كلمة مرور الطوارئ غير صحيحة' }, 403);
  const user = c.get('user') as User;
  await svc.updateSystemSetting('freeze_all_classes', 'false', user.id);
  await svc.unfreezeAllClasses();
  await broadcastEmergency(user, 'إلغاء تجميد الفصول', 'تم إلغاء تجميد جميع الفصول. يمكنكم متابعة العمل بشكل طبيعي.');
  return c.json({ success: true, message: 'تم إلغاء التجميد وإرسال إشعار لجميع المستخدمين' });
});

app.post('/emergency/change-password', async (c) => {
  const user = c.get('user') as User;
  const body = await c.req.json().catch(() => ({}));
  const currentHash = await getEmergencyPasswordHash();
  const provided = String(body.current_password || '');
  if (!currentHash || !provided) {
    return c.json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' }, 403);
  }
  try {
    if (!await comparePassword(provided, currentHash)) {
      return c.json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' }, 403);
    }
  } catch {
    return c.json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' }, 403);
  }
  const newPwd = body.new_password;
  if (!newPwd || typeof newPwd !== 'string') {
    return c.json({ success: false, message: 'كلمة المرور الجديدة مطلوبة' }, 400);
  }
  try {
    passwordComplexity.parse(newPwd);
  } catch {
    return c.json({ success: false, message: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير وحرف صغير ورقم' }, 400);
  }
  const newHash = await hashPassword(newPwd);
  await svc.updateSystemSetting('emergency_password', newHash, user.id);
  return c.json({ success: true, message: 'تم تغيير كلمة مرور الطوارئ بنجاح' });
});

// ─── Admin Detailed Reports ───
app.get('/detailed-stats', async (c) => {
  const validPeriods = ['today', 'week', 'month', 'year', 'all'];
  const period = (c.req.query('period') || 'today') as 'today' | 'week' | 'month' | 'year' | 'all';
  if (!validPeriods.includes(period)) {
    return c.json({ success: false, message: 'Invalid period' }, 400);
  }
  try {
    const stats = await svc.getDetailedSystemStats(period);
    return c.json({ success: true, stats });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin detailedStats error:', err);
    return c.json({ success: false, message: 'Failed to load detailed stats' }, 500);
  }
});

app.get('/academic-tracking', async (c) => {
  try {
    const tracking = await svc.getAcademicTracking();
    return c.json({ success: true, tracking });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin academicTracking error:', err);
    return c.json({ success: false, message: 'Failed to load academic tracking' }, 500);
  }
});

app.get('/detailed-reports', async (c) => {
  const date = c.req.query('date') || undefined;
  try {
    const report = await svc.getAdminDetailedReports(date);
    return c.json({ success: true, report });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin detailedReports error:', err);
    return c.json({ success: false, message: 'Failed to load detailed reports' }, 500);
  }
});

// ─── Direct Messages ───
app.post('/messages/send', zValidator('json', z.object({
  receiverId: z.number().int().positive(),
  content: z.string().min(1).max(1000),
})), async (c) => {
  const admin = c.get('user') as User;
  const { receiverId, content } = c.req.valid('json');
  const result = await dmSvc.sendDirectMessage(admin.id, admin.name, receiverId, content);
  if (!result.success) return c.json(result, 400);
  return c.json(result, 201);
});

// ─── Merge sub-routers ───
app.route('/', adminMessageRoutes);

export { app as adminAdvancedRoutes };
