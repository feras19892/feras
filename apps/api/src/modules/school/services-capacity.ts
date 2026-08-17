import { db } from '../../db/index.js';
import { createNotification, createSchoolNotification } from '../notifications/services.js';

export async function createCapacityRequest(data: {
  school_id: number;
  school_name: string;
  current_max_students: number;
  current_max_teachers: number;
  requested_max_students?: number;
  requested_max_teachers?: number;
  reason: string;
}) {
  const result = await db.run(
    `INSERT INTO capacity_requests (school_id, school_name, current_max_students, current_max_teachers, requested_max_students, requested_max_teachers, reason)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    data.school_id, data.school_name, data.current_max_students, data.current_max_teachers,
    data.requested_max_students || null, data.requested_max_teachers || null, data.reason,
  );

  const admins = await db.all<{ id: number }[]>(`SELECT id FROM users WHERE role = 'admin'`);
  for (const admin of admins) {
    await createNotification({
      user_id: admin.id,
      type: 'capacity_request',
      title: `طلب سعة جديد من "${data.school_name}"`,
      message: `طلب زيادة السعة: طلاب ${data.requested_max_students || '—'}, مدرسين ${data.requested_max_teachers || '—'}`,
    });
  }

  return { success: true, id: Number(result.lastID) };
}

export async function getCapacityRequests(schoolId?: number, status?: string) {
  if (schoolId) {
    return db.all(
      `SELECT * FROM capacity_requests WHERE school_id = ? ${status ? 'AND status = ?' : ''} ORDER BY created_at DESC`,
      ...(status ? [schoolId, status] : [schoolId]),
    );
  }
  return db.all(
    `SELECT * FROM capacity_requests ${status ? 'WHERE status = ?' : ''} ORDER BY created_at DESC`,
    ...(status ? [status] : []),
  );
}

export async function reviewCapacityRequest(id: number, status: 'approved' | 'rejected', reviewerId: number, response?: string) {
  const req = await db.get<{ school_id: number; requested_max_students: number | null; requested_max_teachers: number | null }>(
    `SELECT * FROM capacity_requests WHERE id = ?`, id,
  );
  if (!req) return { success: false, message: 'الطلب غير موجود' };

  await db.run(
    `UPDATE capacity_requests SET status = ?, reviewed_by = ?, reviewed_at = datetime('now'), admin_response = ? WHERE id = ?`,
    status, reviewerId, response || null, id,
  );

  if (status === 'approved') {
    const updates: string[] = [];
    const vals: any[] = [];
    if (req.requested_max_students) {
      updates.push('max_students = ?');
      vals.push(req.requested_max_students);
    }
    if (req.requested_max_teachers) {
      updates.push('max_teachers = ?');
      vals.push(req.requested_max_teachers);
    }
    if (updates.length > 0) {
      vals.push(req.school_id);
      await db.run(`UPDATE schools SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ?`, ...vals);
    }
  }

  await createSchoolNotification({
    school_id: req.school_id,
    type: 'capacity_reviewed',
    title: status === 'approved' ? 'تمت الموافقة على طلب السعة' : 'تم رفض طلب السعة',
    message: response || (status === 'approved' ? 'تمت الموافقة على طلبك' : 'تم رفض طلبك'),
  });

  return { success: true };
}
