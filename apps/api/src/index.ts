import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { authRoutes } from './modules/auth/handlers.js';
import { dashboardRoutes } from './modules/dashboard/handlers.js';
import { settingsRoutes } from './modules/settings/handlers.js';
import { classRoutes } from './modules/classes/handlers.js';
import { reportRoutes } from './modules/reports/handlers.js';
import { notificationRoutes } from './modules/notifications/handlers.js';
import { notificationTemplateRoutes } from './modules/notifications/admin-handlers.js';
import { notificationQueueRoutes } from './modules/notifications/queue-handlers.js';
import { runSubscriptionScheduler } from './modules/notifications/scheduler.js';
import { adminRoutes } from './modules/admin/handlers.js';
import { feedbackRoutes } from './modules/feedback/handlers.js';
import { aiRoutes } from './modules/ai/handlers.js';
import { chatRoutes } from './modules/chat/handlers.js';
import { schoolRoutes } from './modules/school/handlers.js';
import { approvalRoutes } from './modules/approvals/handlers.js';
import { announcementRoutes } from './modules/announcements/handlers.js';
import { deadlineRoutes } from './modules/deadlines/handlers.js';
import { plagiarismRoutes } from './modules/plagiarism/handlers.js';
import { mathRoutes } from './modules/math/index.js';
import { quizRoutes } from './modules/quizzes/handlers.js';
import { expRoutes } from './modules/experiment-questions/handlers.js';
import { gameRoutes } from './modules/gamification/handlers.js';
import { enhRoutes } from './modules/enhancements/handlers.js';
import { sseRoutes } from './modules/sse/handlers.js';
import { complaintRoutes } from './modules/complaints/handlers.js';
import { subscriptionRoutes } from './modules/subscriptions/handlers.js';
import { subscriptionControlRoutes } from './modules/subscriptions/controls.js';
import { inviteCodeRoutes } from './modules/invite-codes/handlers.js';
import { adminInviteCodeRoutes } from './modules/invite-codes/admin-handlers.js';
import { invoiceRoutes } from './modules/invoices/handlers.js';
import { scheduleRoutes } from './modules/schedules/handlers.js';
import { archiveRoutes } from './modules/archive/handlers.js';
import { supportTicketRoutes } from './modules/support-tickets/handlers.js';
import { autoExpireSubscriptions, seedDefaultPlans } from './modules/subscriptions/services.js';
import { seedMathData } from './modules/math/bootstrap.js';
import { runMigrations } from './db/index.js';
import { seedAdminUser, seedEmergencyPassword } from './modules/auth/seed-admin.js';
import { startWorker } from './worker/index.js';
import { corsMiddleware, warnIfCorsMisconfigured } from './shared/middleware/cors.js';
import { securityHeaders } from './shared/middleware/security.js';
import { customLogger } from './shared/middleware/logger.js';
import { authMiddleware, adminAuthMiddleware, schoolAuthMiddleware, teacherAuthMiddleware } from './modules/auth/middleware.js';
import { loginRateLimit, registerRateLimit, passwordUpdateRateLimit, aiRateLimit, chatRateLimit, writeRateLimit, adminRateLimit, globalRateLimit } from './shared/middleware/rate-limit.js';
import { bodySizeLimit } from './shared/middleware/body-limit.js';
import { startBackupInterval, backupDatabase, listBackups, restoreBackup, downloadBackup, deleteBackup } from './shared/backup.js';
import { startArchiveScheduler } from './shared/archive-scheduler.js';
import { initSentry, captureError } from './shared/sentry.js';

initSentry();
warnIfCorsMisconfigured();
await runMigrations();
await seedAdminUser();
await seedEmergencyPassword();
await seedMathData();
await seedDefaultPlans();

const app = new Hono();

app.use(corsMiddleware);
app.use(customLogger);
app.use(securityHeaders);
app.use('/api/*', bodySizeLimit);
app.use('/api/*', authMiddleware);
app.use('/api/*', globalRateLimit);

app.use('/api/admin/*', adminAuthMiddleware);
app.use('/api/school/*', schoolAuthMiddleware);
app.use('/api/teacher/*', teacherAuthMiddleware);

app.use('/api/auth/login', loginRateLimit);
app.use('/api/auth/register', registerRateLimit);
app.use('/api/auth/password', passwordUpdateRateLimit);
app.use('/api/ai/*', aiRateLimit);
app.use('/api/chat/*', chatRateLimit);
app.use('/api/reports/*', writeRateLimit);
app.use('/api/classes/*', writeRateLimit);
app.use('/api/notifications/*', writeRateLimit);
app.use('/api/quizzes/*', writeRateLimit);
app.use('/api/announcements/*', writeRateLimit);
app.use('/api/feedback/*', writeRateLimit);
app.use('/api/admin/*', adminRateLimit);
app.use('/api/school/*', adminRateLimit);
app.use('/api/approvals/*', adminRateLimit);
app.use('/api/deadlines/*', writeRateLimit);
app.use('/api/plagiarism/*', writeRateLimit);
app.route('/api/auth', authRoutes);
app.route('/api/dashboard', dashboardRoutes);
app.route('/api/settings', settingsRoutes);
app.route('/api/classes', classRoutes);
app.route('/api/reports', reportRoutes);
app.route('/api/notifications', notificationRoutes);
app.route('/api/admin/notification-templates', notificationTemplateRoutes);
app.route('/api/admin/notification-queue', notificationQueueRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/feedback', feedbackRoutes);
app.route('/api/ai', aiRoutes);
app.route('/api/chat', chatRoutes);
app.route('/api/school', schoolRoutes);
app.route('/api/approvals', approvalRoutes);
app.route('/api/announcements', announcementRoutes);
app.route('/api/deadlines', deadlineRoutes);
app.route('/api/plagiarism', plagiarismRoutes);
app.route('/api/math', mathRoutes);
app.route('/api/quizzes', quizRoutes);
app.route('/api/experiment-questions', expRoutes);
app.route('/api/game', gameRoutes);
app.route('/api/enh', enhRoutes);
app.route('/api/sse', sseRoutes);
app.route('/api/complaints', complaintRoutes);
app.route('/api/subscriptions', subscriptionRoutes);
app.route('/api/invite-codes', inviteCodeRoutes);
app.route('/api/admin/invite-codes', adminInviteCodeRoutes);
app.route('/api/admin/invoices', invoiceRoutes);
app.route('/api/admin/subscription-controls', subscriptionControlRoutes);
app.route('/api/schedules', scheduleRoutes);
app.route('/api/archive', archiveRoutes);
app.route('/api/support-tickets', supportTicketRoutes);

// Backup management routes (admin only)
app.get('/api/admin/backups', async (c) => {
  try {
    const backups = await listBackups();
    return c.json({ success: true, backups });
  } catch (err) {
    return c.json({ success: false, message: 'Failed to list backups' }, 500);
  }
});

app.post('/api/admin/backups/create', async (c) => {
  try {
    const success = await backupDatabase();
    if (success) {
      return c.json({ success: true, message: 'Backup created successfully' });
    }
    return c.json({ success: false, message: 'Failed to create backup' }, 500);
  } catch (err) {
    return c.json({ success: false, message: 'Failed to create backup' }, 500);
  }
});

app.post('/api/admin/backups/restore', async (c) => {
  try {
    const { backupName } = await c.req.json();
    if (!backupName) {
      return c.json({ success: false, message: 'backupName is required' }, 400);
    }
    const success = await restoreBackup(backupName);
    if (success) {
      return c.json({ success: true, message: 'Backup restored successfully' });
    }
    return c.json({ success: false, message: 'Failed to restore backup' }, 500);
  } catch (err) {
    return c.json({ success: false, message: 'Failed to restore backup' }, 500);
  }
});

app.get('/api/admin/backups/download/:backupName', async (c) => {
  try {
    const backupName = c.req.param('backupName');
    if (!backupName) {
      return c.json({ success: false, message: 'backupName is required' }, 400);
    }
    const data = await downloadBackup(backupName);
    if (data) {
      return c.body(new Uint8Array(data), 200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${backupName}"`,
      });
    }
    return c.json({ success: false, message: 'Failed to download backup' }, 500);
  } catch (err) {
    return c.json({ success: false, message: 'Failed to download backup' }, 500);
  }
});

app.delete('/api/admin/backups/:backupName', async (c) => {
  try {
    const backupName = c.req.param('backupName');
    if (!backupName) {
      return c.json({ success: false, message: 'backupName is required' }, 400);
    }
    const success = await deleteBackup(backupName);
    if (success) {
      return c.json({ success: true, message: 'Backup deleted successfully' });
    }
    return c.json({ success: false, message: 'Failed to delete backup' }, 500);
  } catch (err) {
    return c.json({ success: false, message: 'Failed to delete backup' }, 500);
  }
});

app.get('/api/health', (c) => c.json({ status: 'ok' }));

app.notFound((c) => c.json({ success: false, message: 'Not found' }, 404));

app.onError((err, c) => {
  if (process.env.NODE_ENV !== 'production') console.error('[api] Unhandled error:', err);
  captureError(err, { path: c.req.path, method: c.req.method });
  // Never leak internal error details in production.
  const isProd = process.env.NODE_ENV === 'production';
  return c.json(
    { success: false, message: 'Internal server error', ...(isProd ? {} : { details: err?.message || 'unknown' }) },
    500
  );
});

const port = Number(process.env.PORT) || 3000;

if (process.env.SKIP_SERVE !== '1') {
  serve({
    fetch: app.fetch,
    port,
  });

  startWorker();
  startBackupInterval();
  startArchiveScheduler();
  void autoExpireSubscriptions().catch(() => {});
  setInterval(() => {
    void autoExpireSubscriptions().catch(() => {});
  }, 60 * 60 * 1000);

  void runSubscriptionScheduler().catch(() => {});
  setInterval(() => {
    void runSubscriptionScheduler().catch(() => {});
  }, 60 * 60 * 1000);

  console.log(`Server running at http://localhost:${port}`);
}

export { app };
