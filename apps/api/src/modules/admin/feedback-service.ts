import { db } from '../../db/index.js';

export async function createFeedback(
  userId: number | null,
  userName: string,
  type: string,
  message: string,
  experimentId?: string,
  experimentName?: string,
  rating?: number,
  schoolId?: number | null,
) {
  return db.run(
    `INSERT INTO feedback (user_id, user_name, type, experiment_id, experiment_name, rating, message, school_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    userId, userName, type, experimentId || null, experimentName || null, rating || null, message, schoolId || null
  );
}

export async function getAllFeedback() {
  return db.all(
    `SELECT * FROM feedback ORDER BY created_at DESC LIMIT 200`
  );
}

export async function updateFeedbackStatus(id: number, status: string) {
  await db.run(`UPDATE feedback SET status = ? WHERE id = ?`, status, id);
  return { success: true };
}

export async function getSchoolFeedback(schoolId: number) {
  return db.all(
    `SELECT * FROM feedback WHERE school_id = ? ORDER BY created_at DESC LIMIT 200`,
    schoolId,
  );
}

export async function getSchoolFeedbackStats(schoolId: number) {
  const total = await db.get(`SELECT COUNT(*) as count FROM feedback WHERE school_id = ?`, schoolId);
  const open = await db.get(`SELECT COUNT(*) as count FROM feedback WHERE school_id = ? AND status = 'open'`, schoolId);
  const resolved = await db.get(`SELECT COUNT(*) as count FROM feedback WHERE school_id = ? AND status = 'resolved'`, schoolId);
  const avgRating = await db.get(`SELECT AVG(rating) as avg FROM feedback WHERE school_id = ? AND rating IS NOT NULL`, schoolId);
  return {
    total: total?.count || 0,
    open: open?.count || 0,
    resolved: resolved?.count || 0,
    average: Math.round((avgRating?.avg || 0) * 10) / 10,
  };
}

export async function getFeedbackStats() {
  const total = await db.get(`SELECT COUNT(*) as count FROM feedback`);
  const open = await db.get(`SELECT COUNT(*) as count FROM feedback WHERE status = 'open'`);
  const resolved = await db.get(`SELECT COUNT(*) as count FROM feedback WHERE status = 'resolved'`);
  const avgRating = await db.get(`SELECT AVG(rating) as avg FROM feedback WHERE rating IS NOT NULL`);
  return {
    total: total?.count || 0,
    open: open?.count || 0,
    resolved: resolved?.count || 0,
    average: Math.round((avgRating?.avg || 0) * 10) / 10,
  };
}
