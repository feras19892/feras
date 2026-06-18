import type { DashboardStats } from '@my-modern-app/shared-types';

export async function getStats(): Promise<DashboardStats> {
  return { users: 120, orders: 45, revenue: 8900 };
}
