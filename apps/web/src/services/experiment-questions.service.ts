import { fetchJson } from './http';

export interface ExperimentQuestion {
  id: number;
  template_id: number;
  order_index: number;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'fill_blank' | 'ordering';
  question_text: string;
  options: string | null;
  correct_answer?: string | null;
  points: number;
  is_required: number;
}

export interface ExperimentQuestionTemplate {
  id: number;
  experiment_id: string;
  teacher_id: number;
  title: string;
  status: 'draft' | 'published' | 'archived';
  experiment_title_ar?: string;
  question_count?: number;
  questions?: ExperimentQuestion[];
  created_at: string;
  updated_at: string;
}

export interface StudentQuestion {
  id: number;
  order_index: number;
  question_type: string;
  question_text: string;
  options: string | null;
  points: number;
  is_required: number;
}

export interface ExpQuestionsStats {
  total_templates: number;
  published_templates: number;
  draft_templates: number;
  total_questions: number;
  total_assignments: number;
  total_reports: number;
  total_answers: number;
  total_score: number;
  total_max_score: number;
  average_percentage: number;
}

export interface ReportAnswer {
  id: number;
  question_id: number;
  question_text: string;
  question_type: string;
  answer_text: string;
  is_correct: number | null;
  score: number | null;
  points: number;
  teacher_score: number | null;
  feedback: string | null;
}

export interface ExperimentOption {
  id: string;
  category: string;
  subject: string;
  title_ar: string;
}

export async function getExperiments() {
  return fetchJson<{ success: boolean; experiments?: ExperimentOption[]; message?: string }>('/api/experiment-questions/experiments');
}

export interface QuestionInput {
  order_index: number;
  question_type: string;
  question_text: string;
  options?: string[] | null;
  correct_answer?: string | null;
  points?: number;
  is_required?: boolean;
}

export interface AnswerInput {
  question_id: number;
  answer_text: string;
}

export async function createTemplate(experimentId: string, title: string) {
  return fetchJson<{ success: boolean; template?: ExperimentQuestionTemplate; message?: string }>('/api/experiment-questions/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ experiment_id: experimentId, title }),
  });
}

export async function listTemplates() {
  return fetchJson<{ success: boolean; templates?: ExperimentQuestionTemplate[]; message?: string }>('/api/experiment-questions/templates');
}

export async function getTemplate(id: number) {
  return fetchJson<{ success: boolean; template?: ExperimentQuestionTemplate; questions?: ExperimentQuestion[]; message?: string }>(`/api/experiment-questions/templates/${id}`);
}

export async function updateTemplate(id: number, data: { title?: string; status?: 'draft' | 'published' | 'archived' }) {
  return fetchJson<{ success: boolean; template?: ExperimentQuestionTemplate; message?: string }>(`/api/experiment-questions/templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function publishTemplate(id: number) {
  return fetchJson<{ success: boolean; template?: ExperimentQuestionTemplate; message?: string }>(`/api/experiment-questions/templates/${id}/publish`, { method: 'POST' });
}

export async function addQuestion(templateId: number, data: QuestionInput) {
  return fetchJson<{ success: boolean; question?: ExperimentQuestion; message?: string }>(`/api/experiment-questions/templates/${templateId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateQuestion(templateId: number, questionId: number, data: QuestionInput) {
  return fetchJson<{ success: boolean; question?: ExperimentQuestion; message?: string }>(`/api/experiment-questions/templates/${templateId}/questions/${questionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteQuestion(templateId: number, questionId: number) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/experiment-questions/templates/${templateId}/questions/${questionId}`, { method: 'DELETE' });
}

export async function assignTemplate(templateId: number, classId: string) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/experiment-questions/templates/${templateId}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ class_id: classId }),
  });
}

export async function deleteTemplate(templateId: number) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/experiment-questions/templates/${templateId}`, { method: 'DELETE' });
}

export async function getStudentQuestions(experimentId: string, classId: string) {
  return fetchJson<{ success: boolean; id?: number; title?: string; experiment_id?: string; questions?: StudentQuestion[]; message?: string }>(
    `/api/experiment-questions/student/${encodeURIComponent(experimentId)}?class_id=${encodeURIComponent(classId)}`,
  );
}

export async function submitAnswers(reportId: number, answers: AnswerInput[]) {
  return fetchJson<{ success: boolean; question_score?: number; question_max_score?: number; message?: string }>(
    `/api/experiment-questions/reports/${reportId}/answers`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    },
  );
}

export async function getReportAnswers(reportId: number) {
  return fetchJson<{ success: boolean; answers?: ReportAnswer[]; message?: string }>(`/api/experiment-questions/reports/${reportId}/answers`);
}

export async function getStats() {
  return fetchJson<{ success: boolean; stats?: ExpQuestionsStats; message?: string }>('/api/experiment-questions/stats');
}
