import { db } from '../../db/index.js';

export interface ArchivedReportRow {
  id: number;
  original_report_id: number;
  user_id: number;
  class_id: number | null;
  experiment_type: string | null;
  experiment_id: string | null;
  title: string | null;
  content: string | null;
  grade: number | null;
  status: string | null;
  teacher_notes: string | null;
  archived_at: string;
  archived_by: number | null;
  reason: string | null;
}

export interface ArchivedClassRow {
  id: number;
  original_class_id: number;
  name: string;
  code: string;
  teacher_id: number;
  school_id: number | null;
  student_count: number;
  created_at: string | null;
  archived_at: string;
  archived_by: number | null;
  reason: string | null;
}

export async function archiveReport(reportId: number, archivedBy: number, reason?: string): Promise<{ id: number }> {
  const report = await db.get(
    `SELECT * FROM reports WHERE id = ?`,
    reportId,
  );
  
  if (!report) {
    throw new Error('Report not found');
  }

  const result = await db.run(
    `INSERT INTO archived_reports 
     (original_report_id, user_id, class_id, experiment_type, experiment_id, title, content, grade, status, teacher_notes, archived_by, reason)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    report.id, report.user_id, report.class_id, report.experiment_type, report.experiment_id,
    report.title, report.content, report.grade, report.status, report.teacher_notes, archivedBy, reason || null,
  );

  await db.run('DELETE FROM reports WHERE id = ?', reportId);

  return { id: Number(result.lastID) };
}

export async function archiveClass(classId: number, archivedBy: number, reason?: string): Promise<{ id: number }> {
  const cls = await db.get(
    `SELECT * FROM classes WHERE id = ?`,
    classId,
  );
  
  if (!cls) {
    throw new Error('Class not found');
  }

  const studentCount = await db.get(
    `SELECT COUNT(*) as count FROM class_students WHERE class_id = ?`,
    classId,
  );

  const result = await db.run(
    `INSERT INTO archived_classes 
     (original_class_id, name, code, teacher_id, school_id, student_count, created_at, archived_by, reason)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    cls.id, cls.name, cls.code, cls.teacher_id, cls.school_id, studentCount?.count || 0, cls.created_at, archivedBy, reason || null,
  );

  await db.run('DELETE FROM class_students WHERE class_id = ?', classId);
  await db.run('DELETE FROM classes WHERE id = ?', classId);

  return { id: Number(result.lastID) };
}

export async function getArchivedReports(userId?: number, classId?: number): Promise<ArchivedReportRow[]> {
  let query = 'SELECT * FROM archived_reports';
  const params: any[] = [];
  const conditions: string[] = [];

  if (userId) {
    conditions.push('user_id = ?');
    params.push(userId);
  }

  if (classId) {
    conditions.push('class_id = ?');
    params.push(classId);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY archived_at DESC LIMIT 100';

  return db.all<ArchivedReportRow[]>(query, ...params);
}

export async function getArchivedClasses(teacherId?: number, schoolId?: number): Promise<ArchivedClassRow[]> {
  let query = 'SELECT * FROM archived_classes';
  const params: any[] = [];
  const conditions: string[] = [];

  if (teacherId) {
    conditions.push('teacher_id = ?');
    params.push(teacherId);
  }

  if (schoolId) {
    conditions.push('school_id = ?');
    params.push(schoolId);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY archived_at DESC LIMIT 100';

  return db.all<ArchivedClassRow[]>(query, ...params);
}

export async function restoreReport(archivedId: number): Promise<void> {
  const archived = await db.get<ArchivedReportRow>(
    'SELECT * FROM archived_reports WHERE id = ?',
    archivedId,
  );

  if (!archived) {
    throw new Error('Archived report not found');
  }

  await db.run(
    `INSERT INTO reports 
     (user_id, class_id, experiment_type, experiment_id, title, content, grade, status, teacher_notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    archived.user_id, archived.class_id, archived.experiment_type, archived.experiment_id,
    archived.title, archived.content, archived.grade, archived.status, archived.teacher_notes,
    archived.archived_at, archived.archived_at,
  );

  await db.run('DELETE FROM archived_reports WHERE id = ?', archivedId);
}

export async function restoreClass(archivedId: number): Promise<void> {
  const archived = await db.get<ArchivedClassRow>(
    'SELECT * FROM archived_classes WHERE id = ?',
    archivedId,
  );

  if (!archived) {
    throw new Error('Archived class not found');
  }

  const result = await db.run(
    `INSERT INTO classes (name, code, teacher_id, school_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    archived.name, archived.code, archived.teacher_id, archived.school_id, archived.created_at, archived.archived_at,
  );

  await db.run('DELETE FROM archived_classes WHERE id = ?', archivedId);
}

export async function getArchiveSetting(key: string): Promise<string | null> {
  const row = await db.get('SELECT value FROM archive_settings WHERE key = ?', key);
  return row?.value || null;
}

export async function setArchiveSetting(key: string, value: string): Promise<void> {
  await db.run(
    `INSERT INTO archive_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`,
    key, value, value,
  );
}

export async function autoArchiveOldReports(): Promise<number> {
  const months = await getArchiveSetting('archive_reports_after_months');
  const monthsNum = parseInt(months || '12', 10);
  
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsNum);

  const oldReports = await db.all(
    `SELECT id FROM reports WHERE created_at < ? AND status = 'graded'`,
    cutoffDate.toISOString(),
  );

  let archivedCount = 0;
  for (const report of oldReports) {
    try {
      await archiveReport(report.id, 0, 'Auto-archived: Old report');
      archivedCount++;
    } catch (err) {
      console.error(`Failed to archive report ${report.id}:`, err);
    }
  }

  if (archivedCount > 0) {
    await setArchiveSetting('last_auto_archive_at', new Date().toISOString());
  }

  return archivedCount;
}

export async function autoArchiveOldClasses(): Promise<number> {
  const months = await getArchiveSetting('archive_classes_after_months');
  const monthsNum = parseInt(months || '24', 10);
  
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsNum);

  const oldClasses = await db.all(
    `SELECT id FROM classes WHERE created_at < ? AND is_active = 0`,
    cutoffDate.toISOString(),
  );

  let archivedCount = 0;
  for (const cls of oldClasses) {
    try {
      await archiveClass(cls.id, 0, 'Auto-archived: Old inactive class');
      archivedCount++;
    } catch (err) {
      console.error(`Failed to archive class ${cls.id}:`, err);
    }
  }

  return archivedCount;
}
