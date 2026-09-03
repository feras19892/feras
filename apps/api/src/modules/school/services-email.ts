import { db } from '../../db/index.js';

export async function createEmailChangeRequest(
  requesterType: 'user' | 'school',
  requesterId: number,
  currentEmail: string,
  requestedEmail: string,
): Promise<{ success: boolean; message?: string }> {
  const existing = await db.get<{ id: number }>(
    'SELECT id FROM email_change_requests WHERE requester_type = ? AND requester_id = ? AND status = ?',
    requesterType, requesterId, 'pending',
  );
  if (existing) return { success: false, message: 'You already have a pending request' };

  const emailTaken = await db.get<{ id: number }>(
    'SELECT id FROM users WHERE email = ? UNION SELECT id FROM schools WHERE email = ?',
    requestedEmail, requestedEmail,
  );
  if (emailTaken) return { success: false, message: 'Email already in use' };

  await db.run(
    'INSERT INTO email_change_requests (requester_type, requester_id, current_email, requested_email) VALUES (?, ?, ?, ?)',
    requesterType, requesterId, currentEmail, requestedEmail,
  );
  return { success: true };
}

export async function getEmailChangeRequests(): Promise<any[]> {
  return db.all<any[]>(
    `SELECT id,
            requester_type as account_type,
            requester_id as account_id,
            current_email,
            requested_email,
            status,
            created_at
     FROM email_change_requests
     ORDER BY created_at DESC`,
  );
}

export async function reviewEmailChangeRequest(
  requestId: number,
  status: 'approved' | 'rejected',
  reviewedBy: number,
): Promise<{ success: boolean; message?: string }> {
  const req = await db.get<any>(
    'SELECT * FROM email_change_requests WHERE id = ? AND status = ?',
    requestId, 'pending',
  );
  if (!req) return { success: false, message: 'Request not found or already reviewed' };

  await db.run(
    'UPDATE email_change_requests SET status = ?, reviewed_by = ?, reviewed_at = datetime("now") WHERE id = ?',
    status, reviewedBy, requestId,
  );

  if (status === 'approved') {
    if (req.requester_type === 'school') {
      await db.run('UPDATE schools SET email = ?, updated_at = datetime("now") WHERE id = ?', req.requested_email, req.requester_id);
    } else {
      await db.run('UPDATE users SET email = ?, updated_at = datetime("now") WHERE id = ?', req.requested_email, req.requester_id);
    }
  }

  return { success: true };
}
