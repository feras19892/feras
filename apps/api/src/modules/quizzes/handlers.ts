import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import { db } from '../../db/index.js';
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
  quiz_type: z.enum(['quiz', 'midterm', 'final']).default('quiz'),
  scheduled_at: z.string().datetime().optional().nullable(),
  weight: z.number().int().min(1).max(100).default(10),
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

const updateQuizSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(''),
  time_limit_minutes: z.number().int().min(1).max(180).default(30),
  quiz_type: z.enum(['quiz', 'midterm', 'final']).default('quiz'),
  scheduled_at: z.string().datetime().optional().nullable(),
  weight: z.number().int().min(1).max(100).default(10),
});

const updateQuestionSchema = z.object({
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
  // Verify teacher owns the class
  if (user.role === 'teacher') {
    const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', body.class_id);
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح — لا يمكنك إنشاء اختبار لفصل لا تملكه' }, 403);
    }
  }
  const quiz = await svc.createQuiz(user.id, body.class_id, body.title, body.description, body.time_limit_minutes, body.quiz_type, body.scheduled_at ?? null, body.weight);
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

// Teacher: update quiz
quizRoutes.put('/:id', zValidator('json', updateQuizSchema), async (c) => {
  const user = c.get('user');
  const quizId = Number(c.req.param('id'));
  const quiz = await svc.getQuizById(quizId);
  if (!quiz) return c.json({ success: false, message: 'Quiz not found' }, 404);
  if (quiz.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Not your quiz' }, 403);
  }
  if (quiz.status !== 'draft') {
    return c.json({ success: false, message: 'يمكن تعديل المسودات فقط' }, 400);
  }
  const body = c.req.valid('json');
  const updated = await svc.updateQuiz(quizId, body.title, body.description, body.time_limit_minutes, body.quiz_type, body.scheduled_at ?? null, body.weight);
  return c.json({ success: true, quiz: updated });
});

// Teacher: update question
quizRoutes.put('/:id/questions/:qid', zValidator('json', updateQuestionSchema), async (c) => {
  const user = c.get('user');
  const quizId = Number(c.req.param('id'));
  const questionId = Number(c.req.param('qid'));
  const quiz = await svc.getQuizById(quizId);
  if (!quiz) return c.json({ success: false, message: 'Quiz not found' }, 404);
  if (quiz.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Not your quiz' }, 403);
  }
  const body = c.req.valid('json');
  const updated = await svc.updateQuestion(questionId, body.question_text, body.option_a, body.option_b, body.option_c || null, body.option_d || null, body.correct_answer, body.points);
  return c.json({ success: true, question: updated });
});

// Teacher: delete question
quizRoutes.delete('/:id/questions/:qid', async (c) => {
  const user = c.get('user');
  const quizId = Number(c.req.param('id'));
  const questionId = Number(c.req.param('qid'));
  const quiz = await svc.getQuizById(quizId);
  if (!quiz) return c.json({ success: false, message: 'Quiz not found' }, 404);
  if (quiz.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Not your quiz' }, 403);
  }
  await svc.deleteQuestion(questionId);
  return c.json({ success: true });
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
  // Verify student is a member of the quiz's class
  if (user.role === 'student' && quiz.class_id) {
    const member = await db.get('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?', quiz.class_id, user.id);
    if (!member) return c.json({ success: false, message: 'غير مصرح' }, 403);
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
  if (quiz.class_id) {
    const member = await db.get('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?', quiz.class_id, user.id);
    if (!member) return c.json({ success: false, message: 'غير مصرح' }, 403);
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
  const quiz = await svc.getQuizById(quizId);
  if (!quiz) return c.json({ success: false, message: 'Quiz not found' }, 404);
  if (quiz.class_id) {
    const member = await db.get('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?', quiz.class_id, user.id);
    if (!member) return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const { answers } = c.req.valid('json');
  const parsed: Record<number, string> = {};
  for (const k in answers) parsed[Number(k)] = answers[k];
  const existing = await svc.getSubmission(quizId, user.id);
  if (!existing) {
    return c.json({ success: false, message: 'لم يبدأ الطالب الاختبار' }, 400);
  }
  if (existing.submitted_at) {
    return c.json({ success: false, message: 'Already submitted' }, 400);
  }
  const result = await svc.submitQuiz(quizId, user.id, parsed);
  return c.json({ success: true, ...result });
});

// Student: get submission details (answers review)
quizRoutes.get('/:id/my-submission', async (c) => {
  const user = c.get('user');
  if (user.role !== 'student') {
    return c.json({ success: false, message: 'Students only' }, 403);
  }
  const quizId = Number(c.req.param('id'));
  const quiz = await svc.getQuizById(quizId);
  if (!quiz) return c.json({ success: false, message: 'Quiz not found' }, 404);
  if (quiz.class_id) {
    const member = await db.get('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?', quiz.class_id, user.id);
    if (!member) return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const details = await svc.getSubmissionDetails(quizId, user.id);
  if (!details) return c.json({ success: false, message: 'No submission found' }, 404);
  return c.json({ success: true, ...details });
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

// Student: get quiz leaderboard (class rankings)
quizRoutes.get('/:id/leaderboard', async (c) => {
  const user = c.get('user');
  const quizId = Number(c.req.param('id'));
  const quiz = await svc.getQuizById(quizId);
  if (!quiz) return c.json({ success: false, message: 'Quiz not found' }, 404);
  if (quiz.status === 'draft') {
    return c.json({ success: false, message: 'Quiz not available' }, 403);
  }
  if (user.role === 'student' && quiz.class_id) {
    const member = await db.get('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?', quiz.class_id, user.id);
    if (!member) return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const data = await svc.getQuizLeaderboard(quizId, user.id);
  if (!data) return c.json({ success: false, message: 'Quiz not found' }, 404);
  return c.json({ success: true, ...data });
});

// Admin: get all quizzes (optional ?school_id= & ?teacher_id=)
quizRoutes.get('/admin/all', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.json({ success: false, message: 'Admin only' }, 403);
  }
  const schoolId = c.req.query('school_id');
  const teacherId = c.req.query('teacher_id');
  const quizzes = await svc.getAllQuizzes(
    schoolId ? Number(schoolId) : undefined,
    teacherId ? Number(teacherId) : undefined,
  );
  return c.json({ success: true, quizzes });
});

// Teacher: quiz stats for overview
quizRoutes.get('/stats/teacher', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'Teachers only' }, 403);
  }
  const stats = await svc.getTeacherQuizStats(user.id);
  return c.json({ success: true, stats });
});

// Student: quiz stats for overview
quizRoutes.get('/stats/student', async (c) => {
  const user = c.get('user');
  if (user.role !== 'student') {
    return c.json({ success: false, message: 'Students only' }, 403);
  }
  const stats = await svc.getStudentQuizStats(user.id);
  return c.json({ success: true, stats });
});

export { quizRoutes };
