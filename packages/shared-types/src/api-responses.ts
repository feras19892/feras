export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalReports: number;
  pendingReports: number;
  gradedReports: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
