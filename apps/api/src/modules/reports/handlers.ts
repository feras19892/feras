import { Hono } from 'hono';
import { reportCrudRoutes } from './handlers-crud.js';
import { reportStatsRoutes } from './handlers-stats.js';

const app = new Hono();

app.route('/', reportCrudRoutes);
app.route('/', reportStatsRoutes);

export { app as reportRoutes };
