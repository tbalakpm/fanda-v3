export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  status?: number;
  total?: number;
}
