import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '../auth/middleware.js';
import { db } from '../../db/index.js';
import type { User } from '@my-modern-app/shared-types';
import * as svc from './services.js';
import {
  createTemplateSchema,
  updateTemplateSchema,
  addQuestionSchema,
  assignTemplateSchema,
  submitAnswersSchema,
} from './schemas.js';

type Variables = { user: User };
const expRoutes = new Hono<{ Variables: Variables }>();

expRoutes.use(authMiddleware);

// List all active experiments
expRoutes.get('/experiments', async (c) => {
  const experiments = await svc.getExperiments();
  return c.json({ success: true, experiments });
});

// Teacher: create a question template
expRoutes.post('/templates', zValidator('json', createTemplateSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'Teachers only' }, 403);
  }
  const body = c.req.valid('json');
  const exp = await db.get('SELECT 1 FROM experiments WHERE id = ?', body.experiment_id);
  if (!exp) return c.json({ success: false, message: 'Experiment not found' }, 404);
  const template = await svc.createTemplate(body.experiment_id, user.id, body.title);
  return c.json({ success: true, template }, 201);
});

// Teacher: list own templates
expRoutes.get('/templates', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'Teachers only' }, 403);
  }
  const templates = await svc.listTeacherTemplates(user.id);
  return c.json({ success: true, templates });
});

// Teacher: get a template with questions
expRoutes.get('/templates/:id', async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const data = await svc.getTemplateWithQuestions(id);
  if (!data) return c.json({ success: false, message: 'Template not found' }, 404);
  if (data.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Not your template' }, 403);
  }
  const { questions, ...template } = data;
  return c.json({ success: true, template, questions });
});

// Teacher: update template title/status
expRoutes.put('/templates/:id', zValidator('json', updateTemplateSchema), async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const template = await svc.getTemplateById(id);
  if (!template) return c.json({ success: false, message: 'Template not found' }, 404);
  if (template.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Not your template' }, 403);
  }
  const body = c.req.valid('json');
  const updated = await svc.updateTemplate(id, user.id, body.title, body.status);
  return c.json({ success: true, template: updated });
});

// Teacher: publish template
expRoutes.post('/templates/:id/publish', async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const template = await svc.getTemplateById(id);
  if (!template) return c.json({ success: false, message: 'Template not found' }, 404);
  if (template.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Not your template' }, 403);
  }
  const updated = await svc.publishTemplate(id, user.id);
  return c.json({ success: true, template: updated });
});

// Teacher: add a question
expRoutes.post('/templates/:id/questions', zValidator('json', addQuestionSchema), async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const template = await svc.getTemplateById(id);
  if (!template) return c.json({ success: false, message: 'Template not found' }, 404);
  if (template.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Not your template' }, 403);
  }
  const body = c.req.valid('json');
  const question = await svc.addQuestion(id, body);
  return c.json({ success: true, question }, 201);
});

// Teacher: update a question
expRoutes.put('/templates/:id/questions/:qid', zValidator('json', addQuestionSchema), async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const qid = Number(c.req.param('qid'));
  const template = await svc.getTemplateById(id);
  if (!template) return c.json({ success: false, message: 'Template not found' }, 404);
  if (template.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Not your template' }, 403);
  }
  const body = c.req.valid('json');
  const question = await svc.updateQuestion(qid, body);
  if (!question) return c.json({ success: false, message: 'Question not found' }, 404);
  return c.json({ success: true, question });
});

// Teacher: delete a question
expRoutes.delete('/templates/:id/questions/:qid', async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const qid = Number(c.req.param('qid'));
  const template = await svc.getTemplateById(id);
  if (!template) return c.json({ success: false, message: 'Template not found' }, 404);
  if (template.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Not your template' }, 403);
  }
  await svc.deleteQuestion(qid);
  return c.json({ success: true });
});

// Teacher: assign a template to a class
expRoutes.post('/templates/:id/assign', zValidator('json', assignTemplateSchema), async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const template = await svc.getTemplateById(id);
  if (!template) return c.json({ success: false, message: 'Template not found' }, 404);
  if (template.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Not your template' }, 403);
  }
  const body = c.req.valid('json');
  const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', body.class_id);
  if (!classRow) return c.json({ success: false, message: 'Class not found' }, 404);
  if (classRow.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Not your class' }, 403);
  }
  const result = await svc.assignTemplateToClass(id, body.class_id, user.id);
  if (result.error) return c.json({ success: false, message: result.error }, 400);
  return c.json({ success: true });
});

// Teacher: delete a template
expRoutes.delete('/templates/:id', async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const result = await svc.deleteTemplate(id, user.id, user.role === 'admin');
  if (result.error === 'Template not found') return c.json({ success: false, message: result.error }, 404);
  if (result.error === 'Not your template') return c.json({ success: false, message: result.error }, 403);
  if (result.error) return c.json({ success: false, message: result.error }, 400);
  return c.json({ success: true });
});

// Student: get the active template for an experiment in their class
expRoutes.get('/student/:experiment_id', async (c) => {
  const user = c.get('user');
  if (user.role !== 'student') return c.json({ success: false, message: 'Students only' }, 403);
  const experimentId = c.req.param('experiment_id');
  const classId = c.req.query('class_id');
  if (!classId) return c.json({ success: false, message: 'class_id is required' }, 400);
  const member = await db.get('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?', classId, user.id);
  if (!member) return c.json({ success: false, message: 'غير مصرح' }, 403);
  const data = await svc.getActiveTemplateForClass(classId, experimentId);
  if (!data) return c.json({ success: false, message: 'No questions assigned' }, 404);
  return c.json({ success: true, ...data });
});

// Student: submit or update answers for a report
expRoutes.post('/reports/:report_id/answers', zValidator('json', submitAnswersSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'student') return c.json({ success: false, message: 'Students only' }, 403);
  const reportId = Number(c.req.param('report_id'));
  const report = await svc.getReportById(reportId);
  if (!report) return c.json({ success: false, message: 'Report not found' }, 404);
  if (report.student_id !== user.id) return c.json({ success: false, message: 'غير مصرح' }, 403);
  const body = c.req.valid('json');
  const result = await svc.submitAnswers(reportId, body.answers);
  if (result.error) return c.json({ success: false, message: result.error }, 400);
  return c.json({ success: true, ...result });
});

// Teacher/Admin: stats for the experiment questions system
expRoutes.get('/stats', async (c) => {
  const user = c.get('user');
  if (user.role === 'admin') {
    const stats = await svc.getAdminStats();
    return c.json({ success: true, stats });
  }
  if (user.role === 'teacher') {
    const stats = await svc.getTeacherStats(user.id);
    return c.json({ success: true, stats });
  }
  return c.json({ success: false, message: 'Forbidden' }, 403);
});

// Teacher/Student: get answers for a report
expRoutes.get('/reports/:report_id/answers', async (c) => {
  const user = c.get('user');
  const reportId = Number(c.req.param('report_id'));
  const report = await svc.getReportById(reportId);
  if (!report) return c.json({ success: false, message: 'Report not found' }, 404);
  if (user.role === 'student' && report.student_id !== user.id) {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  if ((user.role === 'teacher' || user.role === 'admin')) {
    const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', report.class_id);
    if (!classRow || (classRow.teacher_id !== user.id && user.role !== 'admin')) {
      return c.json({ success: false, message: 'Not your class' }, 403);
    }
  }
  const answers = await svc.getAnswersForReport(reportId);
  return c.json({ success: true, answers });
});

export { expRoutes };
