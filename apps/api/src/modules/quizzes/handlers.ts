import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import type { User } from '@my-modern-app/shared-types';
import * as svc from './services.js';

type Variables = { user: User };
const quizRoutes = new Hono<{ Variables: Variables }>();

quizRoutes.use(authMiddleware);

const createQuizSchema = z.object({
  class_id: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(''),
  time_limit_minutes: z.number().int().min(1).max(180).default(30),
});

const addQuestionSchema = z.object({
  question_text: z.string().min(1).max(2000),
  option_a: z.string().min(1).max(1000),
  option_b: z.string().min(1).max(1000),
  option_c: z.string().max(1000).optional(),
  option_d: z.string().max(1000).optional(),
  correct_answer: z.enum(['a', 'b', 'c', 'd']),
  points: z.number().int().min(1).max(100).default(10),
});

const submitSchema = z.object({
  answers: z.record(z.string(), z.enum(['a', 'b', 'c', 'd'])),
});

// Teacher: create quiz
quizRoutes.post('/', zValidator('json', createQuizSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'Teachers only' }, 403);
  }
  const body = c.req.valid('json');
  const quiz = await svc.createQuiz(user.id, body.class_id, body.title, body.description, body.time_limit_minutes);
  return c.json({ success: true, quiz }, 201);
});

// Teacher: add question
quizRoutes.post('/:id/questions', zValidator('json', addQuestionSchema), async (c) => {
  const user = c.get('user');
  const quizId = Number(c.req.param('id'));
  const quiz = await svc.getQuizById(quizId);
  if (!quiz) return c.json({ success: false, message: 'Quiz not found' }, 404);
  if (quiz.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Not your quiz' }, 403);
  }
  const body = c.req.valid('json');
  const question = await svc.addQuestion(quizId, body.question_text, body.option_a, body.option_b, body.option_c || null, body.option_d || null, body.correct_answer, body.points);
  return c.json({ success: true, question }, 201);
});

// Teacher: publish quiz
quizRoutes.post('/:id/publish', async (c) => {
  const user = c.get('user');
  const quizId = Number(c.req.param('id'));
  const quiz = await svc.getQuizById(quizId);
  if (!quiz) return c.json({ success: false, message: 'Quiz not found' }, 404);
  if (quiz.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Not your quiz' }, 403);
  }
  await svc.publishQuiz(quizId);
  return c.json({ success: true });
});

// Teacher: close quiz
quizRoutes.post('/:id/close', async (c) => {
  const user = c.get('user');
  const quizId = Number(c.req.param('id'));
  const quiz = await svc.getQuizById(quizId);
  if (!quiz) return c.json({ success: false, message: 'Quiz not found' }, 404);
  if (quiz.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Not your quiz' }, 403);
  }
  await svc.closeQuiz(quizId);
  return c.json({ success: true });
});

// Teacher: delete quiz
quizRoutes.delete('/:id', async (c) => {
  const user = c.get('user');
  const quizId = Number(c.req.param('id'));
  const quiz = await svc.getQuizById(quizId);
  if (!quiz) return c.json({ success: false, message: 'Quiz not found' }, 404);
  if (quiz.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Not your quiz' }, 403);
  }
  await svc.deleteQuiz(quizId);
  return c.json({ success: true });
});

// Teacher: get own quizzes
quizRoutes.get('/my', async (c) => {
  const user = c.get('user');
  const quizzes = await svc.getTeacherQuizzes(user.id);
  return c.json({ success: true, quizzes });
});

// Teacher: get quiz details (with questions + correct answers)
quizRoutes.get('/:id', async (c) => {
  const user = c.get('user');
  const quizId = Number(c.req.param('id'));
  const quiz = await svc.getQuizById(quizId);
  if (!quiz) return c.json({ success: false, message: 'Quiz not found' }, 404);
  const isTeacher = quiz.teacher_id === user.id || user.role === 'admin';
  if (isTeacher) {
    const questions = await svc.getQuizQuestions(quizId);
    return c.json({ success: true, quiz, questions });
  }
  // Student: only published quizzes, no correct answers
  if (quiz.status === 'draft') {
    return c.json({ success: false, message: 'Quiz not available' }, 403);
  }
  const questions = await svc.getQuizQuestionsForStudent(quizId);
  const submission = await svc.getSubmission(quizId, user.id);
  return c.json({ success: true, quiz, questions, submission });
});

// Teacher: get submissions for a quiz
quizRoutes.get('/:id/submissions', async (c) => {
  const user = c.get('user');
  const quizId = Number(c.req.param('id'));
  const quiz = await svc.getQuizById(quizId);
  if (!quiz) return c.json({ success: false, message: 'Quiz not found' }, 404);
  if (quiz.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Not your quiz' }, 403);
  }
  const submissions = await svc.getQuizSubmissions(quizId);
  return c.json({ success: true, submissions });
});

// Student: start quiz
quizRoutes.post('/:id/start', async (c) => {
  const user = c.get('user');
  if (user.role !== 'student') {
    return c.json({ success: false, message: 'Students only' }, 403);
  }
  const quizId = Number(c.req.param('id'));
  const quiz = await svc.getQuizById(quizId);
  if (!quiz) return c.json({ success: false, message: 'Quiz not found' }, 404);
  if (quiz.status === 'draft') {
    return c.json({ success: false, message: 'Quiz not published' }, 403);
  }
  const submission = await svc.startSubmission(quizId, user.id);
  return c.json({ success: true, submission });
});

// Student: submit answers
quizRoutes.post('/:id/submit', zValidator('json', submitSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'student') {
    return c.json({ success: false, message: 'Students only' }, 403);
  }
  const quizId = Number(c.req.param('id'));
  const { answers } = c.req.valid('json');
  const parsed: Record<number, string> = {};
  for (const k in answers) parsed[Number(k)] = answers[k];
  const existing = await svc.getSubmission(quizId, user.id);
  if (existing?.submitted_at) {
    return c.json({ success: false, message: 'Already submitted' }, 400);
  }
  const result = await svc.submitQuiz(quizId, user.id, parsed);
  return c.json({ success: true, ...result });
});

// Student: get available quizzes
quizRoutes.get('/student/available', async (c) => {
  const user = c.get('user');
  if (user.role !== 'student') {
    return c.json({ success: false, message: 'Students only' }, 403);
  }
  const quizzes = await svc.getStudentQuizzes(user.id);
  return c.json({ success: true, quizzes });
});

// Admin: get all quizzes
quizRoutes.get('/admin/all', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.json({ success: false, message: 'Admin only' }, 403);
  }
  const quizzes = await svc.getAllQuizzes();
  return c.json({ success: true, quizzes });
});

export { quizRoutes };
