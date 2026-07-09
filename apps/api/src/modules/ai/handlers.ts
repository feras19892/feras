import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import { ollamaChat, ollamaTags, type ChatMessage } from './services.js';
import type { User } from '@my-modern-app/shared-types';

type Variables = { user: User };

const app = new Hono<{ Variables: Variables }>();

app.use(authMiddleware);

const analyzeSchema = z.object({
  experiment_name: z.string().min(1),
  student_name: z.string().optional(),
  readings: z.string(),
  columns: z.string().optional(),
  equations: z.string().optional(),
  plots: z.string().optional(),
  conclusion: z.string().optional(),
  chart_snapshot: z.string().optional(),
});

app.post('/analyze', zValidator('json', analyzeSchema), async (c) => {
  const body = c.req.valid('json');

  const systemPrompt = `You are an expert science teacher assistant. Analyze the student's lab report and provide:
1. A brief summary of the experiment
2. Strengths of the report
3. Areas for improvement
4. Data quality assessment (are readings consistent? enough data points?)
5. A suggested grade out of 100 with justification

Respond in clear, concise markdown. If the report is in Arabic, respond in Arabic.`;

  const userContent = `Lab Report Analysis Request:
- Experiment: ${body.experiment_name}
- Student: ${body.student_name ?? 'Unknown'}
- Readings (JSON): ${body.readings}
- Columns (JSON): ${body.columns ?? 'N/A'}
- Equations (JSON): ${body.equations ?? 'N/A'}
- Plots (JSON): ${body.plots ?? 'N/A'}
- Conclusion: ${body.conclusion ?? 'N/A'}
- Has chart: ${body.chart_snapshot ? 'Yes' : 'No'}

Please analyze this report.`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];

  try {
    const analysis = await ollamaChat(messages);
    return c.json({ success: true, analysis });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ success: false, message: `AI analysis failed: ${msg}` }, 502);
  }
});

app.get('/models', async (c) => {
  try {
    const models = await ollamaTags();
    return c.json({ success: true, models });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ success: false, message: `Failed to fetch models: ${msg}` }, 502);
  }
});

app.get('/health', async (c) => {
  try {
    const models = await ollamaTags();
    return c.json({ success: true, connected: true, modelCount: models.length });
  } catch {
    return c.json({ success: false, connected: false }, 502);
  }
});

export { app as aiRoutes };
