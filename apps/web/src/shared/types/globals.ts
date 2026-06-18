export type ID = string;

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
