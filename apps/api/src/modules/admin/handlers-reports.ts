import { Hono } from 'hono';
import * as svc from './services-admin-reports.js';
import type { User } from '@my-modern-app/shared-types';

type Variables = { user: User };

export function registerReportsRoutes(app: Hono<{ Variables: Variables }>) {
  app.get('/reports/export', async (c) => {
    try {
      const user = c.get('user');
      const adminSchoolId = (user as User).school_id ?? undefined;
      const format = c.req.query('format') || 'csv';
      const idsParam = c.req.query('ids');
      const ids = idsParam ? idsParam.split(',').map(Number).filter(id => !Number.isNaN(id)) : undefined;
      const rows = await svc.getReportsForExport(ids, adminSchoolId);

      if (format === 'xls') {
        const html = await svc.toExcelHtml(rows);
        c.header('Content-Type', 'application/vnd.ms-excel');
        c.header('Content-Disposition', 'attachment; filename="reports.xls"');
        return c.body(html);
      }

      const csv = await svc.toCsv(rows);
      c.header('Content-Type', 'text/csv; charset=utf-8');
      c.header('Content-Disposition', 'attachment; filename="reports.csv"');
      return c.body(csv);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin reports export error:', err);
      return c.json({ success: false, message: 'Failed to export reports' }, 500);
    }
  });

  app.post('/reports/schedule', async (c) => {
    try {
      const user = c.get('user');
      const body = await c.req.json();
      const { name, frequency, format = 'csv', filters } = body;
      const result = await svc.createScheduledReport(user.id, { name, frequency, format, filters: JSON.stringify(filters || {}) });
      return c.json({ ...result });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin createScheduledReport error:', err);
      return c.json({ success: false, message: 'Failed to schedule report' }, 500);
    }
  });

  app.get('/reports/schedule', async (c) => {
    try {
      const user = c.get('user');
      const list = await svc.getScheduledReports(user.id);
      return c.json({ success: true, schedules: list });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin getScheduledReports error:', err);
      return c.json({ success: false, message: 'Failed to load schedules' }, 500);
    }
  });

  app.delete('/reports/schedule/:id', async (c) => {
    try {
      const user = c.get('user');
      const id = Number(c.req.param('id'));
      const result = await svc.deleteScheduledReport(user.id, id);
      return c.json({ ...result });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin deleteScheduledReport error:', err);
      return c.json({ success: false, message: 'Failed to delete schedule' }, 500);
    }
  });
}
