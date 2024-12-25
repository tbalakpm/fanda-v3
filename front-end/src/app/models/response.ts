export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
  status: number;
}

export interface LoginResponse<T> extends Response<T> {
  token: string;
}
