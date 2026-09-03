import { db, dbAll, dbGet } from '../../db/index.js';
import { dispatchEvent } from '../notifications/dispatch.js';

export async function createQuiz(teacherId: number, classId: string | null, title: string, description: string, timeLimit: number, quizType: string = 'quiz', scheduledAt: string | null = null, weight: number = 10) {
  const result = await db.run(
    `INSERT INTO quizzes (teacher_id, class_id, title, description, time_limit_minutes, quiz_type, scheduled_at, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    teacherId, classId, title, description, timeLimit, quizType, scheduledAt, weight,
  );
  return await db.get(`SELECT * FROM quizzes WHERE id = ?`, result.lastID);
}

export async function addQuestion(quizId: number, questionText: string, optionA: string, optionB: string, optionC: string | null, optionD: string | null, correctAnswer: string, points: number) {
  const result = await db.run(
    `INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    quizId, questionText, optionA, optionB, optionC, optionD, correctAnswer, points,
  );
  await recalcMaxScore(quizId);
  return await db.get(`SELECT * FROM quiz_questions WHERE id = ?`, result.lastID);
}

export async function updateQuestion(questionId: number, questionText: string, optionA: string, optionB: string, optionC: string | null, optionD: string | null, correctAnswer: string, points: number) {
  await db.run(
    `UPDATE quiz_questions SET question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_answer = ?, points = ? WHERE id = ?`,
    questionText, optionA, optionB, optionC, optionD, correctAnswer, points, questionId,
  );
  const row = await db.get<{ quiz_id: number }>(`SELECT quiz_id FROM quiz_questions WHERE id = ?`, questionId);
  if (row) await recalcMaxScore(row.quiz_id);
  return await db.get(`SELECT * FROM quiz_questions WHERE id = ?`, questionId);
}

export async function deleteQuestion(questionId: number) {
  const row = await db.get<{ quiz_id: number }>(`SELECT quiz_id FROM quiz_questions WHERE id = ?`, questionId);
  await db.run(`DELETE FROM quiz_questions WHERE id = ?`, questionId);
  if (row) await recalcMaxScore(row.quiz_id);
}

export async function updateQuiz(quizId: number, title: string, description: string, timeLimit: number, quizType: string, scheduledAt: string | null, weight: number) {
  await db.run(
    `UPDATE quizzes SET title = ?, description = ?, time_limit_minutes = ?, quiz_type = ?, scheduled_at = ?, weight = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    title, description, timeLimit, quizType, scheduledAt, weight, quizId,
  );
  return await db.get(`SELECT * FROM quizzes WHERE id = ?`, quizId);
}

async function recalcMaxScore(quizId: number) {
  const row = await db.get<{ total: number | null }>(`SELECT COALESCE(SUM(points), 0) as total FROM quiz_questions WHERE quiz_id = ?`, quizId);
  await db.run(`UPDATE quizzes SET max_score = ? WHERE id = ?`, row?.total ?? 0, quizId);
}

export async function getQuizById(id: number) {
  return await db.get(`SELECT * FROM quizzes WHERE id = ?`, id);
}

export async function getQuizQuestions(quizId: number) {
  return await db.all(`SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY id`, quizId);
}

export async function getQuizQuestionsForStudent(quizId: number) {
  return await db.all(
    `SELECT id, quiz_id, question_text, option_a, option_b, option_c, option_d, points FROM quiz_questions WHERE quiz_id = ? ORDER BY id`,
    quizId,
  );
}

export async function getTeacherQuizzes(teacherId: number) {
  return await db.all(
    `SELECT q.*,
       c.name as class_name,
       (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count,
       (SELECT COUNT(*) FROM quiz_submissions WHERE quiz_id = q.id AND submitted_at IS NOT NULL) as participant_count,
       (SELECT ROUND(AVG(score * 100.0 / q.max_score), 1) FROM quiz_submissions WHERE quiz_id = q.id AND submitted_at IS NOT NULL) as avg_score,
       (SELECT MAX(score) FROM quiz_submissions WHERE quiz_id = q.id AND submitted_at IS NOT NULL) as highest_score,
       (SELECT MIN(score) FROM quiz_submissions WHERE quiz_id = q.id AND submitted_at IS NOT NULL) as lowest_score
     FROM quizzes q
     LEFT JOIN classes c ON c.id = q.class_id
     WHERE q.teacher_id = ?
     ORDER BY q.created_at DESC`,
    teacherId,
  );
}

export async function getClassQuizzes(classId: string) {
  return await db.all(`SELECT * FROM quizzes WHERE class_id = ? AND status IN ('published','active','closed') ORDER BY created_at DESC`, classId);
}

export async function getStudentQuizzes(studentId: number) {
  return await db.all(
    `SELECT q.*, 
       CASE WHEN qs.id IS NOT NULL THEN 1 ELSE 0 END as submitted,
       qs.score as score,
       qs.submitted_at as submitted_at
     FROM quizzes q
     JOIN class_students cs ON cs.class_id = q.class_id
     LEFT JOIN quiz_submissions qs ON qs.quiz_id = q.id AND qs.student_id = ?
     WHERE cs.student_id = ? AND q.status IN ('published','active','closed')
     ORDER BY q.created_at DESC`,
    studentId, studentId,
  );
}

export async function publishQuiz(quizId: number) {
  const existing = await db.get<{ status: string }>(`SELECT status FROM quizzes WHERE id = ?`, quizId);
  if (existing?.status === 'closed') {
    await db.run(`DELETE FROM quiz_submissions WHERE quiz_id = ?`, quizId);
  }
  await db.run(`UPDATE quizzes SET status = 'published', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, quizId);
  const quiz = await db.get<{ teacher_id: number; class_id: string | null; title: string }>(`SELECT teacher_id, class_id, title FROM quizzes WHERE id = ?`, quizId);
  if (quiz && quiz.class_id) {
    const teacher = await db.get<{ name: string }>('SELECT name FROM users WHERE id = ?', quiz.teacher_id);
    await dispatchEvent({
      type: 'quiz_created',
      actorId: quiz.teacher_id,
      actorName: teacher?.name || 'مدرس',
      actorRole: 'teacher',
      payload: { quizId, classId: quiz.class_id },
    });
  }
}

export async function closeQuiz(quizId: number) {
  await db.run(`UPDATE quizzes SET status = 'closed', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, quizId);
}

export async function deleteQuiz(quizId: number) {
  await db.run('BEGIN IMMEDIATE');
  try {
    await db.run(`DELETE FROM quiz_submissions WHERE quiz_id = ?`, quizId);
    await db.run(`DELETE FROM quiz_questions WHERE quiz_id = ?`, quizId);
    await db.run(`DELETE FROM quizzes WHERE id = ?`, quizId);
    await db.run('COMMIT');
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }
}

export async function startSubmission(quizId: number, studentId: number) {
  const quiz = await getQuizById(quizId);
  if (!quiz) return null;
  if (quiz.status === 'draft') return null;
  if (quiz.status === 'closed') return null;
  if (quiz.class_id) {
    const member = await db.get(
      `SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?`,
      quiz.class_id, studentId,
    );
    if (!member) return null;
  }
  const existing = await db.get(`SELECT * FROM quiz_submissions WHERE quiz_id = ? AND student_id = ?`, quizId, studentId);
  if (existing) return existing;
  const result = await db.run(
    `INSERT INTO quiz_submissions (quiz_id, student_id) VALUES (?, ?)`,
    quizId, studentId,
  );
  return await db.get(`SELECT * FROM quiz_submissions WHERE id = ?`, result.lastID);
}

export async function submitQuiz(quizId: number, studentId: number, answers: Record<number, string>) {
  const quiz = await getQuizById(quizId);
  if (!quiz) return { score: 0, total: 0, error: 'Quiz not found' };
  if (quiz.status === 'draft') return { score: 0, total: 0, error: 'Quiz not published' };
  if (quiz.status === 'closed') return { score: 0, total: 0, error: 'Quiz is closed' };

  // Check if already submitted
  const existingSub = await db.get<{ submitted_at: string | null; started_at: string | null }>(
    `SELECT submitted_at, started_at FROM quiz_submissions WHERE quiz_id = ? AND student_id = ?`, quizId, studentId
  );
  if (existingSub?.submitted_at) return { score: 0, total: 0, error: 'Already submitted' };

  // Check time limit
  if (existingSub?.started_at && quiz.time_limit_minutes > 0) {
    const elapsed = (Date.now() - new Date(existingSub.started_at).getTime()) / 1000;
    const maxSeconds = quiz.time_limit_minutes * 60 + 60; // 60s grace
    if (elapsed > maxSeconds) return { score: 0, total: 0, error: 'Time expired' };
  }

  // Verify student is a member of the quiz's class
  if (quiz.class_id) {
    const member = await db.get(
      `SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?`,
      quiz.class_id, studentId,
    );
    if (!member) return { score: 0, total: 0, error: 'Not enrolled in this class' };
  }

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
    JSON.stringify(answers), score, quizId, studentId,
  );
  return { score, total };
}

export async function getSubmission(quizId: number, studentId: number) {
  return await db.get(`SELECT * FROM quiz_submissions WHERE quiz_id = ? AND student_id = ?`, quizId, studentId);
}

export async function getQuizSubmissions(quizId: number) {
  return await db.all(
    `SELECT qs.*, u.name as student_name, u.email as student_email 
     FROM quiz_submissions qs 
     JOIN users u ON u.id = qs.student_id 
     WHERE qs.quiz_id = ? AND qs.submitted_at IS NOT NULL ORDER BY qs.score DESC`,
    quizId,
  );
}

export async function getSubmissionDetails(quizId: number, studentId: number) {
  const sub = await db.get<{ id: number; score: number; answers: string | null; submitted_at: string | null }>(
    `SELECT id, score, answers, submitted_at FROM quiz_submissions WHERE quiz_id = ? AND student_id = ? AND submitted_at IS NOT NULL`,
    quizId, studentId,
  );
  if (!sub) return null;
  const questions = await dbAll<{ id: number; question_text: string; option_a: string; option_b: string; option_c: string | null; option_d: string | null; correct_answer: string; points: number }>(
    `SELECT id, question_text, option_a, option_b, option_c, option_d, correct_answer, points FROM quiz_questions WHERE quiz_id = ? ORDER BY id`,
    quizId,
  );
  const studentAnswers: Record<number, string> = sub.answers ? JSON.parse(sub.answers) : {};
  const details = questions.map(q => ({
    questionId: q.id,
    question_text: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_answer: q.correct_answer,
    student_answer: studentAnswers[q.id] || null,
    is_correct: studentAnswers[q.id] === q.correct_answer,
    points: q.points,
  }));
  return { score: sub.score, submitted_at: sub.submitted_at, details };
}

export async function getQuizLeaderboard(quizId: number, studentId: number) {
  const quiz = await db.get<{ id: number; max_score: number; title: string; class_id: string | null; status: string }>(
    `SELECT id, max_score, title, class_id, status FROM quizzes WHERE id = ?`, quizId
  );
  if (!quiz) return null;

  const subs = await dbAll<{ student_id: number; score: number; submitted_at: string; name: string }>(
    `SELECT qs.student_id, qs.score, qs.submitted_at, u.name
     FROM quiz_submissions qs
     JOIN users u ON u.id = qs.student_id
     WHERE qs.quiz_id = ? AND qs.submitted_at IS NOT NULL
     ORDER BY qs.score DESC, qs.submitted_at ASC`,
    quizId
  );

  if (subs.length === 0) {
    return { quiz: { id: quiz.id, title: quiz.title, maxScore: quiz.max_score }, stats: null, leaderboard: [], myRank: null, myScore: null };
  }

  const maxScore = quiz.max_score || 1;
  const scores = subs.map(s => s.score);
  const avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length / maxScore) * 100);
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);
  const passed = scores.filter(s => s >= maxScore * 0.5).length;
  const failed = subs.length - passed;

  const leaderboard = subs.map((s, i) => ({
    rank: i + 1,
    studentId: s.student_id,
    name: s.name,
    score: s.score,
    percent: Math.round((s.score / maxScore) * 100),
    isMe: s.student_id === studentId,
  }));

  const myIdx = subs.findIndex(s => s.student_id === studentId);
  const myRank = myIdx >= 0 ? myIdx + 1 : null;
  const myScore = myIdx >= 0 ? subs[myIdx].score : null;

  return {
    quiz: { id: quiz.id, title: quiz.title, maxScore: quiz.max_score },
    stats: { total: subs.length, avgPercent: avg, highest, lowest, passed, failed },
    leaderboard,
    myRank,
    myScore,
  };
}

export async function getAllQuizzes(schoolId?: number, teacherId?: number) {
  const conditions: string[] = [];
  const params: number[] = [];
  if (schoolId) {
    conditions.push('u.school_id = ?');
    params.push(schoolId);
  }
  if (teacherId) {
    conditions.push('q.teacher_id = ?');
    params.push(teacherId);
  }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  return await db.all(
    `SELECT q.*, u.name as teacher_name, c.name as class_name 
     FROM quizzes q 
     JOIN users u ON u.id = q.teacher_id 
     LEFT JOIN classes c ON c.id = q.class_id 
     ${where}
     ORDER BY q.created_at DESC`,
    ...params,
  );
}

export async function getTeacherQuizStats(teacherId: number) {
  const quizzes = await dbAll<{ id: number; max_score: number; weight: number; class_id: string }>(
    `SELECT id, max_score, weight, class_id FROM quizzes WHERE teacher_id = ?`, teacherId
  );
  const quizIds = quizzes.map(q => q.id);
  if (quizIds.length === 0) {
    return { totalQuizzes: 0, totalSubmissions: 0, avgScore: 0, weightedAvg: 0, passedCount: 0, failedCount: 0 };
  }
  const subs = await dbAll<{ quiz_id: number; score: number; student_id: number }>(
    `SELECT quiz_id, score, student_id FROM quiz_submissions WHERE quiz_id IN (${quizIds.map(() => '?').join(',')}) AND submitted_at IS NOT NULL`,
    ...quizIds
  );
  const totalSubmissions = subs.length;
  let weightedSum = 0, weightSum = 0, passedCount = 0, failedCount = 0;
  for (const s of subs) {
    const quiz = quizzes.find(q => q.id === s.quiz_id);
    if (!quiz || quiz.max_score === 0) continue;
    const percent = (s.score / quiz.max_score) * 100;
    const weight = quiz.weight || 10;
    weightedSum += percent * weight;
    weightSum += weight;
    if (percent >= 50) passedCount++; else failedCount++;
  }
  const avgScore = totalSubmissions > 0 ? Math.round(subs.reduce((sum, s) => {
    const quiz = quizzes.find(q => q.id === s.quiz_id);
    return sum + (quiz && quiz.max_score > 0 ? (s.score / quiz.max_score) * 100 : 0);
  }, 0) / totalSubmissions) : 0;
  const weightedAvg = weightSum > 0 ? Math.round(weightedSum / weightSum) : 0;
  return { totalQuizzes: quizzes.length, totalSubmissions, avgScore, weightedAvg, passedCount, failedCount };
}

export async function getStudentQuizStats(studentId: number) {
  const subs = await dbAll<{ quiz_id: number; score: number; submitted_at: string }>(
    `SELECT quiz_id, score, submitted_at FROM quiz_submissions WHERE student_id = ? AND submitted_at IS NOT NULL`,
    studentId
  );
  if (subs.length === 0) {
    return { totalQuizzes: 0, totalSubmissions: 0, avgScore: 0, weightedAvg: 0, passedCount: 0, failedCount: 0, bestScore: 0 };
  }
  const quizIds = subs.map(s => s.quiz_id);
  const quizzes = await dbAll<{ id: number; max_score: number; weight: number }>(
    `SELECT id, max_score, weight FROM quizzes WHERE id IN (${quizIds.map(() => '?').join(',')})`,
    ...quizIds
  );
  let weightedSum = 0, weightSum = 0, passedCount = 0, failedCount = 0, bestPercent = 0;
  for (const s of subs) {
    const quiz = quizzes.find(q => q.id === s.quiz_id);
    if (!quiz || quiz.max_score === 0) continue;
    const percent = (s.score / quiz.max_score) * 100;
    const weight = quiz.weight || 10;
    weightedSum += percent * weight;
    weightSum += weight;
    if (percent >= 50) passedCount++; else failedCount++;
    if (percent > bestPercent) bestPercent = percent;
  }
  const avgScore = Math.round(subs.reduce((sum, s) => {
    const quiz = quizzes.find(q => q.id === s.quiz_id);
    return sum + (quiz && quiz.max_score > 0 ? (s.score / quiz.max_score) * 100 : 0);
  }, 0) / subs.length);
  const weightedAvg = weightSum > 0 ? Math.round(weightedSum / weightSum) : 0;
  return { totalQuizzes: subs.length, totalSubmissions: subs.length, avgScore, weightedAvg, passedCount, failedCount, bestScore: Math.round(bestPercent) };
}
