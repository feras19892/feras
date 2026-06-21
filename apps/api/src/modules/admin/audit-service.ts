import { db } from '../../db/index.js';

export async function logAudit(tableName: string, recordId: string, action: string, actorId: number | null, oldValues?: any, newValues?: any) {
  return db.run(
    `INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, actor_id) VALUES (?, ?, ?, ?, ?, ?)`,
    tableName, recordId, action,
    oldValues ? JSON.stringify(oldValues) : null,
    newValues ? JSON.stringify(newValues) : null,
    actorId || null
  );
}

export async function getAuditLog(limit = 200) {
  return db.all(
    `SELECT a.*, u.name as actor_name FROM audit_log a LEFT JOIN users u ON a.actor_id = u.id ORDER BY a.created_at DESC LIMIT ?`,
    limit
  );
}
