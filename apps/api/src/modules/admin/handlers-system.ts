import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Hono } from 'hono';
import { setAccessCookie, setRefreshCookie } from '../../modules/auth/cookies.js';
import { impersonateUser, getUserById } from '../../modules/auth/services.js';
import { comparePassword } from '../../modules/auth/crypto.js';
import { db } from '../../db/index.js';
import * as svc from './services.js';
import * as sessionSvc from '../sessions/service.js';
import * as healthSvc from './system-health-service.js';
import * as exportSvc from './export-service.js';
import * as auditSvc from './audit-service.js';
import * as activitySvc from '../activity/service.js';
import { backupDatabase } from '../../shared/backup.js';
import { readdir, stat, copyFile } from 'fs/promises';
import { join, resolve, basename, sep } from 'path';
import { existsSync } from 'fs';
import type { User } from '@my-modern-app/shared-types';

export function registerSystemRoutes(app: Hono<{ Variables: { user: User } }>): void {
  app.get('/stats', async (c) => {
    try {
      const stats = await svc.getSystemStats();
      return c.json({ success: true, stats });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin getStats error:', err);
      return c.json({ success: false, message: 'Failed to load stats' }, 500);
    }
  });

  app.get('/reports', async (c) => {
    try {
      const page = Math.max(1, Number(c.req.query('page') || '1'));
      const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') || '50')));
      const toNumber = (v?: string) => v && !Number.isNaN(Number(v)) ? Number(v) : undefined;
      const toString = (v?: string) => v || undefined;
      const user = c.get('user') as User;
      const adminSchoolId = user.school_id ?? undefined;
      const result = await svc.getAllReportsWithDetails(page, limit, {
        search: toString(c.req.query('search')),
        status: toString(c.req.query('status')),
        schoolId: toNumber(c.req.query('schoolId')),
        adminSchoolId,
        classId: toString(c.req.query('classId')),
        teacherId: toNumber(c.req.query('teacherId')),
        experiment: toString(c.req.query('experiment')),
        from: toString(c.req.query('from')),
        to: toString(c.req.query('to')),
        gradeMin: toNumber(c.req.query('gradeMin')),
        gradeMax: toNumber(c.req.query('gradeMax')),
      });
      return c.json({ success: true, ...result });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin getReports error:', err);
      return c.json({ success: false, message: 'Failed to load reports' }, 500);
    }
  });

  app.get('/reports/filters', async (c) => {
    try {
      const user = c.get('user') as User;
      const adminSchoolId = user.school_id ?? undefined;
      const filters = await svc.getReportFilterOptions(adminSchoolId);
      return c.json({ success: true, ...filters });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin getReportsFilters error:', err);
      return c.json({ success: false, message: 'Failed to load filter options' }, 500);
    }
  });

  app.get('/reports/analytics', async (c) => {
    try {
      const user = c.get('user') as User;
      const adminSchoolId = user.school_id ?? undefined;
      const analytics = await svc.getReportsAnalytics(adminSchoolId);
      return c.json({ success: true, analytics });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin getReportsAnalytics error:', err);
      return c.json({ success: false, message: 'Failed to load analytics' }, 500);
    }
  });

  app.get('/sessions', async (c) => {
    try {
      const list = await sessionSvc.getActiveSessions();
      return c.json({ success: true, sessions: list });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin getSessions error:', err);
      return c.json({ success: false, message: 'Failed to load sessions' }, 500);
    }
  });

  app.get('/health', async (c) => {
    try {
      const health = await healthSvc.getSystemHealth();
      return c.json({ success: true, health });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin getHealth error:', err);
      return c.json({ success: false, message: 'Failed to load system health' }, 500);
    }
  });

  app.get('/audit', async (c) => {
    try {
      const list = await auditSvc.getAuditLog();
      return c.json({ success: true, audit: list });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin getAudit error:', err);
      return c.json({ success: false, message: 'Failed to load audit log' }, 500);
    }
  });

  app.get('/export/:type', async (c) => {
    const type = c.req.param('type');
    const user = c.get('user');
    const adminSchoolId = (user as User).school_id ?? undefined;
    let csv = '';
    let filename = 'export.csv';
    try {
      switch (type) {
        case 'users': csv = await exportSvc.exportUsers(); filename = 'users.csv'; break;
        case 'reports': csv = await exportSvc.exportReports(adminSchoolId); filename = 'reports.csv'; break;
        case 'classes': csv = await exportSvc.exportClasses(); filename = 'classes.csv'; break;
        case 'feedback': csv = await exportSvc.exportFeedback(); filename = 'feedback.csv'; break;
        case 'activity': csv = await exportSvc.exportActivity(); filename = 'activity.csv'; break;
        default: return c.json({ success: false, message: 'Invalid export type' }, 400);
      }
      c.header('Content-Type', 'text/csv; charset=utf-8');
      c.header('Content-Disposition', `attachment; filename="${filename}"`);
      return c.body(csv);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin export error:', err);
      return c.json({ success: false, message: 'Failed to export data' }, 500);
    }
  });

  const impersonateSchema = z.object({
    password: z.string().optional(),
  });

  app.post('/impersonate/:id', zValidator('json', impersonateSchema), async (c) => {
    const admin = c.get('user');
    const targetId = Number(c.req.param('id'));
    if (!Number.isFinite(targetId) || targetId <= 0) return c.json({ success: false, message: 'Invalid ID' }, 400);
    c.req.valid('json');
    try {
      const result = await impersonateUser(targetId);
      if (!result) return c.json({ success: false, message: 'User not found' }, 404);
      setAccessCookie(c, result.token);
      setRefreshCookie(c, result.refreshToken);
      await activitySvc.logActivity(admin.id, admin.name, admin.role, 'impersonate', 'user', String(targetId), `Admin impersonated ${result.user.name} (${result.user.email})`);
      return c.json({ success: true, token: result.token, refreshToken: result.refreshToken, user: result.user, adminId: admin.id, adminName: admin.name });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin impersonate error:', err);
      return c.json({ success: false, message: 'Failed to impersonate user' }, 500);
    }
  });

  app.post('/impersonate/return', zValidator('json', z.object({
    admin_id: z.number().int().positive(),
    password: z.string().min(1),
  })), async (c) => {
    const currentAdmin = c.get('user');
    const { admin_id, password } = c.req.valid('json');
    if (currentAdmin.role !== 'admin') {
      return c.json({ success: false, message: 'Admin access required' }, 403);
    }
    if (admin_id !== currentAdmin.id) {
      return c.json({ success: false, message: 'يمكنك العودة لحسابك فقط' }, 403);
    }
    try {
      const adminRow = await db.get<{ password_hash: string }>('SELECT password_hash FROM users WHERE id = ?', currentAdmin.id);
      if (!adminRow) return c.json({ success: false, message: 'Admin not found' }, 404);
      const valid = await comparePassword(password, adminRow.password_hash);
      if (!valid) return c.json({ success: false, message: 'كلمة المرور غير صحيحة' }, 403);
      const targetAdmin = await getUserById(admin_id);
      if (!targetAdmin || targetAdmin.role !== 'admin') {
        return c.json({ success: false, message: 'Invalid admin ID — target must be an admin' }, 403);
      }
      const result = await impersonateUser(admin_id);
      if (!result) return c.json({ success: false, message: 'Admin not found' }, 404);
      setAccessCookie(c, result.token);
      setRefreshCookie(c, result.refreshToken);
      await activitySvc.logActivity(currentAdmin.id, currentAdmin.name, currentAdmin.role, 'impersonate_return', 'user', String(admin_id), `Returned from impersonation to admin ${result.user.name}`);
      return c.json({ success: true, user: result.user });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin impersonateReturn error:', err);
      return c.json({ success: false, message: 'Failed to return from impersonation' }, 500);
    }
  });

  app.patch('/reports/:id/grade', zValidator('json', z.object({
    grade: z.number().min(0).max(100),
    feedback: z.string().max(2000).optional(),
  })), async (c) => {
    const reportId = Number(c.req.param('id'));
    const { grade, feedback } = c.req.valid('json');
    const user = c.get('user');
    try {
      const adminSchoolId = (user as User).school_id ?? undefined;
      const result = await svc.updateReportGradeForAdmin(reportId, grade, feedback, user.id, user.name, adminSchoolId);
      if (!result.success) return c.json(result, 400);
      await activitySvc.logActivity(user.id, user.name, user.role, 'grade', 'report', String(reportId), `Admin graded report ${reportId}: ${grade}`);
      return c.json(result);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin updateGrade error:', err);
      return c.json({ success: false, message: 'Failed to update grade' }, 500);
    }
  });

  app.delete('/reports/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const user = c.get('user');
    const adminSchoolId = (user as User).school_id ?? undefined;
    try {
      const result = await svc.deleteReportForAdmin(id, adminSchoolId);
      if (!result.success) return c.json(result, 404);
      await activitySvc.logActivity(user.id, user.name, user.role, 'delete', 'report', String(id), `Admin deleted report ${id}`);
      return c.json(result);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin deleteReport error:', err);
      return c.json({ success: false, message: 'Failed to delete report' }, 500);
    }
  });

  app.post('/reports/delete-batch', zValidator('json', z.object({
    ids: z.array(z.number().int().positive()),
  })), async (c) => {
    const { ids } = c.req.valid('json');
    const user = c.get('user');
    const adminSchoolId = (user as User).school_id ?? undefined;
    try {
      const result = await svc.deleteReportsForAdmin(ids, adminSchoolId);
      await activitySvc.logActivity(user.id, user.name, user.role, 'delete', 'report', ids.join(','), `Admin deleted reports ${ids.join(', ')}`);
      return c.json(result);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin deleteReportsBatch error:', err);
      return c.json({ success: false, message: 'Failed to delete reports' }, 500);
    }
  });

  app.post('/backup', async (c) => {
    try {
      const ok = await backupDatabase();
      if (!ok) return c.json({ success: false, message: 'Backup failed' }, 500);
      await activitySvc.logActivity(c.get('user').id, c.get('user').name, c.get('user').role, 'backup', 'system', '', 'Manual database backup triggered');
      return c.json({ success: true, message: 'Backup created successfully' });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin backup error:', err);
      return c.json({ success: false, message: 'Backup failed' }, 500);
    }
  });

  app.get('/backups', async (c) => {
    try {
      const backupDir = process.env.BACKUP_DIR || './data/backups';
      if (!existsSync(backupDir)) return c.json({ success: true, backups: [] });
      const files = await readdir(backupDir);
      const backups = await Promise.all(
        files.filter((f: string) => f.startsWith('app_') && f.endsWith('.db')).map(async (f: string) => {
          const s = await stat(join(backupDir, f));
          return { name: f, size: s.size, created: s.mtime.toISOString() };
        })
      );
      backups.sort((a: { created: string }, b: { created: string }) => b.created.localeCompare(a.created));
      return c.json({ success: true, backups });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin listBackups error:', err);
      return c.json({ success: false, message: 'Failed to list backups' }, 500);
    }
  });

  app.post('/backup/restore', zValidator('json', z.object({
    filename: z.string().min(1).max(200),
  })), async (c) => {
    const { filename } = c.req.valid('json');
    const backupDir = process.env.BACKUP_DIR || './data/backups';
    const dbPath = process.env.DB_PATH || './data/app.db';
    // Prevent path traversal: restrict to the backup directory and DB backups only.
    const safeName = basename(filename);
    if (safeName !== filename) return c.json({ success: false, message: 'Invalid backup filename' }, 400);
    if (!safeName.startsWith('app_') && !safeName.endsWith('.db')) {
      return c.json({ success: false, message: 'Invalid backup filename' }, 400);
    }
    const backupPath = resolve(backupDir, safeName);
    const resolvedDir = resolve(backupDir);
    if (!backupPath.startsWith(resolvedDir + sep)) {
      return c.json({ success: false, message: 'Invalid backup filename' }, 400);
    }
    if (!existsSync(backupPath)) return c.json({ success: false, message: 'Backup file not found' }, 404);
    try {
      await copyFile(backupPath, dbPath);
      await activitySvc.logActivity(c.get('user').id, c.get('user').name, c.get('user').role, 'restore', 'system', safeName, `Restored backup: ${safeName}`);
      return c.json({ success: true, message: 'Backup restored successfully' });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin restoreBackup error:', err);
      return c.json({ success: false, message: 'Failed to restore backup' }, 500);
    }
  });

  app.post('/db/cleanup', async (c) => {
    try {
      let deleted = 0;
      const oldSessions = await db.run(`DELETE FROM session_log WHERE logout_at IS NOT NULL AND login_at < datetime('now', '-30 days')`);
      deleted += oldSessions.changes || 0;
      const oldActivity = await db.run(`DELETE FROM activity_log WHERE created_at < datetime('now', '-90 days')`);
      deleted += oldActivity.changes || 0;
      await db.run('VACUUM');
      await activitySvc.logActivity(c.get('user').id, c.get('user').name, c.get('user').role, 'cleanup', 'system', '', `DB cleanup: ${deleted} rows removed`);
      return c.json({ success: true, message: `Cleanup complete: ${deleted} rows removed` });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin dbCleanup error:', err);
      return c.json({ success: false, message: 'Failed to cleanup database' }, 500);
    }
  });

  app.patch('/reports/:id/reassign', zValidator('json', z.object({
    teacher_id: z.number().int().positive(),
  })), async (c) => {
    const reportId = Number(c.req.param('id'));
    const { teacher_id } = c.req.valid('json');
    try {
      const report = await db.get<{ id: number; student_id: number }>(`SELECT id, student_id FROM experiment_reports WHERE id = ?`, reportId);
      if (!report) return c.json({ success: false, message: 'Report not found' }, 404);

      const student = await db.get<{ school_id: number }>(`SELECT school_id FROM users WHERE id = ?`, report.student_id);
      if (!student) return c.json({ success: false, message: 'Student not found' }, 404);

      const teacher = await db.get<{ id: number; role: string; school_id: number }>(`SELECT id, role, school_id FROM users WHERE id = ?`, teacher_id);
      if (!teacher) return c.json({ success: false, message: 'Teacher not found' }, 404);
      if (teacher.role !== 'teacher') return c.json({ success: false, message: 'User is not a teacher' }, 400);
      if (teacher.school_id !== student.school_id) return c.json({ success: false, message: 'Teacher belongs to a different school' }, 403);

      await db.run(`UPDATE experiment_reports SET teacher_id = ? WHERE id = ?`, teacher_id, reportId);
      await activitySvc.logActivity(c.get('user').id, c.get('user').name, c.get('user').role, 'reassign', 'report', String(reportId), `Reassigned report ${reportId} to teacher ${teacher_id}`);
      return c.json({ success: true, message: 'Report reassigned successfully' });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin reassignReport error:', err);
      return c.json({ success: false, message: 'Failed to reassign report' }, 500);
    }
  });
}
