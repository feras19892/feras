import { db, dbAll, dbGet, dbRun } from '../../db/index.js';

export interface QuestionInput {
  order_index: number;
  question_type: string;
  question_text: string;
  options?: string[] | null;
  correct_answer?: string | null;
  points: number;
  is_required: boolean;
}

export interface AnswerInput {
  question_id: number;
  answer_text: string;
}

export async function getExperiments() {
  return dbAll<{ id: string; category: string; subject: string; title_ar: string }>(
    `SELECT id, category, subject, title_ar FROM experiments WHERE is_active = 1 ORDER BY category, title_ar`,
  );
}

export interface QuestionTemplateRow {
  id: number;
  experiment_id: string;
  teacher_id: number;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function createTemplate(experimentId: string, teacherId: number, title: string) {
  const result = await dbRun(
    `INSERT INTO experiment_question_templates (experiment_id, teacher_id, title, status) VALUES (?, ?, ?, 'draft')`,
    experimentId, teacherId, title,
  );
  return dbGet(`SELECT * FROM experiment_question_templates WHERE id = ?`, result.lastID);
}

export async function getTemplateById(id: number) {
  return dbGet<QuestionTemplateRow>(`SELECT * FROM experiment_question_templates WHERE id = ?`, id);
}

export async function getTemplateWithQuestions(id: number) {
  const template = await dbGet<{
    id: number; experiment_id: string; teacher_id: number; title: string; status: string; created_at: string; updated_at: string;
  }>(`SELECT * FROM experiment_question_templates WHERE id = ?`, id);
  if (!template) return null;
  const questions = await dbAll<
    { id: number; order_index: number; question_type: string; question_text: string; options: string; correct_answer: string; points: number; is_required: number }
  >(
    `SELECT * FROM experiment_template_questions WHERE template_id = ? ORDER BY order_index, id`,
    id,
  );
  return { ...template, questions };
}

export async function getTemplateWithQuestionsForStudent(id: number) {
  const template = await dbGet<{ id: number; title: string; experiment_id: string }>(
    `SELECT id, title, experiment_id FROM experiment_question_templates WHERE id = ? AND status = 'published'`,
    id,
  );
  if (!template) return null;
  const questions = await dbAll<
    { id: number; order_index: number; question_type: string; question_text: string; options: string; points: number; is_required: number }
  >(
    `SELECT id, order_index, question_type, question_text, options, points, is_required
     FROM experiment_template_questions WHERE template_id = ? ORDER BY order_index, id`,
    id,
  );
  return { ...template, questions };
}

export async function listTeacherTemplates(teacherId: number) {
  return dbAll<
    { id: number; experiment_id: string; title: string; status: string; experiment_title_ar: string; question_count: number; created_at: string }
  >(
    `SELECT t.id, t.experiment_id, t.title, t.status, e.title_ar as experiment_title_ar,
       (SELECT COUNT(*) FROM experiment_template_questions q WHERE q.template_id = t.id) as question_count,
       t.created_at
     FROM experiment_question_templates t
     JOIN experiments e ON e.id = t.experiment_id
     WHERE t.teacher_id = ?
     ORDER BY t.updated_at DESC`,
    teacherId,
  );
}

export async function updateTemplate(id: number, teacherId: number, title?: string, status?: string) {
  const sets: string[] = [];
  const values: (string | number | null)[] = [];
  if (title !== undefined) { sets.push('title = ?'); values.push(title); }
  if (status !== undefined) { sets.push('status = ?'); values.push(status); }
  if (sets.length === 0) return getTemplateById(id);
  sets.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id, teacherId);
  await dbRun(`UPDATE experiment_question_templates SET ${sets.join(', ')} WHERE id = ? AND teacher_id = ?`, ...values);
  return getTemplateById(id);
}

export async function publishTemplate(id: number, teacherId: number) {
  const template = await getTemplateById(id);
  if (!template) return null;
  await dbRun(
    `UPDATE experiment_question_templates
     SET status = CASE
       WHEN id = ? THEN 'published'
       ELSE 'archived'
     END,
     updated_at = CURRENT_TIMESTAMP
     WHERE experiment_id = ? AND teacher_id = ?`,
    id, template.experiment_id, teacherId,
  );
  return getTemplateById(id);
}

export async function addQuestion(templateId: number, q: QuestionInput) {
  const result = await dbRun(
    `INSERT INTO experiment_template_questions
     (template_id, order_index, question_type, question_text, options, correct_answer, points, is_required)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    templateId,
    q.order_index,
    q.question_type,
    q.question_text,
    q.options ? JSON.stringify(q.options) : null,
    q.correct_answer ?? null,
    q.points,
    q.is_required ? 1 : 0,
  );
  return dbGet(`SELECT * FROM experiment_template_questions WHERE id = ?`, result.lastID);
}

export async function getQuestionById(id: number) {
  return dbGet(`SELECT * FROM experiment_template_questions WHERE id = ?`, id);
}

export async function updateQuestion(questionId: number, q: QuestionInput) {
  await dbRun(
    `UPDATE experiment_template_questions
     SET order_index = ?, question_type = ?, question_text = ?, options = ?, correct_answer = ?, points = ?, is_required = ?
     WHERE id = ?`,
    q.order_index, q.question_type, q.question_text,
    q.options ? JSON.stringify(q.options) : null,
    q.correct_answer ?? null,
    q.points, q.is_required ? 1 : 0,
    questionId,
  );
  return getQuestionById(questionId);
}

export async function deleteQuestion(questionId: number) {
  await dbRun(`DELETE FROM experiment_template_questions WHERE id = ?`, questionId);
}

export async function deleteTemplate(templateId: number, teacherId: number, isAdmin: boolean) {
  const template = await getTemplateById(templateId);
  if (!template) return { error: 'Template not found' };
  if (template.teacher_id !== teacherId && !isAdmin) return { error: 'Not your template' };
  const used = await dbGet<{ cnt: number }>(
    `SELECT COUNT(*) as cnt FROM experiment_report_answers WHERE template_id = ?`,
    templateId,
  );
  if (used && used.cnt > 0) return { error: 'Template already used in reports' };
  await dbRun(`DELETE FROM experiment_template_questions WHERE template_id = ?`, templateId);
  await dbRun(`DELETE FROM experiment_question_templates WHERE id = ?`, templateId);
  return { success: true };
}

export async function assignTemplateToClass(templateId: number, classId: string, teacherId: number) {
  const template = await getTemplateById(templateId);
  if (!template) return { error: 'Template not found' };
  await dbRun(
    `INSERT INTO class_experiment_assignments (class_id, experiment_id, template_id, assigned_by)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(class_id, experiment_id) DO UPDATE SET
       template_id = excluded.template_id,
       assigned_by = excluded.assigned_by,
       assigned_at = CURRENT_TIMESTAMP`,
    classId, template.experiment_id, templateId, teacherId,
  );
  return { success: true };
}

export async function getActiveTemplateForClass(classId: string, experimentId: string) {
  const row = await dbGet<{ template_id: number }>(
    `SELECT a.template_id FROM class_experiment_assignments a
     JOIN experiment_question_templates t ON t.id = a.template_id
     WHERE a.class_id = ? AND a.experiment_id = ? AND t.status = 'published'`,
    classId, experimentId,
  );
  if (!row) return null;
  return getTemplateWithQuestionsForStudent(row.template_id);
}

export async function getReportById(reportId: number) {
  return dbGet<{ id: number; student_id: number; class_id: string; experiment_id: string; question_template_id: number | null; status: string }>(
    `SELECT id, student_id, class_id, experiment_id, question_template_id, status FROM experiment_reports WHERE id = ?`,
    reportId,
  );
}

export async function submitAnswers(reportId: number, answers: AnswerInput[]) {
  const report = await getReportById(reportId);
  if (!report) return { error: 'Report not found' };
  if (report.status === 'graded') return { error: 'Cannot edit answers after grading' };

  const template = await getTemplateWithQuestions(Number(report.question_template_id));
  if (!template) return { error: 'Question template not found for this report' };

  const questionMap = new Map(template.questions.map(q => [q.id, q]));
  let totalScore = 0;
  let totalPoints = 0;

  for (const a of answers) {
    const q = questionMap.get(a.question_id);
    if (!q) continue;
    totalPoints += q.points;
    let isCorrect: number | null = null;
    let score = 0;
    if (q.question_type === 'multiple_choice' || q.question_type === 'true_false' || q.question_type === 'ordering' || q.question_type === 'fill_blank') {
      if (q.correct_answer != null) {
        isCorrect = a.answer_text.trim().toLowerCase() === q.correct_answer.trim().toLowerCase() ? 1 : 0;
        score = isCorrect ? q.points : 0;
      }
    }
    if (score > 0) totalScore += score;

    await dbRun(
      `INSERT INTO experiment_report_answers
       (report_id, question_id, template_id, answer_text, is_correct, score)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(report_id, question_id) DO UPDATE SET
         answer_text = excluded.answer_text,
         is_correct = excluded.is_correct,
         score = excluded.score,
         updated_at = CURRENT_TIMESTAMP`,
      reportId, a.question_id, template.id, a.answer_text, isCorrect, score,
    );
  }

  await dbRun(
    `UPDATE experiment_reports
     SET question_score = ?, question_max_score = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    totalScore, totalPoints, reportId,
  );

  return { success: true, question_score: totalScore, question_max_score: totalPoints };
}

export async function getAnswersForReport(reportId: number) {
  return dbAll<
    { id: number; question_id: number; question_text: string; question_type: string; answer_text: string; is_correct: number | null; score: number | null; points: number; teacher_score: number | null; feedback: string | null }
  >(
    `SELECT a.id, a.question_id, q.question_text, q.question_type, a.answer_text, a.is_correct,
       a.score, q.points, a.teacher_score, a.feedback
     FROM experiment_report_answers a
     JOIN experiment_template_questions q ON q.id = a.question_id
     WHERE a.report_id = ?
     ORDER BY q.order_index, q.id`,
    reportId,
  );
}

export * from './stats.js';
