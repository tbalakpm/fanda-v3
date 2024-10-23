import { User } from "../entities";

export type UserDto = Omit<User, "password">;
