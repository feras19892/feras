import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { authRoutes } from './modules/auth/handlers.js';
import { dashboardRoutes } from './modules/dashboard/handlers.js';
import { settingsRoutes } from './modules/settings/handlers.js';
import { classRoutes } from './modules/classes/handlers.js';
import { reportRoutes } from './modules/reports/handlers.js';
import { notificationRoutes } from './modules/notifications/handlers.js';
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
import { gameRoutes } from './modules/gamification/handlers.js';
import { enhRoutes } from './modules/enhancements/handlers.js';
import { sseRoutes } from './modules/sse/handlers.js';
import { seedMathData } from './modules/math/bootstrap.js';
import { runMigrations } from './db/index.js';
import { seedAdminUser, seedEmergencyPassword } from './modules/auth/seed-admin.js';
import { startWorker } from './worker/index.js';
import { corsMiddleware } from './shared/middleware/cors.js';
import { securityHeaders } from './shared/middleware/security.js';
import { customLogger } from './shared/middleware/logger.js';
import { loginRateLimit, registerRateLimit, passwordUpdateRateLimit, aiRateLimit, chatRateLimit, writeRateLimit, adminRateLimit, globalRateLimit } from './shared/middleware/rate-limit.js';
import { bodySizeLimit } from './shared/middleware/body-limit.js';
import { startBackupInterval } from './shared/backup.js';
import { initSentry, captureError } from './shared/sentry.js';

initSentry();
await runMigrations();
await seedAdminUser();
await seedEmergencyPassword();
await seedMathData();

const app = new Hono();

app.use(corsMiddleware);
app.use(customLogger);
app.use(securityHeaders);
app.use('/api/*', bodySizeLimit);
app.use('/api/*', globalRateLimit);

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
app.route('/api/game', gameRoutes);
app.route('/api/enh', enhRoutes);
app.route('/api/sse', sseRoutes);

app.get('/api/health', (c) => c.json({ status: 'ok' }));

app.notFound((c) => c.json({ success: false, message: 'Not found' }, 404));

app.onError((err, c) => {
  if (process.env.NODE_ENV !== 'production') console.error('[api] Unhandled error:', err);
  captureError(err, { path: c.req.path, method: c.req.method });
  return c.json({ success: false, message: 'Internal server error' }, 500);
});

const port = Number(process.env.PORT) || 3000;

serve({
  fetch: app.fetch,
  port,
});

startWorker();
startBackupInterval();

console.log(`Server running at http://localhost:${port}`);
