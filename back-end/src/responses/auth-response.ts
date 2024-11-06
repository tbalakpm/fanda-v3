import { ApiResponse } from "./api-response";
import { UserDto } from "../dto";

export class AuthResponse extends ApiResponse<UserDto> {
  token?: string;
}
