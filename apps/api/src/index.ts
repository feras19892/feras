import 'dotenv/config';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { authRoutes } from './modules/auth/handlers.js';
import { dashboardRoutes } from './modules/dashboard/handlers.js';
import { settingsRoutes } from './modules/settings/handlers.js';
import { classRoutes } from './modules/classes/handlers.js';
import { reportRoutes } from './modules/reports/handlers.js';
import { notificationRoutes } from './modules/notifications/handlers.js';
import { adminRoutes } from './modules/admin/handlers.js';
import { feedbackRoutes } from './modules/feedback/handlers.js';
import { runMigrations } from './db/index.js';
import { loginRateLimit, passwordUpdateRateLimit } from './shared/middleware/rate-limit.js';

await runMigrations();

const app = new Hono();

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(logger());

app.use(async (c, next) => {
  await next();
  c.header('X-Frame-Options', 'DENY');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  if (process.env.NODE_ENV === 'production') {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    c.header('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  }
});

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

app.get('/api/health', (c) => c.json({ status: 'ok' }));

const port = Number(process.env.PORT) || 3000;

serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running at http://localhost:${port}`);
