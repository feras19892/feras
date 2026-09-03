import { Hono } from 'hono';
import { adminCoreRoutes } from './handlers-core.js';
import { adminAdvancedRoutes } from './handlers-advanced.js';
import { adminNotificationRoutes } from './handlers-notifications.js';

const app = new Hono();

app.route('/', adminCoreRoutes);
app.route('/', adminAdvancedRoutes);
app.route('/notifications', adminNotificationRoutes);

export { app as adminRoutes };
