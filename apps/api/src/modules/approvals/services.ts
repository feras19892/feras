import { db } from '../../db/index.js';
import { createNotification } from '../notifications/services.js';

export type ApprovalType = 'penalty' | 'grade_change' | 'student_removal' | 'grade_appeal';
export type RequesterType = 'student' | 'teacher' | 'school' | 'admin';
export type ApproverType = 'teacher' | 'school' | 'admin';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated' | 'auto_escalated';

export interface CreateApprovalInput {
  type: ApprovalType;
  requester_type: RequesterType;
  requester_id: number;
  requester_name: string;
  approver_type: ApproverType;
  approver_id?: number;
  target_user_id: number;
  target_user_name: string;
  class_id?: string;
  report_id?: number;
  school_id?: number;
  title: string;
  description: string;
  proposed_grade?: number;
  severity?: string;
}

// Escalation chain: teacher → school → admin
const escalationMap: Record<ApproverType, ApproverType | null> = {
  teacher: 'school',
  school: 'admin',
  admin: null,
};

export async function createApprovalRequest(input: CreateApprovalInput) {
  const result = await db.run(
    `INSERT INTO approval_requests
     (type, requester_type, requester_id, requester_name, approver_type, approver_id,
      target_user_id, target_user_name, class_id, report_id, school_id,
      title, description, proposed_grade, severity, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    input.type, input.requester_type, input.requester_id, input.requester_name,
    input.approver_type, input.approver_id || null,
    input.target_user_id, input.target_user_name,
    input.class_id || null, input.report_id || null, input.school_id || null,
    input.title, input.description, input.proposed_grade || null, input.severity || null,
  );

  const id = result.lastID;

  // Notify the approver
  if (input.approver_id) {
    await createNotification({
      user_id: input.approver_id,
      type: 'approval_request',
      title: `طلب موافقة: ${input.title}`,
      message: `${input.requester_name} يطلب موافقتك على: ${input.description}`,
    });
  }

  return { success: true, id };
}

export async function getApprovalsForUser(userId: number, role: string, schoolId?: number) {
  // Get requests where user is the approver, requester, or target
  let query = `
    SELECT a.* FROM approval_requests a
    WHERE a.requester_id = ? OR a.target_user_id = ?
  `;
  const params: any[] = [userId, userId];

  if (role === 'admin') {
    // Admin sees everything
    query = `SELECT * FROM approval_requests ORDER BY created_at DESC`;
    params.length = 0;
  } else if (role === 'school' && schoolId) {
    // School sees requests where they are approver, or related to their school
    query = `
      SELECT a.* FROM approval_requests a
      WHERE (a.approver_type = 'school' AND a.school_id = ?)
         OR a.requester_id = ?
         OR (a.target_user_id IN (SELECT id FROM users WHERE school_id = ?))
      ORDER BY a.created_at DESC
    `;
    params.length = 0;
    params.push(schoolId, userId, schoolId);
  } else if (role === 'teacher') {
    // Teacher sees requests where they are approver, requester, or teach the target student
    query = `
      SELECT a.* FROM approval_requests a
      WHERE a.requester_id = ?
         OR a.target_user_id = ?
         OR (a.approver_type = 'teacher' AND a.approver_id = ?)
         OR (a.class_id IN (SELECT id FROM classes WHERE teacher_id = ?))
      ORDER BY a.created_at DESC
    `;
    params.length = 0;
    params.push(userId, userId, userId, userId);
  }

  return db.all(query, ...params);
}

export async function getPendingApprovals(role: string, userId: number, schoolId?: number) {
  if (role === 'admin') {
    return db.all(`SELECT * FROM approval_requests WHERE status = 'pending' ORDER BY created_at DESC`);
  }
  if (role === 'school' && schoolId) {
    return db.all(
      `SELECT * FROM approval_requests WHERE status = 'pending' AND approver_type = 'school' AND school_id = ? ORDER BY created_at DESC`,
      schoolId,
    );
  }
  if (role === 'teacher') {
    return db.all(
      `SELECT * FROM approval_requests WHERE status = 'pending' AND approver_type = 'teacher' AND approver_id = ? ORDER BY created_at DESC`,
      userId,
    );
  }
  return [];
}

export async function approveRequest(
  requestId: number,
  approverId: number,
  approverName: string,
  approverRole: string,
  response: string,
): Promise<{ success: boolean; message?: string; action?: string }> {
  const req = await db.get<any>(`SELECT * FROM approval_requests WHERE id = ? AND status = 'pending'`, requestId);
  if (!req) return { success: false, message: 'Request not found or already processed' };

  // Verify the approver is authorized
  if (approverRole !== 'admin') {
    if (req.approver_type === 'teacher' && req.approver_id !== approverId) {
      return { success: false, message: 'Not authorized' };
    }
    if (req.approver_type === 'school' && approverRole !== 'school') {
      return { success: false, message: 'Not authorized' };
    }
  }

  await db.run(
    `UPDATE approval_requests SET status = 'approved', approver_response = ?, approver_responded_at = datetime('now'), approver_name = ?, updated_at = datetime('now') WHERE id = ?`,
    response, approverName, requestId,
  );

  // Notify the requester
  await createNotification({
    user_id: req.requester_id,
    type: 'approval_result',
    title: `تمت الموافقة: ${req.title}`,
    message: `وافق ${approverName} على طلبك: ${req.description}. الرد: ${response}`,
  });

  // Execute the approved action
  const actionResult = await executeApprovedAction(req);

  return { success: true, action: actionResult };
}

export async function rejectRequest(
  requestId: number,
  approverId: number,
  approverName: string,
  approverRole: string,
  response: string,
): Promise<{ success: boolean; message?: string }> {
  const req = await db.get<any>(`SELECT * FROM approval_requests WHERE id = ? AND status = 'pending'`, requestId);
  if (!req) return { success: false, message: 'Request not found or already processed' };

  if (approverRole !== 'admin') {
    if (req.approver_type === 'teacher' && req.approver_id !== approverId) {
      return { success: false, message: 'Not authorized' };
    }
    if (req.approver_type === 'school' && approverRole !== 'school') {
      return { success: false, message: 'Not authorized' };
    }
  }

  await db.run(
    `UPDATE approval_requests SET status = 'rejected', approver_response = ?, approver_responded_at = datetime('now'), approver_name = ?, updated_at = datetime('now') WHERE id = ?`,
    response, approverName, requestId,
  );

  // Notify the requester
  await createNotification({
    user_id: req.requester_id,
    type: 'approval_result',
    title: `تم الرفض: ${req.title}`,
    message: `رفض ${approverName} طلبك: ${req.description}. السبب: ${response}`,
  });

  return { success: true };
}

export async function escalateRequest(
  requestId: number,
  reason: string,
): Promise<{ success: boolean; message?: string }> {
  const req = await db.get<any>(`SELECT * FROM approval_requests WHERE id = ? AND status = 'pending'`, requestId);
  if (!req) return { success: false, message: 'Request not found or already processed' };

  const nextApprover = escalationMap[req.approver_type as ApproverType];
  if (!nextApprover) return { success: false, message: 'Cannot escalate further' };

  await db.run(
    `UPDATE approval_requests SET status = 'escalated', escalated_to = ?, escalated_at = datetime('now'), escalation_reason = ?, approver_type = ?, updated_at = datetime('now') WHERE id = ?`,
    nextApprover, reason, nextApprover, requestId,
  );

  // Notify admins if escalated to admin
  if (nextApprover === 'admin') {
    const admins = await db.all<{ id: number }[]>(`SELECT id FROM users WHERE role = 'admin'`);
    for (const admin of admins) {
      await createNotification({
        user_id: admin.id,
        type: 'approval_escalation',
        title: `طلب تصعيد: ${req.title}`,
        message: `تم تصعيد طلب من ${req.requester_name} إليك. السبب: ${reason}`,
      });
    }
  } else if (nextApprover === 'school' && req.school_id) {
    // Notify school
    // School doesn't have a user_id, so we notify via school notifications
    // For now, the school will see it in their pending list
  }

  return { success: true };
}

async function executeApprovedAction(req: any): Promise<string> {
  switch (req.type) {
    case 'penalty': {
      // Create a warning for the student
      await db.run(
        `INSERT INTO warnings (admin_id, user_id, title, message, severity) VALUES (?, ?, ?, ?, ?)`,
        req.requester_id, req.target_user_id, req.title, req.description, req.severity || 'normal',
      );
      await createNotification({
        user_id: req.target_user_id,
        type: 'warning',
        title: req.title,
        message: req.description,
      });
      return 'penalty_applied';
    }
    case 'grade_change': {
      if (req.report_id && req.proposed_grade != null) {
        // Save old grade to history
        const oldReport = await db.get<{ grade: number | null; graded_by: number | null }>(
          `SELECT grade, graded_by FROM experiment_reports WHERE id = ?`, req.report_id,
        );
        if (oldReport) {
          await db.run(
            `INSERT INTO grade_history (report_id, old_grade, new_grade, teacher_id, reason) VALUES (?, ?, ?, ?, ?)`,
            req.report_id, oldReport.grade, req.proposed_grade, req.requester_id, req.description,
          );
        }
        await db.run(
          `UPDATE experiment_reports SET grade = ?, graded_at = datetime('now'), status = 'graded' WHERE id = ?`,
          req.proposed_grade, req.report_id,
        );
        await createNotification({
          user_id: req.target_user_id,
          type: 'report_graded',
          title: 'تم تحديث درجتك',
          message: `تم تحديث درجتك لتصبح ${req.proposed_grade}. السبب: ${req.description}`,
        });
      }
      return 'grade_updated';
    }
    case 'student_removal': {
      if (req.class_id) {
        await db.run(
          `DELETE FROM class_students WHERE class_id = ? AND student_id = ?`,
          req.class_id, req.target_user_id,
        );
        await createNotification({
          user_id: req.target_user_id,
          type: 'class_removed',
          title: 'تم إزالتك من الفصل',
          message: `تم إزالتك من الفصل. السبب: ${req.description}`,
        });
      }
      return 'student_removed';
    }
    case 'grade_appeal': {
      // The appeal is approved — the teacher must re-grade
      if (req.report_id) {
        await db.run(
          `UPDATE experiment_reports SET status = 'resubmitted' WHERE id = ?`,
          req.report_id,
        );
        await createNotification({
          user_id: req.target_user_id,
          type: 'report_resubmitted',
          title: 'تم قبول اعتراضك',
          message: `تم قبول اعتراضك على الدرجة. سيتم إعادة التصحيح. الرد: ${req.approver_response || ''}`,
        });
      }
      return 'appeal_accepted';
    }
    default:
      return 'unknown';
  }
}

export async function getApprovalById(id: number) {
  return db.get(`SELECT * FROM approval_requests WHERE id = ?`, id);
}

export async function getAllApprovals(limit = 200) {
  return db.all(`SELECT * FROM approval_requests ORDER BY created_at DESC LIMIT ?`, limit);
}

export async function getApprovalsByType(type: string, limit = 100) {
  return db.all(`SELECT * FROM approval_requests WHERE type = ? ORDER BY created_at DESC LIMIT ?`, type, limit);
}
