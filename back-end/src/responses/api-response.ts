import { ApiStatus } from './api-status';

export class ApiResponse<T> {
  success!: boolean;
  message!: string;
  status!: ApiStatus;
  data?: T;
}
