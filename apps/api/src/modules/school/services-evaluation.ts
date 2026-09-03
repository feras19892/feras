import { db } from '../../db/index.js';

export async function getTeacherEvaluation(schoolId: number) {
  interface TeacherRow { id: number; name: string; email: string; created_at: string; blocked_at: string | null }
  interface ClassRow { id: string; name: string; teacher_id: number }

  const teachers = await db.all<TeacherRow[]>(
    `SELECT id, name, email, created_at, blocked_at FROM users WHERE school_id = ? AND role = 'teacher' ORDER BY name`,
    schoolId,
  );

  if (teachers.length === 0) return [];

  const teacherIds = teachers.map(t => t.id);
  const classes = await db.all<ClassRow[]>(
    `SELECT id, name, teacher_id FROM classes WHERE teacher_id IN (${teacherIds.map(() => '?').join(',')}) ORDER BY name`,
    ...teacherIds,
  );

  const classesByTeacher: Record<number, ClassRow[]> = {};
  for (const c of classes) {
    if (!classesByTeacher[c.teacher_id]) classesByTeacher[c.teacher_id] = [];
    classesByTeacher[c.teacher_id].push(c);
  }

  const classIds = classes.map(c => c.id);
  const classStudents: Record<string, number> = {};
  const reportStats: Record<string, { total: number; graded: number; pending: number; grade_sum: number; graded_with_grade: number }> = {};
  const quizCounts: Record<string, number> = {};
  const quizSubmissionCounts: Record<string, number> = {};

  if (classIds.length > 0) {
    const ph = classIds.map(() => '?').join(',');
    const csRows = await db.all<{ class_id: string; count: number }[]>(
      `SELECT class_id, COUNT(*) as count FROM class_students WHERE class_id IN (${ph}) GROUP BY class_id`,
      ...classIds,
    );
    for (const r of csRows) classStudents[r.class_id] = r.count;

    const rsRows = await db.all<{ class_id: string; total: number; graded: number; pending: number; grade_sum: number; graded_with_grade: number }[]>(
      `SELECT class_id,
         COUNT(*) as total,
         SUM(CASE WHEN status = 'graded' THEN 1 ELSE 0 END) as graded,
         SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as pending,
         SUM(CASE WHEN status = 'graded' AND grade IS NOT NULL THEN grade ELSE 0 END) as grade_sum,
         SUM(CASE WHEN status = 'graded' AND grade IS NOT NULL THEN 1 ELSE 0 END) as graded_with_grade
       FROM experiment_reports WHERE class_id IN (${ph}) GROUP BY class_id`,
      ...classIds,
    );
    for (const r of rsRows) reportStats[r.class_id] = r;

    const qRows = await db.all<{ class_id: string; count: number }[]>(
      `SELECT class_id, COUNT(*) as count FROM quizzes WHERE class_id IN (${ph}) GROUP BY class_id`,
      ...classIds,
    );
    for (const r of qRows) quizCounts[r.class_id] = r.count;

    const qsRows = await db.all<{ class_id: string; count: number }[]>(
      `SELECT q.class_id, COUNT(*) as count FROM quiz_submissions qs JOIN quizzes q ON qs.quiz_id = q.id WHERE q.class_id IN (${ph}) GROUP BY q.class_id`,
      ...classIds,
    );
    for (const r of qsRows) quizSubmissionCounts[r.class_id] = r.count;
  }

  const teacherAgg = await db.all<{ teacher_id: number; avg_hours: number; last_graded: string; last_report: string }[]>(
    `SELECT c.teacher_id,
       AVG(CASE WHEN r.graded_at IS NOT NULL THEN (julianday(r.graded_at) - julianday(r.submitted_at)) * 24 END) as avg_hours,
       MAX(CASE WHEN r.graded_at IS NOT NULL THEN r.graded_at END) as last_graded,
       MAX(r.submitted_at) as last_report
     FROM experiment_reports r JOIN classes c ON r.class_id = c.id
     WHERE c.teacher_id IN (${teacherIds.map(() => '?').join(',')})
     GROUP BY c.teacher_id`,
    ...teacherIds,
  );
  const teacherAggMap: Record<number, { avg_hours: number; last_graded: string; last_report: string }> = {};
  for (const a of teacherAgg) teacherAggMap[a.teacher_id] = a;

  return teachers.map(teacher => {
    const tClasses = classesByTeacher[teacher.id] || [];
    let totalStudents = 0;
    let totalReports = 0;
    let gradedReports = 0;
    let pendingReports = 0;
    let totalGradeSum = 0;
    let gradedWithGrade = 0;
    let quizCount = 0;
    let quizSubmissions = 0;

    for (const cls of tClasses) {
      totalStudents += classStudents[cls.id] || 0;
      const rs = reportStats[cls.id];
      if (rs) {
        totalReports += Number(rs.total) || 0;
        gradedReports += Number(rs.graded) || 0;
        pendingReports += Number(rs.pending) || 0;
        totalGradeSum += Number(rs.grade_sum) || 0;
        gradedWithGrade += Number(rs.graded_with_grade) || 0;
      }
      quizCount += quizCounts[cls.id] || 0;
      quizSubmissions += quizSubmissionCounts[cls.id] || 0;
    }

    const agg = teacherAggMap[teacher.id];
    const avgGradingHours = agg?.avg_hours ? Math.round(agg.avg_hours) : null;

    let score = 0;
    if (totalReports > 0) score += Math.min(20, (gradedReports / totalReports) * 20);
    if (gradedWithGrade > 0) score += Math.min(20, (totalGradeSum / gradedWithGrade / 100) * 20);
    score += Math.min(15, tClasses.length * 3);
    score += Math.min(15, totalStudents * 0.5);
    score += Math.min(15, quizCount * 3);
    if (avgGradingHours != null) {
      score += Math.max(0, 15 - Math.min(15, avgGradingHours / 4));
    } else {
      score += totalReports > 0 ? 0 : 7.5;
    }

    return {
      ...teacher,
      class_count: tClasses.length,
      total_students: totalStudents,
      total_reports: totalReports,
      graded_reports: gradedReports,
      pending_reports: pendingReports,
      grading_rate: totalReports > 0 ? Math.round((gradedReports / totalReports) * 100) : 0,
      avg_grade: gradedWithGrade > 0 ? Math.round(totalGradeSum / gradedWithGrade) : 0,
      quiz_count: quizCount,
      quiz_submissions: quizSubmissions,
      avg_grading_hours: avgGradingHours,
      last_graded_at: agg?.last_graded || null,
      last_report_at: agg?.last_report || null,
      teaching_score: Math.round(Math.min(100, score)),
      is_blocked: !!teacher.blocked_at,
    };
  });
}

export async function getStudentEvaluation(schoolId: number) {
  interface StudentRow { id: number; name: string; email: string; created_at: string; blocked_at: string | null }

  const students = await db.all<StudentRow[]>(
    `SELECT id, name, email, created_at, blocked_at FROM users WHERE school_id = ? AND role = 'student' ORDER BY name`,
    schoolId,
  );

  if (students.length === 0) return [];

  const studentIds = students.map(s => s.id);
  const ph = studentIds.map(() => '?').join(',');

  const classRows = await db.all<{ student_id: number; class_id: string }[]>(
    `SELECT student_id, class_id FROM class_students WHERE student_id IN (${ph})`,
    ...studentIds,
  );
  const classesByStudent: Record<number, string[]> = {};
  for (const c of classRows) {
    if (!classesByStudent[c.student_id]) classesByStudent[c.student_id] = [];
    classesByStudent[c.student_id].push(c.class_id);
  }

  const reportStatsRows = await db.all<{
    student_id: number;
    total: number;
    graded: number;
    pending: number;
    grade_sum: number;
    graded_with_grade: number;
    last_submitted: string;
    last_graded: string;
  }[]>(
    `SELECT student_id,
       COUNT(*) as total,
       SUM(CASE WHEN status = 'graded' THEN 1 ELSE 0 END) as graded,
       SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as pending,
       SUM(CASE WHEN status = 'graded' AND grade IS NOT NULL THEN grade ELSE 0 END) as grade_sum,
       SUM(CASE WHEN status = 'graded' AND grade IS NOT NULL THEN 1 ELSE 0 END) as graded_with_grade,
       MAX(submitted_at) as last_submitted,
       MAX(graded_at) as last_graded
     FROM experiment_reports WHERE student_id IN (${ph}) GROUP BY student_id`,
    ...studentIds,
  );
  const reportStats: Record<number, { total: number; graded: number; pending: number; grade_sum: number; graded_with_grade: number; last_submitted: string; last_graded: string }> = {};
  for (const r of reportStatsRows) reportStats[r.student_id] = r;

  const quizStatsRows = await db.all<{ student_id: number; count: number }[]>(
    `SELECT student_id, COUNT(*) as count FROM quiz_submissions WHERE student_id IN (${ph}) GROUP BY student_id`,
    ...studentIds,
  );
  const quizCounts: Record<number, number> = {};
  for (const r of quizStatsRows) quizCounts[r.student_id] = r.count;

  const badgeStatsRows = await db.all<{ student_id: number; count: number }[]>(
    `SELECT student_id, COUNT(*) as count FROM student_badges WHERE student_id IN (${ph}) GROUP BY student_id`,
    ...studentIds,
  );
  const badgeCounts: Record<number, number> = {};
  for (const r of badgeStatsRows) badgeCounts[r.student_id] = r.count;

  const daysInactiveRows = await db.all<{ student_id: number; days: number }[]>(
    `SELECT student_id, COALESCE(julianday('now') - julianday(MAX(submitted_at)), 999) as days
     FROM experiment_reports WHERE student_id IN (${ph}) GROUP BY student_id`,
    ...studentIds,
  );
  const daysInactive: Record<number, number> = {};
  for (const r of daysInactiveRows) daysInactive[r.student_id] = r.days;

  return students.map(student => {
    const stats = reportStats[student.id];
    const totalReports = stats?.total || 0;
    const gradedReports = stats?.graded || 0;
    const gradedWithGrade = stats?.graded_with_grade || 0;
    const totalGradeSum = stats?.grade_sum || 0;

    let score = 0;
    if (totalReports > 0) score += Math.min(25, (gradedReports / totalReports) * 25);
    if (gradedWithGrade > 0) score += Math.min(25, (totalGradeSum / gradedWithGrade / 100) * 25);
    score += Math.min(20, (classesByStudent[student.id]?.length || 0) * 4);
    score += Math.min(15, (badgeCounts[student.id] || 0) * 3);
    score += Math.min(15, (quizCounts[student.id] || 0) * 2);
    if ((daysInactive[student.id] || 0) <= 7) score += 10;

    return {
      ...student,
      class_count: classesByStudent[student.id]?.length || 0,
      total_reports: totalReports,
      graded_reports: gradedReports,
      pending_reports: stats?.pending || 0,
      grading_rate: totalReports > 0 ? Math.round((gradedReports / totalReports) * 100) : 0,
      avg_grade: gradedWithGrade > 0 ? Math.round(totalGradeSum / gradedWithGrade) : 0,
      quiz_submissions: quizCounts[student.id] || 0,
      badge_count: badgeCounts[student.id] || 0,
      last_report_at: stats?.last_submitted || null,
      last_graded_at: stats?.last_graded || null,
      student_score: Math.round(Math.min(100, score)),
      is_blocked: !!student.blocked_at,
    };
  });
}
