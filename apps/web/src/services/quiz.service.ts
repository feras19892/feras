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
  created_at: string;
  submitted?: number;
  score?: number | null;
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

export async function createQuiz(classId: string, title: string, description: string, timeLimit: number) {
  return fetchJson<{ success: boolean; quiz?: Quiz; message?: string }>('/api/quizzes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ class_id: classId, title, description, time_limit_minutes: timeLimit }),
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
  return fetchJson<{ success: boolean; quiz: Quiz; questions: QuizQuestion[]; submission?: any }>(`/api/quizzes/${quizId}`);
}

export async function getQuizSubmissions(quizId: number) {
  return fetchJson<{ success: boolean; submissions: any[] }>(`/api/quizzes/${quizId}/submissions`);
}

export async function getAvailableQuizzes() {
  return fetchJson<{ success: boolean; quizzes: Quiz[] }>('/api/quizzes/student/available');
}

export async function startQuiz(quizId: number) {
  return fetchJson<{ success: boolean; submission?: any; message?: string }>(`/api/quizzes/${quizId}/start`, { method: 'POST' });
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
