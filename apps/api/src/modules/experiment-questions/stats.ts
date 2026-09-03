import { dbGet } from '../../db/index.js';

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

function normalizeScore(score?: number | null, max?: number | null): { total_score: number; total_max: number; percentage: number } {
  const s = score ?? 0;
  const m = max ?? 0;
  if (!m) return { total_score: s, total_max: 0, percentage: 0 };
  return { total_score: s, total_max: m, percentage: (s / m) * 100 };
}

export async function getAdminStats(): Promise<ExpQuestionsStats> {
  const templates = await dbGet<{ total: number; published: number; draft: number }>(
    `SELECT
       COUNT(*) as total,
       SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
       SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft
     FROM experiment_question_templates`,
  ) ?? { total: 0, published: 0, draft: 0 };

  const questions = await dbGet<{ count: number }>(`SELECT COUNT(*) as count FROM experiment_template_questions`) ?? { count: 0 };
  const assignments = await dbGet<{ count: number }>(`SELECT COUNT(*) as count FROM class_experiment_assignments`) ?? { count: 0 };
  const answers = await dbGet<{ count: number }>(`SELECT COUNT(*) as count FROM experiment_report_answers`) ?? { count: 0 };
  const reports = await dbGet<{ count: number; score: number; max_score: number }>(
    `SELECT COUNT(*) as count,
            COALESCE(SUM(question_score), 0) as score,
            COALESCE(SUM(question_max_score), 0) as max_score
     FROM experiment_reports
     WHERE question_template_id IS NOT NULL`,
  ) ?? { count: 0, score: 0, max_score: 0 };

  const norm = normalizeScore(reports.score, reports.max_score);

  return {
    total_templates: templates.total,
    published_templates: templates.published,
    draft_templates: templates.draft,
    total_questions: questions.count,
    total_assignments: assignments.count,
    total_reports: reports.count,
    total_answers: answers.count,
    total_score: norm.total_score,
    total_max_score: norm.total_max,
    average_percentage: Math.round((norm.percentage + Number.EPSILON) * 100) / 100,
  };
}

export async function getTeacherStats(teacherId: number): Promise<ExpQuestionsStats> {
  const templates = await dbGet<{ total: number; published: number; draft: number }>(
    `SELECT
       COUNT(*) as total,
       SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
       SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft
     FROM experiment_question_templates
     WHERE teacher_id = ?`,
    teacherId,
  ) ?? { total: 0, published: 0, draft: 0 };

  const questions = await dbGet<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM experiment_template_questions q
     JOIN experiment_question_templates t ON t.id = q.template_id
     WHERE t.teacher_id = ?`,
    teacherId,
  ) ?? { count: 0 };

  const assignments = await dbGet<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM class_experiment_assignments a
     JOIN experiment_question_templates t ON t.id = a.template_id
     WHERE t.teacher_id = ?`,
    teacherId,
  ) ?? { count: 0 };

  const answers = await dbGet<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM experiment_report_answers a
     JOIN experiment_reports r ON r.id = a.report_id
     JOIN experiment_question_templates t ON t.id = r.question_template_id
     WHERE t.teacher_id = ?`,
    teacherId,
  ) ?? { count: 0 };

  const reports = await dbGet<{ count: number; score: number; max_score: number }>(
    `SELECT COUNT(*) as count,
            COALESCE(SUM(r.question_score), 0) as score,
            COALESCE(SUM(r.question_max_score), 0) as max_score
     FROM experiment_reports r
     JOIN experiment_question_templates t ON t.id = r.question_template_id
     WHERE t.teacher_id = ? AND r.question_template_id IS NOT NULL`,
    teacherId,
  ) ?? { count: 0, score: 0, max_score: 0 };

  const norm = normalizeScore(reports.score, reports.max_score);

  return {
    total_templates: templates.total,
    published_templates: templates.published,
    draft_templates: templates.draft,
    total_questions: questions.count,
    total_assignments: assignments.count,
    total_reports: reports.count,
    total_answers: answers.count,
    total_score: norm.total_score,
    total_max_score: norm.total_max,
    average_percentage: Math.round((norm.percentage + Number.EPSILON) * 100) / 100,
  };
}
