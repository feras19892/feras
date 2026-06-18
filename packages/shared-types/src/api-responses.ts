export interface DashboardStats {
  users: number;
  orders: number;
  revenue: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
