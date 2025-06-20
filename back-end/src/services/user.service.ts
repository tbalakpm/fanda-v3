import { Not } from 'typeorm';

import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import type { UserDto } from '../dto/user.dto';
import { cache } from '../helpers/cache.helper';
import { ApiStatus } from '../responses/api-status';
import type { ApiResponse } from '../responses/api-response';
import { UserSchema } from '../schema/user.schema';
import * as EncryptHelper from '../helpers/encrypt.helper';
import type { UserDashboard } from '../interfaces/user-dashboard';
import type { UserExists } from '../interfaces/user-exists';

// export class UserService {
const userRepository = AppDataSource.getRepository(User);

export async function getAllUsers(): Promise<ApiResponse<UserDto[]>> {
  const data = await cache.get<UserDto[]>('users');
  if (data) {
    return {
      success: true,
      message: 'Serving users from cache',
      data,
      status: ApiStatus.OK,
      total: data.length
    };
  }
  const users = await userRepository.find({
    select: ['userId', 'username', 'email', 'phone', 'firstName', 'lastName', 'role', 'isActive'],
    where: { username: Not('admin') },
    order: { userId: 'ASC' }
  });
  await cache.set('users', users);
  return {
    success: true,
    message: 'Serving users from database',
    data: users,
    status: ApiStatus.OK,
    total: users.length
  };
}

export async function getUserById(userId: string): Promise<ApiResponse<UserDto>> {
  const data = await cache.get<User>(`users:${userId}`);
  if (data) {
    return {
      success: true,
      message: 'Serving user from cache',
      data,
      status: ApiStatus.OK
    };
  }
  const user = await userRepository.findOne({
    select: ['userId', 'username', 'email', 'phone', 'firstName', 'lastName', 'role', 'isActive'],
    where: { userId }
  });
  if (!user) {
    return {
      success: false,
      message: `User with id '${userId}' not found`,
      status: ApiStatus.NOT_FOUND
    };
  }
  // const { password: _, ...userWithoutPassword } = user;
  await cache.set(`users:${userId}`, user);
  return {
    success: true,
    message: 'Serving user from database',
    data: user,
    status: ApiStatus.OK
  };
}

export async function getLoginByUsername(username: string): Promise<ApiResponse<User>> {
  const user = await userRepository.findOne({
    where: { username },
    select: ['userId', 'username', 'password', 'email', 'phone', 'firstName', 'lastName', 'role', 'isActive']
  });
  if (!user) {
    return {
      success: false,
      message: `User with name '${username}' not found`,
      status: ApiStatus.NOT_FOUND
    };
  }
  return {
    success: true,
    message: 'User found',
    data: user,
    status: ApiStatus.OK
  };
}

export async function createUser(user: User): Promise<ApiResponse<UserDto>> {
  if (!user.password) user.password = 'Welcome!23';
  const parsedResult = UserSchema.safeParse(user);
  if (!parsedResult.success) {
    return {
      success: false,
      message: parsedResult.error.message,
      status: ApiStatus.BAD_REQUEST
    };
  }
  const parsedUser = parsedResult.data as User;
  if ((await checkExists(parsedUser.username, '', '')).data?.usernameExists) {
    return {
      success: false,
      message: `Username with name '${user.username}' already exists`,
      status: ApiStatus.BAD_REQUEST
    };
  }
  const encryptedPassword = await EncryptHelper.encryptPassword(parsedUser.password);
  const newUser = userRepository.create(parsedUser);
  newUser.password = encryptedPassword;
  const createdUser = await userRepository.save(newUser);
  // deno-lint-ignore no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = createdUser;
  invalidateCache();
  return {
    success: true,
    message: 'User created successfully',
    data: userWithoutPassword as UserDto,
    status: ApiStatus.CREATED
  };
}

export async function updateUser(userId: string, user: Partial<UserDto>): Promise<ApiResponse<UserDto>> {
  if (user.username && (await checkExists(user.username, '', userId)).data?.usernameExists) {
    return {
      success: false,
      message: `Username with name '${user.username}' already exists`,
      status: ApiStatus.BAD_REQUEST
    };
  }
  const dbUser = await userRepository.findOneBy({ userId });
  if (!dbUser) {
    return {
      success: false,
      message: `User with id '${userId}' not found`,
      status: ApiStatus.NOT_FOUND
    };
  }

  const updateUser = { ...dbUser, ...user };
  const updatedUser = await userRepository.save(updateUser);
  // deno-lint-ignore no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = updatedUser;

  invalidateCache(userId);
  return {
    success: true,
    message: 'User updated successfully',
    data: userWithoutPassword as UserDto,
    status: ApiStatus.OK
  };
}

export async function deleteUser(userId: string): Promise<ApiResponse<UserDto>> {
  const user = await userRepository.findOneBy({ userId });
  if (!user) {
    return {
      success: false,
      message: `User with id '${userId}' not found`,
      status: ApiStatus.NOT_FOUND
    };
  }
  const deletedUser = await userRepository.remove(user);
  // deno-lint-ignore no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = deletedUser;

  invalidateCache(userId);
  return {
    success: true,
    message: 'User deleted successfully',
    data: userWithoutPassword as UserDto,
    status: ApiStatus.OK
  };
}

export async function dashboard(): Promise<ApiResponse<UserDashboard>> {
  const sql = `select 
      count(*) as total_user_count, 
      count(case when is_active then 1 else null end) as active_user_count, 
      count(case when is_active = false then 1 else null end) as inactive_user_count, 
      count(case when is_active and role='admin' then 1 else null end) admin_user_count,
      count(case when is_active and role='manager' then 1 else null end) manager_user_count,
      count(case when is_active and role='salesperson' then 1 else null end) salesperson_user_count,
      count(case when is_active and role='user' then 1 else null end) user_user_count
    from users u
    where username != 'admin'`;
  // console.log(sql);
  const result = await userRepository.query(sql);
  if (result && result.length > 0) {
    const dashboard = result[0];
    return {
      success: true,
      message: 'User dashboard loaded successfully',
      data: {
        totalUserCount: Number(dashboard.total_user_count),
        activeUserCount: Number(dashboard.active_user_count),
        inactiveUserCount: Number(dashboard.inactive_user_count),
        adminUserCount: Number(dashboard.admin_user_count),
        managerUserCount: Number(dashboard.manager_user_count),
        salespersonUserCount: Number(dashboard.salesperson_user_count),
        userUserCount: Number(dashboard.user_user_count)
      },
      status: ApiStatus.OK
    };
  }
  return { success: false, message: 'User dashboard failed to load', status: ApiStatus.BAD_REQUEST };
}

export async function checkExists(username?: string, email?: string, userId?: string): Promise<ApiResponse<UserExists>> {
  let usernameExists = false;
  let emailExists = false;
  if (userId) {
    if (username)
      usernameExists = await userRepository.exists({
        where: { username, userId: Not(userId) }
      });
    if (email)
      emailExists = await userRepository.exists({
        where: { email, userId: Not(userId) }
      });

    const data: UserExists = { username, email, ...(username && { usernameExists }), ...(email && { emailExists }) };

    return {
      success: true,
      message: 'Checked Username/Email exists with userid successfully',
      status: ApiStatus.OK,
      data
    };
  }
  if (username) usernameExists = await userRepository.existsBy({ username });
  if (email) emailExists = await userRepository.existsBy({ email });

  const data: UserExists = { username, email, ...(username && { usernameExists }), ...(email && { emailExists }) };
  return {
    success: true,
    message: 'Checked Username/Email exists without userid succesfully',
    status: ApiStatus.OK,
    data
  };
}

async function invalidateCache(userId?: string): Promise<void> {
  await cache.del('users');
  if (userId) await cache.del(`users:${userId}`);
}
// }
