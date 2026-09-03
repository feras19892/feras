import { fetchJson } from './http';

export interface Quiz {
  id: number;
  teacher_id: number;
  class_id: string | null;
  title: string;
  description: string | null;
  time_limit_minutes: number;
  status: string;
  max_score: number;
  quiz_type: string;
  scheduled_at: string | null;
  weight: number;
  created_at: string;
  submitted?: number;
  score?: number | null;
  class_name?: string;
  question_count?: number;
  participant_count?: number;
  avg_score?: number | null;
  highest_score?: number | null;
  lowest_score?: number | null;
  submitted_at?: string | null;
}

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_answer?: string;
  points: number;
}

export async function createQuiz(classId: string, title: string, description: string, timeLimit: number, quizType: string = 'quiz', scheduledAt: string | null = null, weight: number = 10) {
  return fetchJson<{ success: boolean; quiz?: Quiz; message?: string }>('/api/quizzes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ class_id: classId, title, description, time_limit_minutes: timeLimit, quiz_type: quizType, scheduled_at: scheduledAt, weight }),
  });
}

export async function addQuestion(quizId: number, data: { question_text: string; option_a: string; option_b: string; option_c?: string; option_d?: string; correct_answer: string; points?: number }) {
  return fetchJson<{ success: boolean; question?: QuizQuestion; message?: string }>(`/api/quizzes/${quizId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function publishQuiz(quizId: number) {
  return fetchJson<{ success: boolean }>(`/api/quizzes/${quizId}/publish`, { method: 'POST' });
}

export async function updateQuiz(quizId: number, data: { title: string; description: string; time_limit_minutes: number; quiz_type: string; scheduled_at: string | null; weight: number }) {
  return fetchJson<{ success: boolean; quiz?: Quiz }>(`/api/quizzes/${quizId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateQuestion(quizId: number, questionId: number, data: { question_text: string; option_a: string; option_b: string; option_c?: string; option_d?: string; correct_answer: string; points?: number }) {
  return fetchJson<{ success: boolean }>(`/api/quizzes/${quizId}/questions/${questionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteQuestion(quizId: number, questionId: number) {
  return fetchJson<{ success: boolean }>(`/api/quizzes/${quizId}/questions/${questionId}`, { method: 'DELETE' });
}

export interface SubmissionDetail {
  questionId: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_answer: string;
  student_answer: string | null;
  is_correct: boolean;
  points: number;
}

export interface SubmissionReview {
  score: number;
  submitted_at: string | null;
  details: SubmissionDetail[];
}

export async function getMySubmissionReview(quizId: number) {
  return fetchJson<{ success: boolean } & SubmissionReview>(`/api/quizzes/${quizId}/my-submission`);
}

export async function closeQuiz(quizId: number) {
  return fetchJson<{ success: boolean }>(`/api/quizzes/${quizId}/close`, { method: 'POST' });
}

export async function deleteQuiz(quizId: number) {
  return fetchJson<{ success: boolean }>(`/api/quizzes/${quizId}`, { method: 'DELETE' });
}

export async function getMyQuizzes() {
  return fetchJson<{ success: boolean; quizzes: Quiz[] }>('/api/quizzes/my');
}

export async function getQuiz(quizId: number) {
  return fetchJson<{ success: boolean; quiz: Quiz; questions: QuizQuestion[]; submission?: Record<string, unknown>; message?: string }>(`/api/quizzes/${quizId}`);
}

export interface QuizSubmission {
  id: number;
  student_name: string;
  score: number;
  submitted_at: string | null;
}

export async function getQuizSubmissions(quizId: number) {
  return fetchJson<{ success: boolean; submissions: QuizSubmission[] }>(`/api/quizzes/${quizId}/submissions`);
}

export async function getAvailableQuizzes() {
  return fetchJson<{ success: boolean; quizzes: Quiz[] }>('/api/quizzes/student/available');
}

export async function startQuiz(quizId: number) {
  return fetchJson<{ success: boolean; submission?: Record<string, unknown>; message?: string }>(`/api/quizzes/${quizId}/start`, { method: 'POST' });
}

export async function submitQuiz(quizId: number, answers: Record<number, string>) {
  return fetchJson<{ success: boolean; score?: number; total?: number; message?: string }>(`/api/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
}

export async function adminGetAllQuizzes() {
  return fetchJson<{ success: boolean; quizzes: (Quiz & { teacher_name: string; class_name: string | null })[] }>('/api/quizzes/admin/all');
}

export interface QuizStats {
  totalQuizzes: number;
  totalSubmissions: number;
  avgScore: number;
  weightedAvg: number;
  passedCount: number;
  failedCount: number;
  bestScore?: number;
}

export async function getTeacherQuizStats() {
  return fetchJson<{ success: boolean; stats: QuizStats }>('/api/quizzes/stats/teacher');
}

export async function getStudentQuizStats() {
  return fetchJson<{ success: boolean; stats: QuizStats }>('/api/quizzes/stats/student');
}

export interface LeaderboardEntry {
  rank: number;
  studentId: number;
  name: string;
  score: number;
  percent: number;
  isMe: boolean;
}

export interface QuizLeaderboard {
  quiz: { id: number; title: string; maxScore: number };
  stats: { total: number; avgPercent: number; highest: number; lowest: number; passed: number; failed: number } | null;
  leaderboard: LeaderboardEntry[];
  myRank: number | null;
  myScore: number | null;
}

export async function getQuizLeaderboard(quizId: number) {
  return fetchJson<{ success: boolean } & QuizLeaderboard>(`/api/quizzes/${quizId}/leaderboard`);
}
