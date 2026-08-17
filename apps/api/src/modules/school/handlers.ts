import { Hono } from 'hono';
import { schoolBaseRoutes } from './handlers-school.js';
import { schoolOversightRoutes } from './handlers-oversight.js';

const schoolRoutes = new Hono();

schoolRoutes.route('/', schoolBaseRoutes);
schoolRoutes.route('/', schoolOversightRoutes);

export { schoolRoutes };
