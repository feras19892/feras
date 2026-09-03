import { db } from '../db/index.js';

const cache = new Map<string, { value: string | null; expires: number }>();
const TTL = 30 * 1000; // 30 seconds

export async function getSystemSetting(key: string): Promise<string | null> {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.value;
  }

  const row = await db.get<{ value: string }>('SELECT value FROM system_settings WHERE key = ?', key);
  const value = row?.value ?? null;

  cache.set(key, { value, expires: Date.now() + TTL });

  return value;
}

export async function getSystemSettingBool(key: string, defaultValue = false): Promise<boolean> {
  const value = await getSystemSetting(key);
  if (value === null) return defaultValue;
  return value === 'true';
}

export async function setSystemSetting(key: string, value: string): Promise<void> {
  await db.run(
    `INSERT INTO system_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`,
    key, value, value,
  );
  invalidateSystemSetting(key);
}

export function invalidateSystemSetting(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
