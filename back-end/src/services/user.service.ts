import { Not } from "typeorm";

import { AppDataSource } from "../data-source";
import { User } from "../entities";
import { UserDto } from "../dto";
import { UserSchema } from "../schema";
import { cache, encrypt } from "../helpers";
import { ApiResponse, ApiStatus } from "../responses";

export class UserService {
  private static userRepository = AppDataSource.getRepository(User);

  static async getAllUsers(): Promise<ApiResponse<UserDto[]>> {
    const data = await cache.get<UserDto[]>("users");
    if (data) {
      return { success: true, message: "Serving users from cache", data, status: ApiStatus.OK };
    }
    const users = await this.userRepository.find({
      select: ["userId", "username", "email", "phone", "firstName", "lastName", "role", "isActive"],
      order: { userId: "ASC" }
    });
    await cache.set("users", users);
    return { success: true, message: "Serving users from database", data: users, status: ApiStatus.OK };
  }

  static async getUserById(userId: string): Promise<ApiResponse<UserDto>> {
    const data = await cache.get<User>("users:" + userId);
    if (data) {
      return { success: true, message: "Serving user from cache", data, status: ApiStatus.OK };
    } else {
      const user = await this.userRepository.findOne({
        select: ["userId", "username", "email", "phone", "firstName", "lastName", "role", "isActive"],
        where: { userId }
      });
      if (!user) {
        return { success: false, message: `User with id '${userId}' not found`, status: ApiStatus.NOT_FOUND };
      }
      // const { password: _, ...userWithoutPassword } = user;
      await cache.set("users:" + userId, user);
      return { success: true, message: "Serving user from database", data: user, status: ApiStatus.OK };
    }
  }

  static async getLoginByUsername(username: string): Promise<ApiResponse<User>> {
    const user = await this.userRepository.findOne({
      where: { username },
      select: ["userId", "username", "password", "email", "phone", "firstName", "lastName", "role", "isActive"]
    });
    if (!user) {
      return { success: false, message: `User with name '${username}' not found`, status: ApiStatus.NOT_FOUND };
    }
    return { success: true, message: "User found", data: user, status: ApiStatus.OK };
  }

  static async createUser(user: User): Promise<ApiResponse<UserDto>> {
    const parsedResult = UserSchema.safeParse(user);
    if (!parsedResult.success) {
      return { success: false, message: parsedResult.error.message, status: ApiStatus.BAD_REQUEST };
    }
    const parsedUser = parsedResult.data as User;
    if (await this.isUsernameExists(parsedUser.username)) {
      return { success: false, message: `Username with name '${user.username}' already exists`, status: ApiStatus.BAD_REQUEST };
    }
    const encryptedPassword = await encrypt.encryptPassword(parsedUser.password);
    const newUser = this.userRepository.create(parsedUser);
    newUser.password = encryptedPassword;
    const createdUser = await this.userRepository.save(newUser);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = createdUser;
    this.invalidateCache();
    return { success: true, message: "User created successfully", data: userWithoutPassword as UserDto, status: ApiStatus.CREATED };
  }

  static async updateUser(userId: string, user: Partial<UserDto>): Promise<ApiResponse<UserDto>> {
    if (user.username && (await this.isUsernameExists(user.username, userId))) {
      return { success: false, message: `Username with name '${user.username}' already exists`, status: ApiStatus.BAD_REQUEST };
    }
    const dbUser = await this.userRepository.findOneBy({ userId });
    if (!dbUser) {
      return { success: false, message: `User with id '${userId}' not found`, status: ApiStatus.NOT_FOUND };
    }

    const updateUser = { ...dbUser, ...user };
    const updatedUser = await this.userRepository.save(updateUser);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser;

    this.invalidateCache(userId);
    return { success: true, message: "User updated successfully", data: userWithoutPassword as UserDto, status: ApiStatus.OK };
  }

  static async deleteUser(userId: string): Promise<ApiResponse<UserDto>> {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) {
      return { success: false, message: `User with id '${userId}' not found`, status: ApiStatus.NOT_FOUND };
    }
    const deletedUser = await this.userRepository.remove(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = deletedUser;

    this.invalidateCache(userId);
    return { success: true, message: "User deleted successfully", data: userWithoutPassword as UserDto, status: ApiStatus.OK };
  }

  static async isUsernameExists(username: string, userId?: string): Promise<boolean> {
    let exists = true;
    if (userId) {
      exists = await this.userRepository.exists({ where: { username, userId: Not(userId) } });
      return exists;
    } else {
      exists = await this.userRepository.existsBy({ username });
      return exists;
    }
  }

  static async invalidateCache(userId?: string): Promise<void> {
    await cache.del("users");
    if (userId) await cache.del("users:" + userId);
  }
}
