import { DataSource } from 'typeorm';
import { User } from '../entities';
import { encrypt } from '../helpers';
import { UserRoles } from '../entities/role.enum';
import 'dotenv/config';

const { ADMIN_ID = '0192fc5e-0093-7ccc-a20a-dc844a5bad1c', ADMIN_USERNAME = 'admin', ADMIN_PASSWORD = 'Welcome!23' } = process.env;

export const createAdminUser = async (ds: DataSource) => {
  const userRepo = ds.getRepository<User>(User);
  const adminUserFound = await userRepo.existsBy({ username: 'admin' });
  if (!adminUserFound) {
    const adminUser = new User();
    adminUser.userId = ADMIN_ID;
    adminUser.username = ADMIN_USERNAME;
    adminUser.password = await encrypt.encryptPassword(ADMIN_PASSWORD);
    adminUser.role = UserRoles.Admin;
    await userRepo.save(adminUser);
  }
};
