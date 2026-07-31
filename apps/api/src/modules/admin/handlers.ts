import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import { hashPassword } from '../../modules/auth/crypto.js';
import { setAccessCookie } from '../../modules/auth/cookies.js';
import { impersonateUser, updatePassword } from '../../modules/auth/services.js';
import * as svc from './services.js';
import * as activitySvc from '../activity/service.js';
import * as feedbackSvc from './feedback-service.js';
import * as warnSvc from './warning-service.js';
import * as detailSvc from './user-detail-service.js';
import * as sessionSvc from '../sessions/service.js';
import * as healthSvc from './system-health-service.js';
import * as exportSvc from './export-service.js';
import * as auditSvc from './audit-service.js';
import { createAnnouncement } from '../announcements/services.js';
import { createNotification, createSchoolNotification } from '../notifications/services.js';
import { db } from '../../db/index.js';
import type { User } from '@my-modern-app/shared-types';

const updateRoleSchema = z.object({
  role: z.enum(['student', 'teacher', 'admin']),
});

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(['student', 'teacher', 'admin']),
});

const adminResetPasswordSchema = z.object({
  password: z.string().min(8).max(128),
});

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
});

const createClassSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20).optional(),
  teacher_id: z.number().int().positive(),
});

type Variables = { user: User };

const app = new Hono<{ Variables: Variables }>();

// Admin-only middleware
app.use(authMiddleware);
app.use(async (c, next) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح — يقتصر على الأدمن' }, 403);
  }
  await next();
});

// GET /users
app.get('/users', async (c) => {
  const page = Math.max(1, Number(c.req.query('page') || '1'));
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') || '50')));
  const result = await svc.getAllUsers(page, limit);
  return c.json({ success: true, ...result });
});

// GET /stats
app.get('/stats', async (c) => {
  const stats = await svc.getSystemStats();
  return c.json({ success: true, stats });
});

// GET /classes
app.get('/classes', async (c) => {
  const list = await svc.getAllClassesWithTeachers();
  return c.json({ success: true, classes: list });
});

// GET /reports
app.get('/reports', async (c) => {
  const page = Math.max(1, Number(c.req.query('page') || '1'));
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') || '50')));
  const result = await svc.getAllReportsWithDetails(page, limit);
  return c.json({ success: true, ...result });
});

// DELETE /users/:id
app.delete('/users/:id', async (c) => {
  const id = Number(c.req.param('id'));
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

// PATCH /users/:id/role
app.patch('/users/:id/role', zValidator('json', updateRoleSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const { role } = c.req.valid('json');
  const result = await svc.updateUserRole(id, role);
  return c.json(result);
});

// POST /users
app.post('/users', zValidator('json', createUserSchema), async (c) => {
  const { name, email, password, role } = c.req.valid('json');
  const passwordHash = await hashPassword(password);
  const result = await svc.createUser(name, email, passwordHash, role);
  return c.json(result, 201);
});

// DELETE /classes/:id
app.delete('/classes/:id', async (c) => {
  const id = c.req.param('id');
  const result = await svc.deleteClass(id);
  return c.json(result);
});

// GET /activity
app.get('/activity', async (c) => {
  const list = await activitySvc.getRecentActivity();
  return c.json({ success: true, activities: list });
});

// GET /activity/stats
app.get('/activity/stats', async (c) => {
  const stats = await activitySvc.getActivityStats();
  return c.json({ success: true, stats });
});

// GET /insights
app.get('/insights', async (c) => {
  const insights = await activitySvc.getSmartInsights();
  return c.json({ success: true, insights });
});

// GET /feedback
app.get('/feedback', async (c) => {
  const list = await feedbackSvc.getAllFeedback();
  const stats = await feedbackSvc.getFeedbackStats();
  return c.json({ success: true, feedback: list, stats });
});

// PATCH /feedback/:id/status
app.patch('/feedback/:id/status', zValidator('json', z.object({ status: z.enum(['open', 'resolved', 'dismissed']) })), async (c) => {
  const id = Number(c.req.param('id'));
  const { status } = c.req.valid('json');
  const result = await feedbackSvc.updateFeedbackStatus(id, status);
  return c.json(result);
});

// GET /users/:id/full
app.get('/users/:id/full', async (c) => {
  const id = Number(c.req.param('id'));
  const profile = await detailSvc.getUserFullProfile(id);
  if (!profile) return c.json({ success: false, message: 'User not found' }, 404);
  return c.json({ success: true, ...profile });
});

// POST /users/:id/ban
app.post('/users/:id/ban', zValidator('json', z.object({ reason: z.string().optional() })), async (c) => {
  const id = Number(c.req.param('id'));
  const { reason } = c.req.valid('json');
  const result = await detailSvc.banUser(id, reason || '');
  return c.json(result);
});

// POST /users/:id/unban
app.post('/users/:id/unban', async (c) => {
  const id = Number(c.req.param('id'));
  const result = await detailSvc.unbanUser(id);
  return c.json(result);
});

// POST /warnings
app.post('/warnings', zValidator('json', z.object({
  userId: z.number().int().positive(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  severity: z.enum(['low', 'normal', 'high', 'critical']).optional().default('normal'),
})), async (c) => {
  const admin = c.get('user');
  const { userId, title, message, severity } = c.req.valid('json');
  const result = await warnSvc.createWarning(admin.id, userId, title, message, severity);
  return c.json(result, 201);
});

// GET /warnings
app.get('/warnings', async (c) => {
  const list = await warnSvc.getAllWarnings();
  return c.json({ success: true, warnings: list });
});

// GET /warnings/:userId
app.get('/warnings/:userId', async (c) => {
  const userId = Number(c.req.param('userId'));
  const list = await warnSvc.getWarningsForUser(userId);
  return c.json({ success: true, warnings: list });
});

// POST /notes
app.post('/notes', zValidator('json', z.object({
  userId: z.number().int().positive(),
  note: z.string().min(1).max(2000),
})), async (c) => {
  const admin = c.get('user');
  const { userId, note } = c.req.valid('json');
  const result = await detailSvc.addNote(admin.id, userId, note);
  return c.json(result, 201);
});

// GET /notes/:userId
app.get('/notes/:userId', async (c) => {
  const userId = Number(c.req.param('userId'));
  const list = await detailSvc.getUserFullProfile(userId);
  return c.json({ success: true, notes: list?.notes || [] });
});

// GET /sessions
app.get('/sessions', async (c) => {
  const list = await sessionSvc.getActiveSessions();
  return c.json({ success: true, sessions: list });
});

// GET /health
app.get('/health', async (c) => {
  const health = await healthSvc.getSystemHealth();
  return c.json({ success: true, health });
});

// GET /audit
app.get('/audit', async (c) => {
  const list = await auditSvc.getAuditLog();
  return c.json({ success: true, audit: list });
});

// GET /export/:type
app.get('/export/:type', async (c) => {
  const type = c.req.param('type');
  let csv = '';
  let filename = 'export.csv';
  switch (type) {
    case 'users': csv = await exportSvc.exportUsers(); filename = 'users.csv'; break;
    case 'reports': csv = await exportSvc.exportReports(); filename = 'reports.csv'; break;
    case 'classes': csv = await exportSvc.exportClasses(); filename = 'classes.csv'; break;
    case 'feedback': csv = await exportSvc.exportFeedback(); filename = 'feedback.csv'; break;
    case 'activity': csv = await exportSvc.exportActivity(); filename = 'activity.csv'; break;
    default: return c.json({ success: false, message: 'Invalid export type' }, 400);
  }
  c.header('Content-Type', 'text/csv; charset=utf-8');
  c.header('Content-Disposition', `attachment; filename="${filename}"`);
  return c.body(csv);
});

// POST /impersonate/:id
app.post('/impersonate/:id', async (c) => {
  const admin = c.get('user');
  const targetId = Number(c.req.param('id'));
  const result = await impersonateUser(targetId);
  if (!result) return c.json({ success: false, message: 'User not found' }, 404);
  setAccessCookie(c, result.token);
  await activitySvc.logActivity(admin.id, admin.name, admin.role, 'impersonate', 'user', String(targetId), `Admin impersonated ${result.user.name} (${result.user.email})`);
  return c.json({ success: true, user: result.user, adminId: admin.id, adminName: admin.name });
});

// POST /impersonate/return — return from impersonation
app.post('/impersonate/return', zValidator('json', z.object({ admin_id: z.number().int().positive() })), async (c) => {
  const { admin_id } = c.req.valid('json');
  const result = await impersonateUser(admin_id);
  if (!result) return c.json({ success: false, message: 'Admin not found' }, 404);
  setAccessCookie(c, result.token);
  return c.json({ success: true, user: result.user });
});

// POST /users/:id/reset-password
app.post('/users/:id/reset-password', zValidator('json', adminResetPasswordSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const { password } = c.req.valid('json');
  const ok = await updatePassword(id, password);
  if (!ok) return c.json({ success: false, message: 'Update failed' }, 500);
  return c.json({ success: true });
});

// GET /classes/:id/students — get students of a class
app.get('/classes/:id/students', async (c) => {
  const classId = c.req.param('id');
  const students = await svc.getClassStudentsForAdmin(classId);
  return c.json({ success: true, students });
});

// PATCH /classes/:id — update class (rename, transfer teacher)
app.patch('/classes/:id', zValidator('json', z.object({
  name: z.string().min(2).max(100).optional(),
  teacher_id: z.number().int().positive().optional(),
})), async (c) => {
  const classId = c.req.param('id');
  const body = c.req.valid('json');
  const result = await svc.updateClassForAdmin(classId, body);
  if (!result.success) return c.json(result, 400);
  return c.json(result);
});

// PATCH /reports/:id/grade — update report grade
app.patch('/reports/:id/grade', zValidator('json', z.object({
  grade: z.number().min(0).max(100),
  feedback: z.string().max(2000).optional(),
})), async (c) => {
  const reportId = Number(c.req.param('id'));
  const { grade, feedback } = c.req.valid('json');
  const result = await svc.updateReportGradeForAdmin(reportId, grade, feedback);
  if (!result.success) return c.json(result, 400);
  return c.json(result);
});

// PATCH /users/:id — update user name/email
app.patch('/users/:id', zValidator('json', updateUserSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const { name, email } = c.req.valid('json');
  const result = await svc.updateUserForAdmin(id, { name, email });
  if (!result.success) return c.json(result, 400);
  return c.json(result);
});

// POST /classes — create a new class
app.post('/classes', zValidator('json', createClassSchema), async (c) => {
  const { name, code, teacher_id } = c.req.valid('json');
  const result = await svc.createClassForAdmin(name, code, teacher_id);
  if (!result.success) return c.json(result, 400);
  return c.json(result, 201);
});

// DELETE /reports/:id — delete a report
app.delete('/reports/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const result = await svc.deleteReportForAdmin(id);
  return c.json(result);
});

// GET /teachers — list all teachers (for class transfer dropdown)
app.get('/teachers', async (c) => {
  const list = await svc.getAllTeachers();
  return c.json({ success: true, teachers: list });
});

// GET /settings — get all system settings
app.get('/settings', async (c) => {
  const settings = await svc.getSystemSettings();
  return c.json({ success: true, settings });
});

// PATCH /settings — update a system setting
app.patch('/settings', zValidator('json', z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(5000),
})), async (c) => {
  const user = c.get('user') as User;
  const { key, value } = c.req.valid('json');
  const result = await svc.updateSystemSetting(key, value, user.id);
  return c.json(result);
});

// ─── System Alerts ───
app.get('/alerts', async (c) => {
  const list = await svc.getSystemAlerts();
  return c.json({ success: true, alerts: list });
});

app.patch('/alerts/:id/resolve', async (c) => {
  const user = c.get('user') as User;
  const id = Number(c.req.param('id'));
  const result = await svc.resolveSystemAlert(id, user.id);
  if (!result.success) return c.json(result, 400);
  return c.json(result);
});

// ─── Emergency Controls ───
const EMERGENCY_PASSWORD = process.env.EMERGENCY_PASSWORD || '';
if (!EMERGENCY_PASSWORD && process.env.NODE_ENV === 'production') {
  console.warn('[SECURITY] EMERGENCY_PASSWORD env variable is not set — emergency controls will be disabled in production');
}

async function verifyEmergencyPassword(c: any): Promise<boolean> {
  if (!EMERGENCY_PASSWORD) return false;
  const body = await c.req.json().catch(() => ({}));
  return body.emergency_password === EMERGENCY_PASSWORD;
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
  // Notify all users
  const users = await db.all<{ id: number }[]>(`SELECT id FROM users WHERE blocked_at IS NULL`);
  for (const u of users) {
    await createNotification({
      user_id: u.id,
      type: 'emergency',
      title: `🚨 ${title}`,
      message: content.slice(0, 150),
    });
  }
  // Notify all schools
  const schools = await db.all<{ id: number }[]>(`SELECT id FROM schools WHERE blocked_at IS NULL`);
  for (const s of schools) {
    await createSchoolNotification({
      school_id: s.id,
      type: 'emergency',
      title: `🚨 ${title}`,
      message: content.slice(0, 150),
    });
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

// ─── Admin Detailed Reports ───
app.get('/detailed-stats', async (c) => {
  const validPeriods = ['today', 'week', 'month', 'year', 'all'];
  const period = (c.req.query('period') || 'today') as 'today' | 'week' | 'month' | 'year' | 'all';
  if (!validPeriods.includes(period)) {
    return c.json({ success: false, message: 'Invalid period' }, 400);
  }
  const stats = await svc.getDetailedSystemStats(period);
  return c.json({ success: true, stats });
});

app.get('/academic-tracking', async (c) => {
  const tracking = await svc.getAcademicTracking();
  return c.json({ success: true, tracking });
});

app.get('/detailed-reports', async (c) => {
  const date = c.req.query('date') || undefined;
  const report = await svc.getAdminDetailedReports(date);
  return c.json({ success: true, report });
});

export { app as adminRoutes };
