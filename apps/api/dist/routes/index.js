import { Hono } from 'hono';
import { authRoutes } from '../modules/auth/handlers.js';
import { dashboardRoutes } from '../modules/dashboard/handlers.js';
import { settingsRoutes } from '../modules/settings/handlers.js';
const router = new Hono();
router.route('/auth', authRoutes);
router.route('/dashboard', dashboardRoutes);
router.route('/settings', settingsRoutes);
export default router;
