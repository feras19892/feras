import { db } from '../../db/index.js';
import { createNotification } from '../notifications/services.js';
import { broadcastEvent } from '../sse/event-bus.js';
import { escalationMap, type ApproverType } from './services-core.js';
import { randomInt } from 'crypto';

export async function escalateRequest(
  requestId: number,
  reason: string,
): Promise<{ success: boolean; message?: string }> {
  // Allow escalation after rejection OR after escalation deadline has passed on a pending request
  const now = new Date().toISOString();
  const req = await db.get<any>(
    `SELECT * FROM approval_requests WHERE id = ? AND (
      status = 'rejected'
      OR (status = 'pending' AND escalation_deadline IS NOT NULL AND escalation_deadline < ?)
    )`,
    requestId, now,
  );
  if (!req) return { success: false, message: 'لا يمكن التصعيد — يجب أن يُرفض الطلب أولاً أو تنتهي مهلة الرد قبل التصعيد للمستوى الأعلى.' };

  const nextApprover = escalationMap[req.approver_type as ApproverType];
  if (!nextApprover) return { success: false, message: 'لا يمكن التصعيد أكثر — وصل الطلب للأدمن' };

  // Calculate new escalation deadline for the next approver
  const escalationHours: Record<ApproverType, number> = { teacher: 48, school: 72, admin: 0 };
  const hours = escalationHours[nextApprover as ApproverType];
  const newDeadline = hours > 0
    ? new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
    : null;

  await db.run(
    `UPDATE approval_requests SET status = 'pending', escalated_to = ?, escalated_at = datetime('now'), escalation_reason = ?, approver_type = ?, escalation_deadline = ?, updated_at = datetime('now') WHERE id = ?`,
    nextApprover, reason, nextApprover, newDeadline, requestId,
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
      broadcastEvent({
        type: 'approval_escalated',
        payload: { requestId, title: req.title, requesterName: req.requester_name, reason, escalatedTo: 'admin' },
        targetUserId: admin.id,
      });
    }
  } else if (nextApprover === 'school' && req.school_id) {
    // Notify school
    // School doesn't have a user_id, so we notify via school notifications
    // For now, the school will see it in their pending list
  }

  return { success: true };
}

export async function executeApprovedAction(req: any): Promise<string> {
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
        await db.run('BEGIN IMMEDIATE');
        try {
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
          await db.run('COMMIT');
        } catch (err) {
          await db.run('ROLLBACK');
          throw err;
        }
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
    case 'class_creation': {
      const meta = JSON.parse(req.metadata || '{}');
      const teacherId = meta.teacher_id || req.requester_id;
      let classCode = '';
      for (let attempt = 0; attempt < 10; attempt++) {
        classCode = Array.from({ length: 6 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[randomInt(0, 36)]).join('');
        const existing = await db.get('SELECT 1 FROM classes WHERE code = ?', classCode);
        if (!existing) break;
      }
      await db.run('BEGIN IMMEDIATE');
      try {
        const classResult = await db.run(
          `INSERT INTO classes (name, code, teacher_id, is_active) VALUES (?, ?, ?, 1)`,
          meta.name || 'New Class', classCode, teacherId,
        );
        if (meta.school_id) {
          await db.run(`UPDATE classes SET school_id = ? WHERE id = ?`, meta.school_id, classResult.lastID);
        }
        await db.run('COMMIT');
      } catch (err) {
        await db.run('ROLLBACK');
        throw err;
      }
      return 'class_created';
    }
    case 'class_deletion': {
      if (req.class_id) {
        await db.run('BEGIN IMMEDIATE');
        try {
          const quizIds = await db.all<{ id: number }[]>('SELECT id FROM quizzes WHERE class_id = ?', req.class_id);
          if (quizIds.length > 0) {
            const qIds = quizIds.map(q => q.id);
            const qPlaceholders = qIds.map(() => '?').join(',');
            await db.run(`DELETE FROM quiz_submissions WHERE quiz_id IN (${qPlaceholders})`, ...qIds);
            await db.run(`DELETE FROM quiz_questions WHERE quiz_id IN (${qPlaceholders})`, ...qIds);
            await db.run(`DELETE FROM quizzes WHERE id IN (${qPlaceholders})`, ...qIds);
          }
          await db.run('DELETE FROM announcements WHERE class_id = ?', req.class_id);
          await db.run('DELETE FROM experiment_reports WHERE class_id = ?', req.class_id);
          await db.run('DELETE FROM class_messages WHERE class_id = ?', req.class_id);
          await db.run('DELETE FROM experiment_deadlines WHERE class_id = ?', req.class_id);
          await db.run('DELETE FROM class_students WHERE class_id = ?', req.class_id);
          await db.run('DELETE FROM classes WHERE id = ?', req.class_id);
          await db.run('COMMIT');
        } catch (err) {
          await db.run('ROLLBACK');
          throw err;
        }
      }
      return 'class_deleted';
    }
    case 'class_edit': {
      if (req.class_id) {
        const meta = JSON.parse(req.metadata || '{}');
        await db.run('BEGIN IMMEDIATE');
        try {
          if (meta.name) {
            await db.run(`UPDATE classes SET name = ? WHERE id = ?`, meta.name, req.class_id);
          }
          if (meta.teacher_id) {
            await db.run(`UPDATE classes SET teacher_id = ? WHERE id = ?`, meta.teacher_id, req.class_id);
          }
          await db.run('COMMIT');
        } catch (err) {
          await db.run('ROLLBACK');
          throw err;
        }
      }
      return 'class_edited';
    }
    case 'user_creation': {
      const meta = JSON.parse(req.metadata || '{}');
      if (meta.name && meta.email) {
        if (!meta.password || typeof meta.password !== 'string' || meta.password.length < 8) {
          return 'user_creation_failed: password required (min 8 chars)';
        }
        const { hashPassword } = await import('../auth/crypto.js');
        const passwordHash = await hashPassword(meta.password);
        await db.run(
          `INSERT INTO users (name, email, password_hash, role, school_id) VALUES (?, ?, ?, ?, ?)`,
          meta.name, meta.email, passwordHash, meta.role || 'teacher', req.school_id || null,
        );
      }
      return 'user_created';
    }
    case 'user_edit': {
      const meta = JSON.parse(req.metadata || '{}');
      if (req.target_user_id) {
        await db.run('BEGIN IMMEDIATE');
        try {
          if (meta.name) {
            await db.run(`UPDATE users SET name = ? WHERE id = ?`, meta.name, req.target_user_id);
          }
          if (meta.email) {
            await db.run(`UPDATE users SET email = ? WHERE id = ?`, meta.email, req.target_user_id);
          }
          await db.run('COMMIT');
        } catch (err) {
          await db.run('ROLLBACK');
          throw err;
        }
      }
      return 'user_edited';
    }
    case 'report_deletion': {
      if (req.report_id) {
        await db.run('BEGIN IMMEDIATE');
        try {
          await db.run(`DELETE FROM report_comments WHERE report_id = ?`, req.report_id);
          await db.run(`DELETE FROM grade_history WHERE report_id = ?`, req.report_id);
          await db.run(`DELETE FROM experiment_reports WHERE id = ?`, req.report_id);
          await db.run('COMMIT');
        } catch (err) {
          await db.run('ROLLBACK');
          throw err;
        }
      }
      return 'report_deleted';
    }
    default:
      return 'unknown';
  }
}

export { getApprovalById, getAllApprovals, getApprovalsByType, runAutoEscalation } from './services-queries.js';
