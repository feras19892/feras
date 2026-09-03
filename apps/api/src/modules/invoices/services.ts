import { db } from '../../db/index.js';

export interface Invoice {
  id: number;
  subscription_id: number | null;
  owner_id: number;
  owner_type: 'user' | 'school';
  owner_name: string;
  owner_email: string;
  amount_cents: number;
  currency: string;
  status: 'unpaid' | 'paid' | 'cancelled';
  payment_provider: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceListFilters {
  status?: string;
  ownerType?: 'user' | 'school';
  search?: string;
  sort: 'created_at' | 'amount_cents' | 'paid_at';
  order: 'asc' | 'desc';
  page: number;
  limit: number;
}

export async function getAdminInvoices(filters: InvoiceListFilters): Promise<{ invoices: Invoice[]; total: number }> {
  const conditions: string[] = [];
  const values: (string | number)[] = [];

  if (filters.status) {
    conditions.push('i.status = ?');
    values.push(filters.status);
  }
  if (filters.ownerType) {
    conditions.push('i.owner_type = ?');
    values.push(filters.ownerType);
  }
  if (filters.search) {
    conditions.push('(u.name LIKE ? OR u.email LIKE ? OR s.name LIKE ? OR s.email LIKE ?)');
    const q = `%${filters.search}%`;
    values.push(q, q, q, q);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const totalRow = await db.get<{ cnt: number }>(
    `SELECT COUNT(*) as cnt FROM invoices i
     LEFT JOIN users u ON i.owner_type = 'user' AND u.id = i.owner_id
     LEFT JOIN schools s ON i.owner_type = 'school' AND s.id = i.owner_id
     ${where}`,
    ...values,
  );
  const total = totalRow?.cnt ?? 0;

  const invoices = await db.all<Invoice[]>(
    `SELECT i.*,
            CASE WHEN i.owner_type = 'user' THEN u.name ELSE s.name END as owner_name,
            CASE WHEN i.owner_type = 'user' THEN u.email ELSE s.email END as owner_email
     FROM invoices i
     LEFT JOIN users u ON i.owner_type = 'user' AND u.id = i.owner_id
     LEFT JOIN schools s ON i.owner_type = 'school' AND s.id = i.owner_id
     ${where}
     ORDER BY ${filters.sort} ${filters.order}
     LIMIT ? OFFSET ?`,
    ...values,
    filters.limit,
    (filters.page - 1) * filters.limit,
  );

  return { invoices, total };
}

export async function updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined> {
  const paidAt = status === 'paid' ? new Date().toISOString() : null;
  await db.run(
    `UPDATE invoices SET status = ?, paid_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    status,
    paidAt,
    id,
  );
  const row = await db.get<Invoice>(
    `SELECT i.*,
            CASE WHEN i.owner_type = 'user' THEN u.name ELSE s.name END as owner_name,
            CASE WHEN i.owner_type = 'user' THEN u.email ELSE s.email END as owner_email
     FROM invoices i
     LEFT JOIN users u ON i.owner_type = 'user' AND u.id = i.owner_id
     LEFT JOIN schools s ON i.owner_type = 'school' AND s.id = i.owner_id
     WHERE i.id = ?`,
    id,
  );
  return row;
}
