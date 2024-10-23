import { ApiResponse } from "./api-response";
import { UserDto } from "../dto/user.dto";

export class AuthResponse extends ApiResponse<UserDto> {
  token?: string;
}

export class LoginDto {
  username: string;
  password: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
}
