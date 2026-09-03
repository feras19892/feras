import { copyFile, mkdir, readdir, stat, unlink, readFile } from 'fs/promises';
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

export interface BackupInfo {
  name: string;
  path: string;
  size: number;
  mtime: Date;
  created_at: string;
}

export async function listBackups(): Promise<BackupInfo[]> {
  try {
    if (!existsSync(BACKUP_DIR)) {
      return [];
    }

    const files = await readdir(BACKUP_DIR);
    const backups = await Promise.all(
      files
        .filter((f: string) => f.startsWith('app_') && f.endsWith('.db'))
        .map(async (f: string) => {
          const path = join(BACKUP_DIR, f);
          const stats = await stat(path);
          return {
            name: f,
            path,
            size: stats.size,
            mtime: stats.mtime,
            created_at: stats.mtime.toISOString(),
          };
        })
    );

    return backups.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  } catch (err) {
    console.error('[backup] Error listing backups:', err);
    return [];
  }
}

export async function restoreBackup(backupName: string): Promise<boolean> {
  try {
    if (!existsSync(BACKUP_DIR)) {
      console.error('[backup] Backup directory not found');
      return false;
    }

    const backupPath = join(BACKUP_DIR, backupName);
    if (!existsSync(backupPath)) {
      console.error('[backup] Backup file not found:', backupPath);
      return false;
    }

    if (!existsSync(DB_PATH)) {
      console.error('[backup] Database file not found:', DB_PATH);
      return false;
    }

    // Create a backup of current database before restoring
    const currentBackupPath = join(BACKUP_DIR, `pre_restore_${timestamp()}.db`);
    await copyFile(DB_PATH, currentBackupPath);
    console.log(`[backup] Current database backed up to ${currentBackupPath}`);

    // Restore the selected backup
    await copyFile(backupPath, DB_PATH);
    console.log(`[backup] Database restored from ${backupPath}`);

    return true;
  } catch (err) {
    console.error('[backup] Error restoring backup:', err);
    return false;
  }
}

export async function downloadBackup(backupName: string): Promise<Buffer | null> {
  try {
    if (!existsSync(BACKUP_DIR)) {
      console.error('[backup] Backup directory not found');
      return null;
    }

    const backupPath = join(BACKUP_DIR, backupName);
    if (!existsSync(backupPath)) {
      console.error('[backup] Backup file not found:', backupPath);
      return null;
    }

    const data = await readFile(backupPath);
    return data;
  } catch (err) {
    console.error('[backup] Error downloading backup:', err);
    return null;
  }
}

export async function deleteBackup(backupName: string): Promise<boolean> {
  try {
    if (!existsSync(BACKUP_DIR)) {
      console.error('[backup] Backup directory not found');
      return false;
    }

    const backupPath = join(BACKUP_DIR, backupName);
    if (!existsSync(backupPath)) {
      console.error('[backup] Backup file not found:', backupPath);
      return false;
    }

    await unlink(backupPath);
    console.log(`[backup] Deleted backup: ${backupName}`);
    return true;
  } catch (err) {
    console.error('[backup] Error deleting backup:', err);
    return false;
  }
}

const BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export function startBackupInterval() {
  backupDatabase().catch(() => {});
  setInterval(() => { backupDatabase().catch(() => {}); }, BACKUP_INTERVAL);
}
