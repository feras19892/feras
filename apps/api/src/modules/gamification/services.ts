import { db } from '../../db/index.js';
import { createNotification } from '../notifications/services.js';

export async function getAllBadges() {
  return await db.all(`SELECT * FROM badges ORDER BY id`);
}

export async function createBadge(name: string, description: string, icon: string, type: string, criteria: string | null) {
  const result = await db.run(
    `INSERT INTO badges (name, description, icon, type, criteria) VALUES (?, ?, ?, ?, ?)`,
    [name, description, icon, type, criteria],
  );
  return await db.get(`SELECT * FROM badges WHERE id = ?`, [result.lastID]);
}

export async function deleteBadge(badgeId: number) {
  await db.run(`DELETE FROM badges WHERE id = ?`, [badgeId]);
}

export async function awardBadge(studentId: number, badgeId: number, awardedBy: number, awardedByType: string, note: string | null) {
  try {
    const result = await db.run(
      `INSERT OR IGNORE INTO student_badges (student_id, badge_id, awarded_by, awarded_by_type, note) VALUES (?, ?, ?, ?, ?)`,
      [studentId, badgeId, awardedBy, awardedByType, note],
    );
    const awarded = (result.changes ?? 0) > 0;
    if (awarded) {
      // Notify the student about the new badge
      const badge = await db.get<{ name: string; icon: string }>(`SELECT name, icon FROM badges WHERE id = ?`, [badgeId]);
      if (badge) {
        await createNotification({
          user_id: studentId,
          type: 'badge_awarded',
          title: `${badge.icon || '🏆'} شارة جديدة: ${badge.name}`,
          message: note || `حصلت على شارة "${badge.name}"`,
        });
      }
    }
    return awarded;
  } catch {
    return false;
  }
}

export async function removeBadge(studentId: number, badgeId: number) {
  await db.run(`DELETE FROM student_badges WHERE student_id = ? AND badge_id = ?`, [studentId, badgeId]);
}

export async function getStudentBadges(studentId: number) {
  return await db.all(
    `SELECT sb.*, b.name, b.description, b.icon, b.type,
     u.name as awarded_by_name
     FROM student_badges sb
     JOIN badges b ON b.id = sb.badge_id
     LEFT JOIN users u ON u.id = sb.awarded_by
     WHERE sb.student_id = ?
     ORDER BY sb.awarded_at DESC`,
    [studentId],
  );
}

export async function getClassLeaderboard(classId: string) {
  return await db.all(
    `SELECT u.id, u.name, u.avatar_url,
     COALESCE((SELECT AVG(r.grade) FROM experiment_reports r WHERE r.student_id = u.id AND r.class_id = ? AND r.status = 'graded'), 0) as avg_grade,
     (SELECT COUNT(*) FROM experiment_reports r WHERE r.student_id = u.id AND r.class_id = ?) as report_count,
     COALESCE((SELECT SUM(qs.score) FROM quiz_submissions qs JOIN quizzes q ON q.id = qs.quiz_id WHERE qs.student_id = u.id AND q.class_id = ?), 0) as quiz_scores,
     (SELECT COUNT(*) FROM experiment_reports r WHERE r.student_id = u.id AND r.class_id = ?) * 10 +
     COALESCE((SELECT SUM(qs.score) FROM quiz_submissions qs JOIN quizzes q ON q.id = qs.quiz_id WHERE qs.student_id = u.id AND q.class_id = ?), 0) as total_points
     FROM users u
     JOIN class_students cs ON cs.student_id = u.id
     WHERE cs.class_id = ?
     GROUP BY u.id
     ORDER BY total_points DESC`,
    [classId, classId, classId, classId, classId, classId],
  );
}

export async function checkAutoBadges(studentId: number) {
  const badges = await db.all(`SELECT * FROM badges WHERE type = 'auto'`);
  const awarded: number[] = [];
  for (const badge of badges) {
    let shouldAward = false;
    if (badge.criteria === 'top_grade') {
      const top = await db.get(
        `SELECT u.id, AVG(r.grade) as avg FROM users u
         JOIN class_students cs ON cs.student_id = u.id
         JOIN experiment_reports r ON r.student_id = u.id AND r.class_id = cs.class_id
         GROUP BY u.id ORDER BY avg DESC LIMIT 1`,
      );
      if (top && top.id === studentId && top.avg > 0) shouldAward = true;
    }
    if (badge.criteria === 'perfect_quiz') {
      const perfect = await db.get(
        `SELECT 1 FROM quiz_submissions WHERE student_id = ? AND score >= (SELECT MAX(points) * COUNT(*) FROM quiz_questions WHERE quiz_id = quiz_submissions.quiz_id) LIMIT 1`,
        [studentId],
      );
      if (perfect) shouldAward = true;
    }
    if (badge.criteria === 'most_reports') {
      const most = await db.get(
        `SELECT student_id, COUNT(*) as cnt FROM experiment_reports GROUP BY student_id ORDER BY cnt DESC LIMIT 1`,
      );
      if (most && most.student_id === studentId) shouldAward = true;
    }
    if (shouldAward) {
      const ok = await awardBadge(studentId, badge.id, 0, 'auto', null);
      if (ok) awarded.push(badge.id);
    }
  }
  return awarded;
}
