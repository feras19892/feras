import { db } from '../../db/index.js';
import { createNotification } from '../notifications/services.js';
import { broadcastEvent } from '../sse/event-bus.js';
import { escalationMap, type ApproverType } from './services-core.js';

export async function getApprovalById(id: number) {
  return db.get(`SELECT * FROM approval_requests WHERE id = ?`, id);
}

export async function getAllApprovals(limit = 200) {
  return db.all(`SELECT * FROM approval_requests ORDER BY created_at DESC LIMIT ?`, limit);
}

export async function getApprovalsByType(type: string, limit = 100) {
  return db.all(`SELECT * FROM approval_requests WHERE type = ? ORDER BY created_at DESC LIMIT ?`, type, limit);
}

export async function runAutoEscalation(): Promise<number> {
  const now = new Date().toISOString();
  const expired = await db.all<any[]>(
    `SELECT * FROM approval_requests WHERE status = 'pending' AND escalation_deadline IS NOT NULL AND escalation_deadline < ?`,
    now,
  );

  let count = 0;
  for (const req of expired) {
    const nextApprover = escalationMap[req.approver_type as ApproverType];
    if (!nextApprover) continue;

    const escalationHours: Record<ApproverType, number> = { teacher: 48, school: 72, admin: 0 };
    const hours = escalationHours[nextApprover as ApproverType];
    const newDeadline = hours > 0
      ? new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
      : null;

    await db.run(
      `UPDATE approval_requests SET status = 'pending', escalated_to = ?, escalated_at = datetime('now'), escalation_reason = ?, approver_type = ?, escalation_deadline = ?, auto_escalated_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`,
      nextApprover, 'تصعيد تلقائي — انتهاء مهلة الرد', nextApprover, newDeadline, req.id,
    );

    // Notify the requester about auto-escalation
    await createNotification({
      user_id: req.requester_id,
      type: 'approval_auto_escalated',
      title: `تصعيد تلقائي: ${req.title}`,
      message: `تم تصعيد طلبك تلقائياً لعدم رد ${req.approver_type === 'teacher' ? 'المدرس' : 'المدرسة'} خلال المهلة المحددة`,
    });

    // Notify the next approver
    if (nextApprover === 'admin') {
      const admins = await db.all<{ id: number }[]>(`SELECT id FROM users WHERE role = 'admin'`);
      for (const admin of admins) {
        await createNotification({
          user_id: admin.id,
          type: 'approval_escalation',
          title: `طلب تصعيد تلقائي: ${req.title}`,
          message: `تم تصعيد طلب من ${req.requester_name} إليك تلقائياً.`,
        });
        broadcastEvent({
          type: 'approval_escalated',
          payload: { requestId: req.id, title: req.title, requesterName: req.requester_name, reason: 'auto_escalation', escalatedTo: 'admin' },
          targetUserId: admin.id,
        });
      }
    }

    count++;
  }

  return count;
}
