import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, adminAuthMiddleware } from '../auth/middleware.js';
import type { User } from '@my-modern-app/shared-types';
import * as svc from './services.js';

type Variables = { user: User };
const app = new Hono<{ Variables: Variables }>();
app.use(authMiddleware);

const archiveReportSchema = z.object({
  report_id: z.number().int().positive(),
  reason: z.string().optional(),
});

// Archive a report (admin only)
app.post('/report', adminAuthMiddleware, zValidator('json', archiveReportSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');

  try {
    const result = await svc.archiveReport(body.report_id, user.id, body.reason);
    return c.json({ success: true, id: result.id }, 201);
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'production') console.error('archiveReport error:', err);
    return c.json({ success: false, message: err.message || 'Failed to archive report' }, 500);
  }
});

// Get archived reports
app.get('/reports', async (c) => {
  const user = c.get('user');
  const userId = user.role === 'admin' ? undefined : user.id;
  const classId = c.req.query('class_id') ? Number(c.req.query('class_id')) : undefined;

  try {
    const reports = await svc.getArchivedReports(userId, classId);
    return c.json({ success: true, reports });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getArchivedReports error:', err);
    return c.json({ success: false, message: 'Failed to load archived reports' }, 500);
  }
});

// Restore archived report (admin only)
app.post('/report/:id/restore', adminAuthMiddleware, async (c) => {
  const id = Number(c.req.param('id'));

  try {
    await svc.restoreReport(id);
    return c.json({ success: true, message: 'Report restored successfully' });
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'production') console.error('restoreReport error:', err);
    return c.json({ success: false, message: err.message || 'Failed to restore report' }, 500);
  }
});

const archiveClassSchema = z.object({
  class_id: z.number().int().positive(),
  reason: z.string().optional(),
});

// Archive a class (admin only)
app.post('/class', adminAuthMiddleware, zValidator('json', archiveClassSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');

  try {
    const result = await svc.archiveClass(body.class_id, user.id, body.reason);
    return c.json({ success: true, id: result.id }, 201);
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'production') console.error('archiveClass error:', err);
    return c.json({ success: false, message: err.message || 'Failed to archive class' }, 500);
  }
});

// Get archived classes
app.get('/classes', async (c) => {
  const user = c.get('user');
  const teacherId = user.role === 'admin' ? undefined : user.id;
  const schoolId = user.role === 'school' ? user.id : undefined;

  try {
    const classes = await svc.getArchivedClasses(teacherId, schoolId);
    return c.json({ success: true, classes });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getArchivedClasses error:', err);
    return c.json({ success: false, message: 'Failed to load archived classes' }, 500);
  }
});

// Restore archived class (admin only)
app.post('/class/:id/restore', adminAuthMiddleware, async (c) => {
  const id = Number(c.req.param('id'));

  try {
    await svc.restoreClass(id);
    return c.json({ success: true, message: 'Class restored successfully' });
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'production') console.error('restoreClass error:', err);
    return c.json({ success: false, message: err.message || 'Failed to restore class' }, 500);
  }
});

// Get archive settings (admin only)
app.get('/settings', adminAuthMiddleware, async (c) => {
  try {
    const reportsAfter = await svc.getArchiveSetting('archive_reports_after_months');
    const classesAfter = await svc.getArchiveSetting('archive_classes_after_months');
    const autoEnabled = await svc.getArchiveSetting('auto_archive_enabled');
    const lastArchive = await svc.getArchiveSetting('last_auto_archive_at');

    return c.json({
      success: true,
      settings: {
        archive_reports_after_months: reportsAfter || '12',
        archive_classes_after_months: classesAfter || '24',
        auto_archive_enabled: autoEnabled || 'false',
        last_auto_archive_at: lastArchive || null,
      },
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getArchiveSettings error:', err);
    return c.json({ success: false, message: 'Failed to load archive settings' }, 500);
  }
});

// Update archive settings (admin only)
app.patch('/settings', adminAuthMiddleware, zValidator('json', z.object({
  archive_reports_after_months: z.string().optional(),
  archive_classes_after_months: z.string().optional(),
  auto_archive_enabled: z.string().optional(),
})), async (c) => {
  const body = c.req.valid('json');

  try {
    if (body.archive_reports_after_months !== undefined) {
      await svc.setArchiveSetting('archive_reports_after_months', body.archive_reports_after_months);
    }
    if (body.archive_classes_after_months !== undefined) {
      await svc.setArchiveSetting('archive_classes_after_months', body.archive_classes_after_months);
    }
    if (body.auto_archive_enabled !== undefined) {
      await svc.setArchiveSetting('auto_archive_enabled', body.auto_archive_enabled);
    }

    return c.json({ success: true, message: 'Settings updated' });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('updateArchiveSettings error:', err);
    return c.json({ success: false, message: 'Failed to update settings' }, 500);
  }
});

// Trigger auto-archive manually (admin only)
app.post('/auto-archive', adminAuthMiddleware, async (c) => {
  try {
    const reportsCount = await svc.autoArchiveOldReports();
    const classesCount = await svc.autoArchiveOldClasses();

    return c.json({
      success: true,
      message: `Auto-archive completed: ${reportsCount} reports, ${classesCount} classes archived`,
      reports_archived: reportsCount,
      classes_archived: classesCount,
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('autoArchive error:', err);
    return c.json({ success: false, message: 'Failed to run auto-archive' }, 500);
  }
});

export { app as archiveRoutes };
