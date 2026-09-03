import { db } from '../../db/index.js';
import { createNotification } from '../notifications/services.js';
import { broadcastEvent } from '../sse/event-bus.js';

export type ApprovalType =
  | 'penalty' | 'grade_change' | 'student_removal' | 'grade_appeal'
  | 'class_creation' | 'class_deletion' | 'class_edit'
  | 'user_creation' | 'user_edit' | 'report_deletion';
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
  metadata?: string;
}

// Escalation chain: teacher → school → admin
export const escalationMap: Record<ApproverType, ApproverType | null> = {
  teacher: 'school',
  school: 'admin',
  admin: null,
};

export async function createApprovalRequest(input: CreateApprovalInput) {
  // Calculate escalation deadline based on approver type
  const escalationHours: Record<ApproverType, number> = { teacher: 48, school: 72, admin: 0 };
  const hours = escalationHours[input.approver_type];
  const escalationDeadline = hours > 0
    ? new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
    : null;

  const result = await db.run(
    `INSERT INTO approval_requests
     (type, requester_type, requester_id, requester_name, approver_type, approver_id,
      target_user_id, target_user_name, class_id, report_id, school_id,
      title, description, proposed_grade, severity, status, escalation_deadline, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
    input.type, input.requester_type, input.requester_id, input.requester_name,
    input.approver_type, input.approver_id || null,
    input.target_user_id, input.target_user_name,
    input.class_id || null, input.report_id || null, input.school_id || null,
    input.title, input.description, input.proposed_grade || null, input.severity || null,
    escalationDeadline, input.metadata || null,
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
    broadcastEvent({
      type: 'approval_created',
      payload: { requestId: id, title: input.title, requesterName: input.requester_name, approverType: input.approver_type },
      targetUserId: input.approver_id,
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
    if (req.approver_type === 'admin') {
      return { success: false, message: 'Not authorized' };
    }
    if (req.approver_type === 'teacher' && (approverRole !== 'teacher' || req.approver_id !== approverId)) {
      return { success: false, message: 'Not authorized' };
    }
    if (req.approver_type === 'school' && (approverRole !== 'school' || req.school_id !== approverId)) {
      return { success: false, message: 'Not authorized' };
    }
  }

  // Notify the requester
  await createNotification({
    user_id: req.requester_id,
    type: 'approval_result',
    title: `تمت الموافقة: ${req.title}`,
    message: `وافق ${approverName} على طلبك: ${req.description}. الرد: ${response}`,
  });
  broadcastEvent({
    type: 'approval_resolved',
    payload: { requestId, status: 'approved', title: req.title, approverName },
    targetUserId: req.requester_id,
  });

  // Execute the approved action
  const { executeApprovedAction } = await import('./services-actions.js');
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
    if (req.approver_type === 'admin') {
      return { success: false, message: 'Not authorized' };
    }
    if (req.approver_type === 'teacher' && (approverRole !== 'teacher' || req.approver_id !== approverId)) {
      return { success: false, message: 'Not authorized' };
    }
    if (req.approver_type === 'school' && (approverRole !== 'school' || req.school_id !== approverId)) {
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
  broadcastEvent({
    type: 'approval_resolved',
    payload: { requestId, status: 'rejected', title: req.title, approverName },
    targetUserId: req.requester_id,
  });

  return { success: true };
}
