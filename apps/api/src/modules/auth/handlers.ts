import { Hono } from 'hono';
import { login, register } from './services.js';

const authRoutes = new Hono();

authRoutes.post('/login', async (c) => {
  const { email, password } = await c.req.json();
  const result = await login(email, password);
  return c.json(result);
});

authRoutes.post('/register', async (c) => {
  const { email, password, name, role } = await c.req.json();
  const result = await register({ email, password, name, role: role || 'student' });
  return c.json(result);
});

authRoutes.get('/me', (c) => {
  // Mock: in real app, verify JWT from Authorization header
  return c.json({ success: true, user: null });
});

authRoutes.patch('/password', async (c) => {
  return c.json({ success: true });
});

export { authRoutes };
