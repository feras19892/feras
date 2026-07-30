import { db } from '../../db/index.js';

export async function createQuiz(teacherId: number, classId: string | null, title: string, description: string, timeLimit: number) {
  const result = await db.run(
    `INSERT INTO quizzes (teacher_id, class_id, title, description, time_limit_minutes) VALUES (?, ?, ?, ?, ?)`,
    [teacherId, classId, title, description, timeLimit],
  );
  return await db.get(`SELECT * FROM quizzes WHERE id = ?`, [result.lastID]);
}

export async function addQuestion(quizId: number, questionText: string, optionA: string, optionB: string, optionC: string | null, optionD: string | null, correctAnswer: string, points: number) {
  const result = await db.run(
    `INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [quizId, questionText, optionA, optionB, optionC, optionD, correctAnswer, points],
  );
  return await db.get(`SELECT * FROM quiz_questions WHERE id = ?`, [result.lastID]);
}

export async function getQuizById(id: number) {
  return await db.get(`SELECT * FROM quizzes WHERE id = ?`, [id]);
}

export async function getQuizQuestions(quizId: number) {
  return await db.all(`SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY id`, [quizId]);
}

export async function getQuizQuestionsForStudent(quizId: number) {
  return await db.all(
    `SELECT id, quiz_id, question_text, option_a, option_b, option_c, option_d, points FROM quiz_questions WHERE quiz_id = ? ORDER BY id`,
    [quizId],
  );
}

export async function getTeacherQuizzes(teacherId: number) {
  return await db.all(`SELECT * FROM quizzes WHERE teacher_id = ? ORDER BY created_at DESC`, [teacherId]);
}

export async function getClassQuizzes(classId: string) {
  return await db.all(`SELECT * FROM quizzes WHERE class_id = ? AND status IN ('published','active','closed') ORDER BY created_at DESC`, [classId]);
}

export async function getStudentQuizzes(studentId: number) {
  return await db.all(
    `SELECT q.*, 
       CASE WHEN qs.id IS NOT NULL THEN 1 ELSE 0 END as submitted,
       qs.score as score
     FROM quizzes q
     JOIN class_students cs ON cs.class_id = q.class_id
     LEFT JOIN quiz_submissions qs ON qs.quiz_id = q.id AND qs.student_id = ?
     WHERE cs.student_id = ? AND q.status IN ('published','active','closed')
     ORDER BY q.created_at DESC`,
    [studentId, studentId],
  );
}

export async function publishQuiz(quizId: number) {
  await db.run(`UPDATE quizzes SET status = 'published', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [quizId]);
}

export async function closeQuiz(quizId: number) {
  await db.run(`UPDATE quizzes SET status = 'closed', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [quizId]);
}

export async function deleteQuiz(quizId: number) {
  await db.run(`DELETE FROM quizzes WHERE id = ?`, [quizId]);
}

export async function startSubmission(quizId: number, studentId: number) {
  const existing = await db.get(`SELECT * FROM quiz_submissions WHERE quiz_id = ? AND student_id = ?`, [quizId, studentId]);
  if (existing) return existing;
  const result = await db.run(
    `INSERT INTO quiz_submissions (quiz_id, student_id) VALUES (?, ?)`,
    [quizId, studentId],
  );
  return await db.get(`SELECT * FROM quiz_submissions WHERE id = ?`, [result.lastID]);
}

export async function submitQuiz(quizId: number, studentId: number, answers: Record<number, string>) {
  const questions = await getQuizQuestions(quizId);
  let score = 0;
  let total = 0;
  for (const q of questions) {
    total += q.points;
    if (answers[q.id] === q.correct_answer) {
      score += q.points;
    }
  }
  await db.run(
    `UPDATE quiz_submissions SET answers = ?, score = ?, submitted_at = CURRENT_TIMESTAMP WHERE quiz_id = ? AND student_id = ?`,
    [JSON.stringify(answers), score, quizId, studentId],
  );
  return { score, total };
}

export async function getSubmission(quizId: number, studentId: number) {
  return await db.get(`SELECT * FROM quiz_submissions WHERE quiz_id = ? AND student_id = ?`, [quizId, studentId]);
}

export async function getQuizSubmissions(quizId: number) {
  return await db.all(
    `SELECT qs.*, u.name as student_name, u.email as student_email 
     FROM quiz_submissions qs 
     JOIN users u ON u.id = qs.student_id 
     WHERE qs.quiz_id = ? ORDER BY qs.score DESC`,
    [quizId],
  );
}

export async function getAllQuizzes() {
  return await db.all(
    `SELECT q.*, u.name as teacher_name, c.name as class_name 
     FROM quizzes q 
     JOIN users u ON u.id = q.teacher_id 
     LEFT JOIN classes c ON c.id = q.class_id 
     ORDER BY q.created_at DESC`,
  );
}
