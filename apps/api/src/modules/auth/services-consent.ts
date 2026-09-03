import { dbRun } from '../../db/index.js';

export async function recordConsent(
  userId: number,
  type: string,
  version: string,
  ip: string,
  userAgent: string,
): Promise<void> {
  await dbRun(
    `INSERT INTO consent_records (user_id, type, version, ip, user_agent, given_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    userId,
    type,
    version,
    ip,
    userAgent,
  );
}
