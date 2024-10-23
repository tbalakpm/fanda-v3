import { User } from "../entities";
import { LoginDto } from "../dto";
import { ApiStatus, AuthResponse } from "../responses";
import { encrypt } from "../helpers/encrypt";
import { UserService } from "./user.service";

export class AuthService {
  static async register(register: User): Promise<AuthResponse> {
    const result = await UserService.createUser(register);
    if (!result.success) {
      return { success: false, message: result.message, status: result.status };
    }

    const token = encrypt.generateToken({ id: (result.data as User).id });
    return { ...result, token };
  }

  static async login(login: LoginDto): Promise<AuthResponse> {
    const result = await UserService.getLoginByUsername(login.username);
    if (!result.success || !result.data) {
      return {
        success: false,
        message: "Login failed, invalid credentials",
        status: ApiStatus.UNAUTHORIZED
      };
    }

    const isPasswordValid = await encrypt.comparePassword(result.data.password, login.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Login failed, invalid credentials",
        status: ApiStatus.UNAUTHORIZED
      };
    }

    const token = encrypt.generateToken({ id: result.data.id });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = result.data;
    return {
      success: true,
      message: "Login successful",
      token,
      data: userWithoutPassword as User,
      status: ApiStatus.OK
    };
  }
}
