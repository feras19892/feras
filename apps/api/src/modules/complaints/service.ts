import { db } from '../../db/index.js';
import { createNotification } from '../notifications/services.js';
import { getAllAdmins, getUserSchoolId } from '../notifications/dispatch-helpers.js';

export interface ComplaintRow {
  id: number;
  from_user_id: number;
  from_role: string;
  from_name: string;
  target_role: string;
  target_id: number | null;
  category: string;
  subject: string;
  body: string;
  priority: string;
  status: string;
  assigned_to: number | null;
  school_id: number | null;
  resolved_at: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
}

export async function createComplaint(data: {
  fromUserId: number;
  fromRole: string;
  fromName: string;
  targetRole: string;
  targetId: number | null;
  category: string;
  subject: string;
  body: string;
  priority?: string;
  schoolId?: number | null;
}): Promise<{ id: number }> {
  const result = await db.run(
    `INSERT INTO complaints (from_user_id, from_role, from_name, target_role, target_id, category, subject, body, priority, school_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data.fromUserId, data.fromRole, data.fromName, data.targetRole, data.targetId,
    data.category, data.subject, data.body, data.priority || 'normal', data.schoolId || null,
  );
  const id = Number(result.lastID);

  await db.run(
    `INSERT INTO complaint_log (complaint_id, action, to_status, actor_id, actor_name) VALUES (?, 'created', 'open', ?, ?)`,
    id, data.fromUserId, data.fromName,
  );

  // Notify target
  if (data.targetRole === 'admin') {
    for (const adminId of await getAllAdmins()) {
      await createNotification({
        user_id: adminId, type: 'complaint_created',
        title: `شكوى جديدة: ${data.subject}`,
        message: `من ${data.fromName} — ${data.category}`,
      });
    }
  } else if (data.targetId) {
    await createNotification({
      user_id: data.targetId, type: 'complaint_created',
      title: `شكوى جديدة: ${data.subject}`,
      message: `من ${data.fromName} — ${data.category}`,
    });
  }

  return { id };
}

export async function getComplaintsForUser(userId: number, role: string, schoolId?: number | null): Promise<ComplaintRow[]> {
  if (role === 'admin') {
    return db.all<ComplaintRow[]>(`SELECT * FROM complaints ORDER BY created_at DESC LIMIT 200`);
  }
  if (role === 'school') {
    return db.all<ComplaintRow[]>(
      `SELECT * FROM complaints WHERE (target_role = 'school' AND target_id = ?) OR from_user_id = ? ORDER BY created_at DESC LIMIT 200`,
      schoolId, userId,
    );
  }
  if (role === 'teacher') {
    return db.all<ComplaintRow[]>(
      `SELECT * FROM complaints WHERE (target_role = 'teacher' AND target_id = ?) OR from_user_id = ? ORDER BY created_at DESC LIMIT 200`,
      userId, userId,
    );
  }
  // student
  return db.all<ComplaintRow[]>(
    `SELECT * FROM complaints WHERE from_user_id = ? ORDER BY created_at DESC LIMIT 200`,
    userId,
  );
}

export async function getComplaintStats(userId: number, role: string, schoolId?: number | null) {
  let where = '1=1';
  const params: (number | string)[] = [];
  if (role === 'teacher') {
    where = `(target_role = 'teacher' AND target_id = ?) OR from_user_id = ?`;
    params.push(userId, userId);
  } else if (role === 'student') {
    where = `from_user_id = ?`;
    params.push(userId);
  } else if (role === 'school') {
    where = `(target_role = 'school' AND target_id = ?) OR from_user_id = ?`;
    params.push(schoolId || 0, userId);
  }

  const row = await db.get<{ total: number; open: number; urgent: number; resolved: number }>(
    `SELECT
       COUNT(*) as total,
       SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
       SUM(CASE WHEN priority = 'urgent' AND status != 'resolved' THEN 1 ELSE 0 END) as urgent,
       SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
     FROM complaints WHERE ${where}`,
    ...params,
  );

  return {
    total: row?.total || 0,
    open: row?.open || 0,
    urgent: row?.urgent || 0,
    resolved: row?.resolved || 0,
  };
}

export async function updateComplaintStatus(
  id: number, status: string, actorId: number, actorName: string, note?: string,
): Promise<void> {
  const complaint = await db.get<ComplaintRow>(`SELECT * FROM complaints WHERE id = ?`, id);
  if (!complaint) throw new Error('Complaint not found');

  const prevStatus = complaint.status;
  const resolvedAt = status === 'resolved' ? new Date().toISOString() : null;

  await db.run(
    `UPDATE complaints SET status = ?, resolution_note = ?, resolved_at = COALESCE(?, resolved_at), updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    status, note || null, resolvedAt, id,
  );

  await db.run(
    `INSERT INTO complaint_log (complaint_id, action, from_status, to_status, actor_id, actor_name, note) VALUES (?, 'status_changed', ?, ?, ?, ?, ?)`,
    id, prevStatus, status, actorId, actorName, note || null,
  );

  // Notify the original sender
  await createNotification({
    user_id: complaint.from_user_id, type: 'complaint_updated',
    title: `تحديث شكوى: ${complaint.subject}`,
    message: `تم تغيير الحالة إلى: ${status}`,
  });
}

export async function getComplaintLog(id: number) {
  return db.all(`SELECT * FROM complaint_log WHERE complaint_id = ? ORDER BY created_at ASC`, id);
}

export async function getAvailableTargets(userId: number, role: string) {
  if (role === 'student') {
    const schoolId = await getUserSchoolId(userId);
    const teachers = await db.all<{ id: number; name: string }[]>(
      `SELECT DISTINCT u.id, u.name FROM users u
       JOIN class_students cs ON cs.student_id = ? JOIN classes c ON c.id = cs.class_id WHERE u.id = c.teacher_id`,
      userId,
    );
    return {
      teachers,
      school: schoolId ? { id: schoolId } : null,
      admin: true,
    };
  }
  if (role === 'teacher') {
    const schoolId = await getUserSchoolId(userId);
    return {
      school: schoolId ? { id: schoolId } : null,
      admin: true,
    };
  }
  return { admin: true };
}

export async function validateTargetForUser(userId: number, role: string, targetRole: string, targetId: number | null): Promise<boolean> {
  if (targetRole === 'admin') return true;
  const targets = await getAvailableTargets(userId, role);
  if (targetRole === 'teacher' && targetId) {
    return !!(targets as any).teachers?.some((t: { id: number }) => t.id === targetId);
  }
  if (targetRole === 'school') {
    return (targets as any).school?.id != null && (targets as any).school.id === targetId;
  }
  return false;
}

export async function validateComplaintAccess(complaintId: number, userId: number, role: string): Promise<boolean> {
  const complaint = await db.get<ComplaintRow>(`SELECT * FROM complaints WHERE id = ?`, complaintId);
  if (!complaint) return false;
  if (role === 'admin') return true;
  if (complaint.from_user_id === userId) return true;
  if (role === 'teacher' && complaint.target_role === 'teacher' && complaint.target_id === userId) return true;
  if (role === 'school' && complaint.target_role === 'school' && complaint.target_id === userId) return true;
  return false;
}

export async function validateComplaintIsTarget(complaintId: number, userId: number, role: string): Promise<boolean> {
  const complaint = await db.get<ComplaintRow>(`SELECT * FROM complaints WHERE id = ?`, complaintId);
  if (!complaint) return false;
  if (role === 'admin') return true;
  if (role === 'teacher' && complaint.target_role === 'teacher' && complaint.target_id === userId) return true;
  if (role === 'school' && complaint.target_role === 'school' && complaint.target_id === userId) return true;
  return false;
}
