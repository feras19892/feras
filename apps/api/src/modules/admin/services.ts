import { db } from '../../db/index.js';

export async function getAllUsers() {
  return db.all(
    `SELECT id, email, name, role, email_verified_at, created_at FROM users ORDER BY created_at DESC`
  );
}

export async function getSystemStats() {
  const users = await db.all(`SELECT role, COUNT(*) as count FROM users GROUP BY role`);
  const totalUsers = await db.get(`SELECT COUNT(*) as count FROM users`);
  const totalClasses = await db.get(`SELECT COUNT(*) as count FROM classes`);
  const totalReports = await db.get(`SELECT COUNT(*) as count FROM experiment_reports`);
  const totalGraded = await db.get(`SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'graded'`);
  const totalPending = await db.get(`SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'submitted'`);
  const totalResubmitted = await db.get(`SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'resubmitted'`);
  const avgGrade = await db.get(`SELECT AVG(grade) as avg FROM experiment_reports WHERE grade IS NOT NULL`);

  return {
    users: { total: totalUsers?.count || 0, byRole: users },
    classes: { total: totalClasses?.count || 0 },
    reports: {
      total: totalReports?.count || 0,
      graded: totalGraded?.count || 0,
      pending: totalPending?.count || 0,
      resubmitted: totalResubmitted?.count || 0,
      average: Math.round(avgGrade?.avg || 0),
    },
  };
}

export async function getAllClassesWithTeachers() {
  return db.all(
    `SELECT c.*, u.name as teacher_name, u.email as teacher_email,
     (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as student_count
     FROM classes c JOIN users u ON c.teacher_id = u.id ORDER BY c.created_at DESC`
  );
}

export async function getAllReportsWithDetails(page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  return db.all(
    `SELECT r.*, u.name as student_name, u.email as student_email,
     c.name as class_name, t.name as teacher_name
     FROM experiment_reports r
     JOIN users u ON r.student_id = u.id
     JOIN classes c ON r.class_id = c.id
     JOIN users t ON c.teacher_id = t.id
     ORDER BY r.submitted_at DESC LIMIT ? OFFSET ?`,
    limit, offset
  );
}

export async function deleteUser(userId: number) {
  // Delete user's reports first (cascade will handle some)
  await db.run(`DELETE FROM experiment_reports WHERE student_id = ?`, userId);
  await db.run(`DELETE FROM class_students WHERE student_id = ?`, userId);
  await db.run(`DELETE FROM users WHERE id = ?`, userId);
  return { success: true };
}

export async function updateUserRole(userId: number, role: string) {
  await db.run(`UPDATE users SET role = ? WHERE id = ?`, role, userId);
  return { success: true };
}

export async function createUser(name: string, email: string, passwordHash: string, role: string) {
  const result = await db.run(
    `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
    name, email, passwordHash, role
  );
  return { success: true, id: result.lastID };
}

export async function deleteClass(classId: string) {
  await db.run(`DELETE FROM experiment_reports WHERE class_id = ?`, classId);
  await db.run(`DELETE FROM class_students WHERE class_id = ?`, classId);
  await db.run(`DELETE FROM classes WHERE id = ?`, classId);
  return { success: true };
}
