import type { User } from '../entities/user.entity';

export type UserDto = Omit<User, 'password'>;
