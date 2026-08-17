import { Hono } from 'hono';
import { adminCoreRoutes } from './handlers-core.js';
import { adminAdvancedRoutes } from './handlers-advanced.js';

const app = new Hono();

app.route('/', adminCoreRoutes);
app.route('/', adminAdvancedRoutes);

export { app as adminRoutes };
