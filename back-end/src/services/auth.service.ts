import type { User } from '../entities/user.entity';
import type { LoginDto } from '../dto/login.dto';
import * as EncryptHelper from '../helpers/encrypt.helper';
import * as UserService from './user.service';
import type { AuthResponse } from '../responses/auth-response';
import { ApiStatus } from '../responses/api-status';

export async function register(register: User): Promise<AuthResponse> {
  const result = await UserService.createUser(register);
  if (!result.success) {
    return { success: false, message: result.message, status: result.status };
  }
  const token = EncryptHelper.generateToken({
    userId: (result.data as User).userId
  });
  return { ...result, token };
}

export async function login(login: LoginDto): Promise<AuthResponse> {
  const result = await UserService.getLoginByUsername(login.username);
  if (!result.success || !result.data) {
    return {
      success: false,
      message: 'Login failed, invalid credentials',
      status: ApiStatus.UNAUTHORIZED
    };
  }

  const isPasswordValid = await EncryptHelper.comparePassword(result.data.password, login.password);
  if (!isPasswordValid) {
    return {
      success: false,
      message: 'Login failed, invalid credentials',
      status: ApiStatus.UNAUTHORIZED
    };
  }

  const token = EncryptHelper.generateToken({ userId: result.data.userId });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = result.data;
  return {
    success: true,
    message: 'Login successful',
    token,
    data: userWithoutPassword as User,
    status: ApiStatus.OK
  };
}
