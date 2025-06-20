import type { DataSource } from 'typeorm';
import { User } from '../entities';
import * as EncryptHelper from '../helpers';
import { UserRoles } from '../entities/role.enum';
import 'dotenv/config';

const { ADMIN_ID, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

export const createAdminUser = async (ds: DataSource) => {
  const userRepo = ds.getRepository<User>(User);
  const adminUserFound = await userRepo.existsBy({ username: 'admin' });
  if (!adminUserFound) {
    const adminUser = new User();
    adminUser.userId = ADMIN_ID ?? '0192fc5e-0093-7ccc-a20a-dc844a5bad1c'; // Ensure ADMIN_ID is set, or provide a default
    adminUser.username = ADMIN_USERNAME ?? 'admin'; // Ensure ADMIN_USERNAME is set, or provide a default
    adminUser.password = await EncryptHelper.encryptPassword(ADMIN_PASSWORD ?? 'Welcome!23'); // Ensure ADMIN_PASSWORD is set, or provide a default
    adminUser.role = UserRoles.Admin;
    await userRepo.save(adminUser);
  }
};
