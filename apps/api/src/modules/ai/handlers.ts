import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import { analyzeReportBuiltIn } from './analyzer.js';
import { ollamaChat, ollamaTags } from './services.js';
import type { User } from '@my-modern-app/shared-types';

type Variables = { user: User };

const app = new Hono<{ Variables: Variables }>();

app.use(authMiddleware);

const analyzeSchema = z.object({
  experiment_name: z.string().min(1),
  student_name: z.string().optional().nullable(),
  readings: z.string().optional().nullable().default(''),
  columns: z.string().optional().nullable(),
  equations: z.string().optional().nullable(),
  plots: z.string().optional().nullable(),
  conclusion: z.string().optional().nullable(),
  chart_snapshot: z.string().optional().nullable(),
});

app.post('/analyze', zValidator('json', analyzeSchema), async (c) => {
  const body = c.req.valid('json');

  try {
    const result = analyzeReportBuiltIn(body);
    return c.json({ success: true, analysis: result.analysis, grade: result.grade });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ success: false, message: `Analysis failed: ${msg}` }, 500);
  }
});

app.get('/health', async (c) => {
  try {
    const models = await ollamaTags();
    return c.json({ success: true, connected: true, modelCount: models.length, models });
  } catch {
    return c.json({ success: true, connected: false, modelCount: 0, models: [] }, 200);
  }
});

app.get('/models', async (c) => {
  try {
    const models = await ollamaTags();
    return c.json({ success: true, models });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ success: false, message: msg }, 502);
  }
});

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
});

app.post('/chat', zValidator('json', chatSchema), async (c) => {
  const body = c.req.valid('json');
  try {
    const reply = await ollamaChat([
      { role: 'system', content: 'أنت مساعد تعليمي للفيزياء. أجب بالعربية بشكل مختصر وواضح.' },
      { role: 'user', content: body.message },
    ]);
    return c.json({ success: true, reply });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ success: false, message: msg }, 502);
  }
});

export { app as aiRoutes };
