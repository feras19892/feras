import { getArchiveSetting, autoArchiveOldReports, autoArchiveOldClasses } from '../modules/archive/services.js';

const ARCHIVE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export async function runAutoArchive(): Promise<void> {
  try {
    const autoEnabled = await getArchiveSetting('auto_archive_enabled');
    if (autoEnabled !== 'true') {
      console.log('[archive-scheduler] Auto-archive is disabled');
      return;
    }

    console.log('[archive-scheduler] Running auto-archive...');
    const reportsCount = await autoArchiveOldReports();
    const classesCount = await autoArchiveOldClasses();
    console.log(`[archive-scheduler] Completed: ${reportsCount} reports, ${classesCount} classes archived`);
  } catch (err) {
    console.error('[archive-scheduler] Error:', err);
  }
}

export function startArchiveScheduler() {
  runAutoArchive().catch(() => {});
  setInterval(() => { runAutoArchive().catch(() => {}); }, ARCHIVE_INTERVAL);
}
