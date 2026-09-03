import { db } from '../../db/index.js';

export interface SupportTicketRow {
  id: number;
  user_id: number;
  school_id: number | null;
  category: string;
  priority: string;
  subject: string;
  description: string;
  status: string;
  assigned_to: number | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface TicketCommentRow {
  id: number;
  ticket_id: number;
  user_id: number;
  comment: string;
  is_internal: number;
  created_at: string;
}

export async function createTicket(data: {
  user_id: number;
  school_id?: number;
  category: string;
  priority: string;
  subject: string;
  description: string;
}): Promise<{ id: number }> {
  const result = await db.run(
    `INSERT INTO support_tickets (user_id, school_id, category, priority, subject, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    data.user_id, data.school_id || null, data.category, data.priority, data.subject, data.description,
  );
  return { id: Number(result.lastID) };
}

export async function getTickets(filters?: {
  user_id?: number;
  school_id?: number;
  status?: string;
  category?: string;
  priority?: string;
  assigned_to?: number;
}): Promise<SupportTicketRow[]> {
  let query = 'SELECT * FROM support_tickets';
  const params: any[] = [];
  const conditions: string[] = [];

  if (filters?.user_id) {
    conditions.push('user_id = ?');
    params.push(filters.user_id);
  }
  if (filters?.school_id) {
    conditions.push('school_id = ?');
    params.push(filters.school_id);
  }
  if (filters?.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }
  if (filters?.category) {
    conditions.push('category = ?');
    params.push(filters.category);
  }
  if (filters?.priority) {
    conditions.push('priority = ?');
    params.push(filters.priority);
  }
  if (filters?.assigned_to !== undefined) {
    if (filters.assigned_to === null) {
      conditions.push('assigned_to IS NULL');
    } else {
      conditions.push('assigned_to = ?');
      params.push(filters.assigned_to);
    }
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC LIMIT 100';

  return db.all<SupportTicketRow[]>(query, ...params);
}

export async function getTicketById(id: number): Promise<SupportTicketRow | undefined> {
  return db.get<SupportTicketRow>('SELECT * FROM support_tickets WHERE id = ?', id);
}

export async function updateTicket(id: number, data: {
  status?: string;
  assigned_to?: number | null;
  resolution?: string;
  changed_by: number;
}): Promise<void> {
  const updates: string[] = [];
  const params: any[] = [];

  if (data.status !== undefined) {
    updates.push('status = ?');
    params.push(data.status);
  }
  if (data.assigned_to !== undefined) {
    updates.push('assigned_to = ?');
    params.push(data.assigned_to);
  }
  if (data.resolution !== undefined) {
    updates.push('resolution = ?');
    params.push(data.resolution);
  }

  if (updates.length === 0) return;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  await db.run(`UPDATE support_tickets SET ${updates.join(', ')} WHERE id = ?`, ...params);

  if (data.status) {
    const oldStatus = await db.get('SELECT status FROM support_tickets WHERE id = ?', id);
    if (oldStatus && oldStatus.status !== data.status) {
      await db.run(
        `INSERT INTO support_ticket_history (ticket_id, old_status, new_status, changed_by)
         VALUES (?, ?, ?, ?)`,
        id, oldStatus.status, data.status, data.changed_by,
      );

      if (data.status === 'resolved' || data.status === 'closed') {
        await db.run('UPDATE support_tickets SET resolved_at = CURRENT_TIMESTAMP WHERE id = ?', id);
      }
    }
  }
}

export async function addTicketComment(data: {
  ticket_id: number;
  user_id: number;
  comment: string;
  is_internal?: boolean;
}): Promise<{ id: number }> {
  const result = await db.run(
    `INSERT INTO support_ticket_comments (ticket_id, user_id, comment, is_internal)
     VALUES (?, ?, ?, ?)`,
    data.ticket_id, data.user_id, data.comment, data.is_internal ? 1 : 0,
  );
  return { id: Number(result.lastID) };
}

export async function getTicketComments(ticketId: number, includeInternal = false): Promise<TicketCommentRow[]> {
  let query = 'SELECT * FROM support_ticket_comments WHERE ticket_id = ?';
  if (!includeInternal) {
    query += ' AND is_internal = 0';
  }
  query += ' ORDER BY created_at ASC';
  return db.all<TicketCommentRow[]>(query, ticketId);
}

export async function getTicketHistory(ticketId: number) {
  return db.all(
    `SELECT * FROM support_ticket_history WHERE ticket_id = ? ORDER BY changed_at DESC`,
    ticketId,
  );
}

export async function getTicketStats(userId?: number, schoolId?: number) {
  let whereClause = '';
  const params: any[] = [];

  if (userId) {
    whereClause = 'WHERE user_id = ?';
    params.push(userId);
  } else if (schoolId) {
    whereClause = 'WHERE school_id = ?';
    params.push(schoolId);
  }

  const statusStats = await db.all(
    `SELECT status, COUNT(*) as count FROM support_tickets ${whereClause} GROUP BY status`,
    ...params,
  );

  const priorityStats = await db.all(
    `SELECT priority, COUNT(*) as count FROM support_tickets ${whereClause} GROUP BY priority`,
    ...params,
  );

  const categoryStats = await db.all(
    `SELECT category, COUNT(*) as count FROM support_tickets ${whereClause} GROUP BY category`,
    ...params,
  );

  return {
    by_status: statusStats,
    by_priority: priorityStats,
    by_category: categoryStats,
  };
}
