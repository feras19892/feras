import { Hono } from 'hono';
import { authMiddleware } from '../auth/middleware.js';
import * as svc from '../admin/feedback-service.js';
const app = new Hono();
// POST /api/feedback — any authenticated user can submit
app.use(authMiddleware);
app.post('/', async (c) => {
    const user = c.get('user');
    const { type, message, experimentId, experimentName, rating } = await c.req.json();
    await svc.createFeedback(user.id, user.name, type, message, experimentId, experimentName, rating);
    return c.json({ success: true }, 201);
});
export { app as feedbackRoutes };
