import { db } from '../../db/index.js';

export async function getTeacherEvaluation(schoolId: number) {
  const teachers = await db.all(
    `SELECT id, name, email, created_at, blocked_at FROM users WHERE school_id = ? AND role = 'teacher' ORDER BY name`,
    schoolId,
  );

  const evaluations = [];
  for (const teacher of teachers) {
    const classes = await db.all('SELECT id, name FROM classes WHERE teacher_id = ?', teacher.id);

    let totalStudents = 0;
    let totalReports = 0;
    let gradedReports = 0;
    let pendingReports = 0;
    let totalGradeSum = 0;
    let gradedWithGrade = 0;
    let quizCount = 0;
    let quizSubmissions = 0;

    for (const cls of classes) {
      const sc = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM class_students WHERE class_id = ?', cls.id);
      totalStudents += sc?.count || 0;

      const rs = await db.get<{ total: number; graded: number; pending: number; grade_sum: number; graded_with_grade: number }>(
        `SELECT COUNT(*) as total,
         SUM(CASE WHEN status = 'graded' THEN 1 ELSE 0 END) as graded,
         SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as pending,
         SUM(CASE WHEN status = 'graded' AND grade IS NOT NULL THEN grade ELSE 0 END) as grade_sum,
         SUM(CASE WHEN status = 'graded' AND grade IS NOT NULL THEN 1 ELSE 0 END) as graded_with_grade
         FROM experiment_reports WHERE class_id = ?`, cls.id,
      );
      totalReports += rs?.total || 0;
      gradedReports += rs?.graded || 0;
      pendingReports += rs?.pending || 0;
      totalGradeSum += rs?.grade_sum || 0;
      gradedWithGrade += rs?.graded_with_grade || 0;

      const qc = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM quizzes WHERE class_id = ?', cls.id);
      quizCount += qc?.count || 0;

      const qs = await db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM quiz_submissions qs JOIN quizzes q ON qs.quiz_id = q.id WHERE q.class_id = ?', cls.id,
      );
      quizSubmissions += qs?.count || 0;
    }

    const avgGradingTime = await db.get<{ avg_hours: number }>(
      `SELECT AVG((julianday(r.graded_at) - julianday(r.submitted_at)) * 24) as avg_hours
       FROM experiment_reports r JOIN classes c ON r.class_id = c.id
       WHERE c.teacher_id = ? AND r.graded_at IS NOT NULL`, teacher.id,
    );

    const lastGraded = await db.get<{ graded_at: string }>(
      `SELECT r.graded_at FROM experiment_reports r JOIN classes c ON r.class_id = c.id
       WHERE c.teacher_id = ? AND r.graded_at IS NOT NULL ORDER BY r.graded_at DESC LIMIT 1`, teacher.id,
    );

    const lastReport = await db.get<{ submitted_at: string }>(
      `SELECT r.submitted_at FROM experiment_reports r JOIN classes c ON r.class_id = c.id
       WHERE c.teacher_id = ? ORDER BY r.submitted_at DESC LIMIT 1`, teacher.id,
    );

    let score = 0;
    if (totalReports > 0) score += Math.min(20, (gradedReports / totalReports) * 20);
    if (gradedWithGrade > 0) score += Math.min(20, (totalGradeSum / gradedWithGrade / 100) * 20);
    score += Math.min(15, classes.length * 3);
    score += Math.min(15, totalStudents * 0.5);
    score += Math.min(15, quizCount * 3);
    if (avgGradingTime?.avg_hours) {
      score += Math.max(0, 15 - Math.min(15, avgGradingTime.avg_hours / 4));
    } else {
      score += totalReports > 0 ? 0 : 7.5;
    }

    evaluations.push({
      ...teacher,
      class_count: classes.length,
      total_students: totalStudents,
      total_reports: totalReports,
      graded_reports: gradedReports,
      pending_reports: pendingReports,
      grading_rate: totalReports > 0 ? Math.round((gradedReports / totalReports) * 100) : 0,
      avg_grade: gradedWithGrade > 0 ? Math.round(totalGradeSum / gradedWithGrade) : 0,
      quiz_count: quizCount,
      quiz_submissions: quizSubmissions,
      avg_grading_hours: avgGradingTime?.avg_hours ? Math.round(avgGradingTime.avg_hours) : null,
      last_graded_at: lastGraded?.graded_at || null,
      last_report_at: lastReport?.submitted_at || null,
      teaching_score: Math.round(Math.min(100, score)),
      is_blocked: !!teacher.blocked_at,
    });
  }

  return evaluations;
}
