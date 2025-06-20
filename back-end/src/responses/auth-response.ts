import { ApiResponse } from './api-response';
import type { UserDto } from '../dto/user.dto';

export class AuthResponse extends ApiResponse<UserDto> {
  token?: string;
}
