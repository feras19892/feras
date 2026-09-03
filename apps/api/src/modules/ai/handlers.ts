import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import { ollamaChat, ollamaTags } from './services.js';
import { enqueueAI } from './queue.js';
import { analyzeReportBuiltIn } from './analyzer.js';
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
  mode: z.enum(['builtin', 'ai']).optional().default('builtin'),
});

// أجعل المحرك الإحصائي المدمج هو الأساس (فوري/موثوق/غير متأثر بالشبكة)،
// وOllama خياراً صريحاً عبر mode='ai' مع fallback تلقائي للمدمج عند فشله.
app.post('/analyze', zValidator('json', analyzeSchema), async (c) => {
  const body = c.req.valid('json');

  const builtIn = () => analyzeReportBuiltIn(body);

  const buildAiContext = () => [
    `التجربة: ${body.experiment_name}`,
    `الطالب: ${body.student_name || 'غير محدد'}`,
    `القراءات: ${body.readings || 'لا توجد'}`,
    `الأعمدة: ${body.columns || 'لا توجد'}`,
    `المعادلات: ${body.equations || 'لا توجد'}`,
    `الرسومات: ${body.plots || 'لا توجد'}`,
    `الخاتمة: ${body.conclusion || 'لا توجد'}`,
    body.chart_snapshot ? 'يوجد رسم بياني (chart snapshot)' : 'لا يوجد رسم بياني',
  ].join('\n');

  const aiSystemPrompt = `أنت خبير في تقييم تقارير التجارب العلمية. حلل التقرير التالي بشكل شامل واحترافي.

يجب أن يكون تحليلك باللغة العربية ويشمل:
1. ملخص التقرير
2. تقييم جودة البيانات والقراءات
3. تقييم المعادلات والرسومات
4. تقييم الخاتمة
5. درجة مقترحة من 100
6. توصيات للتحسين

في نهاية التحليل، اكتب سطرًا بالصيغة التالية بالضبط:
GRADE: <رقم من 0 إلى 100>`;

  // مدمج بالافتراضي: نتيجة فورية ومؤكدة دون اتصال خارجي
  if (body.mode === 'builtin') {
    const r = builtIn();
    return c.json({ success: true, analysis: r.analysis, grade: r.grade, source: 'builtin' });
  }

  // mode='ai': حاول الذكاء خارجياً، وتراجع للمدمج عند أي فشل/تأخر/انقطاع
  try {
    const aiAnalysis = await enqueueAI((signal) => ollamaChat([
      { role: 'system', content: aiSystemPrompt },
      { role: 'user', content: buildAiContext() },
    ], signal));

    // استخراج الدرجة بشكل صارم مع fallback للدرجة المحسوبة
    const gradeMatch = aiAnalysis.match(/GRADE[^0-9]*(\d{1,3})/i);
    const aiGrade = gradeMatch
      ? Math.min(100, Math.max(0, parseInt(gradeMatch[1], 10)))
      : builtIn().grade;

    const cleanAnalysis = aiAnalysis.replace(/GRADE[^0-9]*\d{1,3}/i, '').trim();

    return c.json({
      success: true,
      analysis: cleanAnalysis || builtIn().analysis,
      grade: aiGrade,
      source: 'ai',
    });
  } catch (err) {
    // ارجع للمحرك المدمج بدلاً من إفشال الطلب
    const r = builtIn();
    return c.json({
      success: true,
      analysis: r.analysis,
      grade: r.grade,
      source: 'builtin',
      fallback: true,
      message: err instanceof Error ? err.message : 'AI request failed; used built-in analyzer',
    });
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
  context: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(2000),
  })).max(10).optional().default([]),
});

app.post('/chat', zValidator('json', chatSchema), async (c) => {
  const user = c.get('user');
  if (user.role === 'guest') {
    return c.json({ success: false, message: 'Guest users cannot use AI chat' }, 403);
  }
  const body = c.req.valid('json');
  try {
    const chatMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: 'أنت مساعد تعليمي للفيزياء. أجب بالعربية بشكل مختصر وواضح.' },
      ...body.context.map(m => ({ role: m.role, content: m.content }) as { role: 'system' | 'user' | 'assistant'; content: string }),
      { role: 'user', content: body.message },
    ];
    const reply = await enqueueAI((signal) => ollamaChat(chatMessages, signal));
    return c.json({ success: true, reply });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ success: false, message: msg }, 502);
  }
});

export { app as aiRoutes };
