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
import { seedMathData } from './modules/math/bootstrap.js';
import { runMigrations } from './db/index.js';
import { seedAdminUser } from './modules/auth/seed-admin.js';
import { startWorker } from './worker/index.js';
import { corsMiddleware } from './shared/middleware/cors.js';
import { securityHeaders } from './shared/middleware/security.js';
import { customLogger } from './shared/middleware/logger.js';
import { loginRateLimit, passwordUpdateRateLimit } from './shared/middleware/rate-limit.js';

await runMigrations();
await seedAdminUser();
await seedMathData();

const app = new Hono();

app.use(corsMiddleware);
app.use(customLogger);
app.use(securityHeaders);

app.use('/api/auth/login', loginRateLimit);
app.use('/api/auth/register', loginRateLimit);
app.use('/api/auth/password', passwordUpdateRateLimit);
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

app.get('/api/health', (c) => c.json({ status: 'ok' }));

const port = Number(process.env.PORT) || 3000;

serve({
  fetch: app.fetch,
  port,
});

startWorker();

console.log(`Server running at http://localhost:${port}`);
