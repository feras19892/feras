import { db } from '../../db/index.js';
import { createNotification } from '../notifications/services.js';

// ─── Penalties & Rewards ───
export async function createPenalty(studentId: number, teacherId: number, classId: string | null, type: string, reason: string, points: number) {
  const result = await db.run(
    `INSERT INTO penalties (student_id, teacher_id, class_id, type, reason, points) VALUES (?, ?, ?, ?, ?, ?)`,
    studentId, teacherId, classId, type, reason, points,
  );
  const penalty = await db.get(
    `SELECT p.*, u.name as teacher_name FROM penalties p JOIN users u ON u.id = p.teacher_id WHERE p.id = ?`,
    result.lastID,
  );
  // Notify the student
  await createNotification({
    user_id: studentId,
    type: type === 'penalty' ? 'penalty' : 'reward',
    title: type === 'penalty' ? `⚠️ عقوبة: ${reason.slice(0, 50)}` : `🎁 مكافأة: ${reason.slice(0, 50)}`,
    message: `${penalty?.teacher_name || 'المدرس'}: ${reason} (${points > 0 ? '+' : ''}${points} نقطة)`,
    class_id: classId || undefined,
  });
  return penalty;
}

export async function getStudentPenalties(studentId: number) {
  return await db.all(
    `SELECT p.*, u.name as teacher_name, c.name as class_name
     FROM penalties p
     JOIN users u ON u.id = p.teacher_id
     LEFT JOIN classes c ON c.id = p.class_id
     WHERE p.student_id = ? ORDER BY p.created_at DESC`,
    studentId,
  );
}

export async function getClassPenalties(classId: string) {
  return await db.all(
    `SELECT p.*, u.name as student_name, t.name as teacher_name
     FROM penalties p
     JOIN users u ON u.id = p.student_id
     JOIN users t ON t.id = p.teacher_id
     WHERE p.class_id = ? ORDER BY p.created_at DESC`,
    classId,
  );
}

export async function dismissPenalty(id: number) {
  await db.run(`UPDATE penalties SET status = 'dismissed' WHERE id = ?`, id);
}

export async function getAllPenalties() {
  return await db.all(
    `SELECT p.*, su.name as student_name, tu.name as teacher_name, c.name as class_name
     FROM penalties p
     JOIN users su ON su.id = p.student_id
     JOIN users tu ON tu.id = p.teacher_id
     LEFT JOIN classes c ON c.id = p.class_id
     ORDER BY p.created_at DESC LIMIT 200`,
  );
}

export async function deletePenalty(id: number) {
  await db.run(`DELETE FROM penalties WHERE id = ?`, id);
}

// ─── Ratings ───
export async function createRating(targetId: string | number, targetType: string, raterId: number, raterType: string, rating: number, comment: string | null) {
  try {
    await db.run(
      `INSERT OR REPLACE INTO ratings (target_id, target_type, rater_id, rater_type, rating, comment) VALUES (?, ?, ?, ?, ?, ?)`,
      targetId, targetType, raterId, raterType, rating, comment,
    );
    return true;
  } catch {
    return false;
  }
}

export async function getRatings(targetId: string | number, targetType: string) {
  const ratings = await db.all(
    `SELECT r.*, u.name as rater_name FROM ratings r LEFT JOIN users u ON u.id = r.rater_id WHERE r.target_id = ? AND r.target_type = ? ORDER BY r.created_at DESC`,
    targetId, targetType,
  );
  const avg = await db.get(
    `SELECT AVG(rating) as avg, COUNT(*) as count FROM ratings WHERE target_id = ? AND target_type = ?`,
    targetId, targetType,
  );
  return { ratings, average: avg?.avg || 0, count: avg?.count || 0 };
}

export async function getTeacherRatings(teacherId: number) {
  return await getRatings(teacherId, 'teacher');
}

export async function getAllRatings() {
  return await db.all(
    `SELECT r.*, u.name as rater_name FROM ratings r LEFT JOIN users u ON u.id = r.rater_id ORDER BY r.created_at DESC LIMIT 200`,
  );
}

export async function getMyRatings(userId: number, role: string) {
  const given = await db.all(
    `SELECT r.*, u.name as target_name FROM ratings r LEFT JOIN users u ON u.id = r.target_id WHERE r.rater_id = ? ORDER BY r.created_at DESC LIMIT 100`,
    userId,
  );
  const received = await db.all(
    `SELECT r.*, u.name as rater_name FROM ratings r LEFT JOIN users u ON u.id = r.rater_id WHERE r.target_id = ? AND r.target_type = ? ORDER BY r.created_at DESC LIMIT 100`,
    userId, role,
  );
  const avgRow = await db.get<{ avg: number; count: number }>(
    `SELECT AVG(rating) as avg, COUNT(*) as count FROM ratings WHERE target_id = ? AND target_type = ?`,
    userId, role,
  );
  return {
    given,
    received,
    average: avgRow?.avg || 0,
    count: avgRow?.count || 0,
  };
}

export async function getRatingTargets(userId: number, role: string) {
  if (role === 'student') {
    const teachers = await db.all<{ id: number; name: string }[]>(
      `SELECT DISTINCT u.id, u.name FROM users u
       JOIN class_students cs ON cs.student_id = ?
       JOIN classes c ON c.id = cs.class_id
       WHERE u.id = c.teacher_id`,
      userId,
    );
    const schoolId = await db.get<{ school_id: number }>(
      `SELECT school_id FROM class_students cs JOIN classes c ON c.id = cs.class_id WHERE cs.student_id = ? LIMIT 1`,
      userId,
    );
    const classes = await db.all<{ id: string; name: string }[]>(
      `SELECT c.id, c.name FROM classes c JOIN class_students cs ON cs.class_id = c.id WHERE cs.student_id = ?`,
      userId,
    );
    return { teachers, school: schoolId?.school_id || null, classes };
  }
  if (role === 'teacher') {
    const students = await db.all<{ id: number; name: string }[]>(
      `SELECT DISTINCT u.id, u.name FROM users u
       JOIN class_students cs ON cs.student_id = u.id
       JOIN classes c ON c.id = cs.class_id
       WHERE c.teacher_id = ?`,
      userId,
    );
    const schoolId = await db.get<{ school_id: number }>(
      `SELECT school_id FROM classes WHERE teacher_id = ? LIMIT 1`,
      userId,
    );
    const classes = await db.all<{ id: string; name: string }[]>(
      `SELECT id, name FROM classes WHERE teacher_id = ?`,
      userId,
    );
    return { students, school: schoolId?.school_id || null, classes };
  }
  return { teachers: [], students: [], classes: [], school: null };
}

export async function getRatingStats(userId: number, role: string) {
  const given = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM ratings WHERE rater_id = ?`, userId);
  const received = await db.get<{ avg: number; count: number }>(
    `SELECT AVG(rating) as avg, COUNT(*) as count FROM ratings WHERE target_id = ? AND target_type = ?`,
    userId, role,
  );
  return {
    givenCount: given?.count || 0,
    receivedAvg: received?.avg || 0,
    receivedCount: received?.count || 0,
  };
}

// ─── Profile Pictures ───
export async function updateAvatar(userId: number, avatarUrl: string) {
  await db.run(`UPDATE users SET avatar_url = ? WHERE id = ?`, avatarUrl, userId);
}

export async function getTeacherRecentActions(teacherId: number, limit = 10) {
  const penalties = await db.all(
    `SELECT p.*, u.name as student_name, c.name as class_name
     FROM penalties p JOIN users u ON u.id = p.student_id
     LEFT JOIN classes c ON c.id = p.class_id
     WHERE p.teacher_id = ? ORDER BY p.created_at DESC LIMIT ?`,
    teacherId, limit,
  );
  return penalties;
}

export async function updateSchoolAvatar(schoolId: number, avatarUrl: string) {
  await db.run(`UPDATE schools SET avatar_url = ? WHERE id = ?`, avatarUrl, schoolId);
}
