import { copyFile, mkdir, readdir, stat, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { uploadToCloud, isCloudBackupEnabled } from './cloud-backup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || './data/app.db';
const BACKUP_DIR = process.env.BACKUP_DIR || './data/backups';
const MAX_BACKUPS = Number(process.env.MAX_BACKUPS) || 7;

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
}

export async function backupDatabase(): Promise<boolean> {
  try {
    if (!existsSync(DB_PATH)) {
      console.error('[backup] Database file not found:', DB_PATH);
      return false;
    }

    if (!existsSync(BACKUP_DIR)) {
      await mkdir(BACKUP_DIR, { recursive: true });
    }

    const backupPath = join(BACKUP_DIR, `app_${timestamp()}.db`);
    await copyFile(DB_PATH, backupPath);
    console.log(`[backup] Database backed up to ${backupPath}`);

    // Clean old backups (keep last MAX_BACKUPS)
    const files = await readdir(BACKUP_DIR);
    const backups = await Promise.all(
      files
        .filter((f: string) => f.startsWith('app_') && f.endsWith('.db'))
        .map(async (f: string) => ({ name: f, path: join(BACKUP_DIR, f), mtime: (await stat(join(BACKUP_DIR, f))).mtime }))
    );
    backups.sort((a: { mtime: Date }, b: { mtime: Date }) => b.mtime.getTime() - a.mtime.getTime());

    for (let i = MAX_BACKUPS; i < backups.length; i++) {
      await unlink(backups[i].path);
      console.log(`[backup] Removed old backup: ${backups[i].name}`);
    }

    // Upload to cloud (R2/S3) if configured
    if (isCloudBackupEnabled()) {
      const backupName = basename(backupPath);
      await uploadToCloud(backupPath, backupName);
    }

    return true;
  } catch (err) {
    console.error('[backup] Error:', err);
    return false;
  }
}

const BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export function startBackupInterval() {
  backupDatabase().catch(() => {});
  setInterval(() => { backupDatabase().catch(() => {}); }, BACKUP_INTERVAL);
}
