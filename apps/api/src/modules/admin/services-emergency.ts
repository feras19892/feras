import { db } from '../../db/index.js';

export async function resolveSystemAlert(id: number, resolvedBy: number) {
  const alert = await db.get(`SELECT id FROM system_alerts WHERE id = ?`, id);
  if (!alert) return { success: false, message: 'التنبيه غير موجود' };
  await db.run(
    `UPDATE system_alerts SET is_resolved = 1, resolved_by = ?, resolved_at = datetime('now') WHERE id = ?`,
    resolvedBy, id,
  );
  return { success: true };
}

export async function freezeAllClasses(adminId: number) {
  await db.run(
    `UPDATE classes SET is_frozen = 1, frozen_reason = 'تجمد طارئ من الأدمن', frozen_at = datetime('now'), frozen_by = ? WHERE is_frozen = 0`,
    adminId,
  );
  return { success: true };
}

export async function unfreezeAllClasses() {
  await db.run(
    `UPDATE classes SET is_frozen = 0, frozen_reason = NULL, frozen_at = NULL, frozen_by = NULL WHERE is_frozen = 1`,
  );
  return { success: true };
}
