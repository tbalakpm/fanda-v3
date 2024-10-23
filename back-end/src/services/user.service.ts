import cache from "../helpers/cache-helper";
import { Not } from "typeorm";
import { AppDataSource } from "../data-source";
import { encrypt } from "../helpers/encrypt";
import { User } from "../entities";
import { UserSchema } from "../schema";
import { UserDto } from "../dto";
import { ApiResponse, ApiStatus } from "../responses";

export class UserService {
  private static userRepository = AppDataSource.getRepository(User);

  static async getAllUsers(): Promise<ApiResponse<UserDto[]>> {
    const data = await cache.get<UserDto[]>("users");
    if (data) {
      return {
        success: true,
        message: "Serving users from cache",
        data,
        status: ApiStatus.OK
      };
    } else {
      // const users = (await this.userRepository.find()).map((u) => {
      //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
      //   const { password: _, ...userWithoutPassword } = u;
      //   return userWithoutPassword as UserDto;
      // });
      const users = await this.userRepository.find();

      await cache.set("users", users);
      return {
        success: true,
        message: "Serving users from database",
        data: users,
        status: ApiStatus.OK
      };
    }
  }

  static async getUserById(id: string): Promise<ApiResponse<UserDto>> {
    const data = await cache.get<User>("users:" + id);
    if (data) {
      return {
        success: true,
        message: "Serving user from cache",
        data,
        status: ApiStatus.OK
      };
    } else {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        return {
          success: false,
          message: `User with id '${id}' not found`,
          status: ApiStatus.NOT_FOUND
        };
      }
      // const { password: _, ...userWithoutPassword } = user;
      await cache.set("users:" + id, user);
      return {
        success: true,
        message: "Serving user from database",
        data: user,
        status: ApiStatus.OK
      };
    }
  }

  static async getLoginByUsername(username: string): Promise<ApiResponse<User>> {
    const user = await this.userRepository.findOne({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        password: true
      }
    });
    if (!user) {
      return {
        success: false,
        message: `User with name '${username}' not found`,
        status: ApiStatus.NOT_FOUND
      };
    }
    return { success: true, message: "User found", data: user, status: ApiStatus.OK };
  }

  static async createUser(user: User): Promise<ApiResponse<UserDto>> {
    const parsedResult = UserSchema.safeParse(user);
    if (!parsedResult.success) {
      return {
        success: false,
        message: parsedResult.error.message,
        status: ApiStatus.BAD_REQUEST
      };
    }
    const parsedUser = parsedResult.data as User;
    if (await this.isUsernameExists(parsedUser.username)) {
      return {
        success: false,
        message: `Username with name '${user.username}' already exists`,
        status: ApiStatus.BAD_REQUEST
      };
    }
    const encryptedPassword = await encrypt.encryptPassword(parsedUser.password);
    const newUser = this.userRepository.create(parsedUser);
    newUser.password = encryptedPassword;
    const createdUser = await this.userRepository.save(newUser);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = createdUser;
    this.invalidateCache();
    return {
      success: true,
      message: "User created successfully",
      data: userWithoutPassword as UserDto,
      status: ApiStatus.CREATED
    };
  }

  static async updateUser(id: string, updateUser: UserDto): Promise<ApiResponse<UserDto>> {
    const parsedResult = UserSchema.safeParse(updateUser);
    if (!parsedResult.success) {
      return {
        success: false,
        message: parsedResult.error.message,
        status: ApiStatus.BAD_REQUEST
      };
    }

    const parsedUser = parsedResult.data as User;
    if (await this.isUsernameExists(parsedUser.username, id)) {
      return {
        success: false,
        message: `Username with name '${parsedUser.username}' already exists`,
        status: ApiStatus.BAD_REQUEST
      };
    }
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return {
        success: false,
        message: `User with id '${id}' not found`,
        status: ApiStatus.NOT_FOUND
      };
    }

    user.username = updateUser.username;
    user.email = updateUser.email;
    user.phone = updateUser.phone;
    user.firstName = updateUser.firstName;
    user.lastName = updateUser.lastName;
    const updatedUser = await this.userRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser;

    this.invalidateCache(id);
    return {
      success: true,
      message: "User updated successfully",
      data: userWithoutPassword as UserDto,
      status: ApiStatus.OK
    };
  }

  static async deleteUser(id: string): Promise<ApiResponse<UserDto>> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return {
        success: false,
        message: `User with id '${id}' not found`,
        status: ApiStatus.NOT_FOUND
      };
    }
    const deletedUser = await this.userRepository.remove(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = deletedUser;

    this.invalidateCache(id);
    return {
      success: true,
      message: "User deleted successfully",
      data: userWithoutPassword as UserDto,
      status: ApiStatus.OK
    };
  }

  static async isUsernameExists(username: string, userId?: string): Promise<boolean> {
    let exists = true;
    if (userId) {
      exists = await this.userRepository.exists({ where: { username, id: Not(userId) } });
      return exists;
    } else {
      exists = await this.userRepository.existsBy({ username });
      return exists;
    }
  }

  static async invalidateCache(id?: string): Promise<void> {
    await cache.del("users");
    if (id) await cache.del("users:" + id);
  }
}
