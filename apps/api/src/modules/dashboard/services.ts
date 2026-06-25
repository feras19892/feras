import type { DashboardStats } from '@my-modern-app/shared-types';
import { db } from '../../db/index.js';

export async function getStats(): Promise<DashboardStats> {
  const totalUsers = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM users`);
  const totalStudents = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM users WHERE role = 'student'`);
  const totalTeachers = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM users WHERE role = 'teacher'`);
  const totalClasses = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM classes`);
  const totalReports = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM experiment_reports`);
  const pendingReports = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'submitted'`);
  const gradedReports = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'graded'`);

  return {
    totalUsers: totalUsers?.count ?? 0,
    totalStudents: totalStudents?.count ?? 0,
    totalTeachers: totalTeachers?.count ?? 0,
    totalClasses: totalClasses?.count ?? 0,
    totalReports: totalReports?.count ?? 0,
    pendingReports: pendingReports?.count ?? 0,
    gradedReports: gradedReports?.count ?? 0,
  };
}
